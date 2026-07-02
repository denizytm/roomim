import { CITIES, districtsFor } from "@hoomies/shared/data/locations";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ListingCard } from "@/components/listing-card";
import { searchListings, type ListingCard as ListingCardData } from "@/lib/queries";
import { colors } from "@/lib/theme";

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary : "#fff",
      }}
    >
      <Text style={{ color: active ? "#fff" : colors.text, fontWeight: "600", fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function SearchScreen() {
  const [city, setCity] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [minAvailable, setMinAvailable] = useState<number | null>(null);
  const [pets, setPets] = useState(false);
  const [results, setResults] = useState<ListingCardData[] | null>(null);
  const [loading, setLoading] = useState(false);

  const districts = useMemo(() => (city ? districtsFor(city) : []), [city]);

  async function run() {
    setLoading(true);
    try {
      const data = await searchListings({
        city,
        district,
        minRent: minRent ? Number(minRent) : null,
        maxRent: maxRent ? Number(maxRent) : null,
        minAvailable,
        pets: pets ? true : null,
      });
      setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  // İlk açılışta tüm aktif ilanları getir (senkron setState tetiklemeden).
  useEffect(() => {
    let alive = true;
    searchListings({})
      .then((data) => alive && setResults(data))
      .catch(() => alive && setResults([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <FlatList
        data={results ?? []}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>Şehir</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Chip label="Tümü" active={!city} onPress={() => { setCity(null); setDistrict(null); }} />
              {CITIES.map((c) => (
                <Chip key={c} label={c} active={city === c} onPress={() => { setCity(c); setDistrict(null); }} />
              ))}
            </ScrollView>

            {city && districts.length > 0 && (
              <>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>İlçe</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <Chip label="Tümü" active={!district} onPress={() => setDistrict(null)} />
                  {districts.map((d) => (
                    <Chip key={d} label={d} active={district === d} onPress={() => setDistrict(d)} />
                  ))}
                </ScrollView>
              </>
            )}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>Min. kira ₺</Text>
                <TextInput
                  value={minRent}
                  onChangeText={(v) => setMinRent(v.replace(/\D/g, ""))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  style={inputStyle}
                />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>Maks. kira ₺</Text>
                <TextInput
                  value={maxRent}
                  onChangeText={(v) => setMaxRent(v.replace(/\D/g, ""))}
                  keyboardType="numeric"
                  placeholder="∞"
                  placeholderTextColor={colors.muted}
                  style={inputStyle}
                />
              </View>
            </View>

            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>Müsait kişi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Chip label="Farketmez" active={minAvailable == null} onPress={() => setMinAvailable(null)} />
              {[1, 2, 3].map((n) => (
                <Chip key={n} label={`${n}+ kişi`} active={minAvailable === n} onPress={() => setMinAvailable(n)} />
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Chip label="🐾 Evcil hayvan" active={pets} onPress={() => setPets((p) => !p)} />
            </View>

            <Pressable
              onPress={run}
              style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 4 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Ara</Text>
            </Pressable>

            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
              {loading ? "Aranıyor…" : `${results?.length ?? 0} ilan`}
            </Text>
          </View>
        }
        renderItem={({ item }) => <ListingCard item={item} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <Text style={{ textAlign: "center", color: colors.muted, marginTop: 20 }}>
              Kriterlere uygun ilan yok.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 11,
  fontSize: 15,
  color: colors.text,
  backgroundColor: "#fff",
} as const;
