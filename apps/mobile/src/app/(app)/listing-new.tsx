import { Ionicons } from "@expo/vector-icons";
import {
  GENDER_PREFERENCE_OPTIONS,
  LISTING_FEATURES,
  PHOTO_CATEGORIES,
} from "@roomim/shared/constants";
import { CITIES, districtsFor } from "@roomim/shared/data/locations";
import { neighborhoodsFor } from "@roomim/shared/data/neighborhoods";
import {
  listingFormSchema,
  validateCategorizedPhotos,
} from "@roomim/shared/validation/listing";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";
import { createListing, uploadListingPhoto } from "@/lib/queries";
import { Btn, Field } from "@/components/form";
import { colors, radius } from "@/lib/theme";

type Photo = { path: string; category: string };

function Input(props: React.ComponentProps<typeof Field> & { label: string }) {
  return <Field {...props} />;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: active ? colors.primary : colors.field,
      }}
    >
      <Text style={{ color: active ? "#fff" : colors.text, fontWeight: active ? "700" : "500", fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function NewListing() {
  const { session } = useSession();
  const userId = session?.user.id;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [f, setF] = useState({
    title: "",
    description: "",
    city: "",
    district: "",
    neighborhood: "",
    monthlyRent: "",
    dues: "",
    deposit: "",
    capacity: "3",
    occupied: "0",
    totalRooms: "",
    bathroomCount: "",
    genderPreference: "any" as "any" | "female" | "male",
    furnished: false,
    petsAllowed: false,
    billsIncluded: false,
    features: [] as string[],
  });
  const set = (k: keyof typeof f, v: unknown) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const n = { ...prev };
      delete n[k];
      return n;
    });
  };

  async function pickFor(category: string) {
    if (!userId) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 6,
    });
    if (res.canceled) return;
    setUploading(category);
    for (const asset of res.assets) {
      if (!asset.base64) continue;
      const ext = (asset.uri.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z]/g, "") || "jpg";
      try {
        const path = await uploadListingPhoto(userId, asset.base64, ext);
        setPhotos((p) => [...p, { path, category }]);
      } catch {
        Alert.alert("Hata", "Fotoğraf yüklenemedi.");
      }
    }
    setUploading(null);
  }

  function toggleFeature(v: string) {
    setF((p) => ({
      ...p,
      features: p.features.includes(v) ? p.features.filter((x) => x !== v) : [...p.features, v],
    }));
  }

  async function submit() {
    if (!userId) return;
    const photoErr = validateCategorizedPhotos(photos);
    if (photoErr) {
      Alert.alert("Fotoğraf", photoErr);
      return;
    }
    const parsed = listingFormSchema.safeParse({
      title: f.title,
      description: f.description,
      monthlyRent: f.monthlyRent,
      deposit: f.deposit || undefined,
      dues: f.dues || undefined,
      billsIncluded: f.billsIncluded,
      capacity: f.capacity,
      occupied: f.occupied,
      totalRooms: f.totalRooms || undefined,
      bathroomCount: f.bathroomCount || undefined,
      city: f.city,
      district: f.district,
      neighborhood: f.neighborhood,
      petsAllowed: f.petsAllowed,
      furnished: f.furnished,
      genderPreference: f.genderPreference,
      features: f.features,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      // Sadece hatalı alanları sıfırla; geçerli girdiler korunur.
      setF((prev) => {
        const n = { ...prev };
        for (const key of Object.keys(errs)) {
          if (key in n && typeof n[key as keyof typeof n] === "string") {
            (n as Record<string, unknown>)[key] = "";
          }
        }
        return n;
      });
      Alert.alert("Hatalı alanlar", "Kırmızı ile işaretlenen alanları düzelt.");
      return;
    }
    setSaving(true);
    try {
      await createListing(userId, parsed.data, photos);
      router.back();
    } catch (e) {
      setSaving(false);
      Alert.alert("Hata", e instanceof Error ? e.message : "İlan oluşturulamadı");
    }
  }

  const districts = f.city ? districtsFor(f.city) : [];
  const neighborhoods = f.city && f.district ? neighborhoodsFor(f.city, f.district) : [];
  // Yazılana göre filtrelenmiş mahalle önerileri (tam eşleşme seçiliyse gizle).
  const hoodQuery = f.neighborhood.trim().toLocaleLowerCase("tr");
  const hoodExactSelected =
    !!hoodQuery && neighborhoods.some((n) => n.toLocaleLowerCase("tr") === hoodQuery);
  const hoodSuggestions = hoodExactSelected
    ? []
    : neighborhoods
        .filter((n) => (hoodQuery ? n.toLocaleLowerCase("tr").includes(hoodQuery) : true))
        .slice(0, 30);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
        {/* Fotoğraflar */}
        <View style={{ gap: 12 }}>
          <SectionTitle hint="Her kategoriden en az 1 fotoğraf">Fotoğraflar</SectionTitle>
          {PHOTO_CATEGORIES.map((cat) => {
            const cphotos = photos.filter((p) => p.category === cat.key);
            return (
              <View key={cat.key} style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons
                    name={cphotos.length > 0 ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={cphotos.length > 0 ? "#059669" : colors.placeholder}
                  />
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{cat.label}</Text>
                  {cphotos.length > 0 && <Text style={{ fontSize: 13, color: colors.muted }}>· {cphotos.length}</Text>}
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {cphotos.map((p) => (
                    <Image
                      key={p.path}
                      source={{ uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/${p.path}` }}
                      style={{ width: 76, height: 76, borderRadius: 12, backgroundColor: colors.surface }}
                      contentFit="cover"
                    />
                  ))}
                  <Pressable
                    onPress={() => pickFor(cat.key)}
                    disabled={uploading === cat.key}
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: colors.placeholder,
                      borderStyle: "dashed",
                      backgroundColor: colors.field,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {uploading === cat.key ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <Ionicons name="camera-outline" size={24} color={colors.muted} />
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <SectionTitle>Temel bilgiler</SectionTitle>
        <Input label="Başlık" value={f.title} onChangeText={(v) => set("title", v)} placeholder="3 kişilik evde 1 oda" error={errors.title} />
        <Input
          label="Açıklama"
          value={f.description}
          onChangeText={(v) => set("description", v)}
          placeholder="Ev, ortak alanlar, mahalle…"
          multiline
          style={{ minHeight: 120 }}
          error={errors.description}
        />

        <SectionTitle>Konum</SectionTitle>
        {/* Şehir / İlçe */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: errors.city ? colors.danger : colors.text }}>
            Şehir{errors.city ? ` — ${errors.city}` : ""}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {CITIES.map((c) => (
              <Chip
                key={c}
                label={c}
                active={f.city === c}
                onPress={() => {
                  setF((p) => ({ ...p, city: c, district: "", neighborhood: "" }));
                  setErrors((prev) => ({ ...prev, city: "", district: "" }));
                }}
              />
            ))}
          </View>
        </View>
        {f.city ? (
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: errors.district ? colors.danger : colors.text }}>
              İlçe{errors.district ? ` — ${errors.district}` : ""}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {districts.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  active={f.district === d}
                  onPress={() => {
                    setF((p) => ({ ...p, district: d, neighborhood: "" }));
                    setErrors((prev) => ({ ...prev, district: "" }));
                  }}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* Semt / Mahalle — veri varsa yazarak ara + öneriden seç, yoksa serbest metin */}
        <View style={{ gap: 8 }}>
          <Input
            label="Semt / Mahalle (ops.)"
            value={f.neighborhood}
            onChangeText={(v) => set("neighborhood", v)}
            placeholder={
              !f.district
                ? "Önce ilçe seç"
                : neighborhoods.length > 0
                  ? "Ara veya listeden seç"
                  : "Ör. Çayyolu"
            }
            error={errors.neighborhood}
          />
          {hoodSuggestions.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {hoodSuggestions.map((n) => (
                <Chip key={n} label={n} active={false} onPress={() => set("neighborhood", n)} />
              ))}
            </View>
          ) : null}
        </View>

        <SectionTitle>Ücretler</SectionTitle>
        <Input label="Aylık kira (₺)" value={f.monthlyRent} onChangeText={(v) => set("monthlyRent", v)} keyboardType="numeric" error={errors.monthlyRent} />
        <Row>
          <Input label="Aidat (₺/ay, ops.)" value={f.dues} onChangeText={(v) => set("dues", v)} keyboardType="numeric" error={errors.dues} />
          <Input label="Depozito (₺, ops.)" value={f.deposit} onChangeText={(v) => set("deposit", v)} keyboardType="numeric" error={errors.deposit} />
        </Row>

        <SectionTitle>Ev</SectionTitle>
        <Row>
          <Input label="Kişi kapasitesi" value={f.capacity} onChangeText={(v) => set("capacity", v)} keyboardType="numeric" error={errors.capacity} />
          <Input label="Evde yaşayan" value={f.occupied} onChangeText={(v) => set("occupied", v)} keyboardType="numeric" error={errors.occupied} />
        </Row>
        <Row>
          <Input label="Oda sayısı (ops.)" value={f.totalRooms} onChangeText={(v) => set("totalRooms", v)} keyboardType="numeric" error={errors.totalRooms} />
          <Input label="Banyo (ops.)" value={f.bathroomCount} onChangeText={(v) => set("bathroomCount", v)} keyboardType="numeric" error={errors.bathroomCount} />
        </Row>

        <SectionTitle>Tercihler</SectionTitle>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>Cinsiyet tercihi</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {GENDER_PREFERENCE_OPTIONS.map((o) => (
              <Chip key={o.value} label={o.label} active={f.genderPreference === o.value} onPress={() => set("genderPreference", o.value)} />
            ))}
          </View>
        </View>

        <View style={{ borderRadius: radius.lg, backgroundColor: colors.field, overflow: "hidden" }}>
          {[
            { k: "furnished", label: "Eşyalı", icon: "cube-outline" as const },
            { k: "petsAllowed", label: "Evcil hayvan kabul", icon: "paw-outline" as const },
            { k: "billsIncluded", label: "Faturalar dahil", icon: "flash-outline" as const },
          ].map((t, i) => (
            <View
              key={t.k}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 16,
                minHeight: 56,
                borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
                borderTopColor: colors.border,
              }}
            >
              <Ionicons name={t.icon} size={20} color={colors.muted} />
              <Text style={{ flex: 1, color: colors.text, fontSize: 16 }}>{t.label}</Text>
              <Switch
                value={f[t.k as keyof typeof f] as boolean}
                onValueChange={(v) => set(t.k as keyof typeof f, v)}
                trackColor={{ true: colors.primary }}
              />
            </View>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>Özellikler</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {LISTING_FEATURES.map((feat) => (
              <Chip key={feat.value} label={feat.label} active={f.features.includes(feat.value)} onPress={() => toggleFeature(feat.value)} />
            ))}
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Btn title="İlanı yayınla" icon="checkmark-circle-outline" onPress={submit} loading={saving} />
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={{ gap: 2, marginTop: 4 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>{children}</Text>
      {hint && <Text style={{ fontSize: 13, color: colors.muted }}>{hint}</Text>}
    </View>
  );
}

// İki alanı yan yana dizer.
function Row({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {React.Children.map(children, (c) => (
        <View style={{ flex: 1 }}>{c}</View>
      ))}
    </View>
  );
}
