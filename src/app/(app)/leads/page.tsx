import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarClock, Download, Flame, Inbox, MapPinned, Sparkles, Trophy } from "lucide-react";
import { Mark } from "@/components/brand/Logo";
import { STAGE_STYLE } from "@/components/marketing";
import { TradeIcon } from "@/components/TradeIcon";
import { button } from "@/components/ui";
import { getSession } from "@/lib/session";
import { tradeById, type LiveTrade } from "@/lib/trades";

const STAGES = [
  { id: "new", label: "New", dot: "bg-water" },
  { id: "contacted", label: "Contacted", dot: "bg-violet" },
  { id: "postcard_sent", label: "Postcard sent", dot: "bg-ink-3" },
  { id: "quoted", label: "Quoted", dot: "bg-sun" },
  { id: "won", label: "Won", dot: "bg-green" },
  { id: "lost", label: "Lost", dot: "bg-danger" },
] as const;
const STAGE_LABEL: Record<string, string> = Object.fromEntries(STAGES.map((s) => [s.id, s.label]));
const HIGH_VALUE = 75_000;

type Permit = {
  address: string | null;
  zip: string | null;
  category: string;
  permit_type: string | null;
  valuation: number | null;
  contractor_name: string | null;
  issued_at: string | null;
};
type Row = { id: string; stage: string; created_at: string; next_follow_up: string | null; permit: Permit | null };

const VIEWS = [
  { id: "all", label: "All leads", icon: Inbox, test: () => true },
  { id: "today", label: "New today", icon: Sparkles, test: (r: Row, t: string) => r.created_at.startsWith(t) },
  { id: "high", label: "High value", icon: Flame, test: (r: Row) => (r.permit?.valuation ?? 0) >= HIGH_VALUE },
  { id: "followup", label: "Follow-ups due", icon: CalendarClock, test: (r: Row, t: string) => !!r.next_follow_up && r.next_follow_up <= t },
  { id: "won", label: "Won", icon: Trophy, test: (r: Row) => r.stage === "won" },
] as const;

const ICON_FOR: Record<string, LiveTrade["icon"]> = { pool: "waves", spa: "waves", fence: "fence", landscaping: "trees" };
const money = (n: number | null) => (n == null ? "—" : `$${Number(n).toLocaleString("en-US")}`);
const workLabel = (c: string) =>
  ({ pool: "Pool", spa: "Spa", fence: "Fence", landscaping: "Outdoor", solar: "Solar", roof: "Roof" })[c] ?? "Other";
