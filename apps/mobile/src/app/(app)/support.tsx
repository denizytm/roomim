import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn, Field } from "@/components/form";
import { useSession } from "@/lib/auth-context";
import { createReport } from "@/lib/queries";
import { colors } from "@/lib/theme";

export default function SupportScreen() {
  const { session } = useSession();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const text = reason.trim();
    if (!session || text.length < 5) {
      Alert.alert("Eksik", "Lütfen sorununu biraz daha açıkla.");
      return;
    }
    setBusy(true);
    try {
      await createReport(session.user.id, text);
      Alert.alert("Alındı", "Talebin bize ulaştı. 48 saat içinde incelenir.", [
        { text: "Tamam", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Hata", e instanceof Error ? e.message : "Gönderilemedi");
    }
    setBusy(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center", padding: 16, borderRadius: 20, backgroundColor: colors.surface }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="help-buoy-outline" size={22} color={colors.primary} />
          </View>
          <Text style={{ flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 }}>
            Bir sorun mu yaşıyorsun ya da bildirmek istediğin bir şey mi var? Aşağıya yaz, ekibimiz
            inceleyip sana dönsün.
          </Text>
        </View>
        <Field
          label="Talebin / şikayetin"
          value={reason}
          onChangeText={setReason}
          placeholder="Sorununu veya talebini açıkla…"
          multiline
          numberOfLines={6}
          style={{ minHeight: 140 }}
        />
        <Btn title="Gönder" icon="send" onPress={submit} loading={busy} disabled={reason.trim().length < 5} />
      </ScrollView>
    </SafeAreaView>
  );
}
