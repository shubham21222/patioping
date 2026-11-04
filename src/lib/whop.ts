import "server-only";
import { Webhook } from "standardwebhooks";
import type { PlanId } from "./plans";

const API_BASE =
  process.env.WHOP_ENV === "sandbox" ? "https://sandbox-api.whop.com/api/v1" : "https://api.whop.com/api/v1";

/** Whop plan IDs (`plan_…`) per tier, created in the Whop dashboard. */
function variantFor(plan: PlanId) {
  const id = {
    starter: process.env.WHOP_PLAN_STARTER,
    growth: process.env.WHOP_PLAN_GROWTH,
    pro: process.env.WHOP_PLAN_PRO,
  }[plan];
  if (!id) throw new Error(`Missing Whop plan id for "${plan}". Set WHOP_PLAN_${plan.toUpperCase()}.`);
  return id;
}

export async function createCheckout(opts: {
  plan: PlanId;
  orgId: string;
  userId: string;
  redirectUrl: string;
}): Promise<string> {
  const key = process.env.WHOP_API_KEY;
  if (!key) throw new Error("WHOP_API_KEY is not set");

  const res = await fetch(`${API_BASE}/checkout_configurations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      variant_id: variantFor(opts.plan),
      redirect_url: opts.redirectUrl,
      // Copied onto the payment and membership, so the webhook knows which org paid.
      metadata: { org_id: opts.orgId, user_id: opts.userId, plan: opts.plan },
    }),
  });
  if (!res.ok) throw new Error(`Whop checkout failed (${res.status}): ${await res.text()}`);

  const body = (await res.json()) as { purchase_url?: string | null };
  if (!body.purchase_url) throw new Error("Whop returned no purchase_url");
  return body.purchase_url;
}

/**
 * Verify a Whop webhook (Standard Webhooks). Whop HMACs with the literal bytes of the
 * `ws_…` secret, while `standardwebhooks` base64-decodes its key, so encode it first.
 * Same approach as `unwrapWebhook` in @whop/sdk.
 */
export function verifyWhopWebhook<T = unknown>(rawBody: string, headers: Headers): T {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) throw new Error("WHOP_WEBHOOK_SECRET is not set");
  const bytes = new TextEncoder().encode(secret);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return new Webhook(btoa(bin)).verify(rawBody, {
    "webhook-id": headers.get("webhook-id") ?? "",
    "webhook-timestamp": headers.get("webhook-timestamp") ?? "",
    "webhook-signature": headers.get("webhook-signature") ?? "",
  }) as T;
}
