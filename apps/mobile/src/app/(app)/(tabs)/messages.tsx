import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useSession } from "@/lib/auth-context";
import { getConversations, type ConvListItem } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";
import { TabHeader } from "@/components/tab-header";
import { EmptyState } from "@/components/empty-state";
import { colors } from "@/lib/theme";

type Filter = "all" | "accepted" | "pending";

function statusLabel(c: ConvListItem) {
  if (c.status === "accepted") return { text: "Aktif", color: "#059669", bg: "#ECFDF5" };
  if (c.status === "declined") return { text: "Reddedildi", color: colors.muted, bg: colors.field };
  return c.isHost
    ? { text: "Yeni istek", color: colors.primary, bg: colors.surface }
    : { text: "Onay bekliyor", color: "#B45309", bg: "#FFFBEB" };
}

// Bugünse saat, bu yılsa "12 Eki", değilse tarih.
function shortTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("tr-TR", d.getFullYear() === now.getFullYear() ? { day: "numeric", month: "short" } : undefined);
}

const rank = (c: ConvListItem) =>
  c.status === "accepted" ? 0 : c.status === "pending" ? 1 : 2;

export default function MessagesScreen() {
  const { session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ConvListItem[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getConversations(session.user.id)
        .then(setItems)
        .catch(() => setItems([]));
    }, [session?.user.id]),
  );

  const shown = useMemo(() => {
    if (!items) return [];
    const base =
      filter === "accepted"
        ? items.filter((c) => c.status === "accepted")
        : filter === "pending"
          ? items.filter((c) => c.status === "pending")
          : items;
    // Hepsi: önce eşleşenler, sonra beklemede; her grupta son mesaja göre (yeni üstte).
    return [...base].sort((a, b) => {
      if (filter === "all") {
        const r = rank(a) - rank(b);
        if (r !== 0) return r;
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [items, filter]);

  const counts = useMemo(() => {
    const all = items ?? [];
    return {
      all: all.length,
      accepted: all.filter((c) => c.status === "accepted").length,
      pending: all.filter((c) => c.status === "pending").length,
    };
  }, [items]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <TabHeader
        title="Eşleşmeler"
        subtitle={counts.pending > 0 ? `${counts.pending} istek bekliyor` : "İlgilendiğin ilanlar ve sohbetlerin"}
      >
        {items && items.length > 0 && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <FilterChip label={`Hepsi (${counts.all})`} active={filter === "all"} onPress={() => setFilter("all")} />
            <FilterChip label={`Eşleşenler (${counts.accepted})`} active={filter === "accepted"} onPress={() => setFilter("accepted")} />
            <FilterChip label={`Beklemede (${counts.pending})`} active={filter === "pending"} onPress={() => setFilter("pending")} />
          </View>
        )}
      </TabHeader>

      {items === null ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="Henüz eşleşmen yok"
          text="Keşfet'te bir ilanı sağa kaydırarak ilgi göster; eşleşince burada sohbet edebilirsin."
        />
      ) : shown.length === 0 ? (
        <EmptyState icon="filter-outline" title="Bu filtrede kayıt yok" />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 10 }}
          renderItem={({ item }) => {
            const s = statusLabel(item);
            const avatar = publicImageUrl("avatars", item.otherAvatar);
            return (
              <Pressable
                onPress={() => router.push(`/chat/${item.id}` as Href)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
              >
                <View style={styles.avatar}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={{ width: 54, height: 54 }} contentFit="cover" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "800", fontSize: 20 }}>
                      {item.otherName.slice(0, 1).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ flex: 1, fontWeight: "700", fontSize: 16, color: colors.text }} numberOfLines={1}>
                      {item.otherName}
                    </Text>
                    <Text style={{ color: colors.placeholder, fontSize: 12 }}>{shortTime(item.updatedAt)}</Text>
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 14 }} numberOfLines={1}>
                    {item.lastMessage ?? "Henüz mesaj yok"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <View style={[styles.status, { backgroundColor: s.bg }]}>
                      <Text style={{ color: s.color, fontSize: 11, fontWeight: "700" }}>{s.text}</Text>
                    </View>
                    <Pressable
                      onPress={() => router.push(`/listing/${item.listingId}` as Href)}
                      hitSlop={6}
                      style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 }}
                    >
                      <Ionicons name="home-outline" size={12} color={colors.muted} />
                      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", flexShrink: 1 }} numberOfLines={1}>
                        {item.listingTitle}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? "#fff" : "rgba(255,255,255,0.2)",
      }}
    >
      <Text style={{ color: active ? colors.primary : "#fff", fontWeight: "700", fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#9A3412",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
});
