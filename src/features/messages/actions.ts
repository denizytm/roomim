"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";

// Ev arayan bir ilana ilgi gösterir: konuşma 'pending' olarak açılır (varsa mevcut açılır).
export async function startConversationAction(formData: FormData) {
  const listingId = formData.get("listingId") as string;
  const { supabase, user } = await requireUser();

  const { data: listing } = await supabase
    .from("listings")
    .select("id, owner_id")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) redirect("/listings");
  if (listing.owner_id === user.id) redirect(`/listings/${listingId}`);

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("seeker_id", user.id)
    .maybeSingle();

  if (existing) redirect(`/messages/${existing.id}`);

  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      seeker_id: user.id,
      host_id: listing.owner_id,
    })
    .select("id")
    .single();

  if (error || !conv) redirect(`/listings/${listingId}`);
  redirect(`/messages/${conv.id}`);
}

// Ev sahibi konuşmayı onaylar/reddeder.
export async function setConversationStatusAction(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as "accepted" | "declined";
  const { supabase, user } = await requireUser();

  await supabase
    .from("conversations")
    .update({ status })
    .eq("id", id)
    .eq("host_id", user.id);

  revalidatePath(`/messages/${id}`);
  revalidatePath("/messages");
}
