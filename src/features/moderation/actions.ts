"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";

export type ReportState = { error?: string; success?: boolean } | null;

export async function createReportAction(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const reason = ((formData.get("reason") as string) ?? "").trim();
  const listingId = (formData.get("listingId") as string) || null;
  const reportedUserId = (formData.get("reportedUserId") as string) || null;

  if (reason.length < 5) {
    return { error: "Lütfen kısa bir açıklama yaz (en az 5 karakter)." };
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    listing_id: listingId,
    reason,
  });
  if (error) return { error: error.message };
  return { success: true };
}

// Admin: şikayeti reddet (kapat)
export async function dismissReportAction(formData: FormData) {
  const id = formData.get("id") as string;
  const { supabase } = await requireUser();
  await supabase.from("reports").update({ status: "dismissed" }).eq("id", id);
  revalidatePath("/moderation");
}

// Admin: kullanıcıyı banla (RLS + RPC admin kontrolü yapar)
export async function banUserAction(formData: FormData) {
  const target = formData.get("userId") as string;
  const { supabase } = await requireUser();
  await supabase.rpc("ban_user", { target });
  revalidatePath("/moderation");
}
