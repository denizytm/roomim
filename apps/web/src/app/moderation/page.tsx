import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { AdminPanel } from "@/features/moderation/admin-panel";
import {
  getAdminUsers,
  getAllListingsForAdmin,
  getOpenReports,
  getSentWarnings,
} from "@/features/moderation/queries";
import { requireOnboardedProfile } from "@/lib/auth";

export const metadata = { title: "Yönetim Paneli" };

export default async function ModerationPage() {
  const profile = await requireOnboardedProfile();
  if (!profile.is_admin) notFound();

  const [users, reports, listings, warnings] = await Promise.all([
    getAdminUsers(),
    getOpenReports(),
    getAllListingsForAdmin(),
    getSentWarnings(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <ShieldCheck className="size-7 text-primary" /> Yönetim Paneli
      </h1>
      <p className="mt-1 text-muted-foreground">
        Kullanıcılar, ilanlar, şikayetler ve uyarılar tek yerde.
      </p>

      <div className="mt-8">
        <AdminPanel
          users={users}
          reports={reports}
          listings={listings}
          warnings={warnings}
        />
      </div>
    </div>
  );
}
