/**
 * PatioPing ingest CLI.
 *
 *   npm run ingest -- discover austin            columns + 3 sample rows (no DB)
 *   npm run ingest -- dry-run austin --days 90   weekly pool/fence/outdoor counts (no DB) → Phase 0 go/no-go
 *   npm run ingest -- sync-config                write src/lib/ingest/configs.ts into the jurisdictions table
 *   npm run ingest -- run [austin] [--days 7]    fetch, store, match leads (needs SUPABASE_SERVICE_ROLE_KEY)
 *
 * Reads .env.local if present. SOCRATA_APP_TOKEN is optional but avoids throttling.
 */
import { createClient } from "@supabase/supabase-js";
import { asJurisdiction, sourceByKey, SOURCES } from "../src/lib/ingest/configs";
import { normalize, weeklyCounts } from "../src/lib/ingest/normalize";
import { runAll, runSource } from "../src/lib/ingest/run";
import { discover, fetchSource } from "../src/lib/ingest/sources";
import type { Jurisdiction } from "../src/lib/ingest/types";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* optional */
}

const [cmd, ...rest] = process.argv.slice(2);
const flag = (name: string, fallback: number) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? Number(rest[i + 1]) : fallback;
};
const positional = rest.filter((a, i) => !a.startsWith("--") && !rest[i - 1]?.startsWith("--"));
const appToken = process.env.SOCRATA_APP_TOKEN || undefined;
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

function needSource(key?: string) {
  const s = key ? sourceByKey(key) : undefined;
  if (!s) {
    console.error(`Unknown source "${key ?? ""}". Known: ${SOURCES.map((x) => x.key).join(", ")}`);
    process.exit(1);
  }
  if (!s.endpoint) {
    console.error(`${s.name} has no endpoint yet. Portal: ${s.portal}`);
    process.exit(1);
  }
  return s;
}

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (in .env.local).");
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function main() {
  switch (cmd) {
    case "discover": {
      const s = needSource(positional[0]);
      const info = await discover(asJurisdiction(s), { appToken });
      console.log(`\n${info.name}  (updated ${info.updated ?? "?"})\n`);
      console.log(info.columns.join("\n"));
      console.log("\nSample rows:\n", JSON.stringify(info.sample, null, 2));
      break;
    }

    case "dry-run": {
      const s = needSource(positional[0]);
      const days = flag("days", 90);
      const j = asJurisdiction(s);
      console.log(`Fetching ${s.name} permits issued since ${daysAgo(days)}…`);
      const raw = await fetchSource(j, { since: daysAgo(days), appToken, maxRecords: flag("max", 100_000) });
      const permits = raw.map((r) => normalize(j, r)).filter((p) => p !== null);
      const kept = permits.filter((p) => p.category !== "other");
      console.log(`${raw.length} residential permits, ${kept.length} pool/spa/fence/outdoor.\n`);

      const rows = weeklyCounts(kept);
      console.log("Week of      pool  spa  fence  outdoor");
      for (const [week, c] of rows) {
        const f = (n?: number) => String(n ?? 0).padStart(5);
        console.log(`${week} ${f(c.pool)}${f(c.spa)}  ${f(c.fence)}  ${f(c.landscaping)}`);
      }
      const full = rows.slice(1, -1); // drop partial first/last week
      const avg = (k: string) => (full.length ? full.reduce((a, [, c]) => a + (c[k] ?? 0), 0) / full.length : 0);
      const poolWeek = avg("pool") + avg("spa");
      console.log(`\nAverage per full week: pool+spa ${poolWeek.toFixed(1)}, fence ${avg("fence").toFixed(1)}, outdoor ${avg("landscaping").toFixed(1)}`);
      console.log(`Phase 0 bar (20+ pool permits/week): ${poolWeek >= 20 ? "PASS" : "below"}`);

      const missing = (k: "contractor_name" | "valuation" | "zip") => kept.filter((p) => !p[k]).length;
      console.log(`Missing fields among kept: builder ${missing("contractor_name")}, value ${missing("valuation")}, zip ${missing("zip")}`);
      console.log("\nSamples:");
      for (const p of kept.slice(-5)) console.log(` ${p.issued_at}  ${p.category.padEnd(11)} ${p.zip ?? "-----"}  ${p.permit_type ?? ""} | ${p.description?.slice(0, 80) ?? ""}`);
      break;
    }

    case "sync-config": {
      const client = db();
      for (const s of SOURCES) {
        const row = {
          name: s.name,
          state: s.state,
          country: s.country,
          timezone: s.timezone,
          source_type: s.source_type,
          endpoint: s.endpoint || "TODO",
          dataset_id: s.dataset_id,
          field_mapping: s.field_mapping,
          coverage_note: s.coverage_note,
        };
        const { data: existing } = await client.from("jurisdictions").select("id, status").eq("name", s.name).maybeSingle();
        const { error } = existing
          ? await client.from("jurisdictions").update(row).eq("id", existing.id)
          : await client.from("jurisdictions").insert({ ...row, status: "paused" });
        console.log(`${s.name}: ${error ? `error ${error.message}` : existing ? `updated (status ${existing.status})` : "inserted (paused)"}`);
      }
      console.log("\nTurn a verified source on in SQL: update jurisdictions set status = 'active' where name = 'Austin';");
      break;
    }

    case "run": {
      const client = db();
      const days = flag("days", 7);
      if (positional[0]) {
        const s = needSource(positional[0]);
        const { data, error } = await client.from("jurisdictions").select("*").eq("name", s.name).single();
        if (error || !data) throw new Error(`No jurisdictions row for ${s.name}. Run sync-config first.`);
        console.log(await runSource(client, data as Jurisdiction, { lookbackDays: days, appToken }));
      } else {
        console.table(await runAll(client, { appToken }));
      }
      break;
    }

    default:
      console.log("Commands: discover <source> | dry-run <source> [--days 90] | sync-config | run [source] [--days 7]");
      console.log(`Sources: ${SOURCES.map((s) => `${s.key}${s.verified ? "" : " (unverified)"}`).join(", ")}`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
