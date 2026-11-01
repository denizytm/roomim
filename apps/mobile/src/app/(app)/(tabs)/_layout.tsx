import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useSession } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function TabsLayout() {
  const { profile } = useSession();
  const isHost = profile?.role === "host";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.bg },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "albums" : "albums-outline"} size={size} color={color} />
          ),
        }}
      />
      {/* İlan veren → İlanlarım; ev arayan → Beğendiklerim (rol'e göre biri gizlenir) */}
      <Tabs.Screen
        name="listings"
        options={{
          title: "İlanlarım",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
          href: isHost ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="liked"
        options={{
          title: "Beğendiklerim",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />
          ),
          href: isHost ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Eşleşmeler",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
