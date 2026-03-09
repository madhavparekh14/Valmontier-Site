type D1Database = {
  prepare: (query: string) => {
    bind: (...values: any[]) => {
      all: () => Promise<{ results: any[] }>;
    };
  };
};

type Env = {
  DB: D1Database;
};

type PagesContext<E = unknown> = {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
};

export const onRequestPost = async (context) => {
  try {
    const body = await context.request.json();
    const id = body.id;

    await context.env.DB.prepare(
      "UPDATE bespoke_requests SET archived = 1 WHERE id = ?"
    )
      .bind(id)
      .run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Archive failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};