import { Apple, Play } from "lucide-react";

import { cn } from "@/lib/utils";

// iOS henüz App Store'da listelenmediği için TestFlight; Android Play Store'da yayında.
export const IOS_TESTFLIGHT = "https://testflight.apple.com/join/xd1FbzJU";
export const ANDROID_STORE = "https://play.google.com/store/apps/details?id=com.hcdijital.roomim";

// Mağaza rozeti görünümünde indirme bağlantıları.
export function MobileAppLinks({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "sm";
}) {
  const sm = size === "sm";
  const base = cn(
    "inline-flex items-center gap-2.5 rounded-xl bg-foreground text-background transition-transform hover:-translate-y-0.5",
    sm ? "px-3 py-1.5" : "px-4 py-2.5",
  );
  const icon = sm ? "size-4" : "size-6";

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a href={ANDROID_STORE} target="_blank" rel="noopener noreferrer" className={base}>
        <Play className={cn(icon, "fill-current")} />
        <span className="flex flex-col text-left leading-tight">
          <span className={cn("opacity-75", sm ? "text-[9px]" : "text-[11px]")}>Hemen indir</span>
          <span className={cn("font-semibold", sm ? "text-xs" : "text-[15px]")}>Google Play</span>
        </span>
      </a>
      <a href={IOS_TESTFLIGHT} target="_blank" rel="noopener noreferrer" className={base}>
        <Apple className={cn(icon, "fill-current")} />
        <span className="flex flex-col text-left leading-tight">
          <span className={cn("opacity-75", sm ? "text-[9px]" : "text-[11px]")}>iOS beta</span>
          <span className={cn("font-semibold", sm ? "text-xs" : "text-[15px]")}>TestFlight</span>
        </span>
      </a>
    </div>
  );
}
