"use client";

import { useActionState, useEffect, useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReportAction } from "@/features/moderation/actions";

export function ReportButton({
  listingId,
  reportedUserId,
  label = "Şikayet et",
  placeholder = "Sorunu kısaca açıkla…",
}: {
  listingId?: string;
  reportedUserId?: string;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createReportAction, null);

  useEffect(() => {
    if (state?.success) toast.success("Şikayetin alındı. 48 saat içinde incelenir.");
    if (state?.error) toast.error(state.error);
  }, [state]);

  // Başarılı gönderimden sonra paneli kapat (effect'te setState yok).
  const showForm = open && !state?.success;

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
      >
        <Flag className="size-3.5" /> {label}
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-border p-3">
      {listingId && <input type="hidden" name="listingId" value={listingId} />}
      {reportedUserId && (
        <input type="hidden" name="reportedUserId" value={reportedUserId} />
      )}
      <Textarea name="reason" rows={3} placeholder={placeholder} required />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Vazgeç
        </Button>
        <Button type="submit" variant="destructive" size="sm" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />} Gönder
        </Button>
      </div>
    </form>
  );
}
