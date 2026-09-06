"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import MediaCard from "@/components/MediaCard";
import type { MediaItem } from "@/lib/moviebox";

const ALL = "Semua";
const GENRES = [ALL, "Action", "Horror", "Romance", "Comedy", "Sci-Fi", "Drama", "Thriller", "Animation", "Adventure", "Fantasy"];
const YEARS = [ALL, ...Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i))];
const COUNTRIES = [ALL, "Indonesia", "USA", "Japan", "Korea", "China", "UK"];

export default function BrowseFilter({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const genre = sp.get("genre") || ALL;
  const year = sp.get("year") || ALL;
  const country = sp.get("country") || ALL;

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value === ALL) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const sel = "bg-rausch text-white border-rausch";
  const idle = "bg-theme-surface border-theme-line/50 text-theme-muted hover:text-theme-ink";
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={genre} onChange={(e) => update("genre", e.target.value)} className={`px-3 py-1.5 rounded-full text-xs border ${genre === ALL ? idle : sel}`}>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={year} onChange={(e) => update("year", e.target.value)} className={`px-3 py-1.5 rounded-full text-xs border ${year === ALL ? idle : sel}`}>
          {YEARS.map((y) => <option key={y} value={y}>{y === ALL ? "Tahun" : y}</option>)}
        </select>
        <select value={country} onChange={(e) => update("country", e.target.value)} className={`px-3 py-1.5 rounded-full text-xs border ${country === ALL ? idle : sel}`}>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c === ALL ? "Negara" : c}</option>)}
        </select>
        {(genre !== ALL || year !== ALL || country !== ALL) && <button onClick={() => router.push(pathname)} className="px-3 py-1.5 text-xs text-rausch">Reset</button>}
        <span className="ml-auto text-xs text-theme-muted self-center">{items.length} di halaman ini</span>
      </div>
      <div className="grid grid-cols-3 min-[420px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-x-3 gap-y-5">
        {items.map((item, i) => <MediaCard key={`${item.subjectId}-${i}`} item={item} />)}
      </div>
    </>
  );
}
