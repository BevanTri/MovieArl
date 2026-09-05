"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { MediaItem } from "@/lib/moviebox";

export default function HeroCarousel({ items }: { items: MediaItem[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = items.filter((i) => i.slug && i.posterUrl).slice(0, 5);

  const next = useCallback(() => {
    setIdx((v) => (v + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, paused, slides.length]);

  if (!slides.length) return null;
  const active = slides[idx];

  return (
    <div
      className="relative mb-8 sm:mb-10 rounded-2xl overflow-hidden bg-theme-surface border border-theme-line shadow-card-lg h-52 sm:h-64 md:h-72 lg:h-80"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Sedang tayang"
    >
      {slides.map(
        (s, i) =>
          i === idx && (
            <Image
              key={s.slug}
              src={s.posterUrl!}
              alt={s.name ?? ""}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top brightness-[0.3] saturate-[0.9] skeleton animate-fade-in"
            />
          ),
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-theme-bg/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-theme-bg/40 to-transparent hidden md:block" />

      <div className="absolute inset-0 flex items-end">
        <div className="p-5 sm:p-8 md:p-10 w-full max-w-2xl">
          <span className="inline-block text-[10px] font-bold text-rausch uppercase tracking-[0.2em] mb-1">Featured</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display text-theme-inverse font-bold leading-tight line-clamp-2">
            {active.name}
          </h1>
          {active.genre && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {active.genre.split(",").slice(0, 4).map((g) => (
                <span key={g.trim()} className="text-[11px] px-2.5 py-1 rounded-md bg-theme-surface-2/20 text-theme-ink-2 border border-theme-line/20">
                  {g.trim()}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs">
            {active.rating && (
              <span className="font-semibold px-1.5 py-0.5 rounded-md bg-yellow-500/90 text-black">★ {active.rating}</span>
            )}
            {active.year && <span className="text-theme-ink-2">{active.year}</span>}
            {active.badge && (
              <span className="px-2 py-0.5 rounded bg-rausch text-white text-[10px] font-bold">{active.badge}</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 sm:mt-6">
            <Link
              href={`/detail/${active.slug}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-rausch hover:bg-rausch-active active:scale-[0.97] text-white font-semibold text-sm transition-all shadow-glow"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
              Tonton Sekarang
            </Link>

            <div className="flex gap-1.5 sm:gap-2" role="tablist" aria-label="Pilih slide">
              {slides.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === idx ? "w-7 bg-rausch" : "w-2.5 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
