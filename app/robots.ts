import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL || "https://moviearl.vercel.app";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/watch/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
