import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.aoneroom.com" },
      { protocol: "https", hostname: "**.hakunaymatata.com" },
    ],
    formats: ["image/webp"],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
