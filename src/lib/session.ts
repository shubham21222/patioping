import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Org = {
  id: string;
  name: string;
  trade: string;
  plan: "trial" | "starter" | "growth" | "pro";
  plan_status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  alert_hour_local: number;
  timezone: string;
};

/** Current user + org for app pages. Redirects to /login when signed out. */
export const getSession = cache(async (next = "/leads") => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, orgs(id, name, trade, plan, plan_status, trial_ends_at, current_period_end, alert_hour_local, timezone)")
    .eq("id", user.id)
    .single();

  const org = (Array.isArray(profile?.orgs) ? profile?.orgs[0] : profile?.orgs) as Org | undefined;
  return { supabase, user, org: org ?? null, role: (profile?.role ?? "member") as "owner" | "member" };
});
