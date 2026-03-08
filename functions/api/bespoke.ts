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
    const budget = body.budget ? String(body.budget).trim() : null;
    const styleBrand = body.styleBrand ? String(body.styleBrand).trim() : null;
    const styleBuild = body.styleBuild ? String(body.styleBuild).trim() : null;
    const caseSize = body.caseSize ? String(body.caseSize).trim() : null;
    const caseFinish = body.caseFinish ? String(body.caseFinish).trim() : null;
    const bracelet = body.bracelet ? String(body.bracelet).trim() : null;
    const hands = body.hands ? String(body.hands).trim() : null;
    const movement = body.movement ? String(body.movement).trim() : null;
    const notes = String(body.notes || body.message || "").trim();

    if (!name || !email || !notes) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, notes" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    if (
      name.length > 120 ||
      email.length > 200 ||
      notes.length > 5000 ||
      (budget && budget.length > 50) ||
      (styleBrand && styleBrand.length > 100) ||
      (styleBuild && styleBuild.length > 100) ||
      (caseSize && caseSize.length > 50) ||
      (caseFinish && caseFinish.length > 100) ||
      (bracelet && bracelet.length > 100) ||
      (hands && hands.length > 100) ||
      (movement && movement.length > 100)
    ) {
      return new Response(JSON.stringify({ error: "Input too long" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const stmt = context.env.DB.prepare(
      `INSERT INTO bespoke_requests
        (name, email, budget, style_brand, style_build, case_size, case_finish, bracelet, hands, movement, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      name,
      email,
      budget,
      styleBrand,
      styleBuild,
      caseSize,
      caseFinish,
      bracelet,
      hands,
      movement,
      notes
    );

    const result = await stmt.run();

    return new Response(
      JSON.stringify({ ok: true, id: result?.meta?.last_row_id ?? null }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        detail: String(err?.message || err),
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
};