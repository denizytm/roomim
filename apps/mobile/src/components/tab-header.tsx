import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/lib/theme";

// Sekme ekranlarının turuncu başlık bandı. Odaktayken durum çubuğu açık renk olur.
export function TabHeader({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  useLightStatusBar();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 16 }]}>
      <View style={[styles.blob, { width: 180, height: 180, top: -70, right: -50 }]} />
      <View style={[styles.blob, { width: 90, height: 90, bottom: -30, right: 90 }]} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

// Turuncu başlıklı ekranlarda durum çubuğunu beyaz yap; ekrandan çıkınca geri al.
export function useLightStatusBar() {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.88)", marginTop: 2 },
});
