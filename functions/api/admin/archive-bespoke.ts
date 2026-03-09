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

export const onRequestGet = async (context: PagesContext<Env>) => {
  try {
    const url = new URL(context.request.url);
    const showArchived = url.searchParams.get("archived") === "1";

    const query = showArchived
      ? `SELECT * FROM bespoke_requests ORDER BY created_at DESC`
      : `SELECT * FROM bespoke_requests WHERE archived = 0 ORDER BY created_at DESC`;

    const result = await context.env.DB.prepare(query)
      .bind()
      .all();

    return new Response(JSON.stringify(result.results || []), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};