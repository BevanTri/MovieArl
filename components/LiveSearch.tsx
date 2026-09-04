"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Suggest = { title: string | null; slug: string | null; poster: string | null; year: string | null };

export default function LiveSearch({ mobile = false }: { mobile?: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggest[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (q.trim().length < 2) {
      if (results.length) setResults([]);
      if (open) setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q.trim())}`);
        setResults(await res.json());
        setOpen(true);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={boxRef} className={mobile ? "relative" : "relative"}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) {
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
              setOpen(false);
            }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Cari film..."
          aria-label="Cari film"
          className={`w-full bg-theme-surface-2/50 border border-theme-line rounded-lg pl-9 pr-3 py-1.5 text-sm text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-rausch/30 focus:border-rausch transition-all ${
            mobile ? "" : "w-36 lg:w-48"
          }`}
        />
      </div>

      {open && (
        <div className="absolute top-full mt-1.5 w-full min-w-[280px] right-0 bg-theme-surface border border-theme-line rounded-xl overflow-hidden shadow-card-lg animate-fade-in z-50">
          {results.map((item) =>
            item.slug ? (
              <Link
                key={item.slug}
                href={`/detail/${item.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-theme-surface-2/50 transition-colors border-b border-theme-line/20 last:border-0"
              >
                {item.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.poster} alt="" className="w-8 h-11 object-cover rounded-md shrink-0 skeleton" loading="lazy" />
                ) : (
                  <div className="w-8 h-11 rounded-md shrink-0 skeleton" />
                )}
                <div className="min-w-0">
                  <span className="text-sm text-theme-ink truncate block">{item.title}</span>
                  {item.year && <span className="text-xs text-theme-muted mt-0.5 block">{item.year}</span>}
                </div>
              </Link>
            ) : null,
          )}
          {q.length >= 2 && results.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-theme-muted">Tidak ditemukan</div>
          )}
          {q.length >= 2 && results.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(q.trim())}`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-center text-xs text-theme-muted hover:text-theme-ink bg-theme-surface-2/30 transition-colors font-medium"
            >
              Lihat semua hasil →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
