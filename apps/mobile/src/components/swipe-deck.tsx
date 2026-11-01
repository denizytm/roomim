import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { EmptyState } from "@/components/empty-state";
import type { DeckListing } from "@/lib/queries";
import { colors } from "@/lib/theme";

const { width } = Dimensions.get("window");
const THRESHOLD = width * 0.28;

function scoreColor(score: number) {
  if (score >= 75) return "#059669";
  if (score >= 50) return colors.primary;
  return "#D97706";
}


function Tag({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.tag}>
      <Ionicons name={icon} size={13} color="#fff" />
      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

function CardContent({ card }: { card: DeckListing }) {
  const available = Math.max(card.capacity - card.occupied, 0);
  return (
    <>
      {card.photoUrl ? (
        <Image source={{ uri: card.photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
      )}
      {/* Alt kısımda koyulaşan gradient (yazı okunurluğu için) */}
      <Image
        source={require("../../assets/images/card-scrim.png")}
        style={styles.scrimWrap}
        contentFit="fill"
        pointerEvents="none"
      />

      {card.score != null && (
        <View style={[styles.score, { backgroundColor: scoreColor(card.score) }]}>
          <Ionicons name="sparkles" size={13} color="#fff" />
          <Text style={styles.scoreText}>%{card.score} uyum</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {card.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="location-outline" size={15} color="rgba(255,255,255,0.9)" />
          <Text style={styles.meta}>
            {card.district}, {card.city}
          </Text>
        </View>
        <Text style={styles.rent}>
          {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(card.monthly_rent)}
          <Text style={styles.rentSub}> /ay</Text>
        </Text>
        <View style={styles.tags}>
          <Tag icon="people-outline" text={`${available} müsait`} />
          {card.furnished && <Tag icon="cube-outline" text="Eşyalı" />}
          {card.pets_allowed && <Tag icon="paw-outline" text="Evcil hayvan" />}
        </View>
      </View>
    </>
  );
}

function TopCard({
  card,
  onSwipe,
}: {
  card: DeckListing;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > THRESHOLD) {
        x.value = withTiming(width * 1.5, { duration: 200 }, () => runOnJS(onSwipe)("right"));
      } else if (e.translationX < -THRESHOLD) {
        x.value = withTiming(-width * 1.5, { duration: 200 }, () => runOnJS(onSwipe)("left"));
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${interpolate(x.value, [-width, width], [-12, 12])}deg` },
    ],
  }));
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, THRESHOLD], [0, 1]) }));
  const passStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-THRESHOLD, 0], [1, 0]) }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <CardContent card={card} />
        <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]}>
          <Text style={styles.stampLikeText}>İLGİLENİYORUM</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampPass, passStyle]}>
          <Text style={styles.stampPassText}>PAS</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export function SwipeDeck({
  cards,
  onLike,
  onPass,
}: {
  cards: DeckListing[];
  onLike: (card: DeckListing) => void;
  onPass: (card: DeckListing) => void;
}) {
  const [index, setIndex] = useState(0);
  const current = cards[index];
  const next = cards[index + 1];

  function handleSwipe(dir: "left" | "right") {
    if (!current) return;
    if (dir === "right") onLike(current);
    else onPass(current);
    setIndex((i) => i + 1);
  }

  if (!current) {
    return (
      <EmptyState
        icon="checkmark-done-outline"
        title="Şimdilik bu kadar 🎉"
        text="Yeni ilanlar geldikçe burada görünecek. Bu arada filtrelerle arama yapabilirsin."
        action={{ title: "İlan ara", onPress: () => router.push("/search" as Href) }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.deck}>
        {next && (
          <View style={[styles.cardWrap, { transform: [{ scale: 0.95 }], opacity: 0.7 }]} pointerEvents="none">
            <View style={styles.card}>
              <CardContent card={next} />
            </View>
          </View>
        )}
        <View style={styles.cardWrap}>
          <TopCard key={current.id} card={current} onSwipe={handleSwipe} />
        </View>
      </View>

      <View style={styles.buttons}>
        <Pressable
          onPress={() => handleSwipe("left")}
          style={({ pressed }) => [styles.fab, styles.fabPass, pressed && styles.pressed]}
          accessibilityLabel="Pas geç"
        >
          <Ionicons name="close" size={30} color="#EF4444" />
        </Pressable>
        <Pressable
          onPress={() => router.push(`/listing/${current.id}` as Href)}
          style={({ pressed }) => [styles.fabSmall, pressed && styles.pressed]}
          accessibilityLabel="İlan detayı"
        >
          <Ionicons name="information-circle-outline" size={26} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={() => handleSwipe("right")}
          style={({ pressed }) => [styles.fab, styles.fabLike, pressed && styles.pressed]}
          accessibilityLabel="İlgileniyorum"
        >
          <Ionicons name="heart" size={30} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deck: { flex: 1, padding: 16 },
  cardWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.surface,
    shadowColor: "#0F172A",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  scrimWrap: { position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" },
  info: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, gap: 6 },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", letterSpacing: -0.3 },
  meta: { color: "rgba(255,255,255,0.9)", fontSize: 15 },
  rent: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 2 },
  rentSub: { fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.85)" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  score: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  scoreText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  stamp: {
    position: "absolute",
    top: 28,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 3,
  },
  stampLike: { left: 24, borderColor: "#059669", transform: [{ rotate: "-14deg" }] },
  stampLikeText: { color: "#059669", fontWeight: "900", fontSize: 18 },
  stampPass: { right: 24, borderColor: "#EF4444", transform: [{ rotate: "14deg" }] },
  stampPassText: { color: "#EF4444", fontWeight: "900", fontSize: 20 },
  buttons: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 24, paddingVertical: 16 },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabPass: { backgroundColor: "#fff" },
  fabLike: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.35 },
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pressed: { transform: [{ scale: 0.92 }] },
});
