/**
 * Daily alert tests: who is due, what the email says, and that runAlerts sends once and logs it.
 * Synthetic data and a fake Supabase/Resend; nothing leaves the machine.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { buildDigest, hasAccess, isDue, localHour, type AlertLead, type AlertOrg } from "../src/lib/alerts/digest";
import { runAlerts, type OutgoingEmail } from "../src/lib/alerts/send";

const org = (o: Partial<AlertOrg> = {}): AlertOrg => ({
  id: "org-1",
  name: "Sample Pool Co",
  trade: "pool_service",
  plan: "starter",
  trial_ends_at: null,
  alert_hour_local: 7,
  timezone: "America/Chicago",
  ...o,
});

const lead = (id: string, p: Partial<AlertLead["permit"]> = {}): AlertLead => ({
  id,
  created_at: "2026-11-11T09:20:00Z",
  permit: {
    address: "1234 Oak St",
    zip: "78704",
    category: "pool",
    permit_type: "Building Permit · Pool",
    valuation: 40000,
    contractor_name: "Sample Pools",
    issued_at: "2026-11-10",
    ...p,
  },
});

// 13:00 UTC on 11 Nov 2026 = 7 AM in Chicago (CST, UTC-6), 6 AM in Denver, 8 AM in New York.
const sevenCentral = new Date("2026-11-11T13:00:00Z");

test("local hour follows the org's time zone, including DST", () => {
  assert.equal(localHour(sevenCentral, "America/Chicago"), 7);
  assert.equal(localHour(sevenCentral, "America/New_York"), 8);
  assert.equal(localHour(sevenCentral, "America/Phoenix"), 6);
  // July: Chicago is on CDT (UTC-5), so 7 AM is 12:00 UTC.
  assert.equal(localHour(new Date("2026-07-15T12:00:00Z"), "America/Chicago"), 7);
});

test("trial orgs get alerts until the trial ends; paid orgs always", () => {
  assert.equal(hasAccess(org({ plan: "trial", trial_ends_at: "2026-11-12T00:00:00Z" }), sevenCentral), true);
  assert.equal(hasAccess(org({ plan: "trial", trial_ends_at: "2026-11-10T00:00:00Z" }), sevenCentral), false);
  assert.equal(hasAccess(org({ plan: "growth" }), sevenCentral), true);
});

test("due only at the local alert hour, once per morning", () => {
  assert.equal(isDue(org(), sevenCentral, null), true);
  assert.equal(isDue(org({ alert_hour_local: 6 }), sevenCentral, null), false);
  assert.equal(isDue(org({ timezone: "America/New_York", alert_hour_local: 8 }), sevenCentral, null), true);
  assert.equal(isDue(org(), sevenCentral, "2026-11-11T12:59:00Z"), false); // already sent this morning
  assert.equal(isDue(org(), sevenCentral, "2026-11-10T13:00:00Z"), true); // yesterday's
  assert.equal(isDue(org({ timezone: "Not/AZone" }), sevenCentral, null), true); // falls back to Central
});

test("digest: subject uses the trade's noun; highest value first; high-value marked", () => {
  const d = buildDigest({
    org: org(),
    leads: [lead("a", { valuation: 30000, address: "1 Low St" }), lead("b", { valuation: 85000, address: "2 High St" })],
    firstName: "Mike",
    siteUrl: "https://patioping.com/",
  });
  assert.equal(d.subject, "2 new pools in your area");
  assert.match(d.text, /^Good morning Mike,/);
  assert.match(d.text, /1 high-value {2}\| {2}2 total {2}\| {2}Zip: 78704/);
  assert.ok(d.text.indexOf("2 High St") < d.text.indexOf("1 Low St"));
  assert.match(d.text, /\[High value\] 2 High St 78704 — Pool — \$85,000 — Builder: Sample Pools/);
  assert.match(d.text, /https:\/\/patioping\.com\/leads\/b/);
  assert.match(d.html, /href="https:\/\/patioping\.com\/leads\/b"/);

  assert.equal(buildDigest({ org: org({ trade: "fence" }), leads: [lead("x")], firstName: null, siteUrl: "https://x" }).subject, "1 new fence job in your area");
});

test("digest escapes permit text in HTML and caps the list", () => {
  const many = Array.from({ length: 20 }, (_, i) => lead(`l${i}`, { address: `${i} <b>Elm</b> St` }));
  const d = buildDigest({ org: org({ name: "A&B Pools" }), leads: many, firstName: null, siteUrl: "https://x" });
  assert.ok(!d.html.includes("<b>Elm</b>"));
  assert.ok(d.html.includes("&lt;b&gt;Elm&lt;/b&gt;"));
  assert.ok(d.html.includes("A&amp;B Pools"));
  assert.match(d.text, /\+ 5 more/);
  assert.match(d.text, /^Good morning,/);
});

/** Just enough of the supabase-js query builder for runAlerts. */
function fakeDb(state: { orgs: AlertOrg[]; lastSent: string | null; leads: unknown[]; profiles: unknown[] }) {
  const inserted: unknown[] = [];
  const builder = (table: string) => {
    const b: Record<string, unknown> = {};
    const chain = () => b;
    for (const m of ["select", "eq", "order", "limit", "lte", "gt"]) b[m] = chain;
    b.maybeSingle = async () => ({ data: state.lastSent ? { sent_at: state.lastSent } : null, error: null });
    b.insert = async (row: unknown) => (inserted.push(row), { error: null });
    b.then = (resolve: (v: unknown) => void) =>
      resolve({
        data: table === "orgs" ? state.orgs : table === "leads" ? state.leads : table === "profiles" ? state.profiles : [],
        error: null,
      });
    return b;
  };
  return { db: { from: builder } as never, inserted };
}

