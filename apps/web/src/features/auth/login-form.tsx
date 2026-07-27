"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Loader2, MailWarning, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  // Doğrulanmamış e-posta ile giriş denendi: hata yerine doğrulama uyarısı göster.
  if (state?.needsVerification) {
    return <VerifyNotice email={state.email ?? ""} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Giriş yap</CardTitle>
        <CardDescription>Hesabına giriş yaparak devam et.</CardDescription>
      </CardHeader>

      <form action={formAction}>
        <input type="hidden" name="redirect" value={redirectTo ?? ""} />
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ad.soyad@metu.edu.tr"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Giriş yap
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Hesabın yok mu?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Kayıt ol
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

function VerifyNotice({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    if (!email) return;
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setSending(false);
    if (error) {
      toast.error("Gönderilemedi: " + error.message);
    } else {
      toast.success("Doğrulama maili tekrar gönderildi. Spam/gereksiz klasörünü de kontrol et.");
      setCooldown(60);
    }
  }

  return (
    <Card className="text-center">
      <CardHeader>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
          <MailWarning className="size-7" />
        </span>
        <CardTitle className="mt-2 text-2xl">Önce e-postanı doğrula</CardTitle>
        <CardDescription>
          {email ? (
            <>
              <span className="font-medium text-foreground">{email}</span> adresine gönderdiğimiz
              doğrulama bağlantısına tıkla, sonra tekrar giriş yap.
            </>
          ) : (
            "Hesabın henüz doğrulanmamış. E-postana gönderdiğimiz doğrulama bağlantısına tıkla, sonra tekrar giriş yap."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Mail gelmediyse spam/gereksiz klasörünü kontrol et ya da aşağıdan tekrar gönder.
        </p>
        <Button className="w-full" onClick={resend} disabled={sending || cooldown > 0}>
          {sending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          {cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : "Doğrulama mailini tekrar gönder"}
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => window.location.assign("/login")}
        >
          Giriş ekranına dön
        </Button>
      </CardContent>
    </Card>
  );
}
