import { Ionicons } from "@expo/vector-icons";
import { ROLE_LABELS } from "@roomim/shared/constants";
import { computeBadges } from "@roomim/shared/loyalty";
import type { UserRole } from "@roomim/shared/types/database.types";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLightStatusBar } from "@/components/tab-header";
import { BadgeList } from "@/components/badge-list";
import { useSession } from "@/lib/auth-context";
import { getProfileFull } from "@/lib/queries";
import { colors, radius } from "@/lib/theme";
import type { Profile } from "@roomim/shared/types/database.types";

export default function ProfileScreen() {
  const { session, signOut } = useSession();
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [university, setUniversity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getProfileFull(session.user.id).then(({ profile, university }) => {
        setProfile(profile);
        setUniversity(university);
        setLoading(false);
      });
    }, [session?.user.id]),
  );

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const badges = computeBadges(profile);
  const initials = (profile.full_name ?? "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  const earned = badges.filter((b) => b.earned).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Turuncu üst alan */}
        <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
          <View style={[styles.blob, { width: 220, height: 220, top: -80, right: -70 }]} />
          <View style={[styles.blob, { width: 120, height: 120, top: 120, left: -50 }]} />
          <View style={styles.avatar}>
            <Text style={{ fontSize: 32, fontWeight: "800", color: colors.primary }}>{initials || "?"}</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff", marginTop: 6 }}>
            {profile.full_name ?? "İsimsiz"}
          </Text>
          {university && (
            <Text style={{ color: "rgba(255,255,255,0.92)", fontSize: 15, textAlign: "center" }}>{university}</Text>
          )}
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{session?.user.email}</Text>
          {profile.role && (
            <View style={styles.rolePill}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                {ROLE_LABELS[profile.role as UserRole]}
              </Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, gap: 24, marginTop: -36 }}>
        {/* Puan + rozet özeti */}
        <View style={[styles.statsCard, styles.card]}>
          <Stat icon="star" value={String(profile.points)} label="Puan" />
          <View style={{ width: 1, alignSelf: "stretch", backgroundColor: colors.border }} />
          <Stat icon="ribbon" value={`${earned}/${badges.length}`} label="Rozet" />
        </View>

        {/* Rozetler */}
        <View style={{ gap: 10 }}>
          <SectionTitle>Rozetler</SectionTitle>
          <BadgeList badges={badges} />
        </View>

        {/* Menü */}
        <View style={{ gap: 10 }}>
          <SectionTitle>Hesap</SectionTitle>
          <View style={[styles.group, styles.card]}>
            <Row icon="options-outline" title="Uyum sorularını güncelle" onPress={() => router.push("/compat-edit")} />
            <Row icon="ban-outline" title="Engellenen kullanıcılar" onPress={() => router.push("/blocked" as Href)} />
            <Row icon="help-buoy-outline" title="Destek / Şikayet" onPress={() => router.push("/support" as Href)} last />
          </View>
        </View>

        <View style={[styles.group, styles.card]}>
          <Row icon="log-out-outline" title="Çıkış yap" onPress={signOut} />
          <Row
            icon="trash-outline"
            title="Hesabımı sil"
            onPress={() => router.push("/account-delete" as Href)}
            danger
            last
          />
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>
      {children}
    </Text>
  );
}

function Stat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View>
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>{value}</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
      </View>
    </View>
  );
}

function Row({
  icon,
  title,
  onPress,
  danger,
  last,
}: {
  icon: IconName;
  title: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  const tint = danger ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.surface },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? "#FEF2F2" : colors.surface }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={{ flex: 1, fontSize: 16, fontWeight: "500", color: tint }}>{title}</Text>
      {!danger && <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />}
    </Pressable>
  );
}

type IconName = keyof typeof Ionicons.glyphMap;

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 20,
    paddingBottom: 56,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
  },
  rolePill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  card: {
    backgroundColor: "#fff",
    shadowColor: "#9A3412",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: radius.lg,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  group: {
    borderRadius: radius.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
});
