import { Ionicons } from "@expo/vector-icons";
import { ROLE_LABELS } from "@roomim/shared/constants";
import { computeBadges } from "@roomim/shared/loyalty";
import type { Profile, UserRole } from "@roomim/shared/types/database.types";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BadgeList } from "@/components/badge-list";
import { Btn } from "@/components/form";
import { useSession } from "@/lib/auth-context";
import { blockUser, createReport, getProfileFull, isUserBlocked, unblockUser } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";
import { colors, radius } from "@/lib/theme";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [university, setUniversity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProfileFull(id)
      .then(({ profile, university }) => {
        setProfile(profile);
        setUniversity(university);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const me = session?.user.id;
    if (!id || !me || me === id) return;
    isUserBlocked(me, id)
      .then(setBlocked)
      .catch(() => {});
  }, [id, session?.user.id]);

  async function report() {
    if (!session || !profile) return;
    Alert.alert("Kullanıcıyı şikayet et", "Bu kullanıcıyı ekibimize bildirmek istiyor musun?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Şikayet et",
        style: "destructive",
        onPress: async () => {
          try {
            await createReport(session.user.id, "Profil şikayeti", { reportedUserId: profile.id });
            Alert.alert("Alındı", "Şikayetin bize ulaştı. 48 saat içinde incelenir.");
          } catch (e) {
            Alert.alert("Hata", e instanceof Error ? e.message : "Gönderilemedi");
          }
        },
      },
    ]);
  }

  function toggleBlock() {
    const me = session?.user.id;
    if (!me || !profile) return;

    if (blocked) {
      setBlockBusy(true);
      unblockUser(me, profile.id)
        .then(() => setBlocked(false))
        .catch((e) => Alert.alert("Hata", e instanceof Error ? e.message : "İşlem başarısız"))
        .finally(() => setBlockBusy(false));
      return;
    }

    Alert.alert(
      "Kullanıcıyı engelle",
      "Engellediğinde birbirinizin ilanlarını ve mesajlarını göremezsiniz, yeni mesaj gönderilemez. İstediğin zaman kaldırabilirsin.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Engelle",
          style: "destructive",
          onPress: () => {
            setBlockBusy(true);
            blockUser(me, profile.id)
              .then(() => {
                setBlocked(true);
                router.back();
              })
              .catch((e) => Alert.alert("Hata", e instanceof Error ? e.message : "İşlem başarısız"))
              .finally(() => setBlockBusy(false));
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <Text style={{ color: colors.muted }}>Profil bulunamadı.</Text>
      </View>
    );
  }

  const badges = computeBadges(profile);
  const avatar = publicImageUrl("avatars", profile.avatar_url);
  const gradYear = profile.graduation_date ? new Date(profile.graduation_date).getFullYear() : null;
  const initials = (profile.full_name ?? "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const isMe = session?.user.id === profile.id;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 24 }}>
        <View style={{ alignItems: "center", gap: 6, paddingTop: 8 }}>
          <View style={styles.avatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={{ width: 96, height: 96 }} contentFit="cover" />
            ) : (
              <Text style={{ fontSize: 32, fontWeight: "800", color: "#fff" }}>{initials || "?"}</Text>
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 6 }}>
            {profile.full_name ?? "İsimsiz"}
          </Text>
          {profile.role && (
            <View style={styles.rolePill}>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>
                {ROLE_LABELS[profile.role as UserRole]}
              </Text>
            </View>
          )}
        </View>

        {/* Bilgiler */}
        {(university || profile.department || gradYear) && (
          <View style={styles.group}>
            {[
              university && { icon: "school-outline" as const, text: university },
              profile.department && { icon: "book-outline" as const, text: profile.department },
              gradYear && { icon: "calendar-outline" as const, text: `${gradYear} mezuniyet` },
            ]
              .filter((x): x is { icon: "school-outline" | "book-outline" | "calendar-outline"; text: string } => !!x)
              .map((r, i, arr) => (
                <View
                  key={r.icon}
                  style={[
                    styles.infoRow,
                    i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <Ionicons name={r.icon} size={18} color={colors.muted} />
                  <Text style={{ flex: 1, color: colors.text, fontSize: 15 }}>{r.text}</Text>
                </View>
              ))}
          </View>
        )}

        {profile.bio ? (
          <View style={{ gap: 10 }}>
            <SectionTitle>Hakkında</SectionTitle>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{profile.bio}</Text>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <SectionTitle>Rozetler</SectionTitle>
          <BadgeList badges={badges} />
        </View>

        {!isMe && (
          <View style={{ gap: 10, marginTop: 8 }}>
            <Btn title="Şikayet et" icon="flag-outline" onPress={report} variant="outline" />
            <Btn
              title={blocked ? "Engeli kaldır" : "Engelle"}
              icon={blocked ? "lock-open-outline" : "ban-outline"}
              onPress={toggleBlock}
              loading={blockBusy}
              variant="danger"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 4,
    borderColor: colors.surface,
  },
  rolePill: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  group: {
    borderRadius: radius.lg,
    backgroundColor: colors.field,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    minHeight: 50,
  },
});
