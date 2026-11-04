"use client";

import { useActionState, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { joinWaitlist, type WaitlistState } from "@/app/actions/waitlist";
import { TradeIcon } from "@/components/TradeIcon";
import { button, input } from "@/components/ui";
import { SOON_TRADES, type SoonTradeId } from "@/lib/trades";

/** Coming-soon trades. Picking one opens a two-field waitlist form underneath. */
export function SoonTrades({
  source,
  defaultEmail = "",
  columns = "sm:grid-cols-2 lg:grid-cols-4",
}: {
  source: "landing" | "onboarding" | "trade_page";
  defaultEmail?: string;
  columns?: string;
}) {
  const [open, setOpen] = useState<SoonTradeId | null>(null);
  const [joined, setJoined] = useState<Record<string, string>>({});
  const active = SOON_TRADES.find((t) => t.id === open);

  return (
    <div>
      <div className={`grid gap-2 ${columns}`}>
        {SOON_TRADES.map((t) => {
          const on = open === t.id;
          const done = joined[t.id];
          return (
            <button
              key={t.id}
              type="button"
              aria-expanded={on}
              aria-controls="waitlist-form"
              onClick={() => setOpen(on ? null : t.id)}
              className={`flex items-start gap-3 rounded-[12px] border p-4 text-left transition-colors ${
                on ? "border-ink-3 bg-white" : "border-line bg-deck hover:border-ink-3"
              }`}
            >
              <TradeIcon name={t.icon} size={22} className="mt-0.5 shrink-0 text-ink-3" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-ink-2">{t.name}</span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-water">
                      <Check size={13} strokeWidth={3} /> On the list
                    </span>
                  ) : (
                    <span className="rounded-full bg-deck-2 px-2 py-0.5 text-[11px] font-semibold text-ink-2">Coming soon</span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm text-ink-3">{t.note}</span>
              </span>
            </button>
          );
        })}
      </div>

      {active && !joined[active.id] && (
        <WaitlistForm
          key={active.id}
          trade={active.id}
          name={active.name}
          source={source}
          defaultEmail={defaultEmail}
          onJoined={(msg) => setJoined((j) => ({ ...j, [active.id]: msg }))}
        />
      )}
      {active && joined[active.id] && (
        <p role="status" className="mt-3 rounded-[10px] bg-[#e6f1fa] px-4 py-3 text-sm text-deep">{joined[active.id]}</p>
      )}
    </div>
  );
}

function WaitlistForm({
  trade,
  name,
  source,
  defaultEmail,
  onJoined,
}: {
  trade: SoonTradeId;
  name: string;
  source: string;
  defaultEmail: string;
  onJoined: (msg: string) => void;
}) {
  const [state, action, pending] = useActionState(async (prev: WaitlistState, fd: FormData) => {
    const res = await joinWaitlist(prev, fd);
    if (res?.ok) onJoined(res.message);
    return res;
  }, null);

  return (
    <form id="waitlist-form" action={action} className="mt-3 rounded-[12px] border border-line bg-white p-4 sm:p-5">
      <p className="font-semibold">Notify me when {name} launches</p>
      <input type="hidden" name="trade" value={trade} />
      <input type="hidden" name="source" value={source} />
      <input type="text" name="company_site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
        <label className="sr-only" htmlFor={`wl-email-${trade}`}>Email</label>
        <input id={`wl-email-${trade}`} name="email" type="email" required defaultValue={defaultEmail} placeholder="you@company.com" className={input} autoComplete="email" autoFocus />
        <label className="sr-only" htmlFor={`wl-zip-${trade}`}>Zip code</label>
        <input id={`wl-zip-${trade}`} name="zip" inputMode="numeric" pattern="\d{5}" maxLength={5} placeholder="Zip" className={input} autoComplete="postal-code" />
        <button type="submit" disabled={pending} className={`${button("primary", "md")} h-12`}>
          {pending ? <Loader2 size={18} className="animate-spin" /> : "Notify me"}
        </button>
      </div>
      {state && !state.ok && <p role="alert" className="mt-2 text-sm text-danger">{state.message}</p>}
    </form>
  );
}
