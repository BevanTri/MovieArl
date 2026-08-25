import Link from "next/link";
import { getMovies, getTvSeries, getAnimation, type CategoryResult } from "@/lib/moviebox";
import MediaCard from "@/components/MediaCard";

export const revalidate = 600;

const TABS = [
  { key: "movies", label: "Film", href: "/browse/movies" },
  { key: "tv", label: "Serial TV", href: "/browse/tv" },
  { key: "animation", label: "Animasi", href: "/browse/animation" },
] as const;

type Tab = (typeof TABS)[number]["key"];

const SORTS = [
  { key: "RECOMMEND", label: "Rekomendasi" },
  { key: "HOT_SCORE", label: "Populer" },
  { key: "NEWEST_RELEASE", label: "Terbaru" },
  { key: "SCORE", label: "Rating" },
] as const;

async function fetchTab(tab: Tab, page: number, sort: string): Promise<CategoryResult> {
  if (tab === "tv") return getTvSeries(page, sort);
  if (tab === "animation") return getAnimation(page, sort);
  return getMovies(page, sort);
}

export default async function BrowsePage({
  params,
  searchParams,
}: {
  params: Promise<{ tab: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { tab: rawTab } = await params;
  const { page: rawPage, sort: rawSort } = await searchParams;
  const tab = (TABS.find((t) => t.key === rawTab)?.key ?? "movies") as Tab;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const sort = SORTS.find((s) => s.key === rawSort)?.key ?? "RECOMMEND";

  let data: CategoryResult | null = null;
  try {
    data = await fetchTab(tab, page, sort);
  } catch {
    data = null;
  }

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
            href={`/browse/${tab}?sort=${s.key}`}
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
          <div className="grid grid-cols-3 min-[420px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-x-3 gap-y-5 reveal-grid">
            {data.items.map((item, i) => (
              <MediaCard key={`${item.subjectId}-${i}`} item={item} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-3">
            {page > 1 ? (
              <Link
                href={`/browse/${tab}?page=${page - 1}&sort=${sort}`}
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
                  href={`/browse/${tab}?page=${i}&sort=${sort}`}
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
                href={`/browse/${tab}?page=${page + 1}&sort=${sort}`}
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
