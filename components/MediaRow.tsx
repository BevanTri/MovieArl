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
    <section className="mb-6 sm:mb-8 group/row">
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-base sm:text-lg font-bold text-ink">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scroll(-1)}
              disabled={!canLeft}
              aria-label={`Geser ${title} ke kiri`}
              className="w-9 h-9 rounded-full surface border border-line flex items-center justify-center text-muted transition-all enabled:hover:text-rausch enabled:hover:border-rausch/40 active:scale-90 disabled:opacity-30 disabled:cursor-default"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canRight}
              aria-label={`Geser ${title} ke kanan`}
              className="w-9 h-9 rounded-full surface border border-line flex items-center justify-center text-muted transition-all enabled:hover:text-rausch enabled:hover:border-rausch/40 active:scale-90 disabled:opacity-30 disabled:cursor-default"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {moreHref && (
            <Link href={moreHref} className="text-xs sm:text-sm text-rausch hover:text-rausch-active font-medium">
              Semua →
            </Link>
          )}
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-row pb-2 -mx-4 px-4 sm:mx-0 sm:px-6 lg:px-8"
      >
        {items.map((item, i) => (
          <MediaCard key={`${item.subjectId}-${i}`} item={item} variant="row" />
        ))}
      </div>
    </section>
  );
}
