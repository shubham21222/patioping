"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";

/** Pick a plan on the left, see the bill on the right. Yearly = 10 months for 12. */
export function PricingPicker() {
  const [plan, setPlan] = useState<PlanId>("growth");
  const [yearly, setYearly] = useState(false);
  const p = PLANS.find((x) => x.id === plan)!;
  const monthly = yearly ? Math.round((p.price * 10) / 12) : p.price;

  return (
    <div className="grid overflow-hidden rounded-[24px] border border-line bg-white shadow-[var(--shadow-float)] md:grid-cols-[1.35fr_1fr]">
      <fieldset className="p-3 sm:p-4">
        <legend className="sr-only">Choose a plan</legend>
        <div className="space-y-2">
          {PLANS.map((x) => {
            const on = x.id === plan;
            return (
              <label
                key={x.id}
                className={`block cursor-pointer rounded-2xl border p-4 transition-colors ${
                  on ? "border-[#cfe3f1] bg-water-soft" : "border-transparent hover:bg-deck"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="plan"
                    value={x.id}
                    checked={on}
                    onChange={() => setPlan(x.id)}
                    className="h-4 w-4 accent-[var(--water)]"
                  />
                  <span className="flex-1 font-medium">{x.name}</span>
                  <span className="num text-sm text-ink-2">${x.price}/mo</span>
                </span>
                <span className="mt-1 block pl-7 text-sm text-ink-2">{x.blurb}</span>
                <span className="mt-3 block pl-7">
                  {x.includes && <span className="mb-1.5 block text-xs font-medium text-ink-3">Everything in {x.includes}, plus:</span>}
                  <span className="grid gap-1.5 text-sm sm:grid-cols-2">
                    {x.features.map((f) => (
                      <span key={f} className="flex gap-2">
                        <Check size={16} strokeWidth={2.5} className={`mt-0.5 shrink-0 ${on ? "text-water" : "text-ink-3"}`} />
                        {f}
                      </span>
                    ))}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="m-3 flex flex-col rounded-[20px] bg-water p-6 text-white sm:m-4 sm:p-7">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/80">Your bill</p>
          <div role="group" aria-label="Billing period" className="flex rounded-full bg-white/15 p-1 text-xs font-medium">
            {[
              [false, "Monthly"],
              [true, "Yearly"],
            ].map(([v, l]) => (
              <button
                key={String(l)}
                type="button"
                aria-pressed={yearly === v}
                onClick={() => setYearly(v as boolean)}
                className={`rounded-full px-3 py-1.5 transition-colors ${yearly === v ? "bg-white text-water" : "text-white/85 hover:text-white"}`}
              >
                {l as string}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-6 flex items-baseline gap-1">
          <span className="marker text-5xl" aria-live="polite">${monthly}</span>
          <span className="text-white/80">/ month</span>
        </p>
        <p className="mt-1 h-5 text-sm text-white/80">{yearly ? `$${p.price * 10} billed yearly. 2 months free.` : "Billed monthly."}</p>
        <ul className="mt-6 space-y-2 text-sm">
          {["7 days free, no card", "Cancel any time", "Secure checkout"].map((t) => (
            <li key={t} className="flex gap-2">
              <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" /> {t}
            </li>
          ))}
        </ul>
        <Link
          href={`/signup?plan=${plan}`}
          className="group mt-auto inline-flex h-12 items-center justify-between rounded-full bg-white pl-5 pr-1.5 pt-0 font-medium text-water max-md:mt-8 md:mt-10"
        >
          Start free with {p.name}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-water text-white transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight size={16} />
          </span>
        </Link>
      </div>
    </div>
  );
}
