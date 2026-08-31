"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFavorites, toggleFavorite, pullSync, type FavItem } from "@/lib/local-store";

export default function FavoritesPage() {
  const [items, setItems] = useState<FavItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    pullSync().finally(() => {
      setItems(getFavorites());
      setMounted(true);
    });
  }, []);

  function remove(slug: string) {
    toggleFavorite({ slug, sid: "", title: "", poster: null });
    setItems(getFavorites());
  }

  return (
    <div className="pt-5 sm:pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="font-display text-xl sm:text-2xl text-ink mb-1">Favorit</h1>
      <p className="text-sm text-muted mb-6">{items.length} judul tersimpan</p>

      {!mounted ? null : items.length === 0 ? (
        <div className="surface border border-line/50 rounded-2xl p-14 text-center">
          <svg className="w-12 h-12 mx-auto text-muted/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-muted">Belum ada favorit.</p>
          <p className="text-sm text-muted/60 mt-1">Tekan ikon hati di halaman detail untuk menyimpan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 min-[420px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-x-3 gap-y-5 reveal-grid">
          {items.map((f) => (
            <div key={f.slug} className="relative w-full group/card">
              <Link href={`/detail/${f.slug}`} className="block relative">
                {f.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.poster} alt={f.title} loading="lazy" className="w-full aspect-[3/4] object-cover rounded-xl skeleton frame-card !p-0" />
                ) : (
                  <div className="aspect-[3/4] rounded-xl skeleton frame-card" />
                )}
                <div className="p-1.5">
                  <h3 className="text-xs font-semibold text-ink line-clamp-2 leading-snug group-hover/card:text-rausch transition-colors">{f.title}</h3>
                </div>
              </Link>
              <button
                onClick={() => remove(f.slug)}
                aria-label={`Hapus ${f.title}`}
                className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-black/70 backdrop-blur border border-white/10 text-muted hover:text-rausch flex items-center justify-center opacity-0 group-hover/card:opacity-100 max-md:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
