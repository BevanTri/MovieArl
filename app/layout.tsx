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
    <html lang="id" className={`${righteous.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');var h=document.documentElement;if(t==='light'){h.classList.add('light');h.classList.remove('dark')}else{h.classList.add('dark');h.classList.remove('light')}})();` }} />
      </head>
      <body className="antialiased bg-theme-bg text-theme-ink flex flex-col min-h-dvh font-body pb-14 sm:pb-0 overflow-x-hidden">
        <div id="app-splash" aria-hidden="true">
          <div className="app-splash-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="app-splash-logo"><img src="/icon-192.png" alt="MovieArl" className="app-splash-img" /></div>
            <div className="app-splash-name">MOVIEARL</div>
            <div className="app-splash-bar"><div className="app-splash-bar-fill"></div></div>
            <div className="app-splash-loading">Loading...</div>
          </div>
        </div>
        <PwaRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <BottomNav />
        <Analytics />
        <SpeedInsights />
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('keydown',e=>{if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['I','J','C'].includes(e.key.toUpperCase()))||(e.ctrlKey&&e.key.toUpperCase()==='U')){e.preventDefault()}});` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var s=document.getElementById('app-splash');if(!s)return;function hide(){s.classList.add('app-splash-hidden');setTimeout(()=>s.remove(),500)}if(document.readyState==='complete')hide();else{var d=!1;var t=setTimeout(()=>{if(!d){d=!0;hide()}},1400);window.addEventListener('load',()=>{if(!d){d=!0;clearTimeout(t);hide()}})}})();document.addEventListener('load',e=>{var t=e.target;if(t&&t.tagName==='IMG'&&t.classList.contains('skeleton'))t.classList.remove('skeleton')},true);` }} />
      </body>
    </html>
  );
}
