import type { MetadataRoute } from "next";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "https://moviearl.vercel.app";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/browse/movies`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/browse/tv`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/browse/animation`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/favorit`, lastModified: now, priority: 0.5 },
    { url: `${base}/riwayat`, lastModified: now, priority: 0.5 },
    { url: `${base}/login`, lastModified: now, priority: 0.3 },
  ];
}
