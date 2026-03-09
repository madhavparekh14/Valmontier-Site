type D1Database = {
  prepare: (query: string) => {
    bind: (...values: any[]) => {
      run: () => Promise<any>;
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

type ArchivePayload = {
  id?: number | string;
};

export const onRequestPost = async (context: PagesContext<Env>) => {
  try {
    const body = (await context.request.json()) as ArchivePayload;

    if (!body.id) {
      return new Response(JSON.stringify({ error: "Missing bespoke id" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    await context.env.DB.prepare(
      `UPDATE bespoke_requests SET archived = 1 WHERE id = ?`
    )
      .bind(body.id)
      .run();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Archive failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};