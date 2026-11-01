import { formatRent } from "@roomim/shared/format";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import type { ListingCard as ListingCardData } from "@/lib/queries";
import { colors } from "@/lib/theme";

export function ListingCard({ item }: { item: ListingCardData }) {
  const available = Math.max(item.capacity - item.occupied, 0);
  return (
    <Pressable
      onPress={() => router.push(`/listing/${item.id}` as Href)}
      style={{
        flexDirection: "row",
        gap: 12,
        borderRadius: 18,
        padding: 8,
        backgroundColor: "#fff",
        shadowColor: "#0F172A",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View style={{ width: 96, height: 96, borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={{ width: 96, height: 96 }} contentFit="cover" />
        ) : (
          <Text style={{ fontSize: 28 }}>🏠</Text>
        )}
      </View>
      <View style={{ flex: 1, paddingVertical: 10, paddingRight: 12, gap: 4, justifyContent: "center" }}>
        <Text style={{ fontWeight: "700", fontSize: 15, color: colors.text }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13 }} numberOfLines={1}>
          📍 {item.district}, {item.city}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>{formatRent(item.monthly_rent)}/ay</Text>
          {item.score != null && (
            <View style={{ backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800" }}>%{item.score} uyum</Text>
            </View>
          )}
        </View>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          {available} müsait / {item.capacity} kişilik
        </Text>
      </View>
    </Pressable>
  );
}
