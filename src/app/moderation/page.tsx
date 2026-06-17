import Link from "next/link";
import { notFound } from "next/navigation";
import { Ban, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { banUserAction, dismissReportAction } from "@/features/moderation/actions";
import { getOpenReports } from "@/features/moderation/queries";
import { requireOnboardedProfile } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Moderasyon" };

export default async function ModerationPage() {
  const profile = await requireOnboardedProfile();
  if (!profile.is_admin) notFound();

  const reports = await getOpenReports();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <ShieldCheck className="size-7 text-primary" /> Moderasyon
      </h1>
      <p className="mt-1 text-muted-foreground">Açık şikayetler — incele ve işlem yap.</p>

      {reports.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Bekleyen şikayet yok 🎉
        </div>
      ) : (
        <div className="mt-6 space-y-4">
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

              <div className="mt-4 flex justify-end gap-2">
                <form action={dismissReportAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Reddet
                  </Button>
                </form>
                {r.reportedId && (
                  <form action={banUserAction}>
                    <input type="hidden" name="userId" value={r.reportedId} />
                    <Button type="submit" variant="destructive" size="sm">
                      <Ban /> Kullanıcıyı banla
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
