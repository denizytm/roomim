import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat } from "@/features/messages/chat";
import { CompatibilityBadge } from "@/features/listings/compatibility-badge";
import { getConversation } from "@/features/messages/queries";
import { requireOnboardedProfile } from "@/lib/auth";
import { AVATAR_BUCKET, publicImageUrl } from "@/lib/supabase/storage";

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

  // Uyum cevaplarını kategoriye göre grupla (soru sırası kategori sırasını korur).
  const groupedAnswers = data.otherAnswers.reduce<
    Record<string, { question: string; answer: string }[]>
  >((acc, a) => {
    (acc[a.category] ??= []).push({ question: a.question, answer: a.answer });
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/messages"
          aria-label="Mesajlara dön"
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        {data.other ? (
          <Link
            href={`/u/${data.other.id}`}
            className="group flex min-w-0 items-center gap-2.5"
          >
            <Avatar className="size-9 shrink-0">
              {publicImageUrl(AVATAR_BUCKET, data.other.avatar_url) && (
                <AvatarImage
                  src={publicImageUrl(AVATAR_BUCKET, data.other.avatar_url)!}
                  alt={data.other.full_name ?? ""}
                />
              )}
              <AvatarFallback>
                {(data.other.full_name ?? "?").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="truncate text-lg font-bold tracking-tight group-hover:text-primary">
              {data.other.full_name ?? "Kullanıcı"}
            </h1>
          </Link>
        ) : (
          <h1 className="truncate text-lg font-bold tracking-tight">Kullanıcı</h1>
        )}
        {data.listing && (
          <Link
            href={`/listings/${data.listing.id}`}
            className="ml-auto shrink-0 text-sm font-medium text-primary hover:underline"
          >
            İlanı gör
          </Link>
        )}
      </div>

      {data.otherAnswers.length > 0 && (
        <details className="group mb-4 overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4">
            <span className="flex items-center gap-2 font-medium">
              <ChevronDown className="size-4 text-primary transition-transform group-open:rotate-180" />
              {data.isHost ? "İsteyen kişinin" : "Karşı tarafın"} uyum profili
              <span className="text-xs font-normal text-muted-foreground">
                · detayları göster
              </span>
            </span>
            {data.otherScore != null && <CompatibilityBadge score={data.otherScore} />}
          </summary>
          <div className="space-y-6 border-t border-border p-5">
            {Object.entries(groupedAnswers).map(([category, items]) => (
              <div key={category}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary/70">
                  {category}
                </p>
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {items.map((a, i) => (
                    <div key={i} className="flex flex-col gap-1 border-l-2 border-primary/15 pl-3">
                      <span className="text-xs leading-snug text-muted-foreground">
                        {a.question}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{a.answer}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      <Chat
        conversationId={id}
        meId={profile.id}
        isHost={data.isHost}
        status={data.conversation.status}
        otherName={data.other?.full_name ?? "Kullanıcı"}
        listingId={data.listing?.id ?? null}
        listingStatus={data.listing?.status ?? null}
        initialMessages={data.messages}
      />
    </div>
  );
}
