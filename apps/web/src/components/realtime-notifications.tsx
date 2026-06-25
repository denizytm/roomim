"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/lib/types/database.types";

// Giriş yapan kullanıcı için global canlı bildirimler:
// - yeni ilan isteği (ev sahibine)
// - istek kabul/ret (ev arayana)
// - başka bir sohbette yeni mesaj
export function RealtimeNotifications({ meId }: { meId: string }) {
  const router = useRouter();

  useEffect(() => {
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
      .channel(`notify:${meId}`)
      // Yeni ilan isteği (ben ev sahibiyim)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: `host_id=eq.${meId}`,
        },
        (payload) => {
          const c = payload.new as Conversation;
          toast.info("Yeni bir ilan isteği aldın 👋", {
            action: { label: "Aç", onClick: () => router.push(`/messages/${c.id}`) },
          });
          router.refresh();
        },
      )
      // İsteğim güncellendi (ben ev arayanım) → kabul/ret
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `seeker_id=eq.${meId}`,
        },
        (payload) => {
          const c = payload.new as Conversation;
          if (c.status === "accepted") {
            toast.success("İsteğin kabul edildi! 🎉 Artık mesajlaşabilirsin.", {
              action: { label: "Sohbete git", onClick: () => router.push(`/messages/${c.id}`) },
            });
          } else if (c.status === "declined") {
            toast("İsteğin reddedildi.");
          }
          router.refresh();
        },
      )
      // Yeni mesaj (RLS sadece benim konuşmalarımı verir)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as Message;
          if (m.sender_id === meId) return;
          // O sohbet zaten açıksa toast gösterme (sohbet kendi içinde gösteriyor)
          const onThisChat =
            typeof window !== "undefined" &&
            window.location.pathname === `/messages/${m.conversation_id}`;
          if (onThisChat) return;
          toast.info("Yeni mesaj 💬", {
            action: {
              label: "Aç",
              onClick: () => router.push(`/messages/${m.conversation_id}`),
            },
          });
          router.refresh();
        },
      )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [meId, router]);

  return null;
}
