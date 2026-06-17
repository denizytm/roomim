import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Chat } from "@/features/messages/chat";
import { getConversation } from "@/features/messages/queries";
import { requireOnboardedProfile } from "@/lib/auth";

export const metadata = { title: "Sohbet" };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { id } = await params;
  const data = await getConversation(id, profile.id);
  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/messages"
            className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Mesajlar
          </Link>
          <h1 className="truncate text-xl font-bold tracking-tight">
            {data.other?.full_name ?? "Kullanıcı"}
          </h1>
        </div>
        {data.listing && (
          <Link
            href={`/listings/${data.listing.id}`}
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            İlanı gör
          </Link>
        )}
      </div>

      <Chat
        conversationId={id}
        meId={profile.id}
        isHost={data.isHost}
        status={data.conversation.status}
        otherName={data.other?.full_name ?? "Kullanıcı"}
        district={data.listing?.district ?? null}
        initialMessages={data.messages}
      />
    </div>
  );
}
