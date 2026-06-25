import Link from "next/link";
import { notFound } from "next/navigation";
import { Ban, ShieldCheck, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  banUserAction,
  dismissReportAction,
  unbanUserAction,
} from "@/features/moderation/actions";
import { getBannedUsers, getOpenReports } from "@/features/moderation/queries";
import { requireOnboardedProfile } from "@/lib/auth";
import { isEffectivelyBanned } from "@/lib/ban";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Moderasyon" };

function BanForm({ userId }: { userId: string }) {
  return (
    <form action={banUserAction} className="flex items-end gap-2">
      <input type="hidden" name="userId" value={userId} />
      <NativeSelect name="preset" defaultValue="168" className="w-28">
        <option value="24">1 gün</option>
        <option value="168">1 hafta</option>
        <option value="720">1 ay</option>
        <option value="0">Süresiz</option>
      </NativeSelect>
      <Input
        name="customHours"
        inputMode="numeric"
        placeholder="veya saat"
        className="w-24"
      />
      <Button type="submit" variant="destructive" size="sm">
        <Ban /> Banla
      </Button>
    </form>
  );
}

export default async function ModerationPage() {
  const profile = await requireOnboardedProfile();
  if (!profile.is_admin) notFound();

  const [reports, banned] = await Promise.all([getOpenReports(), getBannedUsers()]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <ShieldCheck className="size-7 text-primary" /> Moderasyon
      </h1>
      <p className="mt-1 text-muted-foreground">Açık şikayetler ve yasaklı kullanıcılar.</p>

      {/* Açık şikayetler */}
      <h2 className="mt-8 mb-3 font-semibold">Açık şikayetler ({reports.length})</h2>
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-10 text-center text-muted-foreground">
          Bekleyen şikayet yok 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{r.reporterName}</span>{" "}
                  şikayet etti
                  {r.reportedName && (
                    <>
                      {" · hedef: "}
                      <span className="font-medium text-foreground">{r.reportedName}</span>
                    </>
                  )}
                  {r.listingId && (
                    <>
                      {" · "}
                      <Link
                        href={`/listings/${r.listingId}`}
                        className="text-primary hover:underline"
                      >
                        {r.listingTitle}
                      </Link>
                    </>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(r.createdAt)}
                </span>
              </div>

              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">{r.reason}</p>

              <div className="mt-4 flex flex-wrap items-end justify-end gap-2">
                <form action={dismissReportAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Reddet
                  </Button>
                </form>
                {r.reportedId && <BanForm userId={r.reportedId} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yasaklı kullanıcılar */}
      <h2 className="mt-10 mb-3 font-semibold">Yasaklı kullanıcılar ({banned.length})</h2>
      {banned.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-10 text-center text-muted-foreground">
          Yasaklı kullanıcı yok
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {banned.map((u) => {
            const expired =
              u.bannedUntil != null &&
              !isEffectivelyBanned({ banned: true, banned_until: u.bannedUntil });
            return (
              <div key={u.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.bannedUntil
                      ? expired
                        ? `Süresi doldu (${formatDate(u.bannedUntil)}) — etkin değil`
                        : `${formatDate(u.bannedUntil)} tarihine kadar`
                      : "Süresiz"}
                  </p>
                </div>
                <form action={unbanUserAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <Button type="submit" variant="outline" size="sm">
                    <UserCheck /> Banı kaldır
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
