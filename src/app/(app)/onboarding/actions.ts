"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

const TRADES = ["pool_service", "fence", "landscaping", "enclosure", "solar"];
const ZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles"];

export async function saveTerritory(formData: FormData) {
  const { supabase, org } = await getSession("/onboarding");
  if (!org) redirect("/onboarding?error=" + encodeURIComponent("We couldn't find your company. Log out and back in."));

  const zips = Array.from(new Set(String(formData.get("zips") ?? "").match(/\b\d{5}\b/g) ?? [])).slice(0, 200);
  if (!zips.length) redirect("/onboarding?error=" + encodeURIComponent("Add at least one 5-digit zip code."));

  const trade = String(formData.get("trade"));
  const hour = Number(formData.get("alert_hour"));
  const tz = String(formData.get("timezone"));

  const { error: orgErr } = await supabase
    .from("orgs")
    .update({
      trade: TRADES.includes(trade) ? trade : "pool_service",
      alert_hour_local: Number.isInteger(hour) && hour >= 4 && hour <= 11 ? hour : 7,
      timezone: ZONES.includes(tz) ? tz : "America/Chicago",
    })
    .eq("id", org.id);
  if (orgErr) redirect("/onboarding?error=" + encodeURIComponent(orgErr.message));

  // One zip territory per org for now; replace it on every save.
  await supabase.from("territories").delete().eq("org_id", org.id).eq("type", "zip");
  const { error } = await supabase.from("territories").insert({ org_id: org.id, type: "zip", zips });
  if (error) redirect("/onboarding?error=" + encodeURIComponent(error.message));

  redirect("/leads");
}
