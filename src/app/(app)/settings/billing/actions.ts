"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isPlanId } from "@/lib/plans";
import { createCheckout } from "@/lib/whop";

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
