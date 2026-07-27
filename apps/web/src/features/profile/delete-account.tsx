"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAccountAction } from "@/features/auth/actions";

const REMOVED = [
  "Profilin, üniversite bilgin ve rozetlerin",
  "Yayındaki tüm ilanların ve fotoğrafları",
  "Tüm sohbetlerin ve gönderdiğin mesajlar",
  "Uyum soruları cevapların ve puanların",
];

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [state, formAction, pending] = useActionState(deleteAccountAction, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const canDelete = confirm.trim().toLocaleUpperCase("tr-TR") === "SİL";

  return (
    <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <h2 className="mb-1 flex items-center gap-2 font-semibold text-destructive">
        <TriangleAlert className="size-4" /> Hesabı sil
      </h2>
      <p className="text-sm text-muted-foreground">
        Hesabını kalıcı olarak silersin. Bu işlem geri alınamaz.
      </p>

      {!open ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => setOpen(true)}
        >
          Hesabımı sil
        </Button>
      ) : (
        <form action={formAction} className="mt-3 space-y-3">
          <ul className="list-inside list-disc space-y-1 text-sm text-foreground/80">
            {REMOVED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Aynı e-posta ile daha sonra yeniden kayıt olabilirsin, ancak silinen veriler geri
            getirilemez.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-sm font-medium">
              Onaylamak için <span className="font-mono">SİL</span> yaz
            </label>
            <Input
              id="confirm"
              name="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              placeholder="SİL"
              className="max-w-40"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                setConfirm("");
              }}
            >
              Vazgeç
            </Button>
            <Button type="submit" variant="destructive" size="sm" disabled={!canDelete || pending}>
              {pending && <Loader2 className="animate-spin" />} Hesabımı kalıcı olarak sil
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
