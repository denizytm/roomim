"use client";

import Link from "next/link";
import { EyeOff, Eye, Trash2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  adminDeleteListingAction,
  adminSetListingStatusAction,
} from "@/features/moderation/actions";
import type { AdminListing } from "@/features/moderation/queries";
import { formatRent } from "@/lib/format";

const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "Yayında", cls: "bg-emerald-100 text-emerald-700" },
  passive: { label: "Gizli", cls: "bg-amber-100 text-amber-700" },
  matched: { label: "Eşleşti", cls: "bg-blue-100 text-blue-700" },
  closed: { label: "Kapalı", cls: "bg-muted text-muted-foreground" },
};

export function AdminListings({ listings }: { listings: AdminListing[] }) {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-10 text-center text-muted-foreground">
        Hiç ilan yok
      </div>
    );
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {listings.map((l) => {
        const s = STATUS[l.status] ?? STATUS.closed;
        return (
          <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/listings/${l.id}`}
                  className="truncate font-medium hover:text-primary hover:underline"
                >
                  {l.title}
                </Link>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>
                  {s.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {l.ownerName} · {l.district}, {l.city} · {formatRent(l.monthlyRent)}/ay
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {l.status === "active" ? (
                <form action={adminSetListingStatusAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="status" value="passive" />
                  <Button type="submit" variant="outline" size="sm">
                    <EyeOff /> Gizle
                  </Button>
                </form>
              ) : (
                <form action={adminSetListingStatusAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="status" value="active" />
                  <Button type="submit" variant="outline" size="sm">
                    <Eye /> Yayına al
                  </Button>
                </form>
              )}

              {l.status !== "closed" && (
                <form action={adminSetListingStatusAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="status" value="closed" />
                  <Button type="submit" variant="outline" size="sm">
                    <XCircle /> Kapat
                  </Button>
                </form>
              )}

              <form
                action={adminDeleteListingAction}
                onSubmit={(e) => {
                  if (
                    !window.confirm(
                      `"${l.title}" ilanı sistemden tamamen silinsin mi? Bu işlem geri alınamaz; ilana bağlı fotoğraflar ve sohbetler de silinir.`,
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={l.id} />
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 /> Sil
                </Button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
