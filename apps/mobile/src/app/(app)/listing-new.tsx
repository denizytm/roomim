import {
  GENDER_PREFERENCE_OPTIONS,
  LISTING_FEATURES,
  PHOTO_CATEGORIES,
} from "@hoomies/shared/constants";
import { CITIES, districtsFor } from "@hoomies/shared/data/locations";
import {
  listingFormSchema,
  validateCategorizedPhotos,
} from "@hoomies/shared/validation/listing";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";
import { createListing, uploadListingPhoto } from "@/lib/queries";
import { colors } from "@/lib/theme";

type Photo = { path: string; category: string };

function Input(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 11,
          fontSize: 16,
          color: colors.text,
          backgroundColor: "#fff",
        }}
        {...rest}
      />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: active ? 2 : 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.surface : "#fff",
      }}
    >
      <Text style={{ color: active ? colors.primary : colors.text, fontWeight: active ? "700" : "500", fontSize: 13 }}>
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
  const set = (k: keyof typeof f, v: unknown) => setF((p) => ({ ...p, [k]: v }));

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
      Alert.alert("Eksik/hatalı", parsed.error.issues[0]?.message ?? "Formu kontrol et");
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>Yeni ilan</Text>

        {/* Fotoğraflar */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.text }}>Fotoğraflar (her kategori zorunlu)</Text>
          {PHOTO_CATEGORIES.map((cat) => {
            const cphotos = photos.filter((p) => p.category === cat.key);
            return (
              <View key={cat.key} style={{ gap: 8 }}>
                <Text style={{ fontSize: 13, color: colors.text }}>
                  {cat.label}
                  {cphotos.length === 0 ? "  • en az 1" : `  • ${cphotos.length}`}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {cphotos.map((p) => (
                    <Image
                      key={p.path}
                      source={{ uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/${p.path}` }}
                      style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: colors.surface }}
                      contentFit="cover"
                    />
                  ))}
                  <Pressable
                    onPress={() => pickFor(cat.key)}
                    disabled={uploading === cat.key}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: colors.border,
                      borderStyle: "dashed",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {uploading === cat.key ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <Text style={{ fontSize: 26, color: colors.muted }}>＋</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <Input label="Başlık" value={f.title} onChangeText={(v) => set("title", v)} placeholder="3 kişilik evde 1 oda" />
        <Input
          label="Açıklama"
          value={f.description}
          onChangeText={(v) => set("description", v)}
          placeholder="Ev, ortak alanlar, mahalle…"
          multiline
        />

        {/* Şehir / İlçe */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>Şehir</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {CITIES.map((c) => (
              <Chip key={c} label={c} active={f.city === c} onPress={() => setF((p) => ({ ...p, city: c, district: "" }))} />
            ))}
          </View>
        </View>
        {f.city ? (
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>İlçe</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {districts.map((d) => (
                <Chip key={d} label={d} active={f.district === d} onPress={() => set("district", d)} />
              ))}
            </View>
          </View>
        ) : null}
        <Input label="Semt / Mahalle (ops.)" value={f.neighborhood} onChangeText={(v) => set("neighborhood", v)} />

        <Input label="Aylık kira (₺)" value={f.monthlyRent} onChangeText={(v) => set("monthlyRent", v)} keyboardType="numeric" />
        <Input label="Aidat (₺/ay, ops.)" value={f.dues} onChangeText={(v) => set("dues", v)} keyboardType="numeric" />
        <Input label="Depozito (₺, ops.)" value={f.deposit} onChangeText={(v) => set("deposit", v)} keyboardType="numeric" />
        <Input label="Toplam kişi kapasitesi" value={f.capacity} onChangeText={(v) => set("capacity", v)} keyboardType="numeric" />
        <Input label="Şu an dolu kişi" value={f.occupied} onChangeText={(v) => set("occupied", v)} keyboardType="numeric" />
        <Input label="Oda sayısı (ops.)" value={f.totalRooms} onChangeText={(v) => set("totalRooms", v)} keyboardType="numeric" />
        <Input label="Banyo/tuvalet (ops.)" value={f.bathroomCount} onChangeText={(v) => set("bathroomCount", v)} keyboardType="numeric" />

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>Cinsiyet tercihi</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {GENDER_PREFERENCE_OPTIONS.map((o) => (
              <Chip key={o.value} label={o.label} active={f.genderPreference === o.value} onPress={() => set("genderPreference", o.value)} />
            ))}
          </View>
        </View>

        {[
          { k: "furnished", label: "Eşyalı" },
          { k: "petsAllowed", label: "Evcil hayvan kabul" },
          { k: "billsIncluded", label: "Faturalar dahil" },
        ].map((t) => (
          <View key={t.k} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: colors.text, fontSize: 15 }}>{t.label}</Text>
            <Switch
              value={f[t.k as keyof typeof f] as boolean}
              onValueChange={(v) => set(t.k as keyof typeof f, v)}
              trackColor={{ true: colors.primary }}
            />
          </View>
        ))}

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>Özellikler</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {LISTING_FEATURES.map((feat) => (
              <Chip key={feat.value} label={feat.label} active={f.features.includes(feat.value)} onPress={() => toggleFeature(feat.value)} />
            ))}
          </View>
        </View>

        <Pressable
          onPress={submit}
          disabled={saving}
          style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: "center", opacity: saving ? 0.6 : 1, marginTop: 4 }}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>İlanı yayınla</Text>}
        </Pressable>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
