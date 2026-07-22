import { MailCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyActions } from "@/features/auth/verify-actions";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-16">
      <Card className="text-center">
        <CardHeader>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MailCheck className="size-7" />
          </span>
          <CardTitle className="mt-2 text-2xl">E-postanı kontrol et</CardTitle>
          <CardDescription>
            {email ? (
              <>
                <span className="font-medium text-foreground">{email}</span> adresine bir
                onay bağlantısı gönderdik. Hesabını etkinleştirmek için bağlantıya tıkla.
              </>
            ) : (
              "Hesabını etkinleştirmek için gönderdiğimiz onay bağlantısına tıkla."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isDev && (
            <a
              href="http://127.0.0.1:54324"
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm text-primary"
            >
              Geliştirme: maili görmek için yerel posta kutusunu (Mailpit) aç →
            </a>
          )}
          <p className="text-sm text-muted-foreground">
            Mail gelmediyse spam/gereksiz klasörünü kontrol et ya da aşağıdan tekrar gönder.
          </p>
          <VerifyActions email={email} />
        </CardContent>
      </Card>
    </div>
  );
}
