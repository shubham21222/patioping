"use server";

import { createClient } from "@/lib/supabase/server";
import { isSoonTrade, SOON_TRADES } from "@/lib/trades";

export type WaitlistState = { ok: boolean; message: string } | null;

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Honeypot: real people never fill this.
  if (String(formData.get("company_site") ?? "")) return { ok: true, message: "You’re on the list." };

  const trade = formData.get("trade");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const zip = String(formData.get("zip") ?? "").trim();
  const source = String(formData.get("source") ?? "landing");

  if (!isSoonTrade(trade)) return { ok: false, message: "Pick a trade." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "Enter a valid email." };
  if (zip && !/^\d{5}$/.test(zip)) return { ok: false, message: "Zip code should be 5 digits." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("trade_waitlist").insert({
    trade,
    email,
    zip: zip || null,
    source: ["landing", "onboarding", "trade_page"].includes(source) ? source : "landing",
    user_id: user?.id ?? null,
  });

  const name = SOON_TRADES.find((t) => t.id === trade)!.name;
  if (error && error.code !== "23505") {
    console.error("waitlist insert failed", error);
    return { ok: false, message: "Couldn’t save that. Try again in a minute." };
  }
  return { ok: true, message: `You’re on the list. We’ll email ${email} when ${name} launches.` };
}
