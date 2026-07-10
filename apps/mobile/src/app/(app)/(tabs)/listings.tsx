import { daysLeft } from "@roomim/shared/format";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";
import {
  closeListing,
  extendListing,
  getMyListings,
  setListingStatus,
  type MyListing,
} from "@/lib/queries";
import { colors } from "@/lib/theme";

const STATUS: Record<string, { label: string; color: string }> = {
  active: { label: "Yayında", color: "#059669" },
  passive: { label: "Pasif", color: colors.muted },
  matched: { label: "Eşleşti", color: colors.primary },
  closed: { label: "Kapalı", color: colors.muted },
};

function SmallBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 }}
    >
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 10 }}
      >
        <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>İlanlarım</Text>
        <Pressable
          onPress={() => router.push("/listing-new")}
          style={{ backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>+ Yeni</Text>
        </Pressable>
      </View>

      {items === null ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontWeight: "700", color: colors.text }}>Henüz ilanın yok</Text>
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: "center" }}>
            “+ Yeni” ile ilk ilanını oluştur.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          renderItem={({ item }) => {
            const st = STATUS[item.status] ?? STATUS.active;
            const days = daysLeft(item.expires_at);
            const uid = session!.user.id;
            return (
              <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, gap: 10, backgroundColor: "#fff" }}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Image
                    source={item.coverUrl ? { uri: item.coverUrl } : undefined}
                    style={{ width: 84, height: 64, borderRadius: 10, backgroundColor: colors.surface }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontWeight: "700", color: colors.text, flex: 1 }} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={{ color: st.color, fontWeight: "700", fontSize: 12 }}>{st.label}</Text>
                    </View>
                    <Text style={{ color: colors.muted, marginTop: 2 }}>
                      {item.district}, {item.city}
                    </Text>
                    {item.status !== "closed" && (
                      <Text style={{ color: days <= 5 ? colors.danger : colors.muted, fontSize: 12, marginTop: 2 }}>
                        {days <= 0 ? "Süresi doldu" : `${days} gün kaldı`}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {item.status === "active" && (
                    <>
                      <SmallBtn label="Pasife al" onPress={() => act(setListingStatus(item.id, uid, "passive"))} />
                      <SmallBtn label="Kapat" onPress={() => act(closeListing(item.id, uid))} />
                    </>
                  )}
                  {item.status === "passive" && (
                    <SmallBtn label="Yayına al" onPress={() => act(setListingStatus(item.id, uid, "active"))} />
                  )}
                  {item.status === "closed" && (
                    <SmallBtn label="Yeniden yayınla" onPress={() => act(setListingStatus(item.id, uid, "active"))} />
                  )}
                  {item.status !== "closed" && (
                    <SmallBtn label="30 gün uzat" onPress={() => act(extendListing(item.id, uid))} />
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
