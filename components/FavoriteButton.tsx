"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite, type FavItem } from "@/lib/local-store";

export default function FavoriteButton({ item }: { item: FavItem }) {
  const [fav, setFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFav(isFavorite(item.slug));
    setMounted(true);
  }, [item.slug]);

  function onClick() {
    const now = toggleFavorite(item);
    setFav(now);
  }

  return (
    <button
      onClick={onClick}
      aria-label={fav ? "Hapus dari favorit" : "Tambah ke favorit"}
      aria-pressed={fav}
      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${
        fav
          ? "bg-rausch/15 border-rausch/50 text-rausch"
          : "surface text-muted hover:text-rausch hover:border-rausch/40"
      } ${mounted ? "" : "opacity-0"}`}
    >
      <svg className="w-5 h-5" fill={fav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
