import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, GraduationCap, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportButton } from "@/features/moderation/report-button";
import { requireOnboardedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AVATAR_BUCKET, publicImageUrl } from "@/lib/supabase/storage";
import { ROLE_LABELS } from "@/lib/constants";
import { computeBadges } from "@/lib/loyalty";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types/database.types";

export const metadata = { title: "Profil" };

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireOnboardedProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, department, graduation_date, bio, role, created_at, university_id")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  let universityName: string | null = null;
  if (profile.university_id) {
    const { data: uni } = await supabase
      .from("universities")
      .select("name")
      .eq("id", profile.university_id)
      .maybeSingle();
    universityName = uni?.name ?? null;
  }

  const badges = computeBadges(profile);
  const avatar = publicImageUrl(AVATAR_BUCKET, profile.avatar_url);
  const gradYear = profile.graduation_date
    ? new Date(profile.graduation_date).getFullYear()
    : null;
  const isMe = me.id === profile.id;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href="/messages"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Geri
      </Link>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
        <Avatar className="size-24">
          {avatar && <AvatarImage src={avatar} alt={profile.full_name ?? ""} />}
          <AvatarFallback className="text-2xl">
            {(profile.full_name ?? "?").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold tracking-tight">
          {profile.full_name ?? "İsimsiz"}
        </h1>
        {profile.role && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {ROLE_LABELS[profile.role as UserRole]}
          </span>
        )}
        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
          {universityName && (
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="size-4" /> {universityName}
            </span>
          )}
          {(profile.department || gradYear) && (
            <span>
              {[profile.department, gradYear && `${gradYear} mezuniyet`]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </div>
        {profile.bio && (
          <p className="mt-2 max-w-md text-sm text-foreground/80">{profile.bio}</p>
        )}
      </div>

      {/* Rozetler */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-5">
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
            {b.key === "active" ? (
              <Star className="size-4" />
            ) : (
              <BadgeCheck className="size-4" />
            )}
            {b.label}
          </span>
        ))}
      </div>

      {!isMe && (
        <div className="mt-4 flex justify-end">
          <ReportButton reportedUserId={profile.id} />
        </div>
      )}
    </div>
  );
}
