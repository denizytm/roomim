import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-xl border-[1.5px] border-transparent bg-muted px-3.5 pr-9 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
