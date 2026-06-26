import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";

// Bildirim uygulama açıkken de banner olarak görünsün.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPush(userId: string): Promise<void> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Bildirimler",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return; // EAS projectId yok → token alınamaz (eas init sonrası aktifleşir)

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await supabase.from("profiles").update({ expo_push_token: token }).eq("id", userId);
  } catch {
    // Push kurulamadıysa (emülatör/FCM yok) sessizce geç — uygulama çalışmaya devam eder.
  }
}
