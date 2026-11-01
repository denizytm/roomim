import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Field } from "@/components/form";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ alignItems: "center" }}>
              <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
              <Text style={{ fontSize: 40, fontWeight: "900", color: colors.primary, letterSpacing: -1.5 }}>
                roomim<Text style={{ color: colors.text }}>.</Text>
              </Text>
              <Text style={{ fontSize: 15, lineHeight: 21, color: colors.muted, marginTop: 4, textAlign: "center" }}>
                Uyumlu ev arkadaşı, doğrulanmış öğrenciler.
              </Text>
            </View>

            <View style={{ marginTop: 40, gap: 12 }}>
              <Field
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="Üniversite e-postası"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="username"
                autoComplete="email"
              />
              <Field
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Şifre"
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="password"
                right={
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.muted}
                    />
                  </Pressable>
                }
              />
            </View>

            <View style={{ alignItems: "flex-end", marginTop: 12 }}>
              <Link
                href={"/forgot-password" as Href}
                style={{ color: colors.primary, fontWeight: "600", fontSize: 14 }}
              >
                Şifremi unuttum
              </Link>
            </View>

            <Pressable
              onPress={signIn}
              disabled={loading}
              style={({ pressed }) => [styles.cta, { opacity: loading ? 0.6 : pressed ? 0.85 : 1 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Giriş yap</Text>
              )}
            </Pressable>

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 24 }}>
              <Text style={{ color: colors.muted, fontSize: 15 }}>Hesabın yok mu?</Text>
              <Link href="/sign-up" style={{ color: colors.primary, fontWeight: "700", fontSize: 15 }}>
                Kayıt ol
              </Link>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    marginBottom: 16,
  },
  cta: {
    marginTop: 24,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
