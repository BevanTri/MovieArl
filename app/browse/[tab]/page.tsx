import Link from "next/link";
import { getMovies, getTvSeries, getAnimation, type CategoryResult } from "@/lib/moviebox";
import BrowseFilter from "@/components/BrowseFilter";

export const revalidate = 600;

const TABS = [
  { key: "movies", label: "Film", href: "/browse/movies" },
  { key: "tv", label: "Serial TV", href: "/browse/tv" },
  { key: "animation", label: "Animasi", href: "/browse/animation" },
] as const;

type Tab = (typeof TABS)[number]["key"];
const ALL = "ALL";

const SORTS = [
  { key: "RECOMMEND", label: "Rekomendasi" },
  { key: "HOT_SCORE", label: "Populer" },
  { key: "NEWEST_RELEASE", label: "Terbaru" },
  { key: "SCORE", label: "Rating" },
] as const;

async function fetchTab(tab: Tab, page: number, sort: string, genre = "ALL", country = "ALL", year = "ALL"): Promise<CategoryResult> {
  const { getCategoryData, getAnimation, getMovies, getTvSeries, search } = await import("@/lib/moviebox");
  const tabId = tab === "tv" ? 5 : tab === "animation" ? 8 : 2;
  if (tab === "animation" && genre === "ALL" && country === "ALL" && year === "ALL") return getAnimation(page, sort);
  // server filter like Mangava — pass genre/country/year to subject/filter + strict post-check
  try {
    const data = await getCategoryData(tabId, page, 24, sort, genre, country, year, "ALL");
    if (data.items.length) {
      // strict check: if user requested Indonesia but none match, fallback to search
      const matches = (it: { genre?: string | null; country?: string | null; year?: string | null }) => {
        if (genre !== "ALL" && !it.genre?.toLowerCase().includes(genre.toLowerCase())) return false;
        if (country !== "ALL" && !(it.country?.toLowerCase().includes(country.toLowerCase()) || it.genre?.toLowerCase().includes(country.toLowerCase()))) {
          // for Indonesia, also check year/country via search fallback, not strict fail
          // allow if country filter but genre contains country name
          return false;
        }
        if (year !== "ALL" && it.year !== year) return false;
        return true;
      };
      const filtered = data.items.filter(matches);
      if ((genre !== "ALL" || country !== "ALL" || year !== "ALL")) {
        if (filtered.length >= 3) return { ...data, items: filtered };
        // if filtered too few, try search keyword
        const kw = genre !== "ALL" ? genre : country !== "ALL" ? country : year;
        try {
          const s = await search(String(kw), page);
          if (s.items.length) return s;
        } catch {}
        if (filtered.length) return { ...data, items: filtered };
      } else {
        return data;
      }
    }
  } catch {}
  // fallback: if filter yields 0, try search keyword (for genre like Action via search is more reliable)
  const kw = genre !== "ALL" ? genre : country !== "ALL" ? country : year !== "ALL" ? year : "";
  if (kw && kw !== "ALL") {
    try {
      const s = await search(kw, page);
      if (s.items.length) return s;
    } catch {}
  }
  if (tab === "tv") return getTvSeries(page, sort);
  if (tab === "animation") return getAnimation(page, sort);
  return getMovies(page, sort);
}

export default async function BrowsePage({
  params,
  searchParams,
}: {
  params: Promise<{ tab: string }>;
  searchParams: Promise<{ page?: string; sort?: string; genre?: string; country?: string; year?: string; lang?: string; q?: string }>;
}) {
  const { tab: rawTab } = await params;
  const { page: rawPage, sort: rawSort, genre: rawGenre, country: rawCountry, year: rawYear, lang: rawLang, q: rawQ } = await searchParams;
  const tab = (TABS.find((t) => t.key === rawTab)?.key ?? "movies") as Tab;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const sort = SORTS.find((s) => s.key === rawSort)?.key ?? "RECOMMEND";
  const genre = rawGenre || ALL;
  const country = rawCountry || ALL;
  const year = rawYear || ALL;
  const q = rawQ;

  let data: CategoryResult | null = null;
  try {
    data = await fetchTab(tab, page, sort, genre, country, year);
    // if q present (from Categories search), prioritize search
    if (q) {
      const { search } = await import("@/lib/moviebox");
      const s = await search(q, page);
      if (s.items.length) data = s;
    }
  } catch {
    data = null;
  }
  const qs = (extra: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    if (sort !== "RECOMMEND") p.set("sort", sort);
    if (genre !== ALL) p.set("genre", genre);
    if (country !== ALL) p.set("country", country);
    if (year !== ALL) p.set("year", year);
    if (q) p.set("q", q);
    Object.entries(extra).forEach(([k, v]) => { if (v !== undefined) p.set(k, String(v)); });
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const totalPages = data ? Math.min(50, Math.ceil((data.total || 1) / data.perPage)) : 0;

  return (
    <div className="pt-5 sm:pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="font-display text-xl sm:text-2xl text-ink mb-4">
        {TABS.find((t) => t.key === tab)?.label}
      </h1>

      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/browse/${t.key}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 active:scale-[0.97] ${
              tab === t.key
                ? "bg-rausch text-white shadow-card"
                : "surface border border-line/50 text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={`/browse/${tab}${qs({ sort: s.key, page: 1 })}`}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors shrink-0 ${
              sort === s.key
                ? "text-rausch bg-rausch/10 font-medium"
                : "text-muted hover:text-ink"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {data?.items.length ? (
        <>
          <BrowseFilter key={`${tab}-${page}-${sort}`} items={data.items} />

          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-3">
            {page > 1 ? (
              <Link
                href={`/browse/${tab}${qs({ page: page - 1 })}`}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl surface border border-line/50 text-ink text-xs sm:text-sm font-medium hover:bg-surface2/50 transition-colors active:scale-[0.97]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Sebelumnya
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl surface2/30 border border-line/30 text-muted/40 text-xs sm:text-sm font-medium opacity-60">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Sebelumnya
              </span>
            )}

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((i) => (
                <Link
                  key={i}
                  href={`/browse/${tab}${qs({ page: i })}`}
                  className={`w-9 h-9 rounded-lg text-sm flex items-center justify-center font-medium transition-all ${
                    i === page
                      ? "bg-rausch text-white"
                      : "text-muted hover:bg-surface2/50 hover:text-ink"
                  }`}
                >
                  {i}
                </Link>
              ))}
            </div>
            <span className="sm:hidden text-xs text-muted shrink-0">
              Hal {page}/{totalPages}
            </span>

            {page < totalPages && (
              <Link
                href={`/browse/${tab}${qs({ page: page + 1 })}`}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-rausch text-white text-xs sm:text-sm font-semibold hover:bg-rausch-active transition-colors active:scale-[0.97] shadow-card"
              >
                Selanjutnya
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </>
      ) : (
        <p className="text-muted text-center py-20">Gagal memuat atau tidak ada konten.</p>
      )}
    </div>
  );
}
