type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
}) => Promise<Response> | Response;

type Env = {
  STRIPE_SECRET_KEY: string;
  SITE_URL: string;
};

const PRODUCT_BASE_PRICES: Record<string, number> = {
  aviator: 39999,
  "grand-valmontier": 48000,
  chronaut: 29999,
};

const PRICE_MODIFIERS = {
  strap: {
    "Steel Bracelet": 8000,
    "Black Leather": 0,
    "Navy Leather": 0,
    "Brown Leather": 0,
    "Tan Leather": 1000,
    "Leather Strap": 0,
  },
  handColor: {
    Blue: 0,
    Black: 0,
    Steel: 0,
    Gold: 2000,
    "Blue (Lume)": 1500,
    "Black (Lume)": 1500,
    "Steel (Lume)": 1500,
    "Gold (Lume)": 3000,
  },
  dialColor: {
    "White Roman": 0,
    Ivory: 0,
    Silver: 1000,
    "Sky Blue": 2500,
    Black: 1500,
    Blue: 2500,
  },
};

function getBuildPriceCents(slug: string, options: any = {}) {
  const base = PRODUCT_BASE_PRICES[slug] ?? 0;
  const strap = PRICE_MODIFIERS.strap[options.strap as keyof typeof PRICE_MODIFIERS.strap] ?? 0;
  const handColor =
    PRICE_MODIFIERS.handColor[options.handColor as keyof typeof PRICE_MODIFIERS.handColor] ?? 0;
  const dialColor =
    PRICE_MODIFIERS.dialColor[options.dialColor as keyof typeof PRICE_MODIFIERS.dialColor] ?? 0;

  return base + strap + handColor + dialColor;
}

function formBody(params: Record<string, string>) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) body.append(key, value);
  return body;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json();

    const slug = String(body.slug || "").trim();
    const productName = String(body.productName || "Valmontier Watch").trim();
    const options = body.options || {};
    const shipping = body.shipping || null;

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing product slug" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const unitAmount = getBuildPriceCents(slug, options);

    if (!unitAmount) {
      return new Response(JSON.stringify({ error: "Invalid pricing configuration" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const params: Record<string, string> = {
      mode: "payment",
      success_url: `${context.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${context.env.SITE_URL}/products/${slug}`,
      "line_items[0][price_data][currency]": "cad",
      "line_items[0][price_data][product_data][name]": productName,
      "line_items[0][price_data][product_data][description]": JSON.stringify(options),
      "line_items[0][price_data][unit_amount]": String(unitAmount),
      "line_items[0][quantity]": "1",
      "shipping_address_collection[allowed_countries][0]": "CA",
      "shipping_address_collection[allowed_countries][1]": "US",
    };

    if (shipping?.priceCents && shipping?.label) {
      params["shipping_options[0][shipping_rate_data][type]"] = "fixed_amount";
      params["shipping_options[0][shipping_rate_data][display_name]"] = String(shipping.label);
      params["shipping_options[0][shipping_rate_data][fixed_amount][amount]"] = String(
        shipping.priceCents
      );
      params["shipping_options[0][shipping_rate_data][fixed_amount][currency]"] = "cad";
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody(params),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || "Stripe error" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: data.url }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};