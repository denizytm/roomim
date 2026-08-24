"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";

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
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${siteUrl}/auth/callback?next=/reset-password` },
    );
    setPending(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <Card className="text-center">
        <CardHeader>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MailCheck className="size-7" />
          </span>
          <CardTitle className="mt-2 text-2xl">E-postanı kontrol et</CardTitle>
          <CardDescription>
            Eğer <span className="font-medium text-foreground">{email}</span> ile bir hesap
            varsa, şifre sıfırlama bağlantısı gönderdik. Bağlantıya tıklayıp yeni şifreni
            belirle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Mail gelmediyse spam/gereksiz klasörünü kontrol et.
          </p>
          <Button variant="ghost" className="w-full" render={<Link href="/login" />}>
            Giriş ekranına dön
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Şifreni sıfırla</CardTitle>
        <CardDescription>
          Hesabının e-posta adresini gir; sana bir sıfırlama bağlantısı gönderelim.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ad.soyad@metu.edu.tr"
              autoComplete="email"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Sıfırlama bağlantısı gönder
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Şifreni hatırladın mı?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Giriş yap
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
