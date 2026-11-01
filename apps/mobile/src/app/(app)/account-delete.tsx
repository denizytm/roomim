import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn, Field } from "@/components/form";
import { useSession } from "@/lib/auth-context";
import { deleteOwnAccount } from "@/lib/queries";
import { colors } from "@/lib/theme";

const CONFIRM_WORD = "SİL";

const REMOVED = [
  "Profilin, üniversite bilgin ve rozetlerin",
  "Yayındaki tüm ilanların ve fotoğrafları",
  "Tüm sohbetlerin ve gönderdiğin mesajlar",
  "Uyum soruları cevapların ve puanların",
];

export default function AccountDeleteScreen() {
  const { signOut } = useSession();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const canDelete = confirm.trim().toLocaleUpperCase("tr-TR") === CONFIRM_WORD;

  function askDelete() {
    Alert.alert(
      "Hesabın kalıcı olarak silinsin mi?",
      "Bu işlem geri alınamaz. Verilerin sunucularımızdan tamamen kaldırılır.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Hesabımı sil",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await deleteOwnAccount();
              // Hesap gitti; elimizdeki oturum artık geçersiz — yerel olarak da temizle.
              await signOut();
            } catch (e) {
              setBusy(false);
              Alert.alert("Hata", e instanceof Error ? e.message : "Hesap silinemedi");
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", gap: 8, paddingTop: 4 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="warning-outline" size={32} color={colors.danger} />
          </View>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "center" }}>
            Bu işlem geri alınamaz
          </Text>
          <Text style={{ color: colors.muted, fontSize: 15, textAlign: "center" }}>
            Hesabını silersen şunlar kalıcı olarak silinir:
          </Text>
        </View>

        <View style={{ gap: 12, borderRadius: 20, padding: 16, backgroundColor: colors.field }}>
          {REMOVED.map((item) => (
            <View key={item} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Ionicons name="close-circle" size={18} color={colors.danger} style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, color: colors.text, fontSize: 15, lineHeight: 21 }}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={{ color: colors.muted, lineHeight: 20 }}>
          Aynı e-posta ile daha sonra yeniden kayıt olabilirsin, ancak silinen veriler geri
          getirilemez.
        </Text>

        <Field
          label={`Onaylamak için "${CONFIRM_WORD}" yaz`}
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={CONFIRM_WORD}
        />

        <Btn
          title="Hesabımı kalıcı olarak sil"
          icon="trash-outline"
          variant="danger"
          onPress={askDelete}
          disabled={!canDelete}
          loading={busy}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
