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
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text style={{ color: colors.muted, lineHeight: 20 }}>
          Bir sorun mu yaşıyorsun ya da bildirmek istediğin bir şey mi var? Aşağıya yaz, ekibimiz
          inceleyip sana dönsün.
        </Text>
        <Field
          label="Talebin / şikayetin"
          value={reason}
          onChangeText={setReason}
          placeholder="Sorununu veya talebini açıkla…"
          multiline
          numberOfLines={6}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
            backgroundColor: "#fff",
            minHeight: 140,
            textAlignVertical: "top",
          }}
        />
        <View style={{ height: 4 }} />
        <Btn title="Gönder" onPress={submit} loading={busy} disabled={reason.trim().length < 5} />
      </ScrollView>
    </SafeAreaView>
  );
}
