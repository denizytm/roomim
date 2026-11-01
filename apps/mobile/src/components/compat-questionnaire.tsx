import { Ionicons } from "@expo/vector-icons";
import type {
  CompatibilityCategory,
  CompatibilityQuestion,
  QuestionOption,
} from "@roomim/shared/types/database.types";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { SlideInLeft, SlideInRight } from "react-native-reanimated";

import { Btn } from "@/components/form";
import { colors, radius } from "@/lib/theme";

export function CompatQuestionnaire({
  categories,
  questions,
  initial,
  submitLabel,
  warnIncomplete,
  onSubmit,
  hasHeader = false,
}: {
  categories: CompatibilityCategory[];
  questions: CompatibilityQuestion[];
  initial: Record<number, number>;
  submitLabel: string;
  warnIncomplete: boolean;
  onSubmit: (answers: Record<number, number>) => Promise<void>;
  // Üstte navigasyon başlığı varsa üst safe-area boşluğu tekrar eklenmesin.
  hasHeader?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Record<number, number>>(initial);
  const [saving, setSaving] = useState(false);

  function goBack() {
    setDirection("back");
    setStep((s) => Math.max(0, s - 1));
  }

  const cat = categories[step];
  const stepQuestions = questions.filter((q) => q.category_id === cat?.id);
  const answeredCount = questions.filter((q) => answers[q.id] != null).length;
  const pct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isLast = step === categories.length - 1;

  async function finish() {
    setSaving(true);
    try {
      await onSubmit(answers);
    } catch (e) {
      setSaving(false);
      Alert.alert("Hata", e instanceof Error ? e.message : "Kaydedilemedi");
    }
  }

  function onNext() {
    if (!isLast) {
      setDirection("forward");
      setStep((s) => s + 1);
      return;
    }
    if (warnIncomplete && answeredCount < questions.length) {
      Alert.alert(
        "Eksik yanıtlar",
        `${answeredCount}/${questions.length} soruyu yanıtladın. Boş bıraktığın sorular için uyum skorun tam doğru hesaplanamayabilir. İstediğin zaman Profil'den tamamlayabilirsin.`,
        [
          { text: "Cevaplamaya devam et", style: "cancel" },
          { text: "Yine de bitir", onPress: finish },
        ],
      );
    } else {
      finish();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={hasHeader ? ["bottom"] : ["top", "bottom"]}>
      {/* İlerleme */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {categories.map((c, i) => (
            <View
              key={c.id}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 999,
                backgroundColor: i <= step ? colors.primary : colors.field,
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>
            Adım {step + 1} / {categories.length}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>%{pct} yanıtlandı</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, gap: 16 }}>
        <View style={{ gap: 6 }}>
          <View style={{ alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 12 }}>{cat?.name}</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>Yaşam tarzını tanıyalım</Text>
          <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 21 }}>
            {"İstersen boş bırak — sonra Profil'den güncelleyebilirsin."}
          </Text>
        </View>

        <Animated.View
          key={step}
          entering={(direction === "back" ? SlideInLeft : SlideInRight).duration(220)}
          style={{ gap: 14 }}
        >
          {stepQuestions.map((q) => {
            const opts = q.options as unknown as QuestionOption[];
          return (
            <View
              key={q.id}
              style={{ borderRadius: radius.lg, padding: 16, gap: 12, backgroundColor: colors.field }}
            >
              <Text style={{ fontWeight: "700", fontSize: 15, color: colors.text }}>{q.question}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {opts.map((o) => {
                  const active = answers[q.id] === o.value;
                  return (
                    <Pressable
                      key={o.value}
                      onPress={() =>
                        setAnswers((a) => {
                          const next = { ...a };
                          // aynı seçeneğe tekrar basınca temizle (boş bırak)
                          if (next[q.id] === o.value) delete next[q.id];
                          else next[q.id] = o.value;
                          return next;
                        })
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 999,
                        backgroundColor: active ? colors.primary : "#fff",
                      }}
                    >
                      {active && <Ionicons name="checkmark" size={14} color="#fff" />}
                      <Text style={{ color: active ? "#fff" : colors.text, fontWeight: active ? "700" : "500", fontSize: 14 }}>
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
          })}
        </Animated.View>
      </ScrollView>

      {/* Alt: Geri / İleri / Bitir */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        }}
      >
        {step > 0 && (
          <Pressable
            onPress={goBack}
            disabled={saving}
            style={({ pressed }) => ({
              width: 54,
              height: 54,
              borderRadius: radius.md,
              backgroundColor: colors.field,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Btn title={isLast ? submitLabel : "İleri"} onPress={onNext} loading={saving} />
        </View>
      </View>
    </SafeAreaView>
  );
}
