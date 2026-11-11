import type { SupabaseClient } from "@supabase/supabase-js";
import { buildDigest, isDue, type AlertLead, type AlertOrg } from "./digest";

export type AlertResult = { org: string; sent: number; leads: number; error?: string };

type Opts = {
  resendKey: string;
  /** e.g. "PatioPing <alerts@patioping.com>" (the domain must be verified in Resend) */
  from: string;
  siteUrl: string;
  now?: Date;
  fetchImpl?: typeof fetch;
};

async function sendEmail(o: Opts, to: string[], msg: { subject: string; text: string; html: string }, key: string) {
  const res = await (o.fetchImpl ?? fetch)("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${o.resendKey}`,
      "Content-Type": "application/json",
      // Resend drops a repeat with the same key for 24h, so a retried cron can't double-send.
      "Idempotency-Key": key,
    },
    body: JSON.stringify({ from: o.from, to, subject: msg.subject, text: msg.text, html: msg.html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

/** Hourly: email each org whose local alert hour it is, with the leads created since its last alert. */
export async function runAlerts(db: SupabaseClient, o: Opts): Promise<AlertResult[]> {
  const now = o.now ?? new Date();
  const { data: orgs, error } = await db
    .from("orgs")
    .select("id, name, trade, plan, trial_ends_at, alert_hour_local, timezone");
  if (error) throw new Error(`load orgs: ${error.message}`);

  const results: AlertResult[] = [];
  for (const org of (orgs ?? []) as AlertOrg[]) {
    const { data: last } = await db
      .from("alerts_log")
      .select("sent_at")
      .eq("org_id", org.id)
      .eq("channel", "email")
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!isDue(org, now, last?.sent_at ?? null)) continue;

    const result: AlertResult = { org: org.name, sent: 0, leads: 0 };
    try {
      // Everything since the last alert. The first alert includes the 30-day backfill.
      let q = db
        .from("leads")
        .select("id, created_at, permits(address, zip, category, permit_type, valuation, contractor_name, issued_at)")
        .eq("org_id", org.id)
        .lte("created_at", now.toISOString())
        .order("created_at", { ascending: false })
        .limit(500);
      if (last?.sent_at) q = q.gt("created_at", last.sent_at);
      const { data: rows, error: leadErr } = await q;
      if (leadErr) throw new Error(`load leads: ${leadErr.message}`);

      const leads: AlertLead[] = (rows ?? []).flatMap((r) => {
        const p = Array.isArray(r.permits) ? r.permits[0] : r.permits;
        return p ? [{ id: r.id, created_at: r.created_at, permit: p as AlertLead["permit"] }] : [];
      });
      result.leads = leads.length;
      // No new leads: no email. The next alert picks up from the last one that went out.
      if (!leads.length) {
        results.push(result);
        continue;
      }

      const { data: people } = await db.from("profiles").select("email, full_name, role").eq("org_id", org.id);
      const to = [...new Set((people ?? []).map((p) => p.email).filter(Boolean))] as string[];
      if (!to.length) throw new Error("no recipients");
      const owner = (people ?? []).find((p) => p.role === "owner") ?? people?.[0];
      const firstName = owner?.full_name?.trim().split(/\s+/)[0] || null;

      const msg = buildDigest({ org, leads, firstName, siteUrl: o.siteUrl });
      await sendEmail(o, to, msg, `alert-${org.id}-${now.toISOString().slice(0, 13)}`);
      result.sent = to.length;

      const { error: logErr } = await db
        .from("alerts_log")
        .insert({ org_id: org.id, channel: "email", lead_count: leads.length, sent_at: now.toISOString() });
      if (logErr) throw new Error(`alerts_log: ${logErr.message}`);
    } catch (e) {
      result.error = e instanceof Error ? e.message : String(e);
    }
    results.push(result);
  }
  return results;
}
