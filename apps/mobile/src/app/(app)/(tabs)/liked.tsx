import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { TabHeader } from "@/components/tab-header";
import { ListingCard } from "@/components/listing-card";
import { useSession } from "@/lib/auth-context";
import { getLikedListings, type ListingCard as ListingCardData } from "@/lib/queries";
import { colors } from "@/lib/theme";

export default function LikedScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<ListingCardData[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getLikedListings(session.user.id)
        .then(setItems)
        .catch(() => setItems([]));
    }, [session?.user.id]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <TabHeader
        title="Beğendiklerim"
        subtitle={items && items.length > 0 ? `${items.length} ilan kaydettin` : "Sağa kaydırdığın ilanlar"}
      />

      {items === null ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Henüz beğenin yok"
          text="Keşfet'te bir ilanı sağa kaydırdığında burada birikir."
          action={{ title: "İlanları keşfet", onPress: () => router.navigate("/") }}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <ListingCard item={item} />}
        />
      )}
    </View>
  );
}
