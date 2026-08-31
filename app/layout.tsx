import type { Metadata, Viewport } from "next";
import { Righteous, Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PwaRegister from "@/components/PwaRegister";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-righteous",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: { default: "MovieArl — Nonton Film & Serial Sub Indo", template: "%s — MovieArl" },
  description: "Streaming film, serial, dan animasi subtitle Indonesia.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "MovieArl",
    statusBarStyle: "black-translucent",
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://moviearl.vercel.app"),
  openGraph: {
    title: "MovieArl — Nonton Film & Serial Sub Indo",
    description: "Streaming film, serial, dan animasi subtitle Indonesia.",
    url: "/",
    siteName: "MovieArl",
    locale: "id_ID",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "MovieArl", description: "Streaming film, serial, dan animasi subtitle Indonesia." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08080f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${righteous.variable} ${poppins.variable}`}>
      <body className="antialiased bg-bg text-ink min-h-dvh font-body pb-14 sm:pb-0">
        <PwaRegister />
        <Navbar />
        <main>{children}</main>
        <BottomNav />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
