"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Loader2, MailCheck, Pencil, RefreshCw } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/features/auth/actions";
import { TERMS_VERSION } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

const EMPTY = { fullName: "", email: "", password: "", password2: "", referralCode: "" };

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY);
  const set = (key: keyof typeof EMPTY, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [agreed, setAgreed] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  // "Onay mailini tekrar gönder" için basit 60sn cooldown.
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (form.password !== form.password2) {
      setError("Şifreler eşleşmiyor. Aynı şifreyi iki kez gir.");
      return;
    }
    if (!agreed) {
      setError(
        "Devam etmek için Kullanıcı Sözleşmesi, Gizlilik Politikası ve KVKK Aydınlatma Metni'ni kabul etmelisin.",
      );
      return;
    }

    const fd = new FormData();
    fd.set("fullName", form.fullName);
    fd.set("email", form.email);
    fd.set("password", form.password);
    fd.set("termsVersion", TERMS_VERSION);
    if (marketing) fd.set("marketing", "1");
    if (form.referralCode) fd.set("referralCode", form.referralCode);

    startTransition(async () => {
      const res = await registerAction(null, fd);
      if (res?.error) setError(res.error);
      else if (res?.success) setSent(true);
    });
  }

  async function resend() {
    if (!form.email) return;
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email: form.email });
    if (error) {
      toast.error("Gönderilemedi: " + error.message);
    } else {
      toast.success("Onay maili tekrar gönderildi. Spam/gereksiz klasörünü de kontrol et.");
      setCooldown(60);
    }
  }

  // "E-postanı kontrol et" ekranı — form değerleri state'te korunuyor.
  if (sent) {
    return (
      <Card className="text-center">
        <CardHeader>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MailCheck className="size-7" />
          </span>
          <CardTitle className="mt-2 text-2xl">E-postanı kontrol et</CardTitle>
          <CardDescription>
            <span className="font-medium text-foreground">{form.email}</span> adresine bir onay
            bağlantısı gönderdik. Hesabını etkinleştirmek için bağlantıya tıkla.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Mail gelmediyse spam/gereksiz klasörünü kontrol et ya da aşağıdan tekrar gönder.
          </p>
          <Button className="w-full" onClick={resend} disabled={cooldown > 0}>
            <RefreshCw />
            {cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : "Onay mailini tekrar gönder"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Sadece e-postayı temizle; diğer alanlar dolu kalsın.
              setSent(false);
              setError(null);
              set("email", "");
            }}
          >
            <Pencil /> Mail adresini değiştir
          </Button>
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
        <CardTitle className="text-2xl">Kayıt ol</CardTitle>
        <CardDescription>
          Üniversite (edu) e-postanla Roomim topluluğuna katıl.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Deniz Yılmaz"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Üniversite e-postası</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="ad.soyad@metu.edu.tr"
              autoComplete="email"
              required
            />
            <p className="text-xs text-muted-foreground">
              Yalnızca üniversite (.edu.tr) e-postası kabul edilir.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="En az 8 karakter"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password2">Şifre (tekrar)</Label>
            <Input
              id="password2"
              type="password"
              value={form.password2}
              onChange={(e) => set("password2", e.target.value)}
              placeholder="Şifreni tekrar gir"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode">Referans kodu (opsiyonel)</Label>
            <Input
              id="referralCode"
              value={form.referralCode}
              onChange={(e) => set("referralCode", e.target.value)}
              placeholder="ARKADAŞ kodu"
            />
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-2.5 text-sm">
              <Checkbox
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c === true)}
                className="mt-0.5"
                aria-label="Sözleşmeleri kabul et"
              />
              <span className="text-muted-foreground">
                <Link href="/kosullar" target="_blank" className="font-medium text-primary hover:underline">
                  Kullanıcı Sözleşmesi
                </Link>
                ,{" "}
                <Link href="/gizlilik" target="_blank" className="font-medium text-primary hover:underline">
                  Gizlilik Politikası
                </Link>{" "}
                ve{" "}
                <Link href="/kvkk" target="_blank" className="font-medium text-primary hover:underline">
                  KVKK Aydınlatma Metni
                </Link>
                &apos;ni okudum, kabul ediyorum.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-sm">
              <Checkbox
                checked={marketing}
                onCheckedChange={(c) => setMarketing(c === true)}
                className="mt-0.5"
                aria-label="Kampanya e-postaları"
              />
              <span className="text-muted-foreground">
                Kampanya ve duyuru e-postaları almak istiyorum.{" "}
                <span className="text-xs">(opsiyonel)</span>
              </span>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={pending || !agreed}>
            {pending && <Loader2 className="animate-spin" />}
            Onay maili gönder
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Giriş yap
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
