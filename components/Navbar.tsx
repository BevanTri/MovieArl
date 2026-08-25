"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LiveSearch from "./LiveSearch";
import { useUser } from "./useUser";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/browse/movies", label: "Film" },
  { href: "/browse/tv", label: "Serial" },
  { href: "/browse/animation", label: "Animasi" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-line/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center gap-3">
          <Link href="/" className="flex items-center shrink-0">
            <span className="font-display text-xl sm:text-2xl text-ink font-bold tracking-wide">
              Movie<span className="text-rausch">Arl</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                  pathname === l.href
                    ? "text-rausch bg-rausch/10"
                    : "text-muted hover:text-ink hover:bg-surface2/50"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Cari"
              className="md:hidden w-10 h-10 rounded-full surface border border-line flex items-center justify-center text-ink hover:bg-surface2/50 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="hidden lg:block">
              <LiveSearch />
            </div>

            {user ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Menu akun"
                  className="w-8 h-8 rounded-full bg-rausch text-white text-xs font-bold hover:bg-rausch-active transition-colors shadow-card active:scale-95 overflow-hidden flex items-center justify-center"
                >
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.picture} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (user.name ?? "U").charAt(0)
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-surface border border-line rounded-xl overflow-hidden shadow-[var(--shadow-card-lg)] animate-fade-in z-50">
                    <div className="px-3 py-2.5 border-b border-line/40">
                      <p className="text-sm text-ink truncate">{user.name}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <Link href="/favorit" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-ink2 hover:bg-surface2/60 transition-colors">
                      Favorit
                    </Link>
                    <Link href="/riwayat" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-ink2 hover:bg-surface2/60 transition-colors">
                      Riwayat
                    </Link>
                    <a href="/api/auth/logout" className="block px-3 py-2.5 text-sm text-rausch hover:bg-surface2/60 transition-colors">
                      Keluar
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm px-4 py-1.5 rounded-lg bg-rausch text-white font-semibold hover:bg-rausch-active transition-colors shadow-card active:scale-95 hidden sm:inline-block"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-line/40 px-4 py-3 animate-slide-up">
          <LiveSearch mobile />
        </div>
      )}
    </nav>
  );
}
