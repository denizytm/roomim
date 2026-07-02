import { ROLE_LABELS } from "@hoomies/shared/constants";
import { computeBadges } from "@hoomies/shared/loyalty";
import type { Profile, UserRole } from "@hoomies/shared/types/database.types";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn } from "@/components/form";
import { useSession } from "@/lib/auth-context";
import { createReport, getProfileFull } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";
import { colors } from "@/lib/theme";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [university, setUniversity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProfileFull(id)
      .then(({ profile, university }) => {
        setProfile(profile);
        setUniversity(university);
      })
      .finally(() => setLoading(false));
  }, [id]);

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
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
        <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={{ width: 96, height: 96 }} contentFit="cover" />
            ) : (
              <Text style={{ fontSize: 32, fontWeight: "800", color: colors.primary }}>{initials || "?"}</Text>
            )}
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
            {profile.full_name ?? "İsimsiz"}
          </Text>
          {profile.role && (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>
                {ROLE_LABELS[profile.role as UserRole]}
              </Text>
            </View>
          )}
          <Text style={{ color: colors.muted, textAlign: "center" }}>
            {[university, profile.department, gradYear && `${gradYear} mezuniyet`]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          {profile.bio ? (
            <Text style={{ color: colors.text, textAlign: "center", marginTop: 4, lineHeight: 20 }}>
              {profile.bio}
            </Text>
          ) : null}
        </View>

        {/* Rozetler */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "700", color: colors.text }}>Rozetler</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges.map((b) => (
              <View
                key={b.key}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: b.earned ? colors.primary : colors.border,
                  backgroundColor: b.earned ? colors.surface : "#fff",
                  opacity: b.earned ? 1 : 0.5,
                }}
              >
                <Text style={{ color: b.earned ? colors.primary : colors.muted, fontWeight: "600", fontSize: 13 }}>
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {!isMe && (
          <>
            <View style={{ height: 4 }} />
            <Btn title="Şikayet et" onPress={report} variant="outline" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
