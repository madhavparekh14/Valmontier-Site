type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
}) => Promise<Response> | Response;

type Env = {
  PUROLATOR_KEY: string;
  PUROLATOR_PASSWORD: string;
  PUROLATOR_ACCOUNT_NUMBER: string;
  PUROLATOR_ORIGIN_POSTAL_CODE: string;
};

const SERVICE_AVAILABILITY_URL =
  "https://webservices.purolator.com/EWS/V2/ServiceAvailability/ServiceAvailabilityService.asmx";

const ESTIMATES_URL =
  "https://webservices.purolator.com/EWS/V2/Estimating/EstimatingService.asmx";

const MODEL_WEIGHTS_KG: Record<string, number> = {
  aviator: 0.8,
  "grand-valmontier": 0.7,
  chronaut: 0.9,
};

function authHeader(key: string, password: string) {
  return `Basic ${btoa(`${key}:${password}`)}`;
}

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function postSoap(
  url: string,
  action: string,
  xml: string,
  key: string,
  password: string
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "SOAPAction": action,
      "Authorization": authHeader(key, password),
      "User-Agent": "Valmontier/1.0",
      "Accept": "text/xml, application/soap+xml, */*",
      "Cache-Control": "no-cache",
    },
    body: xml,
  });

  const text = await res.text();

  return {
    ok: res.ok,
    status: res.status,
    text,
    contentType: res.headers.get("content-type") || "",
  };
}

function getWeightKg(slug: string) {
  return MODEL_WEIGHTS_KG[slug] ?? 0.8;
}

function normalizePostal(code: string) {
  return code.trim().replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function buildServiceAvailabilityXml(args: {
  originPostalCode: string;
  destinationCity: string;
  destinationProvince: string;
  destinationCountry: string;
  destinationPostalCode: string;
}) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:v1="http://purolator.com/pws/datatypes/v1"
  xmlns:v2="http://purolator.com/pws/serviceavailability/v2">
  <soapenv:Header/>
  <soapenv:Body>
    <v2:GetServicesOptionsRequest>
      <v1:RequestContext>
        <v1:Version>1.3</v1:Version>
        <v1:Language>en</v1:Language>
        <v1:GroupID>Valmontier</v1:GroupID>
        <v1:RequestReference>shipping-quote</v1:RequestReference>
      </v1:RequestContext>

      <v2:SenderAddress>
        <v1:PostalCode>${esc(args.originPostalCode)}</v1:PostalCode>
      </v2:SenderAddress>

      <v2:ReceiverAddress>
        <v1:City>${esc(args.destinationCity)}</v1:City>
        <v1:Province>${esc(args.destinationProvince)}</v1:Province>
        <v1:Country>${esc(args.destinationCountry)}</v1:Country>
        <v1:PostalCode>${esc(args.destinationPostalCode)}</v1:PostalCode>
      </v2:ReceiverAddress>
    </v2:GetServicesOptionsRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildEstimateXml(args: {
  accountNumber: string;
  originPostalCode: string;
  destinationCity: string;
  destinationProvince: string;
  destinationCountry: string;
  destinationPostalCode: string;
  serviceId: string;
  weightKg: number;
}) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:v1="http://purolator.com/pws/datatypes/v1"
  xmlns:v2="http://purolator.com/pws/estimating/v2">
  <soapenv:Header/>
  <soapenv:Body>
    <v2:GetQuickEstimateRequest>
      <v1:RequestContext>
        <v1:Version>2.1</v1:Version>
        <v1:Language>en</v1:Language>
        <v1:GroupID>Valmontier</v1:GroupID>
        <v1:RequestReference>shipping-quote</v1:RequestReference>
      </v1:RequestContext>

      <v2:BillingAccountNumber>${esc(args.accountNumber)}</v2:BillingAccountNumber>

      <v2:SenderAddress>
        <v1:PostalCode>${esc(args.originPostalCode)}</v1:PostalCode>
      </v2:SenderAddress>

      <v2:ReceiverAddress>
        <v1:City>${esc(args.destinationCity)}</v1:City>
        <v1:Province>${esc(args.destinationProvince)}</v1:Province>
        <v1:Country>${esc(args.destinationCountry)}</v1:Country>
        <v1:PostalCode>${esc(args.destinationPostalCode)}</v1:PostalCode>
      </v2:ReceiverAddress>

      <v2:PackageType>Package</v2:PackageType>
      <v2:TotalWeight>
        <v1:Value>${args.weightKg.toFixed(3)}</v1:Value>
        <v1:WeightUnit>kg</v1:WeightUnit>
      </v2:TotalWeight>
      <v2:TotalPieces>1</v2:TotalPieces>
      <v2:ServiceID>${esc(args.serviceId)}</v2:ServiceID>
    </v2:GetQuickEstimateRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function extractTagValues(xml: string, tag: string) {
  const regex = new RegExp(`<[^:>]*:?${tag}>(.*?)</[^:>]*:?${tag}>`, "gms");
  const values: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    values.push(match[1]);
  }
  return values;
}

