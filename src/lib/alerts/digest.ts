/**
 * Daily lead alert: who is due, and what the email says. No Next.js or server-only imports,
 * so this runs the same in the cron Worker and in tests.
 */
import { tradeById } from "../trades";

export type AlertOrg = {
  id: string;
  name: string;
  trade: string;
  plan: string;
  trial_ends_at: string | null;
  alert_hour_local: number;
  timezone: string;
};

export type AlertLead = {
  id: string;
  created_at: string;
  permit: {
    address: string | null;
    zip: string | null;
    category: string;
    permit_type: string | null;
    valuation: number | null;
    contractor_name: string | null;
    issued_at: string | null;
  };
};

/** Hour of day (0-23) at `now` in an IANA time zone. */
export function localHour(now: Date, timeZone: string): number {
  const h = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(now);
  return Number(h) % 24;
}

/** Paid plans get alerts; a trial gets them until it ends. */
export function hasAccess(org: AlertOrg, now: Date): boolean {
  if (org.plan !== "trial") return true;
  return !!org.trial_ends_at && new Date(org.trial_ends_at) > now;
}

/**
 * Due when it's the org's alert hour locally and nothing went out in the last 20 hours
 * (the cron runs hourly; this keeps one email per morning even if a run repeats).
 */
export function isDue(org: AlertOrg, now: Date, lastSentAt: string | null): boolean {
  if (!hasAccess(org, now)) return false;
  let hour: number;
  try {
    hour = localHour(now, org.timezone);
  } catch {
    hour = localHour(now, "America/Chicago");
  }
  if (hour !== org.alert_hour_local) return false;
  return !lastSentAt || now.getTime() - new Date(lastSentAt).getTime() > 20 * 3_600_000;
}

/** Jobs at or above this value get the high-value mark. */
export const HIGH_VALUE = 50_000;
const MAX_LISTED = 15;

const LABEL: Record<string, string> = { pool: "Pool", spa: "Spa", fence: "Fence", landscaping: "Outdoor" };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const plural = (n: number, [one, many]: [string, string]) => `${n} new ${n === 1 ? one : many}`;

export function buildDigest(opts: { org: AlertOrg; leads: AlertLead[]; firstName: string | null; siteUrl: string }) {
  const { org, firstName, siteUrl } = opts;
  const noun = tradeById(org.trade)?.noun ?? ["lead", "leads"];
  // Highest value first, then newest permit.
  const leads = [...opts.leads].sort(
    (a, b) =>
      (b.permit.valuation ?? 0) - (a.permit.valuation ?? 0) ||
      (b.permit.issued_at ?? "").localeCompare(a.permit.issued_at ?? ""),
  );
  const high = leads.filter((l) => (l.permit.valuation ?? 0) >= HIGH_VALUE).length;
  const zips = [...new Set(leads.map((l) => l.permit.zip).filter(Boolean))].sort().slice(0, 6) as string[];
  const shown = leads.slice(0, MAX_LISTED);
  const more = leads.length - shown.length;
  const site = siteUrl.replace(/\/$/, "");

  const subject = `${plural(leads.length, noun)} in your area`;
  const hello = `Good morning${firstName ? ` ${firstName}` : ""},`;
  const summary = [high ? `${high} high-value` : null, `${leads.length} total`, zips.length ? `Zip: ${zips.join(", ")}` : null]
    .filter(Boolean)
    .join("  |  ");

  const line = (l: AlertLead) => {
    const p = l.permit;
    return [
      p.address ? `${p.address}${p.zip ? ` ${p.zip}` : ""}` : p.zip ?? "Address not published",
      LABEL[p.category] ?? p.category,
      p.valuation ? money(p.valuation) : null,
      p.contractor_name ? `Builder: ${p.contractor_name}` : null,
    ]
      .filter(Boolean)
      .join(" — ");
  };

  const text = [
    hello,
    "",
    summary,
    "",
    ...shown.map((l, i) => `${i + 1}. ${(l.permit.valuation ?? 0) >= HIGH_VALUE ? "[High value] " : ""}${line(l)}\n   ${site}/leads/${l.id}`),
    ...(more > 0 ? ["", `+ ${more} more`] : []),
    "",
    `View all leads: ${site}/leads`,
    "",
    `You're receiving this because ${org.name} subscribed to PatioPing alerts.`,
    `Change your alert time or zip codes: ${site}/onboarding`,
  ].join("\n");

  const rows = shown
    .map((l) => {
      const hv = (l.permit.valuation ?? 0) >= HIGH_VALUE;
      return `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e9ef;font-size:15px;line-height:1.45">
        ${hv ? `<span style="display:inline-block;background:#fdf0d5;color:#8a5a00;font-size:12px;font-weight:600;padding:1px 6px;border-radius:4px;margin-right:6px">High value</span>` : ""}
        <a href="${esc(`${site}/leads/${l.id}`)}" style="color:#0b5cad;text-decoration:none;font-weight:600">${esc(l.permit.address ?? l.permit.zip ?? "Address not published")}</a>
        ${l.permit.address && l.permit.zip ? `<span style="color:#5b6675"> ${esc(l.permit.zip)}</span>` : ""}<br>
        <span style="color:#3b4552">${esc([LABEL[l.permit.category] ?? l.permit.category, l.permit.valuation ? money(l.permit.valuation) : null, l.permit.contractor_name ? `Builder: ${l.permit.contractor_name}` : null].filter(Boolean).join(" · "))}</span>
      </td></tr>`;
    })
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f4f7fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18212b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:10px;padding:24px">
    <tr><td style="font-size:16px;padding-bottom:6px">${esc(hello)}</td></tr>
    <tr><td style="font-size:14px;color:#5b6675;padding-bottom:12px">${esc(summary)}</td></tr>
    <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>
    ${more > 0 ? `<tr><td style="padding-top:10px;font-size:14px;color:#5b6675">+ ${more} more</td></tr>` : ""}
    <tr><td style="padding-top:20px"><a href="${esc(`${site}/leads`)}" style="display:inline-block;background:#0b5cad;color:#ffffff;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:6px">View all leads →</a></td></tr>
  </table>
  <p style="max-width:560px;font-size:12px;color:#7a8594;line-height:1.5;margin:16px auto 0">You're receiving this because ${esc(org.name)} subscribed to PatioPing alerts.
  <a href="${esc(`${site}/onboarding`)}" style="color:#7a8594">Change your alert time or zip codes</a>.</p>
  </td></tr></table></body></html>`;

  return { subject, text, html };
}
