/**
 * Daily permit ingest + hourly lead alerts. Crons in wrangler.jsonc:
 *   "15 9 * * *"  ingest every active source
 *   "0 * * * *"   email each org whose local alert hour it is
 * Both can be triggered by hand with `Authorization: Bearer <INGEST_SECRET>`:
 *   POST /run      ingest now
 *   POST /alerts   send alerts that are due now
 */
import { createClient } from "@supabase/supabase-js";
import { runAlerts } from "../../../src/lib/alerts/send";
import { runAll } from "../../../src/lib/ingest/run";

// Minimal shapes of the Workers runtime objects we use (keeps the app's tsconfig free of workers-types).
type Ctx = { waitUntil(p: Promise<unknown>): void };
type ScheduledEvent = { cron: string };
// Cloudflare Email Sending binding (`send_email` in wrangler.jsonc).
type SendEmail = {
  send(msg: { to: string[]; from: string | { email: string; name?: string }; subject: string; text: string; html: string }): Promise<{ messageId: string }>;
};

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SOCRATA_APP_TOKEN?: string;
  APIFY_TOKEN?: string;
  INGEST_SECRET?: string;
  EMAIL?: SendEmail;
  /** Sender address on a domain onboarded to Email Sending */
  ALERT_FROM?: string;
  ALERT_FROM_NAME?: string;
  SITE_URL?: string;
};

const INGEST_CRON = "15 9 * * *";

const supabase = (env: Env) =>
  createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function ingest(env: Env) {
  const results = await runAll(supabase(env), { appToken: env.SOCRATA_APP_TOKEN, apifyToken: env.APIFY_TOKEN });
  for (const r of results) {
    // One structured line per source shows up in Workers observability.
    console.log(JSON.stringify({ event: "ingest", ...r }));
  }
  return results;
}

async function alerts(env: Env) {
  const { EMAIL, ALERT_FROM } = env;
  if (!EMAIL || !ALERT_FROM) {
    console.log(JSON.stringify({ event: "alerts", skipped: "EMAIL binding or ALERT_FROM not set" }));
    return [];
  }
  const from = { email: ALERT_FROM, name: env.ALERT_FROM_NAME ?? "PatioPing" };
  const results = await runAlerts(supabase(env), {
    siteUrl: env.SITE_URL ?? "https://patioping.com",
    mailer: async (msg) => {
      try {
        await EMAIL.send({ from, ...msg });
      } catch (e) {
        const code = (e as { code?: string }).code;
        throw new Error(`Email Sending${code ? ` ${code}` : ""}: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  });
  for (const r of results) console.log(JSON.stringify({ event: "alert", ...r }));
  return results;
}

const worker = {
  async scheduled(event: ScheduledEvent, env: Env, ctx: Ctx) {
    ctx.waitUntil(event.cron === INGEST_CRON ? ingest(env) : alerts(env));
  },

  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const job = { "/run": ingest, "/alerts": alerts }[url.pathname];
    if (req.method !== "POST" || !job) return new Response("Not found", { status: 404 });
    if (!env.INGEST_SECRET || req.headers.get("authorization") !== `Bearer ${env.INGEST_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
    return Response.json(await job(env));
  },
};

export default worker;
