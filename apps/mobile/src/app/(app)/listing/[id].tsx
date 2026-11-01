import { Ionicons } from "@expo/vector-icons";
import { FEATURE_LABELS, GENDER_PREFERENCE_LABELS } from "@roomim/shared/constants";
import { formatDate, formatRent } from "@roomim/shared/format";
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
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn } from "@/components/form";
import { useSession } from "@/lib/auth-context";
import { getListingDetail, likeListing, type ListingDetail } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";
import { colors, radius } from "@/lib/theme";

const W = Dimensions.get("window").width;

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const meId = session?.user.id;
  const [item, setItem] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

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
  const tiles = [
    { icon: "people-outline", value: `${available}/${item.capacity}`, label: "Müsait kişi" },
    item.total_rooms ? { icon: "bed-outline", value: String(item.total_rooms), label: "Oda" } : null,
    item.bathroom_count != null ? { icon: "water-outline", value: String(item.bathroom_count), label: "Banyo" } : null,
    item.available_from
      ? { icon: "calendar-outline", value: formatDate(item.available_from), label: "Müsaitlik" }
      : null,
  ].filter(Boolean) as { icon: IconName; value: string; label: string }[];

  const costs = [
    item.deposit ? { label: "Depozito", value: formatRent(item.deposit) } : null,
    item.dues ? { label: "Aidat", value: `${formatRent(item.dues)}/ay` } : null,
    { label: "Faturalar", value: item.bills_included ? "Kiraya dahil" : "Hariç" },
  ].filter(Boolean) as { label: string; value: string }[];

  const chips = [
    item.furnished ? { icon: "cube-outline", text: "Eşyalı" } : null,
    item.pets_allowed ? { icon: "paw-outline", text: "Evcil hayvan kabul" } : null,
    {
      icon: "person-outline",
      text: GENDER_PREFERENCE_LABELS[item.gender_preference] ?? item.gender_preference,
    },
  ].filter(Boolean) as { icon: IconName; text: string }[];

  const ownerAvatar = item.owner ? publicImageUrl("avatars", item.owner.avatar_url) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Fotoğraflar */}
        {item.photoUrls.length > 0 ? (
          <View>
            <FlatList
              data={item.photoUrls}
              keyExtractor={(u, i) => `${i}-${u}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / W))}
              renderItem={({ item: uri }) => (
                <Image source={{ uri }} style={{ width: W, height: 280 }} contentFit="cover" />
              )}
            />
            {item.photoUrls.length > 1 && (
              <View style={styles.photoCounter}>
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                  {photoIndex + 1} / {item.photoUrls.length}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={{ width: W, height: 200, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="home-outline" size={48} color={colors.primary} />
          </View>
        )}

        <View style={{ padding: 20, gap: 24 }}>
          {/* Başlık + fiyat */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 24, lineHeight: 30, fontWeight: "800", color: colors.text }}>{item.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="location-outline" size={16} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 15, flex: 1 }} numberOfLines={1}>
                {item.neighborhood ? `${item.neighborhood}, ` : ""}
                {item.district}, {item.city}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>
                {formatRent(item.monthly_rent)}
                <Text style={{ fontSize: 15, fontWeight: "500", color: colors.muted }}> /ay</Text>
              </Text>
              {item.score != null && (
                <View style={styles.scorePill}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "800" }}>%{item.score} uyum</Text>
                </View>
              )}
            </View>
          </View>

          {/* Hızlı bilgiler */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {tiles.map((t) => (
              <View key={t.label} style={styles.tile}>
                <Ionicons name={t.icon} size={20} color={colors.primary} />
                <Text style={{ fontWeight: "800", color: colors.text, fontSize: 15 }} numberOfLines={1} adjustsFontSizeToFit>
                  {t.value}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{t.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {chips.map((c) => (
              <View key={c.text} style={styles.chip}>
                <Ionicons name={c.icon} size={14} color={colors.text} />
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>{c.text}</Text>
              </View>
            ))}
          </View>

          {item.description ? (
            <Section title="Açıklama">
              <Text style={{ color: colors.text, fontSize: 15, lineHeight: 23 }}>{item.description}</Text>
            </Section>
          ) : null}

          <Section title="Ücretler">
            <View style={styles.group}>
              {costs.map((c, i) => (
                <View
                  key={c.label}
                  style={[
                    styles.costRow,
                    i < costs.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={{ color: colors.muted, fontSize: 15 }}>{c.label}</Text>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>{c.value}</Text>
                </View>
              ))}
            </View>
          </Section>

          {item.features.length > 0 && (
            <Section title="Özellikler">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {item.features.map((f) => (
                  <View key={f} style={styles.chip}>
                    <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: "500" }}>{FEATURE_LABELS[f] ?? f}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* İlan sahibi */}
          {item.owner && (
            <Section title="İlan sahibi">
              <Pressable
                onPress={() => router.push(`/user/${item.owner!.id}` as Href)}
                style={({ pressed }) => [styles.owner, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.ownerAvatar}>
                  {ownerAvatar ? (
                    <Image source={{ uri: ownerAvatar }} style={{ width: 48, height: 48 }} contentFit="cover" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
                      {(item.owner.full_name ?? "?").slice(0, 1).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: colors.text, fontSize: 16 }}>
                    {item.owner.full_name ?? "Ev sahibi"}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 13 }} numberOfLines={1}>
                    {[item.owner.university, item.owner.department].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
              </Pressable>
            </Section>
          )}
        </View>
      </ScrollView>

      {/* Sabit aksiyon çubuğu */}
      <View style={styles.actionBar}>
        {item.isOwner ? (
          <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 16 }}>Bu senin ilanın.</Text>
        ) : item.conversationId ? (
          <Btn
            title="Sohbete git"
            icon="chatbubble-ellipses-outline"
            onPress={() => router.push(`/chat/${item.conversationId}` as Href)}
          />
        ) : (
          <Btn title="İlgileniyorum" icon="heart" onPress={interested} loading={busy} />
        )}
      </View>
    </SafeAreaView>
  );
}

type IconName = keyof typeof Ionicons.glyphMap;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  photoCounter: {
    position: "absolute",
    right: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    backgroundColor: colors.field,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.field,
  },
  group: {
    borderRadius: radius.md,
    backgroundColor: colors.field,
    overflow: "hidden",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  owner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.field,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
