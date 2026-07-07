import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from "expo-audio";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";
import { publicImageUrl } from "@/lib/storage";
import {
  closeListing,
  getConversationDetail,
  sendMessage,
  setConversationStatus,
  uploadChatAudio,
  uploadChatImage,
  type ChatDetail,
  type ChatMessage,
} from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","😘","😎","🤔","😅",
  "🙌","👍","👎","🙏","👋","🎉","❤️","🔥","✨","🥳",
  "😢","😭","😡","😴","🤝","💯","👏","🙂","😉","🤗",
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const meId = session?.user.id;

  const [detail, setDetail] = useState<ChatDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const load = useCallback(async () => {
    if (!id || !meId) return;
    const d = await getConversationDetail(id, meId);
    setDetail(d);
    setMessages(d?.messages ?? []);
  }, [id, meId]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime
  useEffect(() => {
    if (!id || detail?.status !== "accepted") return;
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const m = payload.new as {
            id: string;
            sender_id: string;
            body: string;
            attachment_url: string | null;
            attachment_type: string | null;
          };
          setMessages((prev) =>
            prev.some((x) => x.id === m.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: m.id,
                    sender_id: m.sender_id,
                    body: m.body,
                    attachmentUrl: m.attachment_url,
                    attachmentType: m.attachment_type,
                  },
                ],
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, detail?.status]);

  async function send() {
    const text = body.trim();
    if (!text || !id || !meId) return;
    setSending(true);
    try {
      await sendMessage(id, meId, text);
      setBody("");
      setShowEmoji(false);
    } catch (e) {
      Alert.alert("Hata", e instanceof Error ? e.message : "Mesaj gönderilemedi");
    }
    setSending(false);
  }

  async function pickImage() {
    if (!id || !meId) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.7,
    });
    if (res.canceled || !res.assets[0]?.base64) return;
    const asset = res.assets[0];
    const ext = (asset.uri.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z]/g, "") || "jpg";
    setUploading(true);
    try {
      const url = await uploadChatImage(meId, asset.base64!, ext);
      await sendMessage(id, meId, "", { url, type: "image" });
    } catch (e) {
      Alert.alert("Hata", e instanceof Error ? e.message : "Görsel gönderilemedi");
    }
    setUploading(false);
  }

  async function toggleRecord() {
    if (!id || !meId) return;
    if (recording) {
      setRecording(false);
      try {
        await recorder.stop();
        const uri = recorder.uri;
        if (!uri) return;
        setUploading(true);
        const url = await uploadChatAudio(meId, uri);
        await sendMessage(id, meId, "", { url, type: "audio" });
      } catch (e) {
        Alert.alert("Hata", e instanceof Error ? e.message : "Ses gönderilemedi");
      }
      setUploading(false);
      return;
    }
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("İzin gerekli", "Sesli mesaj için mikrofon izni ver.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(true);
    } catch (e) {
      Alert.alert("Hata", e instanceof Error ? e.message : "Kayıt başlatılamadı");
    }
  }

  async function changeStatus(next: "accepted" | "declined") {
    if (!id || !meId) return;
    setBusy(true);
    await setConversationStatus(id, next, meId);
    await load();
    setBusy(false);
  }

  async function close() {
    if (!detail?.listingId || !meId) return;
    setBusy(true);
    await closeListing(detail.listingId, meId);
    await load();
    setBusy(false);
  }

  if (!detail) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Pending
  if (detail.status === "pending") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
        <Stack.Screen
          options={{
            headerTitle: () => (
              <ChatHeaderTitle id={detail.otherId} name={detail.otherName} avatar={detail.otherAvatar} />
            ),
          }}
        />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 12 }}>
          {detail.isHost ? (
            <>
              <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text, textAlign: "center" }}>
                {detail.otherName} ilanınla ilgileniyor
              </Text>
              <Text style={{ color: colors.muted, textAlign: "center" }}>
                Onaylarsan mesajlaşma açılır.
              </Text>
              {detail.otherScore != null && (
                <Text style={{ color: colors.primary, fontWeight: "800" }}>%{detail.otherScore} uyum</Text>
              )}
              <CompatList answers={detail.otherAnswers} />
              <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                <Pressable
                  onPress={() => changeStatus("accepted")}
                  disabled={busy}
                  style={{ backgroundColor: colors.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Onayla</Text>
                </Pressable>
                <Pressable
                  onPress={() => changeStatus("declined")}
                  disabled={busy}
                  style={{ borderWidth: 1, borderColor: colors.border, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 }}
                >
                  <Text style={{ color: colors.text, fontWeight: "700" }}>Reddet</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ fontWeight: "700", color: colors.text }}>İsteğin gönderildi</Text>
              <Text style={{ color: colors.muted, textAlign: "center" }}>
                {detail.otherName} onayladığında mesajlaşma açılır.
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (detail.status === "declined") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, padding: 28 }}>
        <Text style={{ color: colors.muted }}>Bu istek reddedildi.</Text>
      </View>
    );
  }

  // Accepted
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerTitle: () => <ChatHeaderTitle id={detail.otherId} name={detail.otherName} avatar={detail.otherAvatar} />,
          headerRight:
            detail.otherAnswers.length > 0
              ? () => (
                  <Pressable onPress={() => setShowProfile((s) => !s)} hitSlop={10}>
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>
                      {showProfile ? "Gizle" : "Detay"}
                    </Text>
                  </Pressable>
                )
              : undefined,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Üst: ilgili ilan + (host) ilanı kapat + uyum profili */}
        <View style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
          {detail.listingId && (
            <Pressable
              onPress={() => router.push(`/listing/${detail.listingId}` as Href)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ fontSize: 16 }}>🏠</Text>
              <Text style={{ flex: 1, color: colors.text, fontWeight: "600" }} numberOfLines={1}>
                {detail.listingTitle ?? "İlan"}
              </Text>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>İlana git ›</Text>
            </Pressable>
          )}
          {detail.isHost && detail.listingStatus !== "closed" && (
            <Pressable onPress={close} disabled={busy} style={{ paddingHorizontal: 10, paddingBottom: 8 }}>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>
                🎉 Anlaştıysanız ilanı kapat
              </Text>
            </Pressable>
          )}
          {showProfile && detail.otherAnswers.length > 0 && (
            <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
              {detail.otherScore != null && (
                <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 4 }}>
                  %{detail.otherScore} uyum
                </Text>
              )}
              <CompatList answers={detail.otherAnswers} />
            </View>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: colors.muted, marginTop: 24 }}>
              Henüz mesaj yok. İlk mesajı sen gönder 👋
            </Text>
          }
          renderItem={({ item }) => {
            const mine = item.sender_id === meId;
            const isImage = item.attachmentType === "image" && item.attachmentUrl;
            const isAudio = item.attachmentType === "audio" && item.attachmentUrl;
            return (
              <View style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "78%" }}>
                {isImage ? (
                  <Image
                    source={{ uri: item.attachmentUrl! }}
                    style={{ width: 200, height: 200, borderRadius: 16 }}
                    contentFit="cover"
                  />
                ) : isAudio ? (
                  <AudioBubble uri={item.attachmentUrl!} mine={mine} />
                ) : (
                  <View
                    style={{
                      backgroundColor: mine ? colors.primary : "#EFEFF2",
                      borderRadius: 16,
                      borderBottomRightRadius: mine ? 4 : 16,
                      borderBottomLeftRadius: mine ? 16 : 4,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                    }}
                  >
                    <Text style={{ color: mine ? "#fff" : colors.text, fontSize: 15 }}>{item.body}</Text>
                  </View>
                )}
              </View>
            );
          }}
        />

        {uploading && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingTop: 6 }}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={{ color: colors.primary, fontSize: 12 }}>Gönderiliyor…</Text>
          </View>
        )}

        {showEmoji && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, paddingHorizontal: 12, paddingVertical: 8 }}
            keyboardShouldPersistTaps="handled"
            style={{ borderTopColor: colors.border, borderTopWidth: 1 }}
          >
            {EMOJIS.map((e) => (
              <Pressable key={e} onPress={() => setBody((b) => b + e)} hitSlop={4}>
                <Text style={{ fontSize: 26 }}>{e}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            padding: 10,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          }}
        >
          <Pressable onPress={() => setShowEmoji((s) => !s)} hitSlop={6} style={{ padding: 4 }}>
            <Ionicons name="happy-outline" size={26} color={showEmoji ? colors.primary : colors.muted} />
          </Pressable>
          <Pressable onPress={pickImage} disabled={uploading} hitSlop={6} style={{ padding: 4 }}>
            <Ionicons name="image-outline" size={26} color={colors.muted} />
          </Pressable>
          <Pressable onPress={toggleRecord} disabled={uploading} hitSlop={6} style={{ padding: 4 }}>
            <Ionicons name={recording ? "stop-circle" : "mic-outline"} size={26} color={recording ? colors.danger : colors.muted} />
          </Pressable>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={recording ? "Kaydediliyor…" : "Mesaj yaz…"}
            placeholderTextColor={colors.muted}
            editable={!recording}
            onFocus={() => setShowEmoji(false)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              color: colors.text,
            }}
          />
          <Pressable
            onPress={send}
            disabled={sending || !body.trim()}
            style={{
              backgroundColor: colors.primary,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              opacity: sending || !body.trim() ? 0.5 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChatHeaderTitle({ id, name, avatar }: { id: string; name: string; avatar: string | null }) {
  const uri = publicImageUrl("avatars", avatar);
  return (
    <Pressable
      onPress={() => router.push(`/user/${id}` as Href)}
      style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      hitSlop={8}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: 30, height: 30 }} contentFit="cover" />
        ) : (
          <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 13 }}>
            {name.slice(0, 1).toUpperCase()}
          </Text>
        )}
      </View>
      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text }} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}

function AudioBubble({ uri, mine }: { uri: string; mine: boolean }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const playing = status.playing;

  function toggle() {
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) {
        player.seekTo(0);
      }
      player.play();
    }
  }

  return (
    <Pressable
      onPress={toggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: mine ? colors.primary : "#EFEFF2",
        borderRadius: 16,
        borderBottomRightRadius: mine ? 4 : 16,
        borderBottomLeftRadius: mine ? 16 : 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minWidth: 140,
      }}
    >
      <Ionicons
        name={playing ? "pause" : "play"}
        size={22}
        color={mine ? "#fff" : colors.primary}
      />
      <Text style={{ color: mine ? "#fff" : colors.text, fontSize: 14 }}>Sesli mesaj</Text>
    </Pressable>
  );
}

function CompatList({ answers }: { answers: { question: string; answer: string }[] }) {
  if (answers.length === 0) return null;
  return (
    <View style={{ width: "100%", gap: 6, marginTop: 6 }}>
      {answers.map((a, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
          <Text style={{ color: colors.muted, fontSize: 12, flex: 1 }}>{a.question}</Text>
          <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600" }}>{a.answer}</Text>
        </View>
      ))}
    </View>
  );
}
