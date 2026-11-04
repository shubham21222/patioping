import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWhopWebhook } from "@/lib/whop";
import { isPlanId } from "@/lib/plans";

type Membership = {
  id: string;
  status: string;
  user_id: string | null;
  cancel_at_period_end?: boolean;
  current_period_end?: string | null;
  metadata?: Record<string, unknown>;
};
type WhopEvent = { type: string; data: Membership };

const ACTIVE = new Set(["active", "trialing", "completed", "canceling", "past_due"]);

export async function POST(request: NextRequest) {
  const raw = await request.text();

  let event: WhopEvent;
  try {
    event = verifyWhopWebhook<WhopEvent>(raw, request.headers);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (!event.type?.startsWith("membership.")) return NextResponse.json({ ok: true, ignored: event.type });

  const m = event.data;
  const orgId = typeof m.metadata?.org_id === "string" ? m.metadata.org_id : null;
  const plan = m.metadata?.plan;
  if (!orgId) return NextResponse.json({ ok: true, ignored: "no org_id in metadata" });

  const deactivated = event.type === "membership.deactivated" || event.type === "membership.went_invalid";
  const active = !deactivated && ACTIVE.has(m.status);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orgs")
    .update({
      plan: active && isPlanId(plan) ? plan : "trial",
      plan_status: deactivated ? "canceled" : m.cancel_at_period_end ? "canceling" : m.status,
      whop_membership_id: m.id,
      whop_user_id: m.user_id,
      current_period_end: m.current_period_end ?? null,
    })
    .eq("id", orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
