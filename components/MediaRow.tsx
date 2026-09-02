"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import MediaCard from "./MediaCard";
import type { MediaItem } from "@/lib/moviebox";

export default function MediaRow({
  title,
  items,
  moreHref,
}: {
  title: string;
  items: MediaItem[];
  moreHref?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  function scroll(dir: 1 | -1) {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 300), behavior: "smooth" });
  }

  if (!items.length) return null;

  return (
    <section className="reveal mb-8 sm:mb-10 group/row">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h2 className="text-base sm:text-lg font-display font-bold text-theme-ink">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scroll(-1)}
              disabled={!canLeft}
              aria-label={`Geser ${title} ke kiri`}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-theme-surface/90 backdrop-blur-sm border border-theme-line/40 text-theme-ink flex items-center justify-center hover:bg-theme-surface-2 shadow-lg transition-all active:scale-90 disabled:opacity-30 disabled:cursor-default"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canRight}
              aria-label={`Geser ${title} ke kanan`}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-theme-surface/90 backdrop-blur-sm border border-theme-line/40 text-theme-ink flex items-center justify-center hover:bg-theme-surface-2 shadow-lg transition-all active:scale-90 disabled:opacity-30 disabled:cursor-default"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {moreHref && (
            <Link href={moreHref} className="text-xs sm:text-sm text-rausch hover:text-rausch-active font-semibold transition-colors shrink-0">
              Lihat semua →
            </Link>
          )}
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-6 lg:px-8 snap-x snap-mandatory scroll-smooth"
      >
        {items.map((item, i) => (
          <MediaCard key={`${item.subjectId}-${i}`} item={item} variant="row" />
        ))}
      </div>
    </section>
  );
}
