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
  "https://devwebservices.purolator.com/EWS/V2/ServiceAvailability/ServiceAvailabilityService.asmx";
const ESTIMATES_URL =
  "https://devwebservices.purolator.com/EWS/V2/Estimating/EstimatingService.asmx";

// Start with fixed package profiles per model
const PACKAGE_PROFILES: Record<
  string,
  { weightKg: number; packageType: "CustomerPackaging" }
> = {
  aviator: { weightKg: 0.8, packageType: "CustomerPackaging" },
  "grand-valmontier": { weightKg: 0.7, packageType: "CustomerPackaging" },
  chronaut: { weightKg: 0.9, packageType: "CustomerPackaging" },
};

const ALLOWED_SERVICES = new Set([
  "PurolatorGround",
  "PurolatorExpress",
]);

function authHeader(key: string, password: string) {
  const raw = `${key}:${password}`;
  // Cloudflare Workers supports btoa
  return `Basic ${btoa(raw)}`;
}

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildValidateXml(city: string, province: string, country: string, postalCode: string) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://purolator.com/pws/datatypes/v1" xmlns:v2="http://purolator.com/pws/serviceavailability/v2">
  <soapenv:Header/>
  <soapenv:Body>
    <v2:ValidateCityPostalCodeZipRequest>
      <v1:RequestContext>
        <v1:Version>2.0</v1:Version>
        <v1:Language>en</v1:Language>
        <v1:GroupID>Valmontier</v1:GroupID>
        <v1:RequestReference>validate-address</v1:RequestReference>
      </v1:RequestContext>
      <v2:Addresses>
        <v1:ShortAddress>
          <v1:City>${esc(city)}</v1:City>
          <v1:Province>${esc(province)}</v1:Province>
          <v1:Country>${esc(country)}</v1:Country>
          <v1:PostalCode>${esc(postalCode)}</v1:PostalCode>
        </v1:ShortAddress>
      </v2:Addresses>
    </v2:ValidateCityPostalCodeZipRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildServiceOptionsXml(
  accountNumber: string,
  originPostalCode: string,
  city: string,
  province: string,
  country: string,
  postalCode: string
) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://purolator.com/pws/datatypes/v1" xmlns:v2="http://purolator.com/pws/serviceavailability/v2">
  <soapenv:Header/>
  <soapenv:Body>
    <v2:GetServiceOptionsRequest>
      <v1:RequestContext>
        <v1:Version>2.0</v1:Version>
        <v1:Language>en</v1:Language>
        <v1:GroupID>Valmontier</v1:GroupID>
        <v1:RequestReference>service-options</v1:RequestReference>
      </v1:RequestContext>
      <v2:BillingAccountNumber>${esc(accountNumber)}</v2:BillingAccountNumber>
      <v2:SenderAddress>
        <v1:City>Hamilton</v1:City>
        <v1:Province>ON</v1:Province>
        <v1:Country>CA</v1:Country>
        <v1:PostalCode>${esc(originPostalCode)}</v1:PostalCode>
      </v2:SenderAddress>
      <v2:ReceiverAddress>
        <v1:City>${esc(city)}</v1:City>
        <v1:Province>${esc(province)}</v1:Province>
        <v1:Country>${esc(country)}</v1:Country>
        <v1:PostalCode>${esc(postalCode)}</v1:PostalCode>
      </v2:ReceiverAddress>
    </v2:GetServiceOptionsRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildQuickEstimateXml(
  accountNumber: string,
  originPostalCode: string,
  city: string,
  province: string,
  country: string,
  postalCode: string,
  packageType: string,
  weightKg: number
) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://purolator.com/pws/datatypes/v1" xmlns:v2="http://purolator.com/pws/estimates/v2">
  <soapenv:Header/>
  <soapenv:Body>
    <v2:GetQuickEstimateRequest>
      <v1:RequestContext>
        <v1:Version>2.2</v1:Version>
        <v1:Language>en</v1:Language>
        <v1:GroupID>Valmontier</v1:GroupID>
        <v1:RequestReference>quick-estimate</v1:RequestReference>
      </v1:RequestContext>
      <v2:BillingAccountNumber>${esc(accountNumber)}</v2:BillingAccountNumber>
      <v2:SenderPostalCode>${esc(originPostalCode)}</v2:SenderPostalCode>
      <v2:ReceiverAddress>
        <v1:City>${esc(city)}</v1:City>
        <v1:Province>${esc(province)}</v1:Province>
        <v1:Country>${esc(country)}</v1:Country>
        <v1:PostalCode>${esc(postalCode)}</v1:PostalCode>
      </v2:ReceiverAddress>
      <v2:PackageType>${esc(packageType)}</v2:PackageType>
      <v2:TotalWeight>
        <v1:Value>${weightKg.toFixed(3)}</v1:Value>
        <v1:WeightUnit>kg</v1:WeightUnit>
      </v2:TotalWeight>
    </v2:GetQuickEstimateRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

