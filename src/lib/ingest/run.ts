import type { SupabaseClient } from "@supabase/supabase-js";
import { normalize } from "./normalize";
import { fetchSource } from "./sources";
import type { Jurisdiction, NormalizedPermit } from "./types";

export type RunResult = {
  jurisdiction: string;
  fetched: number;
  kept: number;
  byCategory: Record<string, number>;
  leadsCreated: number;
  error?: string;
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

/**
 * Pull one source and store the permits we care about (pool, spa, fence, outdoor).
 * Everything else is dropped, so the tables stay small and the raw payloads we keep
 * are the ones a human may need to re-check.
 */
export async function runSource(
  db: SupabaseClient,
  j: Jurisdiction,
  opts: { since?: string; lookbackDays?: number; appToken?: string; maxRecords?: number } = {},
): Promise<RunResult> {
  // Re-read a few days back every run: portals often publish permits late or edit them.
  const since = opts.since ?? daysAgo(opts.lookbackDays ?? 7);
  const result: RunResult = { jurisdiction: j.name, fetched: 0, kept: 0, byCategory: {}, leadsCreated: 0 };
  const startedAt = new Date().toISOString();

  try {
    const raw = await fetchSource(j, { since, appToken: opts.appToken, maxRecords: opts.maxRecords });
    result.fetched = raw.length;

    const keep: { n: NormalizedPermit; raw: Record<string, unknown> }[] = [];
    for (const r of raw) {
      const n = normalize(j, r);
      if (!n || n.category === "other") continue;
      keep.push({ n, raw: r });
      result.byCategory[n.category] = (result.byCategory[n.category] ?? 0) + 1;
    }
    result.kept = keep.length;

    for (let i = 0; i < keep.length; i += 500) {
      const chunk = keep.slice(i, i + 500);
      const { error: rawErr } = await db.from("permits_raw").upsert(
        chunk.map(({ n, raw }) => ({ jurisdiction_id: j.id, external_id: n.permit_number, payload: raw, fetched_at: startedAt })),
        { onConflict: "jurisdiction_id,external_id" },
      );
      if (rawErr) throw new Error(`permits_raw upsert: ${rawErr.message}`);
      const { error } = await db.from("permits").upsert(
        chunk.map(({ n }) => n),
        { onConflict: "jurisdiction_id,permit_number" },
      );
      if (error) throw new Error(`permits upsert: ${error.message}`);
    }

    const { data: created, error: matchErr } = await db.rpc("match_leads", { p_since: startedAt, p_jurisdiction: j.id });
    if (matchErr) throw new Error(`match_leads: ${matchErr.message}`);
    result.leadsCreated = Number(created ?? 0);

    await db
      .from("jurisdictions")
      .update({ last_synced_at: startedAt, status: "active", last_error: null, last_fetched_count: result.fetched })
      .eq("id", j.id);
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
    await db.from("jurisdictions").update({ status: "failing", last_error: result.error.slice(0, 1000) }).eq("id", j.id);
  }
  return result;
}

/** Every active source, one at a time (polite to the portals, simple to reason about). */
export async function runAll(db: SupabaseClient, opts: { appToken?: string } = {}) {
  const { data, error } = await db.from("jurisdictions").select("*").in("status", ["active", "failing"]);
  if (error) throw new Error(`load jurisdictions: ${error.message}`);
  const results: RunResult[] = [];
  for (const j of (data ?? []) as Jurisdiction[]) results.push(await runSource(db, j, opts));
  return results;
}
