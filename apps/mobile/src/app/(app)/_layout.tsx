import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { RealtimeNotifications } from "@/components/realtime-notifications";
import { useSession } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function AppLayout() {
  const { profile, isLoading } = useSession();

  if (isLoading || profile === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const onboarded = profile.onboarding_completed;

  return (
    <>
      {onboarded && <RealtimeNotifications />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[id]"
          options={{ headerShown: true, title: "Sohbet", headerTintColor: colors.text }}
        />
        <Stack.Screen
          name="listing-new"
          options={{ headerShown: true, title: "Yeni ilan", headerTintColor: colors.text }}
        />
        <Stack.Screen
          name="compat-edit"
          options={{ headerShown: true, title: "Uyum soruları", headerTintColor: colors.text }}
        />
        <Stack.Screen
          name="support"
          options={{ headerShown: true, title: "Destek / Şikayet", headerTintColor: colors.text }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{ headerShown: true, title: "Profil", headerTintColor: colors.text }}
        />
        <Stack.Screen
          name="listing/[id]"
          options={{ headerShown: true, title: "İlan", headerTintColor: colors.text }}
        />
        <Stack.Screen
          name="search"
          options={{ headerShown: true, title: "İlan ara", headerTintColor: colors.text }}
        />
        <Stack.Screen
          name="liked"
          options={{ headerShown: true, title: "Beğendiklerim", headerTintColor: colors.text }}
        />
      </Stack.Protected>
      </Stack>
    </>
  );
}
