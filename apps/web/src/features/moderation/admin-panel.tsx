"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Ban, Loader2, MessageSquareWarning, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { AdminListings } from "@/features/moderation/admin-listings";
import {
  banUserAction,
  dismissReportAction,
  unbanUserAction,
  warnUserAction,
} from "@/features/moderation/actions";
import type {
  AdminListing,
  AdminUser,
  ReportItem,
  SentWarning,
} from "@/features/moderation/queries";
import { ROLE_LABELS } from "@/lib/constants";
import { isEffectivelyBanned } from "@/lib/ban";
import { formatDate } from "@/lib/format";
import type { UserRole } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

type WarnTarget = {
  userId: string;
  name: string;
  listingId: string | null;
  listingTitle: string | null;
};

type TabKey = "users" | "listings" | "reports" | "warnings";

export function AdminPanel({
  users,
  reports,
  listings,
  warnings,
}: {
  users: AdminUser[];
  reports: ReportItem[];
  listings: AdminListing[];
  warnings: SentWarning[];
}) {
  const [tab, setTab] = useState<TabKey>("users");
  const [warn, setWarn] = useState<WarnTarget | null>(null);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "users", label: `Kullanıcılar (${users.length})` },
    { key: "listings", label: `İlanlar (${listings.length})` },
    { key: "reports", label: `Şikayetler (${reports.length})` },
    { key: "warnings", label: `Uyarı logu (${warnings.length})` },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <UsersTab
          users={users}
          onWarn={(u) =>
            setWarn({
              userId: u.id,
              name: u.fullName ?? u.email,
              listingId: null,
              listingTitle: null,
            })
          }
        />
      )}

      {tab === "listings" && (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            Gizle = listelerden kaldırır. Kapat = ilanı kapatır. Sil = kalıcı siler. Sahibine
            uyar = ilan sahibine mesaj gönderir.
          </p>
          <AdminListings
            listings={listings}
            onWarnOwner={(l) =>
              setWarn({
                userId: l.ownerId,
                name: l.ownerName,
                listingId: l.id,
                listingTitle: l.title,
              })
            }
          />
        </>
      )}

      {tab === "reports" && (
        <ReportsTab
          reports={reports}
          onWarn={(r) =>
            setWarn({
              userId: r.reportedId!,
              name: r.reportedName ?? "Kullanıcı",
              listingId: r.listingId,
              listingTitle: r.listingTitle,
            })
          }
        />
      )}

      {tab === "warnings" && <WarningsTab warnings={warnings} />}

      {warn && <WarnModal target={warn} onClose={() => setWarn(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kullanıcılar
// ---------------------------------------------------------------------------
function UsersTab({
  users,
  onWarn,
}: {
  users: AdminUser[];
  onWarn: (u: AdminUser) => void;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const s = q.trim().toLocaleLowerCase("tr");
    return users.filter((u) => {
      if (filter === "banned" && !u.banned) return false;
      if (filter === "admins" && !u.isAdmin) return false;
      if (filter === "hosts" && u.role !== "host") return false;
      if (filter === "seekers" && u.role !== "seeker") return false;
      if (!s) return true;
      return (
        (u.fullName ?? "").toLocaleLowerCase("tr").includes(s) ||
        u.email.toLocaleLowerCase("tr").includes(s)
      );
    });
  }, [users, q, filter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ad veya e-posta ara…"
          className="max-w-xs"
        />
        <NativeSelect
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-44"
        >
          <option value="all">Hepsi</option>
          <option value="hosts">Ev sunanlar</option>
          <option value="seekers">Ev arayanlar</option>
          <option value="banned">Yasaklılar</option>
          <option value="admins">Adminler</option>
        </NativeSelect>
        <span className="text-sm text-muted-foreground">{filtered.length} kullanıcı</span>
      </div>

      {filtered.length === 0 ? (
        <Empty>Kullanıcı bulunamadı.</Empty>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {filtered.map((u) => (
            <UserRow key={u.id} u={u} onWarn={onWarn} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserRow({ u, onWarn }: { u: AdminUser; onWarn: (u: AdminUser) => void }) {
  const banActive = isEffectivelyBanned({ banned: u.banned, banned_until: u.bannedUntil });
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/u/${u.id}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {u.fullName ?? "İsimsiz"}
          </Link>
          {u.isAdmin && (
            <Badge variant="secondary" className="text-primary">
              admin
            </Badge>
          )}
          {banActive && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {u.bannedUntil ? `yasaklı → ${formatDate(u.bannedUntil)}` : "süresiz yasaklı"}
            </span>
          )}
          {u.role && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {ROLE_LABELS[u.role as UserRole] ?? u.role}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {u.email} · {u.university ?? "—"} · {u.listingCount} ilan · {u.reportCount} şikayet ·{" "}
          {u.points} puan
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onWarn(u)}>
          <MessageSquareWarning /> Uyar
        </Button>
        {banActive ? (
          <form action={unbanUserAction}>
            <input type="hidden" name="userId" value={u.id} />
            <Button type="submit" variant="outline" size="sm">
              <UserCheck /> Yasağı kaldır
            </Button>
          </form>
        ) : (
          <BanForm userId={u.id} />
        )}
      </div>
    </div>
  );
}

function BanForm({ userId }: { userId: string }) {
  return (
    <form action={banUserAction} className="flex items-center gap-1.5">
      <input type="hidden" name="userId" value={userId} />
      <NativeSelect name="preset" defaultValue="168" className="h-9 w-24">
        <option value="24">1 gün</option>
        <option value="168">1 hafta</option>
        <option value="720">1 ay</option>
        <option value="0">Süresiz</option>
      </NativeSelect>
      <Button type="submit" variant="destructive" size="sm">
        <Ban /> Banla
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Şikayetler
// ---------------------------------------------------------------------------
function ReportsTab({
  reports,
  onWarn,
}: {
  reports: ReportItem[];
  onWarn: (r: ReportItem) => void;
}) {
  if (reports.length === 0) return <Empty>Bekleyen şikayet yok 🎉</Empty>;
  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{r.reporterName}</span> şikayet etti
              {r.reportedName && (
                <>
                  {" · hedef: "}
                  <Link href={`/u/${r.reportedId}`} className="font-medium text-foreground hover:text-primary">
                    {r.reportedName}
                  </Link>
                </>
              )}
              {r.listingId && (
                <>
                  {" · "}
                  <Link href={`/listings/${r.listingId}`} className="text-primary hover:underline">
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

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <form action={dismissReportAction}>
              <input type="hidden" name="id" value={r.id} />
              <Button type="submit" variant="outline" size="sm">
                Reddet
              </Button>
            </form>
            {r.reportedId && (
              <Button type="button" variant="outline" size="sm" onClick={() => onWarn(r)}>
                <MessageSquareWarning /> Uyar
              </Button>
            )}
            {r.reportedId && <BanForm userId={r.reportedId} />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Uyarı logu
// ---------------------------------------------------------------------------
function WarningsTab({ warnings }: { warnings: SentWarning[] }) {
  if (warnings.length === 0) return <Empty>Henüz uyarı gönderilmedi.</Empty>;
  return (
    <div className="space-y-3">
      {warnings.map((w) => (
        <div key={w.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">{w.userName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(w.createdAt)} · {w.readAt ? "okundu" : "okunmadı"}
            </span>
          </div>
          {w.listingTitle && (
            <p className="mt-0.5 text-xs text-primary">İlan: {w.listingTitle}</p>
          )}
          <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm">{w.message}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Uyarı gönderme modalı
// ---------------------------------------------------------------------------
function WarnModal({ target, onClose }: { target: WarnTarget; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function send() {
    if (message.trim().length < 3) {
      toast.error("Lütfen bir uyarı mesajı yaz.");
      return;
    }
    const fd = new FormData();
    fd.set("userId", target.userId);
    fd.set("message", message);
    if (target.listingId) fd.set("listingId", target.listingId);
    startTransition(async () => {
      const res = await warnUserAction(null, fd);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Uyarı gönderildi.");
        onClose();
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquareWarning className="size-5 text-primary" /> Uyarı gönder
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {target.name}
          {target.listingTitle ? ` · ${target.listingTitle}` : ""}
        </p>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Uyarı mesajını yaz… (kullanıcıya uygulama içinde gösterilir)"
          className="mt-3"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={send} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} Gönder
          </Button>
        </div>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-10 text-center text-muted-foreground">
      {children}
    </div>
  );
}
