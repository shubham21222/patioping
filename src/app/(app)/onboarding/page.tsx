import { Notice } from "@/components/AuthCard";
import { SoonTrades } from "@/components/SoonTrades";
import { SubmitButton } from "@/components/SubmitButton";
import { TradeIcon } from "@/components/TradeIcon";
import { input, label } from "@/components/ui";
import { getSession } from "@/lib/session";
import { LIVE_TRADES } from "@/lib/trades";
import { saveTerritory } from "./actions";

const ZONES = [
  ["America/Chicago", "Central (Austin, Nashville)"],
  ["America/Phoenix", "Arizona (Mesa, Phoenix)"],
  ["America/Los_Angeles", "Pacific (Los Angeles)"],
  ["America/New_York", "Eastern (Miami)"],
  ["America/Denver", "Mountain"],
];

const FORM_ID = "territory-form";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase, org, user } = await getSession("/onboarding");
  const { data: territory } = await supabase.from("territories").select("zips").eq("type", "zip").maybeSingle();
  const current = org?.trade ?? "pool_service";

  return (
    <div className="max-w-3xl">
      <p className="text-sm text-ink-3">Dashboard <span className="mx-1.5">/</span> <span className="text-ink-2">Territory</span></p>
      <h1 className="mt-3 text-4xl font-normal tracking-tight sm:text-[2.6rem]">Your territory</h1>
      <p className="mt-2 text-ink-2">Three answers and your first alert goes out tomorrow morning.</p>

      {error && <div className="mt-6"><Notice tone="error">{error}</Notice></div>}

      {/* Lives outside the <form> so the waitlist form below isn't nested; radios join via form=. */}
      <div className="mt-8 space-y-3"><fieldset className="rounded-[22px] border border-white bg-white shadow-[var(--shadow-card)] p-5 sm:p-6">
        <legend className="text-lg font-medium">Pick your trade</legend>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {LIVE_TRADES.map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-line p-4 transition-colors hover:border-ink-3 has-[:checked]:border-water has-[:checked]:bg-water-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-water"
            >
              <span className="flex items-center justify-between">
                <TradeIcon name={t.icon} size={24} className="text-water" />
                <input
                  type="radio"
                  name="trade"
                  value={t.id}
                  form={FORM_ID}
                  required
                  defaultChecked={current === t.id}
                  className="h-4 w-4 accent-[var(--water)]"
                />
              </span>
              <span>
                <span className="block font-semibold">{t.name}</span>
                <span className="text-sm text-ink-2">{t.keywords.slice(0, 3).join(", ")}</span>
              </span>
            </label>
          ))}
        </div>

        <p className="mt-6 text-sm font-semibold text-ink-2">Not listed? Get notified when yours launches.</p>
        <div className="mt-3">
          <SoonTrades source="onboarding" defaultEmail={user.email ?? ""} columns="sm:grid-cols-2" />
        </div>
      </fieldset>

      <form id={FORM_ID} action={saveTerritory} className="rounded-[22px] border border-white bg-white shadow-[var(--shadow-card)] space-y-10 p-5 sm:p-6">
        <fieldset>
          <legend className="text-lg font-medium">Which zip codes do you work in?</legend>
          <label htmlFor="zips" className="sr-only">Zip codes</label>
          <textarea
            id="zips"
            name="zips"
            rows={3}
            required
            defaultValue={territory?.zips?.join(", ") ?? ""}
            placeholder="78701, 78704, 78745"
            className={`${input} mt-4 h-auto py-3 leading-relaxed`}
            aria-describedby="zips-hint"
          />
          <p id="zips-hint" className="mt-2 text-sm text-ink-3">
            Separate with commas or spaces. Paste a whole list if you have one.
          </p>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-lg font-medium">When should the alert arrive?</legend>
          <div>
            <label htmlFor="hour" className={label}>Time</label>
            <select id="hour" name="alert_hour" defaultValue={org?.alert_hour_local ?? 7} className={input}>
              {[5, 6, 7, 8, 9].map((h) => (
                <option key={h} value={h}>{h}:00 AM</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tz" className={label}>Time zone</label>
            <select id="tz" name="timezone" defaultValue={org?.timezone ?? "America/Chicago"} className={input}>
              {ZONES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </fieldset>

        <div className="border-t border-line pt-6">
          <SubmitButton pendingLabel="Saving…" className="w-full sm:w-auto">Save and go to leads</SubmitButton>
        </div>
      </form>
      </div>
    </div>
  );
}
