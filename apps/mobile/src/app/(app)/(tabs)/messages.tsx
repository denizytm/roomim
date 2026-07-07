import { Image } from "expo-image";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";
import { getConversations, type ConvListItem } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";
import { colors } from "@/lib/theme";

type Filter = "all" | "accepted" | "pending";

function statusLabel(c: ConvListItem) {
  if (c.status === "accepted") return { text: "Aktif", color: "#059669" };
  if (c.status === "declined") return { text: "Reddedildi", color: colors.muted };
  return c.isHost
    ? { text: "Yeni istek", color: colors.primary }
    : { text: "Onay bekliyor", color: "#D97706" };
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text, padding: 20, paddingBottom: 8 }}>
        Eşleşmeler
      </Text>

      {items && items.length > 0 && (
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 10 }}>
          <FilterChip label={`Hepsi (${counts.all})`} active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterChip label={`Eşleşenler (${counts.accepted})`} active={filter === "accepted"} onPress={() => setFilter("accepted")} />
          <FilterChip label={`Beklemede (${counts.pending})`} active={filter === "pending"} onPress={() => setFilter("pending")} />
        </View>
      )}

      {items === null ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontWeight: "700", color: colors.text, fontSize: 16 }}>Henüz eşleşmen yok</Text>
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 6 }}>
            {"Keşfet'te bir ilanı sağa kaydırarak ilgi göster."}
          </Text>
        </View>
      ) : shown.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ color: colors.muted, textAlign: "center" }}>Bu filtrede kayıt yok.</Text>
        </View>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
          renderItem={({ item }) => {
            const s = statusLabel(item);
            const avatar = publicImageUrl("avatars", item.otherAvatar);
            return (
              <Pressable
                onPress={() => router.push(`/chat/${item.id}` as Href)}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={{ width: 48, height: 48 }} contentFit="cover" />
                  ) : (
                    <Text style={{ color: colors.primary, fontWeight: "800" }}>
                      {item.otherName.slice(0, 1).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "700", color: colors.text }} numberOfLines={1}>
                      {item.otherName}
                    </Text>
                    <Text style={{ color: s.color, fontSize: 12, fontWeight: "700" }}>{s.text}</Text>
                  </View>
                  <Text style={{ color: colors.muted }} numberOfLines={1}>
                    {item.lastMessage ?? item.listingTitle}
                  </Text>
                  <Pressable
                    onPress={() => router.push(`/listing/${item.listingId}` as Href)}
                    hitSlop={6}
                    style={{ alignSelf: "flex-start", marginTop: 4 }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>
                      🏠 İlana git
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
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
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary : "#fff",
      }}
    >
      <Text style={{ color: active ? "#fff" : colors.text, fontWeight: "600", fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}
