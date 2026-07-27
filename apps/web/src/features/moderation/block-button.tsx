"use client";

import { useActionState, useEffect } from "react";
import { Ban, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleBlockAction } from "@/features/moderation/actions";

export function BlockButton({
  userId,
  blocked,
  className,
}: {
  userId: string;
  blocked: boolean;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(toggleBlockAction, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.blocked === true) toast.success("Kullanıcı engellendi.");
    else if (state?.blocked === false) toast.success("Engel kaldırıldı.");
  }, [state]);

  return (
    <form action={formAction} className={className}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="block" value={blocked ? "0" : "1"} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-muted-foreground hover:text-destructive"
        title={
          blocked
            ? "Engeli kaldır"
            : "Engellediğinde birbirinizin ilanlarını ve mesajlarını göremezsiniz"
        }
      >
        {pending ? (
          <Loader2 className="animate-spin" />
        ) : blocked ? (
          <Undo2 className="size-3.5" />
        ) : (
          <Ban className="size-3.5" />
        )}
        {blocked ? "Engeli kaldır" : "Engelle"}
      </Button>
    </form>
  );
}
