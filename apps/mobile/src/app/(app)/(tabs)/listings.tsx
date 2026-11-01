import { Ionicons } from "@expo/vector-icons";
import { daysLeft } from "@roomim/shared/format";
import { Image } from "expo-image";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useSession } from "@/lib/auth-context";
import {
  closeListing,
  extendListing,
  getMyListings,
  setListingStatus,
  type MyListing,
} from "@/lib/queries";
import { TabHeader } from "@/components/tab-header";
import { EmptyState } from "@/components/empty-state";
import { colors } from "@/lib/theme";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Yayında", color: "#059669", bg: "#ECFDF5" },
  passive: { label: "Pasif", color: colors.muted, bg: colors.field },
  matched: { label: "Eşleşti", color: colors.primary, bg: colors.surface },
  closed: { label: "Kapalı", color: colors.muted, bg: colors.field },
};

function SmallBtn({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.surface,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={14} color={colors.text} />
      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export default function MyListingsScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<MyListing[] | null>(null);

  const load = useCallback(() => {
    if (!session) return;
    getMyListings(session.user.id)
      .then(setItems)
      .catch(() => setItems([]));
  }, [session?.user.id]);

  useFocusEffect(useCallback(() => load(), [load]));

  async function act(fn: Promise<void>) {
    await fn;
    load();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <TabHeader
        title="İlanlarım"
        subtitle={items && items.length > 0 ? `${items.length} ilan` : "Ev arkadaşı aradığın ilanlar"}
        right={
            <Pressable
              onPress={() => router.push("/listing-new")}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "#fff",
                borderRadius: 999,
                paddingLeft: 12,
                paddingRight: 16,
                paddingVertical: 9,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Yeni ilan</Text>
            </Pressable>
        }
      />

      {items === null ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="home-outline"
          title="Henüz ilanın yok"
          text="İlk ilanını oluştur, uyumlu ev arkadaşları seni bulsun."
          action={{ title: "İlan oluştur", onPress: () => router.push("/listing-new") }}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 14 }}
          renderItem={({ item }) => {
            const st = STATUS[item.status] ?? STATUS.active;
            const days = daysLeft(item.expires_at);
            const uid = session!.user.id;
            return (
              <View style={styles.card}>
                <Pressable
                  onPress={() => router.push(`/listing/${item.id}` as Href)}
                  style={{ flexDirection: "row", gap: 12 }}
                >
                  <Image
                    source={item.coverUrl ? { uri: item.coverUrl } : undefined}
                    style={{ width: 88, height: 88, borderRadius: 12, backgroundColor: colors.surface }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, gap: 4, justifyContent: "center" }}>
                    <View style={[styles.status, { backgroundColor: st.bg }]}>
                      <Text style={{ color: st.color, fontWeight: "700", fontSize: 11 }}>{st.label}</Text>
                    </View>
                    <Text style={{ fontWeight: "700", fontSize: 15, color: colors.text }} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                      {item.district}, {item.city}
                    </Text>
                    {item.status !== "closed" && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="time-outline" size={13} color={days <= 5 ? colors.danger : colors.muted} />
                        <Text style={{ color: days <= 5 ? colors.danger : colors.muted, fontSize: 12 }}>
                          {days <= 0 ? "Süresi doldu" : `${days} gün kaldı`}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {item.status === "active" && (
                    <>
                      <SmallBtn icon="pause-outline" label="Pasife al" onPress={() => act(setListingStatus(item.id, uid, "passive"))} />
                      <SmallBtn icon="close-outline" label="Kapat" onPress={() => act(closeListing(item.id, uid))} />
                    </>
                  )}
                  {item.status === "passive" && (
                    <SmallBtn icon="play-outline" label="Yayına al" onPress={() => act(setListingStatus(item.id, uid, "active"))} />
                  )}
                  {item.status === "closed" && (
                    <SmallBtn icon="refresh-outline" label="Yeniden yayınla" onPress={() => act(setListingStatus(item.id, uid, "active"))} />
                  )}
                  {item.status !== "closed" && (
                    <SmallBtn icon="calendar-outline" label="30 gün uzat" onPress={() => act(extendListing(item.id, uid))} />
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 10,
    gap: 12,
    backgroundColor: "#fff",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
});
