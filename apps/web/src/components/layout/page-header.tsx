import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Uygulama sayfalarının turuncu başlık bandı (mobil uygulamadaki başlıklarla aynı dil).
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-3xl bg-primary px-6 py-7 text-primary-foreground sm:px-8",
        className,
      )}
    >
      <div aria-hidden className="absolute -top-16 -right-10 size-48 rounded-full bg-white/10" />
      <div aria-hidden className="absolute -bottom-12 right-40 size-24 rounded-full bg-white/10" />
      <div className="relative">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-primary-foreground/85">{description}</p>}
      </div>
      {action && <div className="relative">{action}</div>}
    </div>
  );
}
