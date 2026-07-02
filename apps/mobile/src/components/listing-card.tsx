import { formatRent } from "@hoomies/shared/format";
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
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <View style={{ width: 104, height: 104, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={{ width: 104, height: 104 }} contentFit="cover" />
        ) : (
          <Text style={{ fontSize: 28 }}>🏠</Text>
        )}
      </View>
      <View style={{ flex: 1, paddingVertical: 10, paddingRight: 12, gap: 4, justifyContent: "center" }}>
        <Text style={{ fontWeight: "700", color: colors.text }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13 }} numberOfLines={1}>
          📍 {item.district}, {item.city}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>{formatRent(item.monthly_rent)}/ay</Text>
          {item.score != null && (
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>%{item.score} uyum</Text>
          )}
        </View>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          {available} müsait / {item.capacity} kişilik
        </Text>
      </View>
    </Pressable>
  );
}
