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

export const onRequestGet = async (context: { env: Env }) => {
  try {
    const result = await context.env.DB.prepare(
      `SELECT *
       FROM bespoke_requests
       ORDER BY created_at DESC`
    )
      .bind()
      .all();

    return new Response(JSON.stringify(result.results), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
};