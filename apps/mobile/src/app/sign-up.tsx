import { TERMS_VERSION } from "@roomim/shared/constants";
import { emailDomain, registerSchema } from "@roomim/shared/validation/auth";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn, Field } from "@/components/form";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    // Rol artık kayıtta seçilmiyor; giriş sonrası "Nasıl kullanacaksın?" adımında belirleniyor.
    const parsed = registerSchema.safeParse({
      fullName,
      email,
      password,
      referralCode: "",
    });
    if (!parsed.success) {
      Alert.alert("Hata", parsed.error.issues[0]?.message ?? "Form geçersiz");
      return;
    }
    if (password !== password2) {
      Alert.alert("Şifreler eşleşmiyor", "Aynı şifreyi iki kez gir.");
      return;
    }
    if (!agreed) {
      Alert.alert(
        "Onay gerekli",
        "Devam etmek için Kullanıcı Sözleşmesi, Gizlilik Politikası ve KVKK Aydınlatma Metni'ni kabul etmelisin.",
      );
      return;
    }
    setLoading(true);
    const domain = emailDomain(parsed.data.email);
    if (!domain || !domain.endsWith(".edu.tr")) {
      setLoading(false);
      Alert.alert("Edu-mail gerekli", "Sadece üniversite (.edu.tr) e-postasıyla kayıt olabilirsin.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: fullName,
          terms_version: TERMS_VERSION,
          marketing_consent: marketing,
        },
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Kayıt başarısız", error.message);
      return;
    }
    // Zaten kayıtlı (onaylanmış) e-posta: Supabase boş identities döner.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      Alert.alert("Hesap zaten var", "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.");
      return;
    }
    Alert.alert(
      "E-postanı kontrol et",
      "Hesabını etkinleştirmek için gönderdiğimiz onay bağlantısına tıkla, sonra giriş yap.",
      [{ text: "Tamam", onPress: () => router.replace("/sign-in") }],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16, flexGrow: 1, justifyContent: "center" }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>Kayıt ol</Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: -8 }}>
            Üniversite (edu) e-postanla Roomim topluluğuna katıl.
          </Text>

          <Field label="Ad Soyad" value={fullName} onChangeText={setFullName} placeholder="Deniz Yılmaz" />
          <Field
            label="Üniversite e-postası"
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
            placeholder="En az 8 karakter"
            secureTextEntry
          />
          <Field
            label="Şifre (tekrar)"
            value={password2}
            onChangeText={setPassword2}
            placeholder="Şifreni tekrar gir"
            secureTextEntry
          />

          <View style={{ gap: 12, marginTop: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <Pressable onPress={() => setAgreed((v) => !v)} hitSlop={8}>
                <CheckBox active={agreed} />
              </Pressable>
              <Text style={{ flex: 1, fontSize: 13, color: colors.muted, lineHeight: 19 }}>
                <Text
                  style={{ color: colors.primary, fontWeight: "700" }}
                  onPress={() => Linking.openURL("https://roomim.com/kosullar")}
                >
                  Kullanıcı Sözleşmesi
                </Text>
                {", "}
                <Text
                  style={{ color: colors.primary, fontWeight: "700" }}
                  onPress={() => Linking.openURL("https://roomim.com/gizlilik")}
                >
                  Gizlilik Politikası
                </Text>
                {" ve "}
                <Text
                  style={{ color: colors.primary, fontWeight: "700" }}
                  onPress={() => Linking.openURL("https://roomim.com/kvkk")}
                >
                  KVKK Aydınlatma Metni
                </Text>
                {"'ni okudum, kabul ediyorum."}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <Pressable onPress={() => setMarketing((v) => !v)} hitSlop={8}>
                <CheckBox active={marketing} />
              </Pressable>
              <Text style={{ flex: 1, fontSize: 13, color: colors.muted, lineHeight: 19 }}>
                Kampanya ve duyuru e-postaları almak istiyorum. (opsiyonel)
              </Text>
            </View>
          </View>

          <Btn title="Onay maili gönder" onPress={submit} loading={loading} />

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Text style={{ color: colors.muted }}>Zaten hesabın var mı?</Text>
            <Link href="/sign-in" style={{ color: colors.primary, fontWeight: "700" }}>
              Giriş yap
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CheckBox({ active }: { active: boolean }) {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary : "transparent",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
      }}
    >
      {active && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>✓</Text>}
    </View>
  );
}
