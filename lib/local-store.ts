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

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncPayload: { favs?: FavItem[]; history?: HistoryItem[] } | null = null;
async function queueSync(patch: { favs?: FavItem[]; history?: HistoryItem[] }) {
  syncPayload = { ...syncPayload, ...patch };
  if (syncTimer) return;
  syncTimer = setTimeout(async () => {
    const payload = syncPayload;
    syncPayload = null;
    syncTimer = null;
    if (!payload) return;
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (r.ok) break;
        if (r.status === 401) break;
      } catch {}
      await new Promise((res) => setTimeout(res, 400 * (i + 1)));
    }
  }, 500);
}

function mergeBySlug<T extends { slug: string; at?: number }>(a: T[], b: T[], cap: number): T[] {
  const m = new Map<string, T>();
  for (const x of [...a, ...b]) if (!m.has(x.slug)) m.set(x.slug, x);
  // for history: sort by at desc if present
  const arr = Array.from(m.values());
  if (arr[0]?.at !== undefined) arr.sort((x, y) => (y.at ?? 0) - (x.at ?? 0));
  return arr.slice(0, cap);
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
  if (typeof window !== "undefined") queueSync({ favs: list.slice(0, 100) });
  return added;
}

export function getHistory(): HistoryItem[] {
  return read<HistoryItem>(HIS_KEY);
}

export function saveHistory(item: HistoryItem) {
  const list = getHistory().filter((h) => h.slug !== item.slug);
  list.unshift({ ...item, at: Date.now() });
  write(HIS_KEY, list.slice(0, 50));
  if (typeof window !== "undefined") queueSync({ history: list.slice(0, 50) });
}

export async function pullSync() {
  try {
    const r = await fetch("/api/sync", { cache: "no-store" });
    if (!r.ok) return;
    const j = (await r.json()) as { favs?: FavItem[]; history?: HistoryItem[] };
    if (Array.isArray(j.favs) && j.favs.length) {
      const local = getFavorites();
      write(FAV_KEY, mergeBySlug(local, j.favs, 100));
    }
    if (Array.isArray(j.history) && j.history.length) {
      const local = getHistory();
      // server at is epoch ms string → coerce to number
      const server = j.history.map((h) => ({ ...h, at: typeof h.at === "string" ? Number(h.at) : h.at }));
      write(HIS_KEY, mergeBySlug(local, server as HistoryItem[], 50));
    }
  } catch {}
}