test("runAlerts sends one email to the org's people and logs it", async () => {
  const { db, inserted } = fakeDb({
    orgs: [org(), org({ id: "org-2", name: "Later Co", alert_hour_local: 9 })],
    lastSent: null,
    leads: [{ id: "lead-1", created_at: "2026-11-11T09:20:00Z", permits: lead("lead-1").permit }],
    profiles: [{ email: "owner@example.com", full_name: "Mike Smith", role: "owner" }, { email: "crew@example.com", full_name: null, role: "member" }],
  });
  const calls: OutgoingEmail[] = [];
  const mailer = async (msg: OutgoingEmail) => void calls.push(msg);

  const res = await runAlerts(db, { mailer, siteUrl: "https://x", now: sevenCentral });
  assert.deepEqual(res, [{ org: "Sample Pool Co", sent: 2, leads: 1 }]); // Later Co isn't due at 7
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].to, ["owner@example.com", "crew@example.com"]);
  assert.equal(calls[0].subject, "1 new pool in your area");
  assert.match(calls[0].text, /^Good morning Mike,/);
  assert.equal(inserted.length, 1);
});

test("runAlerts sends nothing on a day with no new leads", async () => {
  const { db, inserted } = fakeDb({ orgs: [org()], lastSent: "2026-11-10T13:00:00Z", leads: [], profiles: [] });
  let called = false;
  const res = await runAlerts(db, { siteUrl: "https://x", now: sevenCentral, mailer: async () => void (called = true) });
  assert.deepEqual(res, [{ org: "Sample Pool Co", sent: 0, leads: 0 }]);
  assert.equal(called, false);
  assert.equal(inserted.length, 0);
});

test("a send failure is reported, not logged as sent", async () => {
  const { db, inserted } = fakeDb({
    orgs: [org()], lastSent: null,
    leads: [{ id: "lead-1", created_at: "2026-11-11T09:20:00Z", permits: lead("lead-1").permit }],
    profiles: [{ email: "owner@example.com", full_name: null, role: "owner" }],
  });
  const res = await runAlerts(db, {
    siteUrl: "https://x", now: sevenCentral,
    mailer: async () => { throw new Error("Email Sending E_SENDER_NOT_VERIFIED: sender not verified"); },
  });
  assert.match(res[0].error ?? "", /E_SENDER_NOT_VERIFIED/);
  assert.equal(inserted.length, 0);
});
