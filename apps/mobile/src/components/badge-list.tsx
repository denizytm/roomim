import { Ionicons } from "@expo/vector-icons";
import type { computeBadges } from "@roomim/shared/loyalty";
import { Text, View } from "react-native";

import { colors } from "@/lib/theme";

// Kazanılan rozet ✓ ile turuncu, kazanılmayan kilitli ve soluk.
export function BadgeList({ badges }: { badges: ReturnType<typeof computeBadges> }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {badges.map((b) => (
        <View
          key={b.key}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: b.earned ? "#FFEDD5" : colors.field,
            opacity: b.earned ? 1 : 0.6,
          }}
        >
          <Ionicons
            name={b.earned ? "checkmark-circle" : "lock-closed"}
            size={14}
            color={b.earned ? colors.primary : colors.muted}
          />
          <Text style={{ color: b.earned ? colors.primary : colors.muted, fontWeight: "600", fontSize: 13 }}>
            {b.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
