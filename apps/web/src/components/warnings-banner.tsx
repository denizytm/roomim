"use client";

import { useEffect, useState } from "react";
import { TriangleAlert, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Warning = { id: string; message: string; created_at: string };

// Giriş yapan kullanıcıya, moderasyon tarafından gönderilmiş okunmamış uyarıları
// üstte bir şerit olarak gösterir. "Kapat" uyarıyı okundu işaretler.
export function WarningsBanner() {
  const [warnings, setWarnings] = useState<Warning[]>([]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_warnings")
        .select("id, message, created_at")
        .is("read_at", null)
        .order("created_at", { ascending: false });
      if (active) setWarnings(data ?? []);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function dismiss(id: string) {
    setWarnings((ws) => ws.filter((w) => w.id !== id));
    const supabase = createClient();
    await supabase
      .from("user_warnings")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  }

  if (warnings.length === 0) return null;

  return (
    <div className="border-b border-amber-300/70 bg-amber-50">
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-2.5">
        {warnings.map((w) => (
          <div key={w.id} className="flex items-start gap-3 text-sm text-amber-900">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p className="flex-1 leading-snug">
              <span className="font-semibold">Moderasyon uyarısı: </span>
              {w.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(w.id)}
              aria-label="Uyarıyı kapat"
              className="shrink-0 rounded p-0.5 text-amber-700 transition-colors hover:bg-amber-100 hover:text-amber-900"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
