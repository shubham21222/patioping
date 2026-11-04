import { Check } from "lucide-react";
import { Notice } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";
import { getSession } from "@/lib/session";
import { FOUNDING, PLANS } from "@/lib/plans";
import { cancelPlan, startCheckout } from "./actions";

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
      <p className="text-sm text-ink-3">Dashboard <span className="mx-1.5">/</span> <span className="text-ink-2">Billing</span></p>
      <h1 className="mt-3 text-4xl font-normal tracking-tight sm:text-[2.6rem]">Billing</h1>

      <div className="mt-6 max-w-3xl">
        {error && <Notice tone="error">{error}</Notice>}
        {status === "success" && (
          <Notice tone="info">Payment received. Your plan updates here within a minute, once the payment is confirmed.</Notice>
        )}
        {status === "canceled" && (
          <Notice tone="info">Your plan is canceled. You keep access until the end of the period you paid for.</Notice>
        )}
      </div>

      <dl className="mt-4 grid max-w-3xl gap-px overflow-hidden rounded-[22px] border border-white bg-line shadow-[var(--shadow-card)] sm:grid-cols-3">
        <div className="bg-white p-5">
          <dt className="text-sm text-ink-2">Plan</dt>
          <dd className="mt-1 text-lg font-medium">{current?.name ?? "Free week"}</dd>
        </div>
        <div className="bg-white p-5">
          <dt className="text-sm text-ink-2">Status</dt>
          <dd className="mt-1 text-lg font-medium">{STATUS[org?.plan_status ?? "trialing"] ?? org?.plan_status}</dd>
        </div>
        <div className="bg-white p-5">
          <dt className="text-sm text-ink-2">
            {org?.plan === "trial" ? "Free week ends" : org?.plan_status === "canceling" ? "Access until" : "Renews"}
          </dt>
          <dd className="num mt-1 text-lg font-medium">
            {periodEnd ? new Date(periodEnd).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
          </dd>
        </div>
      </dl>

      <h2 className="mt-12 text-xl font-medium">{current ? "Change plan" : "Choose a plan"}</h2>
      <p className="mt-1 text-ink-2">Secure checkout. Cancel any time from this page. {FOUNDING.line}</p>

      <div className="mt-6 grid overflow-hidden rounded-[22px] border border-white bg-white shadow-[var(--shadow-card)] lg:grid-cols-3">
        {PLANS.map((p, i) => {
          const isCurrent = p.id === org?.plan;
          return (
            <form
              key={p.id}
              action={startCheckout}
              className={`flex flex-col p-6 ${i > 0 ? "border-t border-line lg:border-l lg:border-t-0" : ""}`}
            >
              <input type="hidden" name="plan" value={p.id} />
              <h3 className="font-medium">{p.name}</h3>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="marker text-4xl">${p.price}</span>
                <span className="text-ink-3">/ month</span>
              </p>
              {p.includes && <p className="mt-4 text-xs font-medium text-ink-3">Everything in {p.includes}, plus:</p>}
              <ul className={`${p.includes ? "mt-2" : "mt-5"} flex-1 space-y-2 text-[15px]`}>
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={17} strokeWidth={2.5} className="mt-0.5 shrink-0 text-water" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {isCurrent ? (
                  <p className="flex h-12 items-center justify-center rounded-full bg-deck font-medium text-ink-2">Current plan</p>
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
      {role === "owner" && org?.whop_membership_id && org.plan !== "trial" && !["canceling", "canceled"].includes(org.plan_status) && (
        <form action={cancelPlan} className="mt-10 flex max-w-3xl flex-col gap-4 rounded-[22px] border border-white bg-white p-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">Cancel plan</h2>
            <p className="mt-1 text-sm text-ink-2">Alerts keep coming until the end of the period you&rsquo;ve paid for.</p>
          </div>
          <SubmitButton variant="quiet" pendingLabel="Canceling…" className="sm:w-auto">Cancel at period end</SubmitButton>
        </form>
      )}
    </div>
  );
}
