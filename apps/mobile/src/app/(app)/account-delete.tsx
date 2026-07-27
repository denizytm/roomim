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
        <Text style={{ color: colors.text, fontSize: 16, lineHeight: 22 }}>
          Hesabını silmek kalıcıdır ve geri alınamaz. Silinecekler:
        </Text>

        <View
          style={{
            gap: 10,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 16,
            backgroundColor: "#fff",
          }}
        >
          {REMOVED.map((item) => (
            <Text key={item} style={{ color: colors.text, lineHeight: 20 }}>
              •  {item}
            </Text>
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
          onPress={askDelete}
          disabled={!canDelete}
          loading={busy}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
