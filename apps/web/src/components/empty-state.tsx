import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Boş liste: turuncu ikon dairesi + başlık + açıklama + opsiyonel aksiyon.
export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  text?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl bg-secondary px-6 py-16 text-center",
        className,
      )}
    >
      <span className="grid size-20 place-items-center rounded-full bg-primary text-primary-foreground ring-8 ring-primary/15">
        <Icon className="size-9" />
      </span>
      <p className="mt-6 text-lg font-bold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