function parseServiceAvailability(xml: string) {
  const ids = extractTagValues(xml, "ServiceID");
  const labels = extractTagValues(xml, "ServiceDescription");

  return ids.map((serviceId, i) => ({
    serviceId,
    label: labels[i] || serviceId,
  }));
}

function parseEstimatePriceCents(xml: string) {
  const values = extractTagValues(xml, "TotalPrice");
  const raw = values[0] || "0";
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

function dedupeServices(services: Array<{ serviceId: string; label: string }>) {
  const seen = new Set<string>();
  return services.filter((s) => {
    if (seen.has(s.serviceId)) return false;
    seen.add(s.serviceId);
    return true;
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json();

    const slug = String(body.slug || "").trim();
    const city = String(body.city || "").trim();
    const province = String(body.province || "").trim();
    const postalCode = normalizePostal(String(body.postalCode || ""));
    const country = String(body.country || "CA").trim();

    if (!slug || !city || !province || !postalCode || !country) {
      return new Response(JSON.stringify({ error: "Missing required shipping fields" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const {
      PUROLATOR_KEY,
      PUROLATOR_PASSWORD,
      PUROLATOR_ACCOUNT_NUMBER,
      PUROLATOR_ORIGIN_POSTAL_CODE,
    } = context.env;

    const originPostalCode = normalizePostal(PUROLATOR_ORIGIN_POSTAL_CODE);

    const svcXml = buildServiceAvailabilityXml({
      originPostalCode,
      destinationCity: city,
      destinationProvince: province,
      destinationCountry: country,
      destinationPostalCode: postalCode,
    });

    const svcRes = await postSoap(
      SERVICE_AVAILABILITY_URL,
      "http://purolator.com/pws/serviceavailability/v2/GetServicesOptions",
      svcXml,
      PUROLATOR_KEY,
      PUROLATOR_PASSWORD
    );

    if (!svcRes.ok || !svcRes.text.includes("Envelope")) {
      return new Response(
        JSON.stringify({
          error: "Purolator service availability failed",
          status: svcRes.status,
          detail: svcRes.text.slice(0, 2000),
        }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    const availableServices = dedupeServices(parseServiceAvailability(svcRes.text)).filter(
      (s) => s.serviceId && /Ground|Express/i.test(s.serviceId)
    );

    const weightKg = getWeightKg(slug);

    const quotedOptions = [];

    for (const svc of availableServices.slice(0, 8)) {
      const estXml = buildEstimateXml({
        accountNumber: PUROLATOR_ACCOUNT_NUMBER,
        originPostalCode,
        destinationCity: city,
        destinationProvince: province,
        destinationCountry: country,
        destinationPostalCode: postalCode,
        serviceId: svc.serviceId,
        weightKg,
      });

      const estRes = await postSoap(
        ESTIMATES_URL,
        "http://purolator.com/pws/estimating/v2/GetQuickEstimate",
        estXml,
        PUROLATOR_KEY,
        PUROLATOR_PASSWORD
      );

      if (!estRes.ok || !estRes.text.includes("Envelope")) continue;

      quotedOptions.push({
        serviceId: svc.serviceId,
        label: svc.label || svc.serviceId,
        priceCents: parseEstimatePriceCents(estRes.text),
      });
    }

    const sorted = quotedOptions
      .filter((x) => x.priceCents > 0)
      .sort((a, b) => a.priceCents - b.priceCents);

    return new Response(JSON.stringify({ options: sorted }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Failed to get shipping quote",
        detail: String(err?.message || err),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};