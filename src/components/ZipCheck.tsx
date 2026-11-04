"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowUpRight, Loader2, Lock, MapPin } from "lucide-react";
import { checkZip, requestCounty, type CountyState, type ZipState } from "@/app/actions/coverage";
import { button, input } from "@/components/ui";

const CATEGORY: Record<string, [string, string]> = {
  pool: ["pool", "pools"],
  spa: ["spa", "spas"],
  fence: ["fence", "fences"],
  landscaping: ["patio", "patios"],
};

function headline(count: number, by: Record<string, number>) {
  const kinds = Object.keys(by)
    .filter((k) => by[k] > 0)
    .map((k) => CATEGORY[k]?.[0] ?? k);
  const joined = kinds.length > 1 ? `${kinds.slice(0, -1).join(", ")} & ${kinds.at(-1)}` : kinds[0] ?? "backyard";
  return `new ${joined} ${count === 1 ? "project" : "projects"}`;
}

/** Hero zip box: real counts from the last 30 days, details locked until signup. */
export function ZipCheck() {
  const [state, action, pending] = useActionState<ZipState, FormData>(checkZip, null);
  const zip = state?.ok ? state.data.zip : state?.zip;

  return (
    <div className="mx-auto w-full max-w-xl text-left">
      <form action={action} className="flex items-center gap-2 rounded-full border border-white bg-white/90 p-1.5 pl-5 shadow-[var(--shadow-card)] backdrop-blur focus-within:border-water">
        <MapPin size={18} className="shrink-0 text-ink-3" aria-hidden="true" />
        <label htmlFor="hero-zip" className="sr-only">Your zip code</label>
        <input
          id="hero-zip"
          name="zip"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="\d{5}"
          maxLength={5}
          required
          placeholder="Enter your zip code"
          defaultValue={zip}
          className="num min-w-0 flex-1 bg-transparent text-[17px] text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <button type="submit" disabled={pending} className={`${button("primary", "lg")} shrink-0 px-5`}>
          {pending ? <Loader2 size={18} className="animate-spin" /> : null}
          <span className="max-sm:hidden">See projects near me</span>
          <span className="sm:hidden">Check</span>
        </button>
      </form>

      <div aria-live="polite">
        {state && !state.ok && <p role="alert" className="mt-2 pl-5 text-sm text-danger">{state.message}</p>}
        {state?.ok && state.data.count > 0 && <Result data={state.data} />}
        {state?.ok && state.data.count === 0 && <NotCovered zip={state.data.zip} />}
      </div>
    </div>
  );
}

function Result({ data }: { data: Extract<ZipState, { ok: true }>["data"] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-3xl border border-white bg-white/95 shadow-[var(--shadow-float)] backdrop-blur">
      <div className="p-5">
        <p className="text-sm text-ink-3">Last 30 days{data.jurisdiction ? ` · ${data.jurisdiction}` : ""}</p>
        <p className="mt-1 text-2xl font-medium tracking-tight">
          <span className="marker text-water">{data.count}</span> {headline(data.count, data.by_category)} near {data.zip}
        </p>
        {data.coverage_note && <p className="mt-2 rounded-lg bg-sun-soft px-3 py-2 text-xs text-sun-ink">{data.coverage_note}</p>}
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {data.samples.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-4 px-5 py-3">
            <span className="min-w-0">
              <span aria-hidden="true" className="block select-none truncate text-[15px] font-medium blur-[5px]">
                {["4821 Laurel Oak Dr", "1907 Barton Creek Ln", "612 Shadow Ridge Ct"][i]}
              </span>
              <span className="sr-only">Address hidden until you start your free week.</span>
              <span className="block truncate text-xs capitalize text-ink-2">
                {s.work} · issued {new Date(s.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </span>
            <span className="num shrink-0 text-sm font-medium">{s.value_band ?? "Value not listed"}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-start justify-between gap-3 border-t border-line bg-deck px-5 py-4 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-sm text-ink-2">
          <Lock size={14} /> Addresses and builders unlock with your free week.
        </p>
        <Link href={`/signup?zip=${data.zip}`} className={`${button("primary", "md")} group pr-1.5`}>
          Start free week to unlock
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-water">
            <ArrowUpRight size={14} />
          </span>
        </Link>
      </div>
    </div>
  );
}

function NotCovered({ zip }: { zip: string }) {
  const [state, action, pending] = useActionState<CountyState, FormData>(requestCounty, null);
  return (
    <div className="mt-3 rounded-3xl border border-white bg-white/95 p-5 shadow-[var(--shadow-float)] backdrop-blur">
      <p className="text-lg font-medium">We don&rsquo;t have permit data for {zip} yet.</p>
      <p className="mt-1 text-sm text-ink-2">Tell us your county. We add the most-requested counties first and email you when yours is live.</p>
      {state?.ok ? (
        <p role="status" className="mt-4 rounded-xl bg-water-soft px-4 py-3 text-sm text-deep">{state.message}</p>
      ) : (
        <form action={action} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_5rem_auto]">
          <input type="hidden" name="zip" value={zip} />
          <input type="text" name="company_site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <label className="sr-only" htmlFor="rc-email">Email</label>
          <input id="rc-email" name="email" type="email" required placeholder="you@company.com" autoComplete="email" className={input} />
          <label className="sr-only" htmlFor="rc-county">County</label>
          <input id="rc-county" name="county" required placeholder="County, e.g. Harris" className={input} />
          <label className="sr-only" htmlFor="rc-state">State</label>
          <input id="rc-state" name="state" maxLength={2} placeholder="TX" className={`${input} uppercase`} />
          <button type="submit" disabled={pending} className={`${button("primary", "md")} h-11`}>
            {pending ? <Loader2 size={16} className="animate-spin" /> : "Request"}
          </button>
          {state && !state.ok && <p role="alert" className="text-sm text-danger sm:col-span-4">{state.message}</p>}
        </form>
      )}
    </div>
  );
}
