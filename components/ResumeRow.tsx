"use client";

import MediaCard from "./MediaCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getHistory, type HistoryItem } from "@/lib/local-store";

export default function ResumeRow() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(getHistory().slice(0, 12));
  }, []);

  if (!items.length) return null;

  return (
    <section className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-base sm:text-lg font-bold text-ink">Lanjutkan Menonton</h2>
        <Link href="/riwayat" className="text-xs sm:text-sm text-rausch hover:text-rausch-active font-medium">
          Semua Riwayat →
        </Link>
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-row pb-2 -mx-4 px-4 sm:mx-0 sm:px-6 lg:px-8">
        {items.map((h) => (
          <Link
            key={h.slug}
            href={`/watch/${h.slug}?sid=${h.sid}&se=${h.se}&ep=${h.ep}`}
            className="group flex items-center gap-3 shrink-0 w-64 sm:w-72 rounded-2xl surface border border-line/60 p-3 hover:bg-surface2/50 transition-colors shadow-[var(--shadow-card)]"
          >
            <div className="w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-surface2 skeleton">
              {h.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={h.poster} alt="" loading="lazy" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-ink line-clamp-2 leading-snug group-hover:text-rausch transition-colors">
                {h.title}
              </h3>
              <p className="text-xs text-muted mt-1">
                {h.se > 0 ? `S${h.se} · E${h.ep}` : "Film"}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-rausch mt-1.5 font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                Lanjutkan
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
