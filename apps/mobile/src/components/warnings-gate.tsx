import { useEffect } from "react";
import { Alert } from "react-native";

import { supabase } from "@/lib/supabase";

// Giriş yapan kullanıcının okunmamış moderasyon uyarılarını uygulama açılınca
// bir Alert olarak gösterir ve "Anladım"a basınca okundu işaretler.
export function WarningsGate() {
  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_warnings")
        .select("id, message")
        .is("read_at", null)
        .order("created_at", { ascending: false });
      if (!active || !data?.length) return;

      const ids = data.map((w) => w.id);
      const body = data.map((w) => `• ${w.message}`).join("\n\n");
      Alert.alert("Moderasyon uyarısı", body, [
        {
          text: "Anladım",
          onPress: async () => {
            await supabase
              .from("user_warnings")
              .update({ read_at: new Date().toISOString() })
              .in("id", ids);
          },
        },
      ]);
    })();
    return () => {
      active = false;
    };
  }, []);

  return null;
}
