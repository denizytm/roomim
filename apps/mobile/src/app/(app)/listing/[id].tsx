import { FEATURE_LABELS, GENDER_PREFERENCE_LABELS } from "@hoomies/shared/constants";
import { formatDate, formatRent } from "@hoomies/shared/format";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn } from "@/components/form";
import { useSession } from "@/lib/auth-context";
import { getListingDetail, likeListing, type ListingDetail } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";
import { colors } from "@/lib/theme";

const W = Dimensions.get("window").width;

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const meId = session?.user.id;
  const [item, setItem] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!id || !meId) return;
    getListingDetail(id, meId)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id, meId]);

  useFocusEffect(load);

  async function interested() {
    if (!item || !meId || !item.owner) return;
    setBusy(true);
    try {
      await likeListing(meId, { id: item.id, owner_id: item.owner.id });
      const fresh = await getListingDetail(item.id, meId);
      setItem(fresh);
      if (fresh?.conversationId) router.push(`/chat/${fresh.conversationId}` as Href);
    } catch (e) {
      Alert.alert("Hata", e instanceof Error ? e.message : "İşlem başarısız");
    }
    setBusy(false);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <Text style={{ color: colors.muted }}>İlan bulunamadı.</Text>
      </View>
    );
  }

  const available = Math.max(item.capacity - item.occupied, 0);
  const facts = [
    item.total_rooms ? `${item.total_rooms} odalı ev` : null,
    item.bathroom_count != null ? `${item.bathroom_count} banyo/tuvalet` : null,
    item.deposit ? `${formatRent(item.deposit)} depozito` : null,
    item.dues ? `${formatRent(item.dues)} aidat/ay` : null,
    item.available_from ? `${formatDate(item.available_from)} müsait` : null,
  ].filter(Boolean) as string[];

  const chips = [
    item.furnished ? "🛋️ Eşyalı" : null,
    item.pets_allowed ? "🐾 Evcil hayvan kabul" : null,
    `👥 ${GENDER_PREFERENCE_LABELS[item.gender_preference] ?? item.gender_preference}`,
  ].filter(Boolean) as string[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Fotoğraflar */}
        {item.photoUrls.length > 0 ? (
          <FlatList
            data={item.photoUrls}
            keyExtractor={(u, i) => `${i}-${u}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: uri }) => (
              <Image source={{ uri }} style={{ width: W, height: 260 }} contentFit="cover" />
            )}
          />
        ) : (
          <View style={{ width: W, height: 200, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 40 }}>🏠</Text>
          </View>
        )}

        <View style={{ padding: 20, gap: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>{item.title}</Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>
                📍 {item.neighborhood ? `${item.neighborhood}, ` : ""}
                {item.district}, {item.city}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: colors.primary }}>
                {formatRent(item.monthly_rent)}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                /ay{item.bills_included ? " · faturalar dahil" : ""}
              </Text>
            </View>
          </View>

          {item.score != null && (
            <View style={{ alignSelf: "flex-start", backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
              <Text style={{ color: colors.primary, fontWeight: "800" }}>%{item.score} uyum</Text>
            </View>
          )}

          <Text style={{ color: colors.text }}>
            {available} müsait / {item.capacity} kişilik
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {chips.map((c) => (
              <View key={c} style={{ backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 }}>
                <Text style={{ color: colors.text, fontSize: 13 }}>{c}</Text>
              </View>
            ))}
          </View>

          {facts.length > 0 && (
            <View style={{ gap: 6 }}>
              {facts.map((f) => (
                <Text key={f} style={{ color: colors.text }}>• {f}</Text>
              ))}
            </View>
          )}

          {item.description ? (
            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "700", color: colors.text }}>Açıklama</Text>
              <Text style={{ color: colors.muted, lineHeight: 21 }}>{item.description}</Text>
            </View>
          ) : null}

          {item.features.length > 0 && (
            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "700", color: colors.text }}>Özellikler</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {item.features.map((f) => (
                  <Text key={f} style={{ color: colors.text, fontSize: 13 }}>
                    ✓ {FEATURE_LABELS[f] ?? f}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* İlan sahibi */}
          {item.owner && (
            <Pressable
              onPress={() => router.push(`/user/${item.owner!.id}` as Href)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 14,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {publicImageUrl("avatars", item.owner.avatar_url) ? (
                  <Image source={{ uri: publicImageUrl("avatars", item.owner.avatar_url)! }} style={{ width: 44, height: 44 }} contentFit="cover" />
                ) : (
                  <Text style={{ color: colors.primary, fontWeight: "800" }}>
                    {(item.owner.full_name ?? "?").slice(0, 1).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: colors.text }}>
                  {item.owner.full_name ?? "Ev sahibi"}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                  {[item.owner.university, item.owner.department].filter(Boolean).join(" · ")}
                </Text>
              </View>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Profili gör ›</Text>
            </Pressable>
          )}

          {/* Aksiyon */}
          {item.isOwner ? (
            <Text style={{ color: colors.muted, textAlign: "center" }}>Bu senin ilanın.</Text>
          ) : item.conversationId ? (
            <Btn title="Sohbete git" onPress={() => router.push(`/chat/${item.conversationId}` as Href)} />
          ) : (
            <Btn title="İlgileniyorum" onPress={interested} loading={busy} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
