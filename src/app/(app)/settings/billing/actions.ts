"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isPlanId } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelAtPeriodEnd, createCheckout } from "@/lib/whop";

export async function startCheckout(formData: FormData) {
  const plan = formData.get("plan");
  if (!isPlanId(plan)) redirect("/settings/billing?error=" + encodeURIComponent("Pick a plan."));

  const { user, org, role } = await getSession("/settings/billing");
  if (!org || role !== "owner") {
    redirect("/settings/billing?error=" + encodeURIComponent("Only the account owner can change the plan."));
  }

  const h = await headers();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${h.get("host")}`;

  let url: string;
  try {
    url = await createCheckout({ plan, orgId: org.id, userId: user.id, redirectUrl: `${site}/settings/billing?status=success` });
  } catch (e) {
    console.error(e);
    redirect("/settings/billing?error=" + encodeURIComponent("Checkout couldn't start. Try again in a minute."));
  }
  redirect(url);
}

export async function cancelPlan() {
  const { org, role } = await getSession("/settings/billing");
  if (!org || role !== "owner") {
    redirect("/settings/billing?error=" + encodeURIComponent("Only the account owner can cancel the plan."));
  }
  if (!org.whop_membership_id) {
    redirect("/settings/billing?error=" + encodeURIComponent("There’s no paid plan to cancel."));
  }

  let periodEnd: string | null = null;
  try {
    const m = await cancelAtPeriodEnd(org.whop_membership_id);
    periodEnd = m.current_period_end;
  } catch (e) {
    console.error(e);
    redirect("/settings/billing?error=" + encodeURIComponent("Couldn’t cancel right now. Try again in a minute."));
  }
  // The membership.updated webhook confirms this too; write it now so the page reflects it.
  await createAdminClient()
    .from("orgs")
    .update({ plan_status: "canceling", ...(periodEnd ? { current_period_end: periodEnd } : {}) })
    .eq("id", org.id);
  redirect("/settings/billing?status=canceled");
}
