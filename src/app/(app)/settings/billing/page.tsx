import { Check } from "lucide-react";
import { Notice } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";
import { getSession } from "@/lib/session";
import { PLANS } from "@/lib/plans";
import { startCheckout } from "./actions";

const STATUS: Record<string, string> = {
  trialing: "Free week",
  active: "Active",
  canceling: "Cancels at period end",
  past_due: "Payment past due",
  canceled: "Canceled",
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ error?: string; status?: string }> }) {
  const { error, status } = await searchParams;
  const { org, role } = await getSession("/settings/billing");
  const current = PLANS.find((p) => p.id === org?.plan);
  const periodEnd = org?.current_period_end ?? (org?.plan === "trial" ? org?.trial_ends_at : null);

  return (
    <div>
      <h1 className="text-3xl font-extrabold [font-stretch:87.5%] sm:text-4xl">Billing</h1>

      <div className="mt-6 max-w-3xl">
        {error && <Notice tone="error">{error}</Notice>}
        {status === "success" && (
          <Notice tone="info">Payment received. Your plan updates here within a minute of Whop confirming it.</Notice>
        )}
      </div>

      <dl className="mt-4 grid max-w-3xl gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        <div className="bg-white p-5">
          <dt className="text-sm text-ink-2">Plan</dt>
          <dd className="mt-1 text-lg font-bold">{current?.name ?? "Free week"}</dd>
        </div>
        <div className="bg-white p-5">
          <dt className="text-sm text-ink-2">Status</dt>
          <dd className="mt-1 text-lg font-bold">{STATUS[org?.plan_status ?? "trialing"] ?? org?.plan_status}</dd>
        </div>
        <div className="bg-white p-5">
          <dt className="text-sm text-ink-2">{org?.plan === "trial" ? "Free week ends" : "Renews"}</dt>
          <dd className="num mt-1 text-lg font-bold">
            {periodEnd ? new Date(periodEnd).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
          </dd>
        </div>
      </dl>

      <h2 className="mt-14 text-xl font-bold">{current ? "Change plan" : "Choose a plan"}</h2>
      <p className="mt-1 text-ink-2">Checkout is handled by Whop. Cancel any time from your Whop account.</p>

      <div className="mt-6 grid overflow-hidden rounded-2xl border border-line lg:grid-cols-3">
        {PLANS.map((p, i) => {
          const isCurrent = p.id === org?.plan;
          return (
            <form
              key={p.id}
              action={startCheckout}
              className={`flex flex-col p-6 ${i > 0 ? "border-t border-line lg:border-l lg:border-t-0" : ""}`}
            >
              <input type="hidden" name="plan" value={p.id} />
              <h3 className="font-bold">{p.name}</h3>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="marker text-4xl">${p.price}</span>
                <span className="text-ink-3">/ month</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-[15px]">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={17} strokeWidth={2.5} className="mt-0.5 shrink-0 text-water" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {isCurrent ? (
                  <p className="flex h-13 items-center justify-center rounded-[10px] bg-deck font-semibold text-ink-2">Current plan</p>
                ) : role === "owner" ? (
                  <SubmitButton variant={p.featured ? "primary" : "quiet"} pendingLabel="Opening checkout…">
                    {current ? `Switch to ${p.name}` : `Choose ${p.name}`}
                  </SubmitButton>
                ) : (
                  <p className="text-sm text-ink-3">Ask your account owner to change plans.</p>
                )}
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
