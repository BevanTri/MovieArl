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
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, paused, slides.length]);

  if (!slides.length) return null;
  const active = slides[idx];

  return (
    <div
      className="relative h-[60svh] max-h-[540px] min-h-[360px] w-full overflow-hidden bg-surface2"
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
              className="object-cover object-top opacity-70 animate-fade-in"
            />
          ),
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 inset-x-0">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
          <p className="eyebrow mb-1.5 text-rausch">Sedang Tayang</p>
          <h1 className="font-display text-[26px] leading-tight sm:text-4xl lg:text-5xl text-ink line-clamp-2">
            {active.name}
          </h1>
          <div className="flex items-center gap-2.5 sm:gap-3 mt-2 text-xs sm:text-sm">
            {active.rating && (
              <span className="font-semibold px-1.5 py-0.5 rounded-md bg-goldchip/90 text-black">★ {active.rating}</span>
            )}
            {active.year && <span className="text-muted">{active.year}</span>}
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
