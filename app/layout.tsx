import type { Metadata, Viewport } from "next";
import { Righteous, Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
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
        <Navbar />
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
