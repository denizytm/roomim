import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Btn } from "@/components/form";
import { colors } from "@/lib/theme";

// Boş liste ekranı: ikon dairesi + başlık + açıklama + opsiyonel aksiyon.
export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text?: string;
  action?: { title: string; onPress: () => void };
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
          borderWidth: 8,
          borderColor: "#FFEDD5",
        }}
      >
        <Ionicons name={icon} size={34} color="#fff" />
      </View>
      <Text style={{ fontWeight: "800", color: colors.text, fontSize: 18, textAlign: "center" }}>{title}</Text>
      {text && (
        <Text style={{ color: colors.muted, textAlign: "center", fontSize: 15, lineHeight: 21, maxWidth: 280 }}>
          {text}
        </Text>
      )}
      {action && (
        <View style={{ marginTop: 16, alignSelf: "stretch", paddingHorizontal: 32 }}>
          <Btn title={action.title} onPress={action.onPress} />
        </View>
      )}
    </View>
  );
}
