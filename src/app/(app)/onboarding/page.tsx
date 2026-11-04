import { Notice } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";
import { input, label } from "@/components/ui";
import { getSession } from "@/lib/session";
import { saveTerritory } from "./actions";

const TRADES = [
  { id: "pool_service", name: "Pool service", note: "New pools and spas", live: true },
  { id: "fence", name: "Fencing", note: "Coming later", live: false },
  { id: "landscaping", name: "Landscaping", note: "Coming later", live: false },
  { id: "enclosure", name: "Screen enclosures", note: "Coming later", live: false },
];

const ZONES = [
  ["America/Chicago", "Central (Austin, Nashville)"],
  ["America/Phoenix", "Arizona (Mesa, Phoenix)"],
  ["America/Los_Angeles", "Pacific (Los Angeles)"],
  ["America/New_York", "Eastern (Miami)"],
  ["America/Denver", "Mountain"],
];

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase, org } = await getSession("/onboarding");
  const { data: territory } = await supabase.from("territories").select("zips").eq("type", "zip").maybeSingle();

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-extrabold [font-stretch:87.5%] sm:text-4xl">Your territory</h1>
      <p className="mt-2 text-ink-2">Three answers and your first alert goes out tomorrow morning.</p>

      {error && <div className="mt-6"><Notice tone="error">{error}</Notice></div>}

      <form action={saveTerritory} className="mt-10 space-y-12">
        <fieldset>
          <legend className="text-lg font-bold">What do you do?</legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {TRADES.map((t) => (
              <label
                key={t.id}
                className={`flex items-start gap-3 rounded-[12px] border p-4 transition-colors ${
                  t.live
                    ? "cursor-pointer border-line hover:border-ink-3 has-[:checked]:border-water has-[:checked]:bg-[#eef6fc]"
                    : "cursor-not-allowed border-line bg-deck text-ink-3"
                }`}
              >
                <input
                  type="radio"
                  name="trade"
                  value={t.id}
                  disabled={!t.live}
                  defaultChecked={(org?.trade ?? "pool_service") === t.id}
                  className="mt-1 accent-[var(--water)]"
                />
                <span>
                  <span className={`block font-semibold ${t.live ? "text-ink" : ""}`}>{t.name}</span>
                  <span className="text-sm">{t.note}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-bold">Which zip codes do you service?</legend>
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
          <legend className="mb-4 text-lg font-bold">When should the alert arrive?</legend>
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

        <div className="border-t border-line pt-8">
          <SubmitButton pendingLabel="Saving…" className="w-full sm:w-auto">Save and go to leads</SubmitButton>
        </div>
      </form>
    </div>
  );
}
