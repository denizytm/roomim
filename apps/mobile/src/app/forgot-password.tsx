import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn, Field } from "@/components/form";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const mail = email.trim().toLowerCase();
    if (!mail) {
      Alert.alert("E-posta gerekli", "Lütfen e-posta adresini gir.");
      return;
    }
    setLoading(true);
    // Sıfırlama bağlantısı web'deki reset sayfasını açar; kullanıcı orada yeni
    // şifresini belirleyip mobil uygulamaya yeni şifresiyle girer.
    const { error } = await supabase.auth.resetPasswordForEmail(mail, {
      redirectTo: "https://roomim.com/auth/callback?next=/reset-password",
    });
    setLoading(false);
    if (error) {
      Alert.alert("Gönderilemedi", error.message);
      return;
    }
    Alert.alert(
      "E-postanı kontrol et",
      "Bu e-posta ile bir hesap varsa, şifre sıfırlama bağlantısı gönderdik. Bağlantıya tıklayıp yeni şifreni belirle, sonra tekrar giriş yap.",
      [{ text: "Tamam", onPress: () => router.replace("/sign-in") }],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 16, flexGrow: 1, justifyContent: "center" }}
        >
          <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>
            Şifreni sıfırla
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: -8 }}>
            Hesabının e-posta adresini gir; sana bir sıfırlama bağlantısı gönderelim.
          </Text>

          <Field
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ad.soyad@metu.edu.tr"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Btn title="Sıfırlama bağlantısı gönder" onPress={submit} loading={loading} />

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 4 }}>
            <Text style={{ color: colors.muted }}>Şifreni hatırladın mı?</Text>
            <Link href="/sign-in" style={{ color: colors.primary, fontWeight: "700" }}>
              Giriş yap
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
