import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getConversationsForUser,
  type ConversationListItem,
} from "@/features/messages/queries";
import { requireOnboardedProfile } from "@/lib/auth";
import { AVATAR_BUCKET, publicImageUrl } from "@/lib/supabase/storage";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Mesajlar" };

function statusBadge(c: ConversationListItem) {
  if (c.status === "accepted")
    return <Badge variant="default">Aktif</Badge>;
  if (c.status === "declined")
    return <Badge variant="outline">Reddedildi</Badge>;
  return c.isHost ? (
    <Badge variant="default">Yeni istek</Badge>
  ) : (
    <Badge variant="secondary">Onay bekliyor</Badge>
  );
}

export default async function MessagesPage() {
  const profile = await requireOnboardedProfile();
  const conversations = await getConversationsForUser(profile.id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <PageHeader title="Mesajlar" description="Eşleştiğin ev sahibi/arayanlarla buradan iletişim kur." />

      {conversations.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={MessageCircle}
          title="Henüz mesajın yok"
          text="Bir ilanda “İletişime geç” diyerek başlayabilirsin."
        />
      ) : (
        <div className="mt-6 divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-[0_4px_20px_-6px_rgb(154_52_18/0.12)] ring-1 ring-foreground/[0.06]">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-muted"
            >
              <Avatar>
                {c.otherAvatar ? (
                  <AvatarImage src={publicImageUrl(AVATAR_BUCKET, c.otherAvatar)!} alt={c.otherName} />
                ) : null}
                <AvatarFallback>
                  {c.otherName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{c.otherName}</p>
                  {statusBadge(c)}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {c.lastMessage ?? c.listingTitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
