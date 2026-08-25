"use client";

export type FavItem = {
  slug: string;
  sid: string;
  title: string;
  poster: string | null;
  year?: string | null;
};

export type HistoryItem = {
  slug: string;
  sid: string;
  title: string;
  poster: string | null;
  se: number;
  ep: number;
  at: number;
};

const FAV_KEY = "moviearl_favs";
const HIS_KEY = "moviearl_history";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, val: T[]) {
  localStorage.setItem(key, JSON.stringify(val.slice(0, 100)));
}

export function getFavorites(): FavItem[] {
  return read<FavItem>(FAV_KEY);
}

export function isFavorite(slug: string): boolean {
  return getFavorites().some((f) => f.slug === slug);
}

export function toggleFavorite(item: FavItem): boolean {
  const list = getFavorites();
  const idx = list.findIndex((f) => f.slug === item.slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    write(FAV_KEY, list);
    return false;
  }
  list.unshift(item);
  write(FAV_KEY, list);
  return true;
}

export function getHistory(): HistoryItem[] {
  return read<HistoryItem>(HIS_KEY);
}

export function saveHistory(item: HistoryItem) {
  const list = getHistory().filter((h) => h.slug !== item.slug);
  list.unshift({ ...item, at: Date.now() });
  write(HIS_KEY, list.slice(0, 50));
}
