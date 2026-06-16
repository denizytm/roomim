"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
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
import { demoLoginAction, loginAction } from "@/features/auth/actions";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [demoPending, startDemo] = useTransition();

  function handleDemo() {
    startDemo(async () => {
      const res = await demoLoginAction();
      if (res?.error) toast.error(res.error);
    });
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

          {/* GEÇİCİ: test için demo hesabı girişi. İş bitince kaldırılacak. */}
          <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> veya <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleDemo}
            disabled={demoPending}
          >
            {demoPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Demo hesabıyla gir
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
