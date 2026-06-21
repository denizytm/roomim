"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { closeListingAction } from "@/features/listings/actions";
import { CLOSE_REASONS } from "@/lib/constants";

export function CloseListingButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(CLOSE_REASONS[0].value);
  const [pending, startTransition] = useTransition();

  function confirm() {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("reason", reason);
    startTransition(() => closeListingAction(fd));
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Kapat
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <NativeSelect
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-8 w-40 text-xs"
        aria-label="Kapatma sebebi"
      >
        {CLOSE_REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </NativeSelect>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={confirm}
        disabled={pending}
      >
        {pending && <Loader2 className="animate-spin" />} Onayla
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(false)}
        disabled={pending}
      >
        Vazgeç
      </Button>
    </div>
  );
}
