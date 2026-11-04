"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const STAGES = ["new", "contacted", "postcard_sent", "quoted", "won", "lost"];

export async function updateLead(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const stage = String(formData.get("stage"));
  if (!STAGES.includes(stage)) return;
  const followUp = String(formData.get("next_follow_up") ?? "") || null;
  const wonRaw = String(formData.get("won_value_monthly") ?? "").replace(/[^0-9.]/g, "");
  const { data: before } = await supabase.from("leads").select("stage").eq("id", id).single();
  if (!before) return;

  await supabase
    .from("leads")
    .update({
      stage,
      next_follow_up: followUp,
      won_value_monthly: stage === "won" && wonRaw ? Number(wonRaw) : null,
    })
    .eq("id", id);

  if (before.stage !== stage) {
    await supabase
      .from("lead_activities")
      .insert({ lead_id: id, user_id: user.id, type: "stage_change", body: `${before.stage} → ${stage}` });
  }
  revalidatePath(`/leads/${id}`);
}

export async function addNote(formData: FormData) {
  const id = String(formData.get("id"));
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!body) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("lead_activities").insert({ lead_id: id, user_id: user.id, type: "note", body });
  revalidatePath(`/leads/${id}`);
}
