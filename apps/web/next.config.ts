import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@roomim/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
      // Demo/örnek ilan görselleri için (geçici).
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
