import { isEffectivelyBanned } from "@hoomies/shared/ban";
import type {
  CompatibilityCategory,
  CompatibilityQuestion,
  ListingStatus,
  Profile,
  QuestionOption,
  UserRole,
} from "@hoomies/shared/types/database.types";
import type { ListingInput } from "@hoomies/shared/validation/listing";

import { supabase } from "@/lib/supabase";
import { publicImageUrl } from "@/lib/storage";

export async function getOnboardingData(): Promise<{
  categories: CompatibilityCategory[];
  questions: CompatibilityQuestion[];
}> {
  const [{ data: categories }, { data: questions }] = await Promise.all([
    supabase.from("compatibility_categories").select("*").order("position"),
    supabase.from("compatibility_questions").select("*").order("position"),
  ]);
  return { categories: categories ?? [], questions: questions ?? [] };
}

export async function getMyAnswers(userId: string): Promise<Record<number, number>> {
  const { data } = await supabase
    .from("compatibility_answers")
    .select("question_id, value")
    .eq("user_id", userId);
  const map: Record<number, number> = {};
  for (const a of data ?? []) map[a.question_id] = a.value;
  return map;
}

// Sadece cevapları kaydet (profilden güncelleme — onboarding bayrağına dokunmaz).
export async function saveAnswers(
  userId: string,
  answers: Record<number, number>,
): Promise<void> {
  const rows = Object.entries(answers).map(([qid, value]) => ({
    user_id: userId,
    question_id: Number(qid),
    value,
  }));
  if (rows.length === 0) return;
  const { error } = await supabase
    .from("compatibility_answers")
    .upsert(rows, { onConflict: "user_id,question_id" });
  if (error) throw error;
}

// Onboarding'i tamamla — cevaplar kısmi/boş olabilir, bayrak yine de set edilir.
export async function saveOnboarding(
  userId: string,
  role: UserRole,
  answers: Record<number, number>,
): Promise<void> {
  await saveAnswers(userId, answers);
  const { error } = await supabase
    .from("profiles")
    .update({ role, onboarding_completed: true })
    .eq("id", userId);
  if (error) throw error;
}

export type DeckListing = {
  id: string;
  title: string;
  monthly_rent: number;
  dues: number | null;
  city: string;
  district: string;
  neighborhood: string | null;
  capacity: number;
  occupied: number;
  furnished: boolean;
  pets_allowed: boolean;
  owner_id: string;
  score: number | null;
  photoUrl: string | null;
};

export async function getDeck(userId: string): Promise<DeckListing[]> {
  const [{ data: passes }, { data: convs }] = await Promise.all([
    supabase.from("listing_passes").select("listing_id").eq("user_id", userId),
    supabase.from("conversations").select("listing_id").eq("seeker_id", userId),
  ]);
  const excluded = new Set<string>([
    ...(passes ?? []).map((p) => p.listing_id),
    ...(convs ?? []).map((c) => c.listing_id),
  ]);

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .neq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const candidates = (listings ?? []).filter((l) => !excluded.has(l.id));
  if (candidates.length === 0) return [];

  const ownerIds = [...new Set(candidates.map((l) => l.owner_id))];
  const [{ data: owners }, { data: scores }, { data: photos }] = await Promise.all([
    supabase.from("profiles").select("id, banned, banned_until").in("id", ownerIds),
    supabase.rpc("compatibility_scores", { other_users: ownerIds }),
    supabase
      .from("listing_photos")
      .select("listing_id, storage_path, position")
      .in("listing_id", candidates.map((l) => l.id))
      .order("position", { ascending: true }),
  ]);

  const bannedSet = new Set(
    (owners ?? []).filter((o) => isEffectivelyBanned(o)).map((o) => o.id),
  );
  const scoreMap = new Map((scores ?? []).map((s) => [s.user_id, s.score]));
  const coverMap = new Map<string, string>();
  for (const p of photos ?? []) {
    if (!coverMap.has(p.listing_id)) coverMap.set(p.listing_id, p.storage_path);
  }

  return candidates
    .filter((l) => !bannedSet.has(l.owner_id))
    .map((l) => ({
      id: l.id,
      title: l.title,
      monthly_rent: l.monthly_rent,
      dues: l.dues,
      city: l.city,
      district: l.district,
      neighborhood: l.neighborhood,
      capacity: l.capacity,
      occupied: l.occupied,
      furnished: l.furnished,
      pets_allowed: l.pets_allowed,
      owner_id: l.owner_id,
      score: scoreMap.get(l.owner_id) ?? null,
      photoUrl: publicImageUrl("listing-photos", coverMap.get(l.id)),
    }));
}

export async function passListing(userId: string, listingId: string): Promise<void> {
  await supabase
    .from("listing_passes")
    .upsert({ user_id: userId, listing_id: listingId }, { onConflict: "user_id,listing_id" });
}

// Sağa kaydırma = ilgilenme: pending konuşma oluştur (varsa mevcut).
export async function likeListing(
  userId: string,
  listing: { id: string; owner_id: string },
): Promise<void> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listing.id)
    .eq("seeker_id", userId)
    .maybeSingle();
  if (existing) return;
  const { error } = await supabase.from("conversations").insert({
    listing_id: listing.id,
    seeker_id: userId,
    host_id: listing.owner_id,
  });
  if (error) throw error;
}

// --- Filtreli manuel arama ---

export type SearchFilters = {
  city?: string | null;
  district?: string | null;
  minRent?: number | null;
  maxRent?: number | null;
  minAvailable?: number | null;
  pets?: boolean | null;
};

export type ListingCard = {
  id: string;
  title: string;
  monthly_rent: number;
  city: string;
  district: string;
  capacity: number;
  occupied: number;
  pets_allowed: boolean;
  furnished: boolean;
  score: number | null;
  coverUrl: string | null;
};

async function decorateListings(rows: { id: string; owner_id: string; [k: string]: unknown }[]): Promise<ListingCard[]> {
  if (rows.length === 0) return [];
  const ownerIds = [...new Set(rows.map((l) => l.owner_id))];
  const [{ data: owners }, { data: scores }, { data: photos }] = await Promise.all([
    supabase.from("profiles").select("id, banned, banned_until").in("id", ownerIds),
    supabase.rpc("compatibility_scores", { other_users: ownerIds }),
    supabase
      .from("listing_photos")
      .select("listing_id, storage_path, position")
      .in("listing_id", rows.map((l) => l.id))
      .order("position", { ascending: true }),
  ]);
  const bannedSet = new Set((owners ?? []).filter((o) => isEffectivelyBanned(o)).map((o) => o.id));
  const scoreMap = new Map((scores ?? []).map((s) => [s.user_id, s.score]));
  const coverMap = new Map<string, string>();
  for (const p of photos ?? []) if (!coverMap.has(p.listing_id)) coverMap.set(p.listing_id, p.storage_path);

  return rows
    .filter((l) => !bannedSet.has(l.owner_id))
    .map((l) => ({
      id: l.id,
      title: l.title as string,
      monthly_rent: l.monthly_rent as number,
      city: l.city as string,
      district: l.district as string,
      capacity: l.capacity as number,
      occupied: l.occupied as number,
      pets_allowed: l.pets_allowed as boolean,
      furnished: l.furnished as boolean,
      score: scoreMap.get(l.owner_id) ?? null,
      coverUrl: publicImageUrl("listing-photos", coverMap.get(l.id)),
    }));
}

export async function searchListings(f: SearchFilters): Promise<ListingCard[]> {
  let q = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(60);
  if (f.city) q = q.eq("city", f.city);
  if (f.district) q = q.eq("district", f.district);
  if (f.minRent != null) q = q.gte("monthly_rent", f.minRent);
  if (f.maxRent != null) q = q.lte("monthly_rent", f.maxRent);
  if (f.pets) q = q.eq("pets_allowed", true);

  const { data: listings } = await q;
  let rows = listings ?? [];
  if (f.minAvailable != null) {
    rows = rows.filter((l) => Math.max((l.capacity ?? 0) - (l.occupied ?? 0), 0) >= f.minAvailable!);
  }
  return decorateListings(rows);
}

// Beğendiklerim: ev arayanın ilgi gösterdiği (sağa kaydırdığı) ilanlar.
export async function getLikedListings(userId: string): Promise<ListingCard[]> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("listing_id, created_at")
    .eq("seeker_id", userId)
    .order("created_at", { ascending: false });
  const ids = [...new Set((convs ?? []).map((c) => c.listing_id))];
  if (ids.length === 0) return [];
  const { data: listings } = await supabase.from("listings").select("*").in("id", ids);
  // Konuşma sırasını koru
  const order = new Map(ids.map((id, i) => [id, i]));
  const rows = (listings ?? []).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
  return decorateListings(rows);
}

// --- İlan detayı ---

export type ListingDetail = {
  id: string;
  title: string;
  description: string | null;
  monthly_rent: number;
  deposit: number | null;
  dues: number | null;
  bills_included: boolean;
  city: string;
  district: string;
  neighborhood: string | null;
  capacity: number;
  occupied: number;
  total_rooms: number | null;
  bathroom_count: number | null;
  available_from: string | null;
  furnished: boolean;
  pets_allowed: boolean;
  gender_preference: string;
  features: string[];
  status: ListingStatus;
  photoUrls: string[];
  owner: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    department: string | null;
    university: string | null;
  } | null;
  score: number | null;
  isOwner: boolean;
  conversationId: string | null;
};

export async function getListingDetail(
  listingId: string,
  viewerId: string,
): Promise<ListingDetail | null> {
  const { data: l } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();
  if (!l) return null;

  const [{ data: photos }, { data: owner }, { data: scores }, { data: conv }] =
    await Promise.all([
      supabase
        .from("listing_photos")
        .select("storage_path, position")
        .eq("listing_id", listingId)
        .order("position", { ascending: true }),
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, department, university_id, banned, banned_until")
        .eq("id", l.owner_id)
        .maybeSingle(),
      supabase.rpc("compatibility_scores", { other_users: [l.owner_id] }),
      supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listingId)
        .eq("seeker_id", viewerId)
        .maybeSingle(),
    ]);

  if (owner && isEffectivelyBanned(owner)) return null;

  let university: string | null = null;
  if (owner?.university_id) {
    const { data: uni } = await supabase
      .from("universities")
      .select("name")
      .eq("id", owner.university_id)
      .maybeSingle();
    university = uni?.name ?? null;
  }

  return {
    id: l.id,
    title: l.title,
    description: l.description,
    monthly_rent: l.monthly_rent,
    deposit: l.deposit,
    dues: l.dues,
    bills_included: l.bills_included,
    city: l.city,
    district: l.district,
    neighborhood: l.neighborhood,
    capacity: l.capacity,
    occupied: l.occupied,
    total_rooms: l.total_rooms,
    bathroom_count: l.bathroom_count,
    available_from: l.available_from,
    furnished: l.furnished,
    pets_allowed: l.pets_allowed,
    gender_preference: l.gender_preference,
    features: (l.features as string[] | null) ?? [],
    status: l.status,
    photoUrls: (photos ?? [])
      .map((p) => publicImageUrl("listing-photos", p.storage_path))
      .filter((u): u is string => Boolean(u)),
    owner: owner
      ? {
          id: owner.id,
          full_name: owner.full_name,
          avatar_url: owner.avatar_url,
          department: owner.department,
          university,
        }
      : null,
    score: scores?.[0]?.score ?? null,
    isOwner: l.owner_id === viewerId,
    conversationId: conv?.id ?? null,
  };
}

// --- Konuşmalar / sohbet ---

export type ConvListItem = {
  id: string;
  status: string;
  isHost: boolean;
  listingId: string;
  otherName: string;
  otherAvatar: string | null;
  listingTitle: string;
  lastMessage: string | null;
  updatedAt: string;
};

export async function getConversations(userId: string): Promise<ConvListItem[]> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("*")
    .or(`seeker_id.eq.${userId},host_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  if (!convs?.length) return [];

  const listingIds = [...new Set(convs.map((c) => c.listing_id))];
  const otherIds = [...new Set(convs.map((c) => (c.host_id === userId ? c.seeker_id : c.host_id)))];
  const convIds = convs.map((c) => c.id);

  const [{ data: listings }, { data: profiles }, { data: msgs }] = await Promise.all([
    supabase.from("listings").select("id, title").in("id", listingIds),
    supabase.from("profiles").select("id, full_name, avatar_url").in("id", otherIds),
    supabase
      .from("messages")
      .select("conversation_id, body, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false }),
  ]);

  const lm = new Map((listings ?? []).map((l) => [l.id, l.title]));
  const pm = new Map((profiles ?? []).map((p) => [p.id, p]));
  const last = new Map<string, string>();
  for (const m of msgs ?? []) if (!last.has(m.conversation_id)) last.set(m.conversation_id, m.body);

  return convs.map((c) => {
    const otherId = c.host_id === userId ? c.seeker_id : c.host_id;
    const other = pm.get(otherId);
    return {
      id: c.id,
      status: c.status,
      isHost: c.host_id === userId,
      listingId: c.listing_id,
      otherName: other?.full_name ?? "Kullanıcı",
      otherAvatar: other?.avatar_url ?? null,
      listingTitle: lm.get(c.listing_id) ?? "İlan",
      lastMessage: last.get(c.id) ?? null,
      updatedAt: c.updated_at,
    };
  });
}

export type ChatMessage = {
  id: string;
  sender_id: string;
  body: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
};

export type ChatDetail = {
  status: string;
  isHost: boolean;
  otherId: string;
  otherName: string;
  otherAvatar: string | null;
  listingId: string | null;
  listingStatus: string | null;
  listingTitle: string | null;
  district: string | null;
  messages: ChatMessage[];
  otherScore: number | null;
  otherAnswers: { question: string; answer: string; category: string }[];
};

export async function getConversationDetail(
  id: string,
  userId: string,
): Promise<ChatDetail | null> {
  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!conv) return null;

  const isHost = conv.host_id === userId;
  const otherId = isHost ? conv.seeker_id : conv.host_id;

  const [{ data: listing }, { data: other }, { data: messages }, { data: rawAnswers }] =
    await Promise.all([
      supabase
        .from("listings")
        .select("id, title, district, status")
        .eq("id", conv.listing_id)
        .maybeSingle(),
      supabase.from("profiles").select("id, full_name, avatar_url").eq("id", otherId).maybeSingle(),
      supabase
        .from("messages")
        .select("id, sender_id, body, attachment_url, attachment_type, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true }),
      supabase.rpc("conversation_other_answers", { conv_id: id }),
    ]);

  let otherScore: number | null = null;
  let otherAnswers: { question: string; answer: string; category: string }[] = [];
  if (rawAnswers && rawAnswers.length > 0) {
    const [{ data: scores }, { data: questions }, { data: cats }] = await Promise.all([
      supabase.rpc("compatibility_scores", { other_users: [otherId] }),
      supabase.from("compatibility_questions").select("*").order("position"),
      supabase.from("compatibility_categories").select("id, name"),
    ]);
    otherScore = scores?.[0]?.score ?? null;
    const vMap = new Map(rawAnswers.map((a) => [a.question_id, a.value]));
    const catMap = new Map((cats ?? []).map((c) => [c.id, c.name]));
    otherAnswers = (questions ?? [])
      .filter((q) => vMap.has(q.id))
      .map((q) => {
        const opts = q.options as unknown as QuestionOption[];
        const v = vMap.get(q.id);
        return {
          question: q.question,
          answer: opts.find((o) => o.value === v)?.label ?? String(v),
          category: catMap.get(q.category_id) ?? "",
        };
      });
  }

  return {
    status: conv.status,
    isHost,
    otherId,
    otherName: other?.full_name ?? "Kullanıcı",
    otherAvatar: other?.avatar_url ?? null,
    listingId: listing?.id ?? null,
    listingStatus: listing?.status ?? null,
    listingTitle: listing?.title ?? null,
    district: listing?.district ?? null,
    messages: (messages ?? []).map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      body: m.body,
      attachmentUrl: m.attachment_url,
      attachmentType: m.attachment_type,
    })),
    otherScore,
    otherAnswers,
  };
}

export async function sendMessage(
  convId: string,
  senderId: string,
  body: string,
  attachment?: { url: string; type: "image" | "audio" },
): Promise<void> {
  const { error } = await supabase.from("messages").insert({
    conversation_id: convId,
    sender_id: senderId,
    body,
    attachment_url: attachment?.url ?? null,
    attachment_type: attachment?.type ?? null,
  });
  if (error) throw error;
}

// Sohbet görselini (base64) chat-media bucket'ına yükle, public URL döndür.
export async function uploadChatImage(
  userId: string,
  base64: string,
  ext: string,
): Promise<string> {
  const { decode } = await import("base64-arraybuffer");
  const path = `${userId}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
  const contentType = ext === "png" ? "image/png" : "image/jpeg";
  const { error } = await supabase.storage
    .from("chat-media")
    .upload(path, decode(base64), { contentType });
  if (error) throw error;
  return publicImageUrl("chat-media", path)!;
}

// Kaydedilen ses dosyasını (file:// uri) chat-media'ya yükle, public URL döndür.
export async function uploadChatAudio(userId: string, uri: string): Promise<string> {
  const res = await fetch(uri);
  const bytes = await res.arrayBuffer();
  const path = `${userId}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.m4a`;
  const { error } = await supabase.storage
    .from("chat-media")
    .upload(path, bytes, { contentType: "audio/mp4" });
  if (error) throw error;
  return publicImageUrl("chat-media", path)!;
}

export async function setConversationStatus(
  id: string,
  status: "accepted" | "declined",
  userId: string,
): Promise<void> {
  await supabase.from("conversations").update({ status }).eq("id", id).eq("host_id", userId);
}

