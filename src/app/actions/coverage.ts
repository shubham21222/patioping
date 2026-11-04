"use server";

import { createClient } from "@/lib/supabase/server";

export type ZipPreview = {
  zip: string;
  count: number;
  by_category: Record<string, number>;
  jurisdiction: string | null;
  coverage_note: string | null;
  samples: { category: string; work: string; value_band: string | null; issued_at: string }[];
};

export type ZipState = { ok: true; data: ZipPreview } | { ok: false; zip?: string; message: string } | null;

export async function checkZip(_prev: ZipState, formData: FormData): Promise<ZipState> {
  const zip = String(formData.get("zip") ?? "").trim();
  if (!/^\d{5}$/.test(zip)) return { ok: false, message: "Enter a 5-digit US zip code." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("zip_preview", { p_zip: zip });
  if (error) {
    console.error("zip_preview failed", error);
    return { ok: false, zip, message: "Couldn’t check that zip right now. Try again in a minute." };
  }
  return { ok: true, data: data as ZipPreview };
}

export type CountyState = { ok: boolean; message: string } | null;

export async function requestCounty(_prev: CountyState, formData: FormData): Promise<CountyState> {
  if (String(formData.get("company_site") ?? "")) return { ok: true, message: "Thanks, we’ve got it." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const county = String(formData.get("county") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const zip = String(formData.get("zip") ?? "").trim();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "Enter a valid email." };
  if (county.length < 2 || county.length > 80) return { ok: false, message: "Which county do you work in?" };
  if (state && !/^[A-Z]{2}$/.test(state)) return { ok: false, message: "Use the 2-letter state code, like TX." };

  const supabase = await createClient();
  const { error } = await supabase.from("coverage_requests").insert({
    email,
    county,
    state: state || null,
    zip: /^\d{5}$/.test(zip) ? zip : null,
  });
  if (error && error.code !== "23505") {
    console.error("coverage request failed", error);
    return { ok: false, message: "Couldn’t save that. Try again in a minute." };
  }
  return { ok: true, message: `Got it. We’ll email ${email} when ${county} is live.` };
}