async function postSoap(url: string, action: string, xml: string, key: string, password: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "text/xml; charset=utf-8",
      SOAPAction: action,
      Authorization: authHeader(key, password),
    },
    body: xml,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Purolator HTTP ${res.status}: ${text.slice(0, 500)}`);
  }

  return text;
}

function textBetween(xml: string, tag: string) {
  const re = new RegExp(`<[^:>]*:?${tag}>(.*?)</[^:>]*:?${tag}>`, "gms");
  const out: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

function parseServiceIds(xml: string) {
  return textBetween(xml, "ServiceID").filter((x) => ALLOWED_SERVICES.has(x));
}

function parseEstimates(xml: string) {
  // Lightweight XML scraping for first pass
  const blocks = xml.match(/<[^:>]*:?ShipmentEstimate\b[\s\S]*?<\/[^:>]*:?ShipmentEstimate>/gms) || [];

  return blocks
    .map((block) => {
      const serviceId = textBetween(block, "ServiceID")[0] || "";
      const totalPrice = textBetween(block, "TotalPrice")[0] || "0";
      const expectedDeliveryDate = textBetween(block, "ExpectedDeliveryDate")[0] || "";
      const estimatedTransitDays = textBetween(block, "EstimatedTransitDays")[0] || "";

      return {
        serviceId,
        label: serviceId
          .replace("Purolator", "Purolator ")
          .replace("Ground", "Ground")
          .replace("Express", "Express")
          .trim(),
        priceCents: Math.round(Number(totalPrice) * 100),
        currency: "CAD",
        expectedDeliveryDate,
        estimatedTransitDays,
      };
    })
    .filter((x) => x.serviceId && ALLOWED_SERVICES.has(x.serviceId) && Number.isFinite(x.priceCents));
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json();

    const slug = String(body.slug || "").trim();
    const city = String(body.city || "").trim();
    const province = String(body.province || "").trim();
    const country = String(body.country || "CA").trim();
    const postalCode = String(body.postalCode || "").trim().replace(/\s+/g, "").toUpperCase();

    if (!slug || !city || !province || !country || !postalCode) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const profile = PACKAGE_PROFILES[slug];
    if (!profile) {
      return new Response(JSON.stringify({ error: "Unknown product slug" }), {
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

    if (!PUROLATOR_KEY || !PUROLATOR_PASSWORD || !PUROLATOR_ACCOUNT_NUMBER || !PUROLATOR_ORIGIN_POSTAL_CODE) {
      return new Response(JSON.stringify({ error: "Purolator environment variables are missing" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // 1) Validate address
    const validateXml = buildValidateXml(city, province, country, postalCode);
    await postSoap(
      SERVICE_AVAILABILITY_URL,
      "http://purolator.com/pws/serviceavailability/v2/ValidateCityPostalCodeZip",
      validateXml,
      PUROLATOR_KEY,
      PUROLATOR_PASSWORD
    );

    // 2) Get available services
    const serviceOptionsXml = buildServiceOptionsXml(
      PUROLATOR_ACCOUNT_NUMBER,
      PUROLATOR_ORIGIN_POSTAL_CODE,
      city,
      province,
      country,
      postalCode
    );

    const serviceXml = await postSoap(
      SERVICE_AVAILABILITY_URL,
      "http://purolator.com/pws/serviceavailability/v2/GetServiceOptions",
      serviceOptionsXml,
      PUROLATOR_KEY,
      PUROLATOR_PASSWORD
    );

    const availableServices = new Set(parseServiceIds(serviceXml));

    // 3) Get quick estimates
    const estimateXml = buildQuickEstimateXml(
      PUROLATOR_ACCOUNT_NUMBER,
      PUROLATOR_ORIGIN_POSTAL_CODE,
      city,
      province,
      country,
      postalCode,
      profile.packageType,
      profile.weightKg
    );

    const estimateRespXml = await postSoap(
      ESTIMATES_URL,
      "http://purolator.com/pws/estimates/v2/GetQuickEstimate",
      estimateXml,
      PUROLATOR_KEY,
      PUROLATOR_PASSWORD
    );

    const estimates = parseEstimates(estimateRespXml).filter((x) => availableServices.has(x.serviceId));

    return new Response(JSON.stringify({ options: estimates }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Shipping quote failed", detail: String(err?.message || err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};