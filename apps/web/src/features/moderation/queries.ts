import { createClient } from "@/lib/supabase/server";

export type ReportItem = {
  id: string;
  reason: string;
  createdAt: string;
  reporterName: string;
  reportedId: string | null;
  reportedName: string | null;
  listingId: string | null;
  listingTitle: string | null;
};

export type BannedUser = {
  id: string;
  name: string;
  bannedUntil: string | null;
};

export type AdminListing = {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  city: string;
  district: string;
  monthlyRent: number;
  status: string;
  createdAt: string;
};

// Adminler için tüm ilanlar (RLS: is_admin() hepsini görür).
export async function getAllListingsForAdmin(): Promise<AdminListing[]> {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, owner_id, city, district, monthly_rent, status, created_at")
    .order("created_at", { ascending: false });

  if (!listings?.length) return [];

  const ownerIds = [...new Set(listings.map((l) => l.owner_id))];
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", ownerIds);
  const pm = new Map((profs ?? []).map((p) => [p.id, p.full_name]));

  return listings.map((l) => ({
    id: l.id,
    title: l.title,
    ownerId: l.owner_id,
    ownerName: pm.get(l.owner_id) ?? "Kullanıcı",
    city: l.city,
    district: l.district,
    monthlyRent: l.monthly_rent,
    status: l.status,
    createdAt: l.created_at,
  }));
}

export type AdminUser = {
  id: string;
  fullName: string | null;
  email: string;
  university: string | null;
  role: string | null;
  isAdmin: boolean;
  banned: boolean;
  bannedUntil: string | null;
  points: number;
  memberNo: number | null;
  createdAt: string;
  listingCount: number;
  reportCount: number;
};

// Tüm kullanıcılar (email dahil) — security definer RPC, sadece adminlere döner.
export async function getAdminUsers(
  search = "",
  filter = "all",
): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_list_users", { search, filter });
  return (data ?? []).map((u) => ({
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    university: u.university,
    role: u.role,
    isAdmin: u.is_admin,
    banned: u.banned,
    bannedUntil: u.banned_until,
    points: u.points ?? 0,
    memberNo: u.member_no,
    createdAt: u.created_at,
    listingCount: Number(u.listing_count ?? 0),
    reportCount: Number(u.report_count ?? 0),
  }));
}

export type SentWarning = {
  id: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  userName: string;
  listingTitle: string | null;
};

// Gönderilen uyarı kayıtları (admin RLS ile hepsi görünür).
export async function getSentWarnings(): Promise<SentWarning[]> {
  const supabase = await createClient();
  const { data: warnings } = await supabase
    .from("user_warnings")
    .select("id, message, created_at, read_at, user_id, listing_id")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!warnings?.length) return [];

  const userIds = [...new Set(warnings.map((w) => w.user_id))];
  const listingIds = [...new Set(warnings.map((w) => w.listing_id).filter(Boolean))] as string[];
  const [{ data: profs }, { data: lst }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", userIds),
    supabase.from("listings").select("id, title").in("id", listingIds),
  ]);
  const pm = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
  const lm = new Map((lst ?? []).map((l) => [l.id, l.title]));

  return warnings.map((w) => ({
    id: w.id,
    message: w.message,
    createdAt: w.created_at,
    readAt: w.read_at,
    userName: pm.get(w.user_id) ?? "Kullanıcı",
    listingTitle: w.listing_id ? (lm.get(w.listing_id) ?? "İlan") : null,
  }));
}

export async function getBannedUsers(): Promise<BannedUser[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, banned_until")
    .eq("banned", true)
    .order("full_name", { ascending: true });
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.full_name ?? "Kullanıcı",
    bannedUntil: p.banned_until,
  }));
}

// Sadece adminler için (RLS reports select'i is_admin() ile sınırlar).
export async function getOpenReports(): Promise<ReportItem[]> {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (!reports?.length) return [];

  const profileIds = [
    ...new Set(
      reports.flatMap((r) => [r.reporter_id, r.reported_user_id].filter(Boolean)),
    ),
  ] as string[];
  const listingIds = [
    ...new Set(reports.map((r) => r.listing_id).filter(Boolean)),
  ] as string[];

  const [{ data: profs }, { data: lst }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", profileIds),
    supabase.from("listings").select("id, title").in("id", listingIds),
  ]);

  const pm = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
  const lm = new Map((lst ?? []).map((l) => [l.id, l.title]));

  return reports.map((r) => ({
    id: r.id,
    reason: r.reason,
    createdAt: r.created_at,
    reporterName: pm.get(r.reporter_id) ?? "Kullanıcı",
    reportedId: r.reported_user_id,
    reportedName: r.reported_user_id
      ? (pm.get(r.reported_user_id) ?? "Kullanıcı")
      : null,
    listingId: r.listing_id,
    listingTitle: r.listing_id ? (lm.get(r.listing_id) ?? "İlan") : null,
  }));
}
