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
      <h1 className="text-3xl font-bold tracking-tight">Mesajlar</h1>
      <p className="mt-1 text-muted-foreground">
        Eşleştiğin ev sahibi/arayanlarla buradan iletişim kur.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center">
          <MessageCircle className="size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">Henüz mesajın yok</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bir ilanda “İletişime geç” diyerek başlayabilirsin.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
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
