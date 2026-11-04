/**
 * Daily permit ingest. Runs on the cron in wrangler.jsonc; can also be triggered by
 * POST /run with `Authorization: Bearer <INGEST_SECRET>` (useful after adding a source).
 */
import { createClient } from "@supabase/supabase-js";
import { runAll } from "../../../src/lib/ingest/run";

// Minimal shapes of the Workers runtime objects we use (keeps the app's tsconfig free of workers-types).
type Ctx = { waitUntil(p: Promise<unknown>): void };

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SOCRATA_APP_TOKEN?: string;
  INGEST_SECRET?: string;
};

async function ingest(env: Env) {
  const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const results = await runAll(db, { appToken: env.SOCRATA_APP_TOKEN });
  for (const r of results) {
    // One structured line per source shows up in Workers observability.
    console.log(JSON.stringify({ event: "ingest", ...r }));
  }
  return results;
}

const worker = {
  async scheduled(_event: unknown, env: Env, ctx: Ctx) {
    ctx.waitUntil(ingest(env));
  },

  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (req.method !== "POST" || url.pathname !== "/run") return new Response("Not found", { status: 404 });
    if (!env.INGEST_SECRET || req.headers.get("authorization") !== `Bearer ${env.INGEST_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
    return Response.json(await ingest(env));
  },
};

export default worker;
