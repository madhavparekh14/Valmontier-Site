type D1Database = {
  prepare: (query: string) => {
    bind: (...values: any[]) => {
      run: () => Promise<{ meta?: { last_row_id?: number } }>;
    };
  };
};

type Env = {
  DB: D1Database;
};

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
}) => Promise<Response> | Response;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const contentType = context.request.headers.get("content-type") || "";

    let body: any = {};
    if (contentType.includes("application/json")) {
      body = await context.request.json();
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await context.request.formData();
      body = Object.fromEntries(form.entries());
    } else {
      return new Response(JSON.stringify({ error: "Unsupported content-type" }), {
        status: 415,
        headers: { "content-type": "application/json" },
      });
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = body.phone ? String(body.phone).trim() : null;

    const model = body.model ? String(body.model).trim() : null;
    const dialColor = body.dialColor ? String(body.dialColor).trim() : null;
    const handColor = body.handColor ? String(body.handColor).trim() : null;
    const strap = body.strap ? String(body.strap).trim() : null;

    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields: name, email, message" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (name.length > 120 || email.length > 200 || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Input too long" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const stmt = context.env.DB.prepare(
      `INSERT INTO bespoke_requests
        (name, email, phone, model, dial_color, hand_color, strap, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(name, email, phone, model, dialColor, handColor, strap, message);

    const result = await stmt.run();

    return new Response(JSON.stringify({ ok: true, id: result?.meta?.last_row_id ?? null }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Server error", detail: String(err?.message || err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};