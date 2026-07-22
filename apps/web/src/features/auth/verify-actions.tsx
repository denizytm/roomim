"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function VerifyActions({ email }: { email?: string }) {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Basit geri sayım (spam'i önlemek için tekrar gönder butonu kısa süre kilitli).
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    if (!email) {
      toast.error("E-posta adresi bulunamadı. Lütfen tekrar kayıt ol.");
      return;
    }
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setSending(false);
    if (error) {
      toast.error("Gönderilemedi: " + error.message);
      return;
    }
    toast.success("Onay maili tekrar gönderildi. Gelen kutunu ve spam klasörünü kontrol et.");
    setCooldown(60);
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={resend} disabled={sending || cooldown > 0}>
        {sending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        {cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : "Onay mailini tekrar gönder"}
      </Button>
      <Button variant="outline" className="w-full" render={<Link href="/register" />}>
        <Pencil /> Mail adresini değiştir
      </Button>
      <Button variant="ghost" className="w-full" render={<Link href="/login" />}>
        Giriş ekranına dön
      </Button>
    </div>
  );
}
