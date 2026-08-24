"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [done, setDone] = useState(false);

  // Callback recovery kodunu değiştirdiği için buraya oturumla geliriz.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== password2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPending(false);
      setError(error.message);
      return;
    }
    // Recovery oturumunu kapat; kullanıcı yeni şifresiyle taze giriş yapsın.
    await supabase.auth.signOut();
    setDone(true);
  }

  if (done) {
    return (
      <Card className="text-center">
        <CardHeader>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="size-7" />
          </span>
          <CardTitle className="mt-2 text-2xl">Şifren güncellendi 🎉</CardTitle>
          <CardDescription>Artık yeni şifrenle giriş yapabilirsin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="w-full"
            onClick={() => window.location.assign("/login")}
          >
            Giriş yap
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (ready && !hasSession) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Bağlantı geçersiz</CardTitle>
          <CardDescription>
            Sıfırlama bağlantısı geçersiz ya da süresi dolmuş. Yeni bir bağlantı iste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" render={<Link href="/forgot-password" />}>
            Yeni bağlantı iste
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Yeni şifre belirle</CardTitle>
        <CardDescription>Hesabın için yeni bir şifre gir.</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Yeni şifre</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 8 karakter"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password2">Yeni şifre (tekrar)</Label>
            <Input
              id="password2"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Şifreni tekrar gir"
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-6">
          <Button type="submit" size="lg" className="w-full" disabled={pending || !ready}>
            {pending && <Loader2 className="animate-spin" />}
            Şifreyi güncelle
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
