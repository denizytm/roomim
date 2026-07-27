import { Link } from "expo-router";
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

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const mail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
    setLoading(false);
    if (!error) return;

    // E-posta doğrulanmamış: giriş hatası değil — doğrula + tekrar gönder uyarısı.
    if (error.code === "email_not_confirmed" || /not confirmed/i.test(error.message)) {
      Alert.alert(
        "Önce e-postanı doğrula",
        "Hesabın henüz doğrulanmamış. E-postana gönderdiğimiz bağlantıya tıkla, sonra tekrar giriş yap.",
        [
          {
            text: "Doğrulama mailini tekrar gönder",
            onPress: async () => {
              const { error: rErr } = await supabase.auth.resend({ type: "signup", email: mail });
              Alert.alert(
                rErr ? "Gönderilemedi" : "Gönderildi",
                rErr
                  ? rErr.message
                  : "Doğrulama maili tekrar gönderildi. Spam/gereksiz klasörünü de kontrol et.",
              );
            },
          },
          { text: "Tamam", style: "cancel" },
        ],
      );
      return;
    }
    Alert.alert("Giriş başarısız", "E-posta veya şifre hatalı.");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 24, gap: 18, flexGrow: 1, justifyContent: "center" }}>
          <View style={{ gap: 6, marginBottom: 8 }}>
            <Text style={{ fontSize: 30, fontWeight: "800", color: colors.primary }}>Roomim</Text>
            <Text style={{ color: colors.muted }}>Üniversiteli ev arkadaşı eşleşmesi</Text>
          </View>

          <Field
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ad.soyad@metu.edu.tr"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <Field
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Btn title="Giriş yap" onPress={signIn} loading={loading} />

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 4 }}>
            <Text style={{ color: colors.muted }}>Hesabın yok mu?</Text>
            <Link href="/sign-up" style={{ color: colors.primary, fontWeight: "700" }}>
              Kayıt ol
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
