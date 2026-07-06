import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@hoomies/shared/constants";
import type {
  CompatibilityCategory,
  CompatibilityQuestion,
  UserRole,
} from "@hoomies/shared/types/database.types";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CompatQuestionnaire } from "@/components/compat-questionnaire";
import { useSession } from "@/lib/auth-context";
import { getMyAnswers, getOnboardingData, saveOnboarding } from "@/lib/queries";
import { colors } from "@/lib/theme";

export default function Onboarding() {
  const { session, refreshProfile } = useSession();
  const [role, setRole] = useState<UserRole | null>(null);
  const [data, setData] = useState<{
    categories: CompatibilityCategory[];
    questions: CompatibilityQuestion[];
    initial: Record<number, number>;
  } | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.all([getOnboardingData(), getMyAnswers(session.user.id)]).then(([d, initial]) =>
      setData({ ...d, initial }),
    );
  }, [session?.user.id]);

  // 1. Adım: rol seçimi
  if (!role) {
    return <RolePicker onPick={setRole} />;
  }

  // 2. Adım: uyum soruları
  if (!data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <CompatQuestionnaire
      categories={data.categories}
      questions={data.questions}
      initial={data.initial}
      submitLabel="Tamamla"
      warnIncomplete
      onSubmit={async (answers) => {
        if (!session) return;
        await saveOnboarding(session.user.id, role, answers);
        await refreshProfile();
      }}
    />
  );
}

function RolePicker({ onPick }: { onPick: (r: UserRole) => void }) {
  const roles: UserRole[] = ["seeker", "host"];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16, flexGrow: 1, justifyContent: "center" }}>
        <View style={{ gap: 6, marginBottom: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>Nasıl kullanacaksın?</Text>
          <Text style={{ color: colors.muted }}>Deneyimini buna göre uyarlıyoruz.</Text>
        </View>
        {roles.map((r) => (
          <Pressable
            key={r}
            onPress={() => onPick(r)}
            style={({ pressed }) => ({
              borderWidth: 1.5,
              borderColor: colors.border,
              borderRadius: 18,
              padding: 20,
              backgroundColor: pressed ? colors.surface : "#fff",
              gap: 6,
            })}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.primary }}>
              {r === "seeker" ? "🔎 " : "🏠 "}
              {ROLE_LABELS[r]}
            </Text>
            <Text style={{ color: colors.muted, lineHeight: 20 }}>{ROLE_DESCRIPTIONS[r]}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
