import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SwipeDeck } from "@/components/swipe-deck";
import { useSession } from "@/lib/auth-context";
import { getDeck, likeListing, passListing, type DeckListing } from "@/lib/queries";
import { colors } from "@/lib/theme";

export default function DeckScreen() {
  const { session } = useSession();
  const [cards, setCards] = useState<DeckListing[] | null>(null);

  useEffect(() => {
    if (!session) return;
    getDeck(session.user.id)
      .then(setCards)
      .catch(() => setCards([]));
  }, [session?.user.id]);

  const onLike = useCallback(
    (card: DeckListing) => {
      if (session) void likeListing(session.user.id, card).catch(() => {});
    },
    [session],
  );

  const onPass = useCallback(
    (card: DeckListing) => {
      if (session) void passListing(session.user.id, card.id).catch(() => {});
    },
    [session],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 4,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image source={require("../../../../assets/images/icon.png")} style={{ width: 32, height: 32, borderRadius: 9 }} />
          <Text style={{ fontSize: 24, fontWeight: "900", color: colors.primary, letterSpacing: -0.8 }}>
            roomim<Text style={{ color: colors.text }}>.</Text>
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/search" as Href)}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: colors.field,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
          accessibilityLabel="İlan ara"
        >
          <Ionicons name="search" size={20} color={colors.text} />
        </Pressable>
      </View>
      {cards === null ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <SwipeDeck cards={cards} onLike={onLike} onPass={onPass} />
      )}
    </SafeAreaView>
  );
}
