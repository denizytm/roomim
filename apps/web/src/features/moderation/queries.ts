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
