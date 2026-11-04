import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { Mark } from "@/components/brand/Logo";
import { button } from "@/components/ui";
import { getSession } from "@/lib/session";

const STAGES = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "postcard_sent", label: "Postcard sent" },
  { id: "quoted", label: "Quoted" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;

const STAGE_LABEL: Record<string, string> = Object.fromEntries(STAGES.map((s) => [s.id, s.label]));
const HIGH_VALUE = 75_000;

type Permit = {
  address: string | null;
  zip: string | null;
  category: string;
  valuation: number | null;
  contractor_name: string | null;
  issued_at: string | null;
};

const money = (n: number | null) => (n == null ? "Value not listed" : `$${Number(n).toLocaleString("en-US")}`);
const workLabel = (c: string) => ({ pool: "Pool", spa: "Spa", fence: "Fence", solar: "Solar", roof: "Roof" })[c] ?? "Other";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const { stage = "all" } = await searchParams;
  const { supabase } = await getSession("/leads");

  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  let q = supabase
    .from("leads")
    .select("id, stage, created_at, permits(address, zip, category, valuation, contractor_name, issued_at)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (stage !== "all") q = q.eq("stage", stage);
  const [{ data: leads, error }, { count: territories }] = await Promise.all([
    q,
    supabase.from("territories").select("id", { count: "exact", head: true }),
  ]);

  const rows = (leads ?? []).map((l) => ({ ...l, permit: (Array.isArray(l.permits) ? l.permits[0] : l.permits) as Permit | null }));
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = rows.filter((r) => r.created_at.startsWith(today)).length;
  const weekCount = rows.filter((r) => r.created_at >= since).length;
  const highCount = rows.filter((r) => (r.permit?.valuation ?? 0) >= HIGH_VALUE).length;

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-baseline gap-3 text-3xl font-extrabold [font-stretch:87.5%] sm:text-4xl">
            <span className="marker text-6xl text-water sm:text-7xl">{todayCount}</span>
            new {todayCount === 1 ? "pool" : "pools"} today
          </h1>
          <p className="num mt-2 text-ink-2">
            {weekCount} this week · {highCount} high value (over ${HIGH_VALUE / 1000}k)
          </p>
        </div>
        {rows.length > 0 && (
          <a href={`/leads/export${stage !== "all" ? `?stage=${stage}` : ""}`} className={button("quiet")}>
            <Download size={18} /> Export CSV
          </a>
        )}
      </div>

      <nav aria-label="Filter by stage" className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {STAGES.map((s) => {
          const on = stage === s.id;
          return (
            <Link
              key={s.id}
              href={s.id === "all" ? "/leads" : `/leads?stage=${s.id}`}
              aria-current={on ? "true" : undefined}
              className={`h-9 shrink-0 rounded-full px-3.5 text-sm font-semibold leading-9 transition-colors ${
                on ? "bg-ink text-white" : "bg-deck text-ink-2 hover:bg-deck-2 hover:text-ink"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      {error ? (
        <p role="alert" className="mt-6 rounded-[10px] bg-[#fbeaec] px-4 py-3 text-danger">
          Couldn&rsquo;t load leads: {error.message}. Refresh to try again.
        </p>
      ) : rows.length === 0 ? (
        <EmptyState hasTerritory={(territories ?? 0) > 0} filtered={stage !== "all"} />
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {rows.map((r) => {
            const p = r.permit;
            const high = (p?.valuation ?? 0) >= HIGH_VALUE;
            return (
              <li key={r.id}>
                <Link href={`/leads/${r.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 px-1 py-4 hover:bg-deck sm:grid-cols-[1fr_auto_auto] sm:px-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold">
                      {high && <span className="h-2 w-2 shrink-0 rounded-full bg-sun" aria-label="High value" />}
                      <span className="truncate">{p?.address ?? "Address pending"}{p?.zip ? `, ${p.zip}` : ""}</span>
                    </p>
                    <p className="truncate text-sm text-ink-2">
                      {workLabel(p?.category ?? "other")} · {p?.contractor_name ?? "Builder not listed"}
                      {p?.issued_at && <> · issued {new Date(p.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>}
                    </p>
                  </div>
                  <p className={`num text-right font-semibold ${high ? "text-sun-ink" : ""}`}>{money(p?.valuation ?? null)}</p>
                  <span className="col-span-2 justify-self-start rounded-full bg-deck-2 px-2.5 py-0.5 text-xs font-semibold text-ink-2 group-hover:bg-white sm:col-span-1 sm:justify-self-end">
                    {STAGE_LABEL[r.stage] ?? r.stage}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function EmptyState({ hasTerritory, filtered }: { hasTerritory: boolean; filtered: boolean }) {
  if (filtered) {
    return (
      <p className="mt-10 text-ink-2">
        No leads in this stage.{" "}
        <Link href="/leads" className="font-semibold text-water underline">Show all leads</Link>
      </p>
    );
  }
  return (
    <div className="mt-8 flex flex-col items-start gap-5 rounded-2xl bg-deck p-6 sm:flex-row sm:items-center sm:p-8">
      <Mark size={48} />
      <div className="flex-1">
        <h2 className="text-lg font-bold">{hasTerritory ? "Your first alert is on its way" : "Tell us where you work"}</h2>
        <p className="mt-1 max-w-[56ch] text-ink-2">
          {hasTerritory
            ? "New pool permits in your zip codes will show up here, and in your inbox at 7 AM."
            : "Add the zip codes you service and we’ll start matching new pool permits to them tonight."}
        </p>
      </div>
      {!hasTerritory && (
        <Link href="/onboarding" className={button("primary", "lg")}>
          Add zip codes <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}
