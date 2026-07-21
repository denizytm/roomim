import type { NextConfig } from "next";

// Content-Security-Policy — uygulamanın gerçekten kullandığı kaynaklara izin verir:
// - script/style: Next + Tailwind inline enjeksiyonu için 'unsafe-inline'
// - img: Supabase Storage, OSM harita tile'ları, picsum (demo), data/blob
// - connect: Supabase REST + Realtime (wss)
// - media/worker: sesli mesaj + MapLibre blob worker
// - frame-ancestors 'none': clickjacking'e karşı
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://tile.openstreetmap.org https://picsum.photos",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "media-src 'self' blob: https://*.supabase.co",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Sesli mesaj için mikrofona yalnızca kendi origin'imizde izin; kamera/konum kapalı.
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@roomim/shared"],
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
      // Demo/örnek ilan görselleri için (geçici).
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
