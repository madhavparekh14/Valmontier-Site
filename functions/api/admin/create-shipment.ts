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

  PUROLATOR_ORIGIN_COMPANY?: string;
  PUROLATOR_ORIGIN_NAME?: string;
  PUROLATOR_ORIGIN_PHONE?: string;
  PUROLATOR_ORIGIN_ADDRESS1?: string;
  PUROLATOR_ORIGIN_CITY?: string;
  PUROLATOR_ORIGIN_PROVINCE?: string;
  PUROLATOR_ORIGIN_COUNTRY?: string;
};

const SHIPPING_URL =
  "https://devwebservices.purolator.com/EWS/V2/Shipping/ShippingService.asmx";
const DOCUMENTS_URL =
  "https://devwebservices.purolator.com/EWS/V1/Document/DocumentService.asmx";

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

function splitAddressLine(line: string) {
  const trimmed = String(line || "").trim();
  const match = trimmed.match(/^(\d+)\s+(.*)$/);
  if (!match) {
    return {
      streetNumber: "",
      streetName: trimmed,
    };
  }

  return {
    streetNumber: match[1],
    streetName: match[2],
  };
}

function textBetween(xml: string, tag: string) {
  const re = new RegExp(`<[^:>]*:?${tag}>(.*?)</[^:>]*:?${tag}>`, "gms");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
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
      "content-type": "text/xml; charset=utf-8",
      SOAPAction: action,
      Authorization: authHeader(key, password),
    },
    body: xml,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Purolator HTTP ${res.status}: ${text.slice(0, 800)}`);
  }

  if (text.includes("<Fault>") || text.includes(":Fault>")) {
    throw new Error(`Purolator SOAP fault: ${text.slice(0, 1200)}`);
  }

  return text;
}

function buildCreateShipmentXml(args: {
  accountNumber: string;
  originCompany: string;
  originName: string;
  originPhone: string;
  originAddress1: string;
  originCity: string;
  originProvince: string;
  originCountry: string;
  originPostalCode: string;

  receiverName: string;
  receiverCompany?: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverAddress1: string;
  receiverCity: string;
  receiverProvince: string;
  receiverCountry: string;
  receiverPostalCode: string;

  serviceId: string;
  weightKg: number;
  description: string;
}) {
  const senderStreet = splitAddressLine(args.originAddress1);
  const receiverStreet = splitAddressLine(args.receiverAddress1);
  const shipmentDate = new Date().toISOString().slice(0, 10);

  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:v1="http://purolator.com/pws/datatypes/v1"
  xmlns:v2="http://purolator.com/pws/shipping/v2">
  <soapenv:Header/>
  <soapenv:Body>
    <v2:CreateShipmentRequest>
      <v1:RequestContext>
        <v1:Version>2.0</v1:Version>
        <v1:Language>en</v1:Language>
        <v1:GroupID>Valmontier</v1:GroupID>
        <v1:RequestReference>create-shipment</v1:RequestReference>
      </v1:RequestContext>

      <v2:Shipment>
        <v2:SenderInformation>
          <v2:Address>
            <v1:Name>${esc(args.originName)}</v1:Name>
            <v1:Company>${esc(args.originCompany)}</v1:Company>
            <v1:PhoneNumber>
              <v1:CountryCode>1</v1:CountryCode>
              <v1:AreaCode>${esc(args.originPhone.slice(0, 3) || "905")}</v1:AreaCode>
              <v1:Phone>${esc(args.originPhone.slice(3) || "5555555")}</v1:Phone>
            </v1:PhoneNumber>
            <v1:StreetNumber>${esc(senderStreet.streetNumber)}</v1:StreetNumber>
            <v1:StreetName>${esc(senderStreet.streetName)}</v1:StreetName>
            <v1:City>${esc(args.originCity)}</v1:City>
            <v1:Province>${esc(args.originProvince)}</v1:Province>
            <v1:Country>${esc(args.originCountry)}</v1:Country>
            <v1:PostalCode>${esc(args.originPostalCode)}</v1:PostalCode>
          </v2:Address>
        </v2:SenderInformation>

        <v2:ReceiverInformation>
          <v2:Address>
            <v1:Name>${esc(args.receiverName)}</v1:Name>
            <v1:Company>${esc(args.receiverCompany || args.receiverName)}</v1:Company>
            <v1:PhoneNumber>
              <v1:CountryCode>1</v1:CountryCode>
              <v1:AreaCode>${esc(args.receiverPhone.slice(0, 3) || "000")}</v1:AreaCode>
              <v1:Phone>${esc(args.receiverPhone.slice(3) || "0000000")}</v1:Phone>
            </v1:PhoneNumber>
            <v1:StreetNumber>${esc(receiverStreet.streetNumber)}</v1:StreetNumber>
            <v1:StreetName>${esc(receiverStreet.streetName)}</v1:StreetName>
            <v1:City>${esc(args.receiverCity)}</v1:City>
            <v1:Province>${esc(args.receiverProvince)}</v1:Province>
            <v1:Country>${esc(args.receiverCountry)}</v1:Country>
            <v1:PostalCode>${esc(args.receiverPostalCode)}</v1:PostalCode>
          </v2:Address>
        </v2:ReceiverInformation>

        <v2:ShipmentDate>${shipmentDate}</v2:ShipmentDate>

        <v2:PackageInformation>
          <v2:ServiceID>${esc(args.serviceId)}</v2:ServiceID>
          <v2:Description>${esc(args.description)}</v2:Description>
          <v2:TotalWeight>
            <v1:Value>${args.weightKg.toFixed(3)}</v1:Value>
            <v1:WeightUnit>kg</v1:WeightUnit>
          </v2:TotalWeight>
          <v2:TotalPieces>1</v2:TotalPieces>
          <v2:PiecesInformation>
            <v2:Piece>
              <v2:Weight>
                <v1:Value>${args.weightKg.toFixed(3)}</v1:Value>
                <v1:WeightUnit>kg</v1:WeightUnit>
              </v2:Weight>
            </v2:Piece>
          </v2:PiecesInformation>
        </v2:PackageInformation>

        <v2:PaymentInformation>
          <v2:PaymentType>Sender</v2:PaymentType>
          <v2:RegisteredAccountNumber>${esc(args.accountNumber)}</v2:RegisteredAccountNumber>
        </v2:PaymentInformation>

        <v2:NotificationInformation>
          <v2:ConfirmationEmailAddress>${esc(args.receiverEmail)}</v2:ConfirmationEmailAddress>
        </v2:NotificationInformation>
      </v2:Shipment>
    </v2:CreateShipmentRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildGetDocumentsXml(pin: string) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:v1="http://purolator.com/pws/datatypes/v1"
  xmlns:v2="http://purolator.com/pws/document/v1">
  <soapenv:Header/>
  <soapenv:Body>
    <v2:GetDocumentsRequest>
      <v1:RequestContext>
        <v1:Version>1.3</v1:Version>
        <v1:Language>en</v1:Language>
        <v1:GroupID>Valmontier</v1:GroupID>
        <v1:RequestReference>get-documents</v1:RequestReference>
      </v1:RequestContext>

      <v2:DocumentCriterium>
        <v2:PIN>${esc(pin)}</v2:PIN>
      </v2:DocumentCriterium>

      <v2:DocumentTypes>
        <v2:DocumentType>ShippingLabel</v2:DocumentType>
      </v2:DocumentTypes>
    </v2:GetDocumentsRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function parseCreateShipment(xml: string) {
  const shipmentPin =
    textBetween(xml, "ShipmentPIN")[0] ||
    textBetween(xml, "PIN")[0] ||
    "";

  const trackingNumber =
    textBetween(xml, "TrackingNumber")[0] ||
    shipmentPin;

  return {
    shipmentPin,
    trackingNumber,
  };
}

function parseLabel(xml: string) {
  const documentData =
    textBetween(xml, "DocumentData")[0] ||
    textBetween(xml, "Data")[0] ||
    "";

  const mimeType =
    textBetween(xml, "MimeType")[0] ||
    "application/pdf";

  return {
    documentData,
    mimeType,
  };
}

const MODEL_PACKAGE_PROFILES: Record<
  string,
  { weightKg: number; description: string }
> = {
  "Valmontier Aviator": { weightKg: 0.8, description: "Valmontier Aviator watch" },
  "Grand Valmontier": { weightKg: 0.7, description: "Grand Valmontier watch" },
  "Valmontier Chronaut": { weightKg: 0.9, description: "Valmontier Chronaut watch" },
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json();

    const orderId = String(body.orderId || "").trim();
    const serviceId = String(body.serviceId || "").trim() || "PurolatorGround";

    const customerName = String(body.customerName || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "0000000000").replace(/\D/g, "");
    const model = String(body.model || "").trim();

    const address = body.address || {};
    const line1 = String(address.line1 || "").trim();
    const city = String(address.city || "").trim();
    const province = String(address.province || "").trim();
    const postalCode = String(address.postalCode || "").trim().replace(/\s+/g, "").toUpperCase();
    const country = String(address.country || "CA").trim();

    if (!orderId || !customerName || !email || !line1 || !city || !province || !postalCode) {
      return new Response(JSON.stringify({ error: "Missing shipment fields" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const {
      PUROLATOR_KEY,
      PUROLATOR_PASSWORD,
      PUROLATOR_ACCOUNT_NUMBER,
      PUROLATOR_ORIGIN_POSTAL_CODE,
      PUROLATOR_ORIGIN_COMPANY,
      PUROLATOR_ORIGIN_NAME,
      PUROLATOR_ORIGIN_PHONE,
      PUROLATOR_ORIGIN_ADDRESS1,
      PUROLATOR_ORIGIN_CITY,
      PUROLATOR_ORIGIN_PROVINCE,
      PUROLATOR_ORIGIN_COUNTRY,
    } = context.env;

    if (
      !PUROLATOR_KEY ||
      !PUROLATOR_PASSWORD ||
      !PUROLATOR_ACCOUNT_NUMBER ||
      !PUROLATOR_ORIGIN_POSTAL_CODE
    ) {
      return new Response(JSON.stringify({ error: "Missing Purolator environment variables" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const pkg = MODEL_PACKAGE_PROFILES[model] || {
      weightKg: 0.8,
      description: model || "Valmontier watch shipment",
    };

    const createXml = buildCreateShipmentXml({
      accountNumber: PUROLATOR_ACCOUNT_NUMBER,
      originCompany: PUROLATOR_ORIGIN_COMPANY || "Valmontier",
      originName: PUROLATOR_ORIGIN_NAME || "Valmontier Shipping",
      originPhone: String(PUROLATOR_ORIGIN_PHONE || "9055555555").replace(/\D/g, ""),
      originAddress1: PUROLATOR_ORIGIN_ADDRESS1 || "1280 Main St W",
      originCity: PUROLATOR_ORIGIN_CITY || "Hamilton",
      originProvince: PUROLATOR_ORIGIN_PROVINCE || "ON",
      originCountry: PUROLATOR_ORIGIN_COUNTRY || "CA",
      originPostalCode: PUROLATOR_ORIGIN_POSTAL_CODE,

      receiverName: customerName,
      receiverCompany: customerName,
      receiverPhone: phone,
      receiverEmail: email,
      receiverAddress1: line1,
      receiverCity: city,
      receiverProvince: province,
      receiverCountry: country,
      receiverPostalCode: postalCode,

      serviceId,
      weightKg: pkg.weightKg,
      description: pkg.description,
    });

    const createRespXml = await postSoap(
      SHIPPING_URL,
      "http://purolator.com/pws/shipping/v2/CreateShipment",
      createXml,
      PUROLATOR_KEY,
      PUROLATOR_PASSWORD
    );

    const { shipmentPin, trackingNumber } = parseCreateShipment(createRespXml);

    if (!shipmentPin) {
      return new Response(
        JSON.stringify({
          error: "Shipment created response did not include a PIN",
          detail: createRespXml.slice(0, 1500),
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const docsXml = buildGetDocumentsXml(shipmentPin);

    const docsRespXml = await postSoap(
      DOCUMENTS_URL,
      "http://purolator.com/pws/document/v1/GetDocuments",
      docsXml,
      PUROLATOR_KEY,
      PUROLATOR_PASSWORD
    );

    const { documentData, mimeType } = parseLabel(docsRespXml);

    return new Response(
      JSON.stringify({
        ok: true,
        orderId,
        shipmentPin,
        trackingNumber,
        label: documentData
          ? {
              mimeType,
              base64: documentData,
            }
          : null,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Create shipment failed",
        detail: String(err?.message || err),
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
};