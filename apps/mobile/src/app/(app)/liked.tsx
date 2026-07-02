import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  if (items === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontWeight: "700", color: colors.text, fontSize: 16 }}>Henüz beğenin yok</Text>
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 6 }}>
            {"Keşfet'te bir ilanı sağa kaydırdığında burada birikir."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <ListingCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}
