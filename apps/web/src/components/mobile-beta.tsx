import { Apple, Play } from "lucide-react";

import { cn } from "@/lib/utils";

export const IOS_TESTFLIGHT = "https://testflight.apple.com/join/xd1FbzJU";
export const ANDROID_TESTING = "https://play.google.com/apps/testing/com.hcdijital.roomim";

// iOS (TestFlight) + Android (Play beta) test bağlantıları.
export function MobileBetaLinks({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "sm";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-foreground font-medium text-background transition-opacity hover:opacity-90";
  const dims = size === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm";

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <a
        href={IOS_TESTFLIGHT}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, dims)}
      >
        <Apple className={size === "sm" ? "size-4" : "size-5"} /> iOS · TestFlight
      </a>
      <a
        href={ANDROID_TESTING}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, dims)}
      >
        <Play className={size === "sm" ? "size-4" : "size-5"} /> Android · Play testi
      </a>
    </div>
  );
}
