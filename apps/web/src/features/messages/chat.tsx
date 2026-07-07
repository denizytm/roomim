"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Loader2, MapPin, PartyPopper, Send, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { closeListingAction } from "@/features/listings/actions";
import { setConversationStatusAction } from "@/features/messages/actions";
import { createClient } from "@/lib/supabase/client";
import type { ConversationStatus, Message } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

type Props = {
  conversationId: string;
  meId: string;
  isHost: boolean;
  status: ConversationStatus;
  otherName: string;
  listingId: string | null;
  listingStatus: string | null;
  initialMessages: Message[];
};

export function Chat({
  conversationId,
  meId,
  isHost,
  status,
  otherName,
  listingId,
  listingStatus,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [statusPending, startStatus] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Realtime: yeni mesajları dinle
  useEffect(() => {
    if (status !== "accepted") return;
    const supabase = createClient();
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // RLS'li realtime için token'ı abonelikten önce set et.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const msg = payload.new as Message;
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
            );
          },
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: meId, body: text });
    setSending(false);
    if (error) {
      toast.error("Mesaj gönderilemedi: " + error.message);
      return;
    }
    setBody("");
  }

  function changeStatus(next: "accepted" | "declined") {
    const fd = new FormData();
    fd.set("id", conversationId);
    fd.set("status", next);
    startStatus(() => setConversationStatusAction(fd));
  }

  async function shareAddress() {
    const addr = window.prompt(
      "Paylaşmak istediğin adresi yaz (sadece onayladığında gönderilir):",
    );
    if (!addr || !addr.trim()) return;
    // İkinci onay adımı
    if (
      !window.confirm(
        "Adresini karşı tarafla paylaşmak üzeresin. Bu geri alınamaz — onaylıyor musun?",
      )
    )
      return;
    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: meId,
      body: `📍 Paylaşılan adres: ${addr.trim()}`,
    });
    if (error) toast.error(error.message);
  }

  // --- Pending durumu ---
  if (status === "pending") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        {isHost ? (
          <>
            <p className="font-medium">
              <span className="text-primary">{otherName}</span> ilanınla ilgileniyor ve
              seninle iletişim kurmak istiyor.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Onaylarsan mesajlaşma açılır.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button onClick={() => changeStatus("accepted")} disabled={statusPending}>
                {statusPending ? <Loader2 className="animate-spin" /> : <Check />} Onayla
              </Button>
              <Button
                variant="outline"
                onClick={() => changeStatus("declined")}
                disabled={statusPending}
              >
                <X /> Reddet
              </Button>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-6 animate-spin text-primary" />
            <p className="mt-3 font-medium">İsteğin gönderildi</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {otherName} onayladığında mesajlaşma açılacak.
            </p>
          </>
        )}
      </div>
    );
  }

  // --- Declined durumu ---
  if (status === "declined") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
        Bu istek reddedildi.
      </div>
    );
  }

  // --- Accepted: sohbet ---
  return (
    <div className="flex h-[60vh] flex-col rounded-2xl border border-border bg-card">
      {/* Eşleşince ev sahibine ilanı kapatma önerisi */}
      {isHost && listingId && listingStatus !== "closed" && (
        <form
          action={closeListingAction}
          className="flex items-center justify-between gap-2 border-b border-border bg-primary/5 px-4 py-2.5 text-sm"
        >
          <span className="flex items-center gap-2">
            <PartyPopper className="size-4 text-primary" /> Anlaştıysanız ilanı
            kapatabilirsin.
          </span>
          <input type="hidden" name="id" value={listingId} />
          <input type="hidden" name="reason" value="matched" />
          <Button type="submit" size="xs" variant="outline">
            İlanı kapat
          </Button>
        </form>
      )}

      {/* Mesajlar */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Henüz mesaj yok. İlk mesajı sen gönder 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === meId;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Giriş alanı */}
      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <Button variant="ghost" size="xs" onClick={shareAddress}>
            <MapPin /> Adres paylaş
          </Button>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5" /> İki onaylı
          </span>
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Mesaj yaz…"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={sending || !body.trim()}>
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </div>
    </div>
  );
}
