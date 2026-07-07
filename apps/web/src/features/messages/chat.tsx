"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Check,
  ImageIcon,
  Loader2,
  Mic,
  MapPin,
  PartyPopper,
  Send,
  ShieldAlert,
  Smile,
  Square,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { closeListingAction } from "@/features/listings/actions";
import { setConversationStatusAction } from "@/features/messages/actions";
import { createClient } from "@/lib/supabase/client";
import type { ConversationStatus, Message } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","😘","😎","🤔","😅",
  "🙌","👍","👎","🙏","👋","🎉","❤️","🔥","✨","🥳",
  "😢","😭","😡","😴","🤝","💯","👏","🙂","😉","🤗",
];

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
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [statusPending, startStatus] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Realtime: yeni mesajları dinle
  useEffect(() => {
    if (status !== "accepted") return;
    const supabase = createClient();
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
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
    setShowEmoji(false);
  }

  // Görsel/ses ekini yükle ve mesaj olarak gönder.
  async function uploadAndSend(file: Blob, type: "image" | "audio", ext: string) {
    setUploading(true);
    const supabase = createClient();
    const path = `${meId}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("chat-media")
      .upload(path, file, { contentType: file.type || undefined });
    if (upErr) {
      setUploading(false);
      toast.error("Yükleme başarısız: " + upErr.message);
      return;
    }
    const { data } = supabase.storage.from("chat-media").getPublicUrl(path);
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: meId,
      body: "",
      attachment_url: data.publicUrl,
      attachment_type: type,
    });
    setUploading(false);
    if (error) toast.error("Gönderilemedi: " + error.message);
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Görsel en fazla 8 MB olabilir.");
      return;
    }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    uploadAndSend(file, "image", ext);
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Tarayıcın ses kaydını desteklemiyor.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => {
        if (ev.data.size) chunksRef.current.push(ev.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        await uploadAndSend(blob, "audio", "webm");
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Mikrofon erişimi reddedildi.");
    }
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
                    "max-w-[75%] overflow-hidden rounded-2xl text-sm",
                    m.attachment_type ? "p-1" : "px-3.5 py-2",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {m.attachment_type === "image" && m.attachment_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.attachment_url}
                      alt="Görsel"
                      className="max-h-64 rounded-xl object-cover"
                    />
                  ) : m.attachment_type === "audio" && m.attachment_url ? (
                    <audio controls src={m.attachment_url} className="h-10 w-56 max-w-full" />
                  ) : (
                    m.body
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Giriş alanı */}
      <div className="relative border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <Button variant="ghost" size="xs" onClick={shareAddress}>
            <MapPin /> Adres paylaş
          </Button>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5" /> İki onaylı
          </span>
          {uploading && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <Loader2 className="size-3.5 animate-spin" /> Yükleniyor…
            </span>
          )}
        </div>

        {showEmoji && (
          <div className="absolute bottom-full left-3 mb-2 grid max-w-70 grid-cols-8 gap-1 rounded-xl border border-border bg-popover p-2 shadow-lg">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className="rounded-md p-1 text-lg hover:bg-muted"
                onClick={() => setBody((b) => b + e)}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickImage}
        />

        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Emoji"
            onClick={() => setShowEmoji((s) => !s)}
          >
            <Smile />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Görsel gönder"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <ImageIcon />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={recording ? "destructive" : "ghost"}
            aria-label={recording ? "Kaydı durdur" : "Sesli mesaj"}
            disabled={uploading}
            onClick={toggleRecording}
          >
            {recording ? <Square /> : <Mic />}
          </Button>
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={recording ? "Kaydediliyor…" : "Mesaj yaz…"}
            autoComplete="off"
            disabled={recording}
            onFocus={() => setShowEmoji(false)}
          />
          <Button type="submit" size="icon" disabled={sending || !body.trim()}>
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </div>
    </div>
  );
}
