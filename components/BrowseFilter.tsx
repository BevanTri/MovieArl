"use client";
import { useMemo, useState } from "react";
import MediaCard from "@/components/MediaCard";
import type { MediaItem } from "@/lib/moviebox";

const ALL = "Semua";

export default function BrowseFilter({ items }: { items: MediaItem[] }) {
  const [genre, setGenre] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [country, setCountry] = useState(ALL);

  const genres = useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => it.genre?.split(",").forEach((g) => g.trim() && s.add(g.trim())));
    return [ALL, ...Array.from(s).sort()];
  }, [items]);
  const years = useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => it.year && s.add(it.year));
    return [ALL, ...Array.from(s).sort((a, b) => Number(b) - Number(a))];
  }, [items]);
  const countries = useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => it.country && s.add(it.country));
    return [ALL, ...Array.from(s).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (genre !== ALL && !it.genre?.split(",").map((g) => g.trim()).includes(genre)) return false;
      if (year !== ALL && it.year !== year) return false;
      if (country !== ALL && it.country !== country) return false;
      return true;
    });
  }, [items, genre, year, country]);

  const sel = "bg-rausch text-white border-rausch";
  const idle = "surface border-line/50 text-muted hover:text-ink";
  // ponytail: native select over lib
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className={`px-3 py-1.5 rounded-full text-xs border ${genre===ALL?idle:sel}`}>
          {genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className={`px-3 py-1.5 rounded-full text-xs border ${year===ALL?idle:sel}`}>
          {years.map((y) => <option key={y} value={y}> {y===ALL?"Tahun":y}</option>)}
        </select>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={`px-3 py-1.5 rounded-full text-xs border ${country===ALL?idle:sel}`}>
          {countries.map((c) => <option key={c} value={c}>{c===ALL?"Negara":c}</option>)}
        </select>
        {(genre!==ALL||year!==ALL||country!==ALL) && <button onClick={()=>{setGenre(ALL);setYear(ALL);setCountry(ALL)}} className="px-3 py-1.5 text-xs text-rausch">Reset</button>}
        <span className="ml-auto text-xs text-muted self-center">{filtered.length}/{items.length}</span>
      </div>
      {filtered.length ? (
        <div className="grid grid-cols-3 min-[420px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-x-3 gap-y-5 reveal-grid">
          {filtered.map((item, i) => <MediaCard key={`${item.subjectId}-${i}`} item={item} />)}
        </div>
      ) : <p className="text-muted text-center py-10 text-sm">Tidak ada hasil di halaman ini. Coba reset filter atau halaman lain.</p>}
    </>
  );
}
