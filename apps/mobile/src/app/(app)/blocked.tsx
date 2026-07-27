import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";
import { getBlockedUsers, unblockUser, type BlockedUser } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";
import { colors } from "@/lib/theme";
import { useFocusEffect } from "expo-router";

export default function BlockedUsersScreen() {
  const { session } = useSession();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const me = session?.user.id;
      if (!me) return;
      getBlockedUsers(me)
        .then(setUsers)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [session?.user.id]),
  );

  function remove(user: BlockedUser) {
    const me = session?.user.id;
    if (!me) return;
    setBusyId(user.id);
    unblockUser(me, user.id)
      .then(() => setUsers((prev) => prev.filter((u) => u.id !== user.id)))
      .catch((e) => Alert.alert("Hata", e instanceof Error ? e.message : "İşlem başarısız"))
      .finally(() => setBusyId(null));
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        ListEmptyComponent={
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 40 }}>
            Engellediğin kimse yok.
          </Text>
        }
        ListHeaderComponent={
          users.length > 0 ? (
            <Text style={{ color: colors.muted, marginBottom: 4, lineHeight: 20 }}>
              Engellediğin kişilerin ilanlarını ve mesajlarını görmezsin, size mesaj gönderemezler.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const avatar = publicImageUrl("avatars", item.avatar_url);
          const initials = (item.full_name ?? "?")
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? "")
            .join("");

          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 14,
                backgroundColor: "#fff",
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {avatar ? (
                  <Image source={{ uri: avatar }} style={{ width: 44, height: 44 }} contentFit="cover" />
                ) : (
                  <Text style={{ fontWeight: "800", color: colors.primary }}>{initials || "?"}</Text>
                )}
              </View>

              <Text style={{ flex: 1, color: colors.text, fontWeight: "600" }}>
                {item.full_name ?? "İsimsiz"}
              </Text>

              <Pressable
                onPress={() => remove(item)}
                disabled={busyId === item.id}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: busyId === item.id ? 0.6 : pressed ? 0.85 : 1,
                })}
              >
                {busyId === item.id ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>Kaldır</Text>
                )}
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
