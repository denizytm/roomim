"use client";

import { useRef, useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { KvkkBody, PrivacyBody, TermsBody } from "@/features/legal/legal-docs";
import { cn } from "@/lib/utils";

const DOCS = [
  { key: "terms", title: "Kullanıcı Sözleşmesi", Body: TermsBody },
  { key: "privacy", title: "Gizlilik Politikası", Body: PrivacyBody },
  { key: "kvkk", title: "KVKK Aydınlatma Metni", Body: KvkkBody },
] as const;

// Kayıt onayı: her metni sırayla açar; kullanıcı sonuna kadar kaydırmadan
// "Kabul ediyorum" aktifleşmez. Hepsi kabul edilince onComplete() çağrılır.
export function ConsentFlow({
  onComplete,
  onClose,
}: {
  onComplete: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [reachedBottom, setReachedBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = DOCS[step];
  const isLast = step === DOCS.length - 1;
  const Body = current.Body;

  // Kaydırma alanı her adımda (key={step}) yeniden mount olur; ref callback yeni
  // öğede scroll'u sıfırlar ve içerik ekrana sığıyorsa (kaydırma yoksa) onayı açar.
  function attachScroll(el: HTMLDivElement | null) {
    scrollRef.current = el;
    if (el && el.scrollHeight <= el.clientHeight + 8) setReachedBottom(true);
  }

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setReachedBottom(true);
  }

  function accept() {
    if (isLast) {
      onComplete();
      return;
    }
    setReachedBottom(false);
    setStep((s) => s + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Adım {step + 1} / {DOCS.length}
            </p>
            <h3 className="text-lg font-semibold">{current.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex gap-1.5 px-5 pt-3">
          {DOCS.map((d, i) => (
            <span
              key={d.key}
              className={cn(
                "h-1 flex-1 rounded-full",
                i < step ? "bg-primary" : i === step ? "bg-primary/50" : "bg-muted",
              )}
            />
          ))}
        </div>

        <div
          key={step}
          ref={attachScroll}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto px-5 py-4"
        >
          <Body />
          <p className="mt-6 text-center text-xs text-muted-foreground">— metnin sonu —</p>
        </div>

        <div className="border-t border-border px-5 py-4">
          {!reachedBottom && (
            <p className="mb-2 text-center text-xs text-muted-foreground">
              Onaylamak için metni sonuna kadar kaydır.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Vazgeç
            </Button>
            <Button onClick={accept} disabled={!reachedBottom}>
              <Check />
              {isLast ? "Okudum, tümünü kabul ediyorum" : "Okudum, kabul ediyorum"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
