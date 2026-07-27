import { redirect } from "next/navigation";
import { BadgeCheck, Ban, Gift, LifeBuoy, Sparkles, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteAccount } from "@/features/profile/delete-account";
import { ProfileForm } from "@/features/profile/profile-form";
import { ReferralCodes } from "@/features/profile/referral-codes";
import { BlockButton } from "@/features/moderation/block-button";
import { ReportButton } from "@/features/moderation/report-button";
import { requireUser } from "@/lib/auth";
import { isEffectivelyBanned } from "@/lib/ban";
import { computeBadges } from "@/lib/loyalty";
import { AVATAR_BUCKET, publicImageUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

export const metadata = { title: "Profilim" };

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");
  if (isEffectivelyBanned(profile)) redirect("/banned");

  let universityName: string | null = null;
  if (profile.university_id) {
    const { data: uni } = await supabase
      .from("universities")
      .select("name")
      .eq("id", profile.university_id)
      .maybeSingle();
    universityName = uni?.name ?? null;
  }

  const { data: codes } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  const badges = computeBadges(profile);

  // Engellediklerim. blocks RLS'i zaten yalnızca kendi kayıtlarımı döndürüyor.
  const { data: blockRows } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  const blockedIds = (blockRows ?? []).map((b) => b.blocked_id);
  const { data: blockedProfiles } = blockedIds.length
    ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", blockedIds)
    : { data: [] };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>
      <p className="mt-1 text-muted-foreground">
        Profilini güncel tut — eşleşme şansını artırır.
      </p>

      {/* Puan & Rozetler */}
      <div className="mt-8 grid gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Star className="size-6" />
          </span>
          <div>
            <p className="text-2xl font-bold">{profile.points}</p>
            <p className="text-sm text-muted-foreground">puan</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-5">
          {badges.map((b) => (
            <span
              key={b.key}
              title={b.description}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
                b.earned
                  ? "border-primary/25 bg-primary/10 text-primary"
                  : "border-dashed border-border text-muted-foreground opacity-60",
              )}
            >
              {b.key === "founder" ? (
                <Sparkles className="size-4" />
              ) : b.key === "active" ? (
                <Star className="size-4" />
              ) : (
                <BadgeCheck className="size-4" />
              )}
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Referans kodları */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <Gift className="size-4 text-primary" /> Referans kodların
        </h2>
        <ReferralCodes codes={codes ?? []} />
      </div>

      {/* Destek / Şikayet */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <LifeBuoy className="size-4 text-primary" /> Destek / Şikayet
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Bir sorun mu var ya da bildirmek istediğin bir şey mi? Bize yaz, ekibimiz inceler.
        </p>
        <ReportButton
          label="Destek / şikayet talebi oluştur"
          placeholder="Talebini veya sorununu açıkla…"
        />
      </div>

      {/* Engellenen kullanıcılar */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <Ban className="size-4 text-primary" /> Engellenen kullanıcılar
        </h2>
        {blockedProfiles?.length ? (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              Engellediğin kişilerin ilanlarını ve mesajlarını görmezsin, sana mesaj gönderemezler.
            </p>
            <ul className="divide-y divide-border">
              {blockedProfiles.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <Avatar className="size-9">
                    {publicImageUrl(AVATAR_BUCKET, p.avatar_url) && (
                      <AvatarImage
                        src={publicImageUrl(AVATAR_BUCKET, p.avatar_url)!}
                        alt={p.full_name ?? ""}
                      />
                    )}
                    <AvatarFallback>
                      {(p.full_name ?? "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm font-medium">{p.full_name ?? "İsimsiz"}</span>
                  <BlockButton userId={p.id} blocked />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Engellediğin kimse yok.</p>
        )}
      </div>

      <div className="mt-8">
        <ProfileForm
          profile={profile}
          userId={user.id}
          universityName={universityName}
          email={user.email ?? ""}
        />
      </div>

      <DeleteAccount />
    </div>
  );
}
