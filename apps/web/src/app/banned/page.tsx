import { Ban } from "lucide-react";

import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Hesap askıya alındı" };

export default function BannedPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <Ban className="size-7" />
      </span>
      <h1 className="mt-4 text-2xl font-bold">Hesabın askıya alındı</h1>
      <p className="mt-2 text-muted-foreground">
        Bu hesap topluluk kurallarının ihlali nedeniyle askıya alınmıştır. İtiraz için
        destek ekibiyle iletişime geçebilirsin.
      </p>
      <form action={signOut} className="mt-6">
        <Button variant="outline">Çıkış yap</Button>
      </form>
    </div>
  );
}
