import * as Notifications from "expo-notifications";
import { Stack, router, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SessionProvider, useSession } from "@/lib/auth-context";
import { registerForPush } from "@/lib/push";
import { colors } from "@/lib/theme";

function RootNavigator() {
  const { session, isLoading } = useSession();

  // Oturum açılınca push token'ı kaydet
  useEffect(() => {
    if (session) registerForPush(session.user.id);
  }, [session?.user.id]);

  // Bildirime tıklayınca ilgili sohbete git
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const convId = resp.notification.request.content.data?.conversationId as string | undefined;
      if (convId) router.push(`/chat/${convId}` as Href);
    });
    return () => sub.remove();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