const short = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—");

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; stage?: string; q?: string }>;
}) {
  const { view = "all", stage, q } = await searchParams;
  const { supabase, org, user } = await getSession("/leads");
  const [, many] = tradeById(org?.trade ?? "")?.noun ?? ["lead", "leads"];

  const [{ data, error }, { count: territories }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, stage, created_at, next_follow_up, permits(address, zip, category, permit_type, valuation, contractor_name, issued_at)")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("territories").select("id", { count: "exact", head: true }),
  ]);

  const all: Row[] = (data ?? []).map((l) => ({
    ...l,
    permit: (Array.isArray(l.permits) ? l.permits[0] : l.permits) as Permit | null,
  }));
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const activeView = VIEWS.find((v) => v.id === view) ?? VIEWS[0];
  const needle = q?.trim().toLowerCase();

  const inView = all.filter((r) => activeView.test(r, today));
  const searched = needle
    ? inView.filter((r) =>
        `${r.permit?.address ?? ""} ${r.permit?.zip ?? ""} ${r.permit?.contractor_name ?? ""}`.toLowerCase().includes(needle),
      )
    : inView;
  const rows = stage ? searched.filter((r) => r.stage === stage) : searched;

  const stats = [
    { n: all.filter((r) => r.created_at.startsWith(today)).length, l: "today" },
    { n: all.filter((r) => r.created_at >= weekAgo).length, l: "this week" },
    { n: all.filter((r) => (r.permit?.valuation ?? 0) >= HIGH_VALUE).length, l: "high value" },
  ];

  const href = (p: { view?: string; stage?: string | null; q?: string | null }) => {
    const sp = new URLSearchParams();
    const v = p.view ?? view;
    if (v !== "all") sp.set("view", v);
    const st = p.stage === undefined ? stage : p.stage;
    if (st) sp.set("stage", st);
    const qq = p.q === undefined ? q : p.q;
    if (qq) sp.set("q", qq);
    const s = sp.toString();
    return `/leads${s ? `?${s}` : ""}`;
  };

  const handle = (user.email ?? "").split("@")[0].split(/[._-]/)[0];
  const first = handle ? handle[0].toUpperCase() + handle.slice(1) : "";

  return (
    <div>
      <p className="text-sm text-ink-3">
        Dashboard <span className="mx-1.5">/</span> <span className="text-ink-2">Leads</span>
      </p>
      <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight sm:text-[2.6rem]">Leads</h1>
          <p className="mt-1 text-ink-2">
            Good morning{first ? `, ${first}` : ""}. New {many} in your zip codes, every day at 7 AM.
          </p>
        </div>
        <dl className="flex gap-8">
          {stats.map((s) => (
            <div key={s.l} className="flex flex-col-reverse text-right">
              <dt className="mt-1 text-xs text-ink-3">{s.l}</dt>
              <dd className="marker text-3xl">{s.n}</dd>
            </div>
          ))}
        </dl>
      </div>

      {error ? (
        <p role="alert" className="mt-8 rounded-2xl bg-danger-soft px-4 py-3 text-danger">
          Couldn&rsquo;t load leads: {error.message}. Refresh to try again.
        </p>
      ) : all.length === 0 ? (
        <EmptyState hasTerritory={(territories ?? 0) > 0} many={many} />
      ) : (
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-3 xl:grid-cols-[272px_minmax(0,1fr)]">
          {/* Views */}
          <section className="min-w-0 rounded-[22px] border border-white bg-white p-3 shadow-[var(--shadow-card)] xl:self-start">
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <h2 className="font-medium">Views</h2>
              <Link href="/onboarding" className="inline-flex items-center gap-1 text-sm text-water hover:underline">
                <MapPinned size={14} /> Territory
              </Link>
            </div>
            <ul className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-1.5 xl:overflow-visible xl:pb-0">
              {VIEWS.map((v) => {
                const on = v.id === activeView.id;
                const n = all.filter((r) => v.test(r, today)).length;
                return (
                  <li key={v.id} className="shrink-0">
                    <Link
                      href={href({ view: v.id, stage: null })}
                      aria-current={on ? "true" : undefined}
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${
                        on ? "border-[#cfe3f1] bg-water-soft" : "border-transparent hover:bg-deck"
                      }`}
                    >
                      <span className={`grid h-8 w-8 place-items-center rounded-full ${on ? "bg-water text-white" : "bg-deck-2 text-ink-2"}`}>
                        <v.icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block whitespace-nowrap text-[14px] font-medium">{v.label}</span>
                        <span className="num block text-xs text-ink-3">
                          {n} {n === 1 ? "lead" : "leads"}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Table */}
          <section className="min-w-0 rounded-[22px] border border-white bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-medium">{activeView.label}</h2>
                <span className="num rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-2">{rows.length} leads</span>
              </div>
              <div className="flex gap-2">
                {rows.length > 0 && (
                  <a href={`/leads/export${stage ? `?stage=${stage}` : ""}`} className={button("quiet", "md")}>
                    <Download size={16} /> Export CSV
                  </a>
                )}
                <Link href="/onboarding" className={`${button("primary", "md")} max-sm:hidden`}>
                  Edit territory
                </Link>
              </div>
            </div>
            {needle && (
              <p className="mt-2 text-sm text-ink-2">
                Matching &ldquo;{q}&rdquo; ·{" "}
                <Link href={href({ q: null })} className="text-water underline">clear</Link>
              </p>
            )}

            {/* Stage counters double as filters */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STAGES.filter((s) => s.id !== "lost" && s.id !== "postcard_sent").map((s) => {
                const n = searched.filter((r) => r.stage === s.id).length;
                const on = stage === s.id;
                return (
                  <Link
                    key={s.id}
                    href={href({ stage: on ? null : s.id })}
                    aria-current={on ? "true" : undefined}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
                      on ? "border-ink bg-white" : "border-line bg-deck/60 hover:border-line-2"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    <span className="marker text-lg">{n}</span>
                    <span className="text-sm text-ink-2">{s.label}</span>
                  </Link>
                );
              })}
            </div>

            {rows.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-deck p-6 text-center text-ink-2">
                Nothing here yet.{" "}
                <Link href="/leads" className="font-medium text-water underline">Show all leads</Link>
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-line">
                <div className="hidden grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_6.5rem_7rem_2rem] gap-4 border-b border-line bg-deck/70 px-4 py-2.5 text-xs font-medium text-ink-3 md:grid">
                  <span>Address</span>
                  <span>Work</span>
                  <span>Builder</span>
                  <span className="text-right">Value</span>
                  <span>Stage</span>
                  <span className="sr-only">Open</span>
                </div>
                <ul className="divide-y divide-line">
                  {rows.map((r) => {
                    const p = r.permit;
                    const high = (p?.valuation ?? 0) >= HIGH_VALUE;
                    const label = STAGE_LABEL[r.stage] ?? r.stage;
                    const work = p?.permit_type ?? workLabel(p?.category ?? "other");
                    return (
                      <li key={r.id}>
                        <Link
                          href={`/leads/${r.id}`}
                          className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3 hover:bg-deck/60 md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_6.5rem_7rem_2rem]"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-water-soft text-water">
                              <TradeIcon name={ICON_FOR[p?.category ?? ""] ?? "waves"} size={16} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[14px] font-medium">{p?.address ?? "Address pending"}</span>
                              <span className="num block text-xs text-ink-3">
                                {p?.zip}
                                <span className="max-md:hidden"> · issued {short(p?.issued_at ?? null)}</span>
                              </span>
                            </span>
                          </span>
                          <span className={`num text-right text-[14px] font-medium md:order-4 ${high ? "text-sun-ink" : ""}`}>
                            {high && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-sun align-middle" aria-label="High value" />}
                            {money(p?.valuation ?? null)}
                          </span>
                          <span className="hidden truncate text-sm text-ink-2 md:order-2 md:block">{work}</span>
                          <span className="hidden truncate text-sm text-ink-2 md:order-3 md:block">{p?.contractor_name ?? "Not listed"}</span>
                          <span className="col-span-2 flex min-w-0 items-center gap-2 md:order-5 md:col-span-1">
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLE[label] ?? "bg-deck-2 text-ink-2"}`}>
                              {label}
                            </span>
                            <span className="truncate text-xs text-ink-3 md:hidden">
                              {work} · issued {short(p?.issued_at ?? null)}
                            </span>
                          </span>
                          <span className="hidden h-8 w-8 place-items-center rounded-full border border-line text-ink-2 transition-colors group-hover:border-ink group-hover:text-ink md:order-6 md:grid">
                            <ArrowUpRight size={15} />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasTerritory, many }: { hasTerritory: boolean; many: string }) {
  return (
    <div className="mt-8 flex flex-col items-start gap-5 rounded-[22px] border border-white bg-white p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:p-8">
      <Mark size={48} />
      <div className="flex-1">
        <h2 className="text-lg font-medium">{hasTerritory ? "Your first alert is on its way" : "Tell us where you work"}</h2>
        <p className="mt-1 max-w-[56ch] text-ink-2">
          {hasTerritory
            ? `New ${many} in your zip codes will show up here, and in your inbox at 7 AM.`
            : "Add the zip codes you work in and we’ll start matching new permits to them tonight."}
        </p>
      </div>
      {!hasTerritory && (
        <Link href="/onboarding" className={button("primary", "lg")}>
          Add zip codes <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
