import Link from "next/link";
import { HousePlus } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-sm shadow-primary/30">
        <HousePlus className="size-[18px]" />
      </span>
      <span className="text-xl font-black tracking-tighter text-primary">
        roomim<span className="text-foreground">.</span>
      </span>
      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-primary">
        Beta
      </span>
    </Link>
  );
}
