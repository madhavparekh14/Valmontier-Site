type D1Database = {
  prepare: (query: string) => {
    bind: (...values: any[]) => {
      run: () => Promise<any>;
    };
  };
};

type Env = { DB: D1Database };

type PagesContext<E = unknown> = {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
};

export const onRequestPost = async (context: PagesContext<Env>) => {
  try {
    const body = (await context.request.json()) as { id?: string | number };

    if (!body.id) {
      return new Response(JSON.stringify({ error: "Missing order id" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    await context.env.DB.prepare(
      `UPDATE orders SET archived = 1 WHERE id = ?`
    ).bind(body.id).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to archive order" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};