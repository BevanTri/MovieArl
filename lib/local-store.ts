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
  at?: number;
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
  let added: boolean;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    list.unshift(item);
    added = true;
  }
  write(FAV_KEY, list);
  if (typeof window !== "undefined") fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favs: list.slice(0, 100) }) }).catch(() => {});
  return added;
}

export function getHistory(): HistoryItem[] {
  return read<HistoryItem>(HIS_KEY);
}

export function saveHistory(item: HistoryItem) {
  const list = getHistory().filter((h) => h.slug !== item.slug);
  list.unshift({ ...item, at: Date.now() });
  write(HIS_KEY, list.slice(0, 50));
  // ponytail: sync lintas device jika login
  if (typeof window !== "undefined") fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ history: list.slice(0, 50) }) }).catch(() => {});
}

export async function pullSync() {
  try {
    const r = await fetch("/api/sync", { cache: "no-store" });
    if (!r.ok) return;
    const j = (await r.json()) as { favs?: FavItem[]; history?: HistoryItem[] };
    if (Array.isArray(j.favs) && j.favs.length) write(FAV_KEY, j.favs.slice(0, 100));
    if (Array.isArray(j.history) && j.history.length) write(HIS_KEY, j.history.slice(0, 50));
  } catch {}
}
