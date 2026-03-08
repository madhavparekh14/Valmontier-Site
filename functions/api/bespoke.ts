type D1Database = {
  prepare: (query: string) => {
    bind: (...values: any[]) => {
      run: () => Promise<{ meta?: { last_row_id?: number } }>;
    };
  };
};

type Env = {
  DB: D1Database;
  MAILER_URL: string;
  MAILER_SECRET: string;
};

type PagesContext<E = unknown> = {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
};

type BespokePayload = {
  name?: string;
  email?: string;
  budget?: string | null;
  styleBrand?: string | null;
  styleBuild?: string | null;
  caseSize?: string | null;
  caseFinish?: string | null;
  bracelet?: string | null;
  hands?: string | null;
  movement?: string | null;
  notes?: string | null;
};

export const onRequestPost = async (context: PagesContext<Env>) => {
  try {
    const body = (await context.request.json()) as BespokePayload;

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
    const notes = String(body.notes || "").trim();

    if (!name || !email || !notes) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
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
    const requestId = result?.meta?.last_row_id ?? null;

    context.waitUntil(
      fetch(context.env.MAILER_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mailer-secret": context.env.MAILER_SECRET,
        },
        body: JSON.stringify({
          requestId,
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
          notes,
        }),
      }).catch((error) => {
        console.error("Mailer request failed:", error);
      })
    );

    return new Response(JSON.stringify({ ok: true, id: requestId }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("Bespoke submission failed:", err);

    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};