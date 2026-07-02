import { router, usePathname, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

type Banner = { text: string; route: Href } | null;

// Web'deki RealtimeNotifications'ın mobil karşılığı:
// - yeni ilan isteği (ev sahibine)
// - istek kabul edildi (ev arayana)
// - başka bir sohbette yeni mesaj
// Üstten kayan, dokununca ilgili sohbete giden geçici bir bildirim şeridi gösterir.
export function RealtimeNotifications() {
  const { session } = useSession();
  const meId = session?.user.id;
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const insets = useSafeAreaInsets();
  const [banner, setBanner] = useState<Banner>(null);
  const [y] = useState(() => new Animated.Value(-140));

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!banner) return;
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    const t = setTimeout(() => {
      Animated.timing(y, { toValue: -140, duration: 250, useNativeDriver: true }).start(() =>
        setBanner(null),
      );
    }, 4000);
    return () => clearTimeout(t);
  }, [banner, y]);

  useEffect(() => {
    if (!meId) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;

    (async () => {
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (s?.access_token) supabase.realtime.setAuth(s.access_token);

      channel = supabase
        .channel(`notify:${meId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "conversations", filter: `host_id=eq.${meId}` },
          (p) => {
            const c = p.new as { id: string };
            setBanner({ text: "Yeni bir ilan isteği aldın 👋", route: `/chat/${c.id}` as Href });
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "conversations", filter: `seeker_id=eq.${meId}` },
          (p) => {
            const c = p.new as { id: string; status: string };
            if (c.status === "accepted") {
              setBanner({ text: "İsteğin kabul edildi! 🎉 Mesajlaşabilirsin.", route: `/chat/${c.id}` as Href });
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (p) => {
            const m = p.new as { sender_id: string; conversation_id: string };
            if (m.sender_id === meId) return;
            if (pathRef.current === `/chat/${m.conversation_id}`) return;
            setBanner({ text: "Yeni mesaj 💬", route: `/chat/${m.conversation_id}` as Href });
          },
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [meId]);

  if (!banner) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingTop: insets.top + 6,
        transform: [{ translateY: y }],
        zIndex: 1000,
      }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => {
          const r = banner.route;
          setBanner(null);
          router.push(r);
        }}
        style={{
          marginHorizontal: 12,
          backgroundColor: colors.text,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 6,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>{banner.text}</Text>
        <Text style={{ color: "#fff", opacity: 0.75, fontSize: 12, marginTop: 2 }}>
          Açmak için dokun
        </Text>
      </Pressable>
    </Animated.View>
  );
}
