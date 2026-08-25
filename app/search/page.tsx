import { search } from "@/lib/moviebox";
import MediaCard from "@/components/MediaCard";

export const metadata = { title: "Pencarian" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const keyword = (q ?? "").trim();

  let results = null;
  if (keyword) {
    try {
      results = await search(keyword);
    } catch {
      results = null;
    }
  }

  return (
    <div className="pt-5 sm:pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="font-display text-xl sm:text-2xl text-ink">Pencarian</h1>
      <p className="text-sm text-muted mt-1 mb-6">
        {keyword ? `${results?.total ?? 0} hasil untuk "${keyword}"` : "Ketik di kotak pencarian atas"}
      </p>

      {results?.items.length ? (
        <div className="grid grid-cols-3 min-[420px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-x-3 gap-y-5 reveal-grid">
          {results.items.map((item, i) => (
            <MediaCard key={`${item.subjectId}-${i}`} item={item} />
          ))}
        </div>
      ) : keyword ? (
        <div className="surface border border-line/50 rounded-2xl p-14 text-center">
          <p className="text-muted">Film tidak ditemukan.</p>
          <p className="text-sm text-muted/60 mt-1">Coba kata kunci lain.</p>
        </div>
      ) : null}
    </div>
  );
}
