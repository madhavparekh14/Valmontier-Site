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

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
}) => Promise<Response> | Response;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await context.env.DB.prepare(
      `SELECT *
       FROM bespoke_requests
       ORDER BY created_at DESC`
    )
      .bind()
      .all();

    return new Response(JSON.stringify(result.results || []), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
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