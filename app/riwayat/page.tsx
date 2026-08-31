"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHistory, pullSync } from "@/lib/local-store";

export default function HistoryPage() {
  const [items, setItems] = useState<ReturnType<typeof getHistory>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    pullSync().finally(() => {
      setItems(getHistory());
      setMounted(true);
    });
  }, []);

  return (
    <div className="pt-5 sm:pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="font-display text-xl sm:text-2xl text-ink mb-1">Riwayat Tonton</h1>
      <p className="text-sm text-muted mb-6">{items.length} judul</p>

      {!mounted ? null : items.length === 0 ? (
        <div className="surface border border-line/50 rounded-2xl p-14 text-center">
          <svg className="w-12 h-12 mx-auto text-muted/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-muted">Belum ada riwayat.</p>
          <p className="text-sm text-muted/60 mt-1">Mulai nonton — otomatis tercatat di sini.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((h) => (
            <Link
              key={`${h.slug}-${h.se}-${h.ep}`}
              href={`/watch/${h.slug}?sid=${h.sid}&se=${h.se}&ep=${h.ep}`}
              className="group flex items-center gap-3 rounded-2xl surface border border-line/50 p-3 hover:bg-surface2/50 transition-colors"
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
                  {h.se > 0 ? `Season ${h.se} · Episode ${h.ep}` : "Film"} ·{" "}
                  {new Date(h.at ?? 0).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 text-xs text-rausch font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                Lanjut
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