export async function closeListing(
  listingId: string,
  userId: string,
  reason = "matched",
): Promise<void> {
  await supabase
    .from("listings")
    .update({ status: "closed", close_reason: reason })
    .eq("id", listingId)
    .eq("owner_id", userId);
}

// --- Profil ---

export async function getProfileFull(
  userId: string,
): Promise<{ profile: Profile | null; university: string | null }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  let university: string | null = null;
  if (profile?.university_id) {
    const { data: u } = await supabase
      .from("universities")
      .select("name")
      .eq("id", profile.university_id)
      .maybeSingle();
    university = u?.name ?? null;
  }
  return { profile: profile ?? null, university };
}

// --- İlan oluşturma / yönetimi ---

export type MyListing = {
  id: string;
  title: string;
  monthly_rent: number;
  city: string;
  district: string;
  status: ListingStatus;
  expires_at: string;
  coverUrl: string | null;
};

export async function getMyListings(userId: string): Promise<MyListing[]> {
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  const ids = (data ?? []).map((l) => l.id);
  const { data: photos } = ids.length
    ? await supabase
        .from("listing_photos")
        .select("listing_id, storage_path, position")
        .in("listing_id", ids)
        .order("position", { ascending: true })
    : { data: [] as { listing_id: string; storage_path: string; position: number }[] };
  const cover = new Map<string, string>();
  for (const p of photos ?? []) if (!cover.has(p.listing_id)) cover.set(p.listing_id, p.storage_path);

  return (data ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    monthly_rent: l.monthly_rent,
    city: l.city,
    district: l.district,
    status: l.status,
    expires_at: l.expires_at,
    coverUrl: publicImageUrl("listing-photos", cover.get(l.id)),
  }));
}

export async function createListing(
  userId: string,
  d: ListingInput,
  photos: { path: string; category: string }[],
): Promise<string> {
  // Herkes en fazla 1 aktif/açık ilan açabilir.
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .neq("status", "closed");
  if ((count ?? 0) >= 1) {
    throw new Error("En fazla 1 aktif ilanın olabilir. Yeni ilan için mevcut ilanını kapat.");
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      owner_id: userId,
      title: d.title,
      description: d.description || null,
      monthly_rent: d.monthlyRent,
      deposit: d.deposit ?? null,
      dues: d.dues ?? null,
      bills_included: d.billsIncluded,
      capacity: d.capacity,
      occupied: d.occupied,
      room_count: d.totalRooms ?? 1,
      total_rooms: d.totalRooms ?? null,
      bathroom_count: d.bathroomCount ?? null,
      available_from: d.availableFrom || null,
      city: d.city,
      district: d.district,
      neighborhood: d.neighborhood || null,
      pets_allowed: d.petsAllowed,
      furnished: d.furnished,
      gender_preference: d.genderPreference,
      features: d.features,
    })
    .select("id")
    .single();
  if (error || !listing) throw error ?? new Error("İlan oluşturulamadı");

  const rows = photos.map((p, i) => ({
    listing_id: listing.id,
    storage_path: p.path,
    category: p.category,
    position: i,
  }));
  const { error: pe } = await supabase.from("listing_photos").insert(rows);
  if (pe) throw pe;
  return listing.id;
}

export async function setListingStatus(
  listingId: string,
  userId: string,
  status: ListingStatus,
): Promise<void> {
  await supabase.from("listings").update({ status }).eq("id", listingId).eq("owner_id", userId);
}

export async function extendListing(listingId: string, userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();
  await supabase
    .from("listings")
    .update({ expires_at: expiresAt, status: "active" })
    .eq("id", listingId)
    .eq("owner_id", userId);
}

// Galeriden seçilen bir görseli storage'a yükler, path döner.
export async function uploadListingPhoto(
  userId: string,
  base64: string,
  ext: string,
): Promise<string> {
  const { decode } = await import("base64-arraybuffer");
  const path = `${userId}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
  const contentType = ext === "png" ? "image/png" : "image/jpeg";
  const { error } = await supabase.storage
    .from("listing-photos")
    .upload(path, decode(base64), { contentType });
  if (error) throw error;
  return path;
}

// Destek / şikayet talebi. Hedefsiz (listingId/reportedUserId yok) = genel destek.
export async function createReport(
  reporterId: string,
  reason: string,
  opts?: { listingId?: string; reportedUserId?: string },
): Promise<void> {
  const { error } = await supabase.from("reports").insert({
    reporter_id: reporterId,
    reason,
    listing_id: opts?.listingId ?? null,
    reported_user_id: opts?.reportedUserId ?? null,
  });
  if (error) throw error;
}
