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

// Admin: kullanıcıyı banla. Süre: preset (saat) veya customHours; 0/boş = süresiz.
export async function banUserAction(formData: FormData) {
  const target = formData.get("userId") as string;
  const preset = Number(formData.get("preset"));
  const custom = Number(formData.get("customHours"));
  const hours =
    Number.isFinite(custom) && custom > 0
      ? custom
      : Number.isFinite(preset)
        ? preset
        : 0;
  const until = hours > 0 ? new Date(Date.now() + hours * 3_600_000).toISOString() : null;

  const { supabase } = await requireUser();
  await supabase.rpc("ban_user", { target, until });
  revalidatePath("/moderation");
}

// Admin: banı kaldır
export async function unbanUserAction(formData: FormData) {
  const target = formData.get("userId") as string;
  const { supabase } = await requireUser();
  await supabase.rpc("unban_user", { target });
  revalidatePath("/moderation");
}
