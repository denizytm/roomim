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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
  chatMediaSignedUrl,
  sendMessage,
  setConversationStatus,
  uploadChatAudio,
  uploadChatImage,
  type ChatDetail,
  type ChatMessage,
} from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { EmptyState } from "@/components/empty-state";
import { Btn } from "@/components/form";
import { colors, radius } from "@/lib/theme";

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
    let active = true;
    (async () => {
      if (!id || !meId) return;
      const d = await getConversationDetail(id, meId);
      if (!active) return;
      setDetail(d);
      setMessages(d?.messages ?? []);
    })();
    return () => {
      active = false;
    };
  }, [id, meId]);

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
          const add = (attachmentUrl: string | null) =>
            setMessages((prev) =>
              prev.some((x) => x.id === m.id)
                ? prev
                : [
                    ...prev,
                    {
                      id: m.id,
                      sender_id: m.sender_id,
                      body: m.body,
                      attachmentUrl,
                      attachmentType: m.attachment_type,
                    },
                  ],
            );
          // Private chat-media: ekli mesaj için signed URL üret, sonra ekle.
          if (m.attachment_url) {
            chatMediaSignedUrl(m.attachment_url).then(add);
          } else {
            add(null);
          }
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
      const path = await uploadChatImage(id, meId, asset.base64!, ext);
      await sendMessage(id, meId, "", { url: path, type: "image" });
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
        const path = await uploadChatAudio(id, meId, uri);
        await sendMessage(id, meId, "", { url: path, type: "audio" });
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
        {detail.isHost ? (
          <>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 12, alignItems: "center" }}>
              <View style={styles.stateIcon}>
                <Ionicons name="person-add-outline" size={32} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, textAlign: "center" }}>
                {detail.otherName} ilanınla ilgileniyor
              </Text>
              <Text style={{ color: colors.muted, textAlign: "center", fontSize: 15 }}>
                Onaylarsan mesajlaşma açılır.
              </Text>
              {detail.otherScore != null && (
                <View style={styles.scorePill}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "800" }}>%{detail.otherScore} uyum</Text>
                </View>
              )}
              <View style={styles.compatCard}>
                <CompatPager answers={detail.otherAnswers} />
              </View>
            </ScrollView>
            <View style={styles.actionBar}>
              <View style={{ flex: 1 }}>
                <Btn title="Reddet" variant="outline" onPress={() => changeStatus("declined")} disabled={busy} />
              </View>
              <View style={{ flex: 1 }}>
                <Btn title="Onayla" icon="checkmark" onPress={() => changeStatus("accepted")} disabled={busy} />
              </View>
            </View>
          </>
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 }}>
            <View style={styles.stateIcon}>
              <Ionicons name="hourglass-outline" size={32} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>İsteğin gönderildi</Text>
            <Text style={{ color: colors.muted, textAlign: "center", fontSize: 15, lineHeight: 21 }}>
              {detail.otherName} onayladığında mesajlaşma açılır.
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (detail.status === "declined") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <EmptyState icon="close-circle-outline" title="Bu istek reddedildi" />
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
        <View style={{ padding: 12, gap: 8, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }}>
          {detail.listingId && (
            <Pressable
              onPress={() => router.push(`/listing/${detail.listingId}` as Href)}
              style={({ pressed }) => [styles.listingBanner, pressed && { opacity: 0.8 }]}
            >
              <View style={styles.bannerIcon}>
                <Ionicons name="home" size={16} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, color: colors.text, fontWeight: "600", fontSize: 14 }} numberOfLines={1}>
                {detail.listingTitle ?? "İlan"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
            </Pressable>
          )}
          {detail.isHost && detail.listingStatus !== "closed" && (
            <Pressable
              onPress={close}
              disabled={busy}
              style={({ pressed }) => [styles.closePill, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="checkmark-done" size={15} color="#059669" />
              <Text style={{ color: "#059669", fontWeight: "700", fontSize: 13 }}>Anlaştıysanız ilanı kapat</Text>
            </Pressable>
          )}
          {showProfile && detail.otherAnswers.length > 0 && (
            <View style={styles.compatCard}>
              {detail.otherScore != null && (
                <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 4 }}>
                  %{detail.otherScore} uyum
                </Text>
              )}
              <CompatPager answers={detail.otherAnswers} />
            </View>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 6, flexGrow: 1 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <EmptyState icon="chatbubble-ellipses-outline" title="Henüz mesaj yok" text="İlk mesajı sen gönder 👋" />
          }
          renderItem={({ item }) => {
            const mine = item.sender_id === meId;
            const isImage = item.attachmentType === "image" && item.attachmentUrl;
            const isAudio = item.attachmentType === "audio" && item.attachmentUrl;
            return (
              <View style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                {isImage ? (
                  <Image
                    source={{ uri: item.attachmentUrl! }}
                    style={{ width: 220, height: 220, borderRadius: 20 }}
                    contentFit="cover"
                  />
                ) : isAudio ? (
                  <AudioBubble uri={item.attachmentUrl!} mine={mine} />
                ) : (
                  <View
                    style={{
                      backgroundColor: mine ? colors.primary : colors.field,
                      borderRadius: 20,
                      borderBottomRightRadius: mine ? 6 : 20,
                      borderBottomLeftRadius: mine ? 20 : 6,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: mine ? "#fff" : colors.text, fontSize: 16, lineHeight: 21 }}>{item.body}</Text>
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
            style={{ borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }}
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
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderTopColor: colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
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
            placeholderTextColor={colors.placeholder}
            editable={!recording}
            onFocus={() => setShowEmoji(false)}
            style={{
              flex: 1,
              backgroundColor: colors.field,
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 11,
              fontSize: 16,
              color: colors.text,
              marginLeft: 4,
            }}
          />
          <Pressable
            onPress={send}
            disabled={sending || !body.trim()}
            style={{
              backgroundColor: colors.primary,
              width: 42,
              height: 42,
              borderRadius: 21,
              marginLeft: 4,
              alignItems: "center",
              justifyContent: "center",
              opacity: sending || !body.trim() ? 0.4 : 1,
            }}
          >
            <Ionicons name="arrow-up" size={22} color="#fff" />
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
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: 32, height: 32 }} contentFit="cover" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
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
        backgroundColor: mine ? colors.primary : colors.field,
        borderRadius: 20,
        borderBottomRightRadius: mine ? 6 : 20,
        borderBottomLeftRadius: mine ? 20 : 6,
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

type CompatAnswer = { question: string; answer: string; category: string };

function CompatPager({ answers }: { answers: CompatAnswer[] }) {
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const groups = useMemo(() => {
    const map = new Map<string, { question: string; answer: string }[]>();
    for (const a of answers) {
      const arr = map.get(a.category) ?? [];
      arr.push({ question: a.question, answer: a.answer });
      map.set(a.category, arr);
    }
    return [...map.entries()].map(([category, items]) => ({ category, items }));
  }, [answers]);

  if (answers.length === 0) return null;

  function goTo(i: number) {
    setPage(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  }

  return (
    <View
      style={{ width: "100%", marginTop: 6 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {/* Kategori sekmeleri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
      >
        {groups.map((g, i) => (
          <Pressable
            key={g.category}
            onPress={() => goTo(i)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: i === page ? colors.primary : "#fff",
            }}
          >
            <Text style={{ color: i === page ? "#fff" : colors.text, fontWeight: "700", fontSize: 12 }}>
              {g.category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Soldan sağa kaydırmalı sayfalar */}
      {width > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setPage(Math.round(e.nativeEvent.contentOffset.x / width))
          }
        >
          {groups.map((g) => (
            <View key={g.category} style={{ width, gap: 10 }}>
              {g.items.map((a, i) => (
                <View
                  key={i}
                  style={{ borderLeftWidth: 2, borderLeftColor: colors.primary + "33", paddingLeft: 10, gap: 2 }}
                >
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{a.question}</Text>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: "700" }}>{a.answer}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Nokta göstergesi */}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 }}>
        {groups.map((g, i) => (
          <View
            key={g.category}
            style={{
              width: i === page ? 16 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === page ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  compatCard: {
    alignSelf: "stretch",
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.field,
  },
  actionBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  listingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.field,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  closePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
  },
});
