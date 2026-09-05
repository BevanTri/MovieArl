import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDetail, parseSeasons } from "@/lib/moviebox";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import type { FavItem } from "@/lib/local-store";

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const result = await getDetail(decodeURIComponent(slug));
    const subject = ((result?.subject ?? {}) as Record<string, unknown>) ?? {};
    const title = String(subject.title ?? "");
    if (!title) return {};
    const desc =
      String((subject as { description?: string }).description ?? "").slice(0, 160) ||
      "Nonton streaming sub Indonesia.";
    const poster = ((subject.cover ?? {}) as { url?: string }).url ?? undefined;
    return {
      title,
      description: desc,
      openGraph: { title, description: desc, images: poster ? [poster] : undefined, type: "video.movie" },
      twitter: { card: poster ? "summary_large_image" : "summary", title, description: desc, images: poster ? [poster] : undefined },
    };
  } catch {
    return {};
  }
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let d: Record<string, unknown> | null = null;
  let failed = false;
  let missing = false;
  try {
    const result = await getDetail(decodeURIComponent(slug));
    if (result === null) missing = true;
    else d = result as Record<string, unknown>;
  } catch {
    failed = true;
  }
  if (missing) {
    return (
      <div className="pt-24 pb-16 text-center px-4">
        <p className="font-display text-xl font-bold mb-2">Judul tidak tersedia</p>
        <p className="text-theme-muted text-sm mb-6">Film/serial ini mungkin sudah dihapus dari sumber.</p>
        <Link href="/" className="inline-block px-6 py-2.5 rounded-xl bg-rausch text-white font-semibold text-sm active:scale-[0.97] transition-transform">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }
  const subject = (d?.subject ?? {}) as Record<string, unknown>;

  if (!subject.title) {
    if (failed) {
      return (
        <div className="pt-24 pb-16 text-center px-4">
          <p className="text-theme-muted">Gagal memuat. Server sibuk sesaat.</p>
          <a href={`/detail/${slug}`} className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-rausch text-white font-semibold text-sm">
            Coba Lagi
          </a>
        </div>
      );
    }
    notFound();
  }

  const cover = (subject.cover ?? {}) as { url?: string };
  const resource = (d?.resource ?? {}) as {
    seasons?: Array<{ se: number; maxEp: number; allEp?: string }>;
  };
  const seasons = parseSeasons(resource.seasons);
  const isSeries = seasons.length > 0;
  const subjectId = String(subject.subjectId ?? "");
  const detailPath = String(subject.detailPath ?? slug);

  const favItem: FavItem = {
    slug: detailPath,
    sid: subjectId,
    title: String(subject.title),
    poster: cover.url ?? null,
    year: subject.releaseDate ? String(subject.releaseDate).slice(0, 4) : null,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isSeries ? "TVSeries" : "Movie",
    name: String(subject.title),
    image: cover.url,
    description: String((subject as { description?: string }).description ?? "").slice(0, 300),
    genre: Array.isArray((subject as { genreList?: Array<{ name?: string }> }).genreList) ? (subject as { genreList: Array<{ name?: string }> }).genreList.map((g) => g.name) : undefined,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-ink transition-colors mb-4 group">
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Kembali
      </Link>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-theme-surface rounded-2xl border border-theme-line p-4 sm:p-6 lg:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 animate-fade-in">
          <div className="shrink-0 w-32 sm:w-44 mx-auto sm:mx-0">
            <div className="aspect-[3/4] bg-theme-surface-2 rounded-xl p-1.5 shadow-card-lg ring-1 ring-theme-inverse/5 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover.url} alt={String(subject.title)} className="w-full h-full object-cover rounded-lg skeleton" loading="lazy" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-theme-ink leading-snug break-words">
              {String(subject.title)}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-sm">
              {Boolean(subject.imdbRatingValue) && (
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md bg-yellow-500/90 text-black flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {String(subject.imdbRatingValue)}
                </span>
              )}
              {Boolean(subject.categoryName) && (
                <span className="px-2 py-0.5 rounded bg-theme-surface-2/50 border border-theme-line text-xs text-theme-muted">{String(subject.categoryName)}</span>
              )}
              {Boolean(subject.releaseDate) && (
                <span className="text-theme-muted">{String(subject.releaseDate).slice(0, 4)}</span>
              )}
              {Boolean(subject.duration) && <span className="text-theme-muted">{String(subject.duration)}</span>}
            </div>

            {Array.isArray(subject.genreList) && subject.genreList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(subject.genreList as Array<{ name?: string }>).slice(0, 12).map((g, i) => (
                  <span key={i} className="px-3 py-1 text-xs font-medium rounded-full bg-rausch/8 text-rausch border border-rausch/15">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center gap-2.5">
              {!isSeries ? (
                <Link
                  href={`/watch/${encodeURIComponent(detailPath)}?sid=${subjectId}`}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-rausch hover:bg-rausch-active active:scale-[0.97] text-white font-semibold shadow-glow transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Tonton Sekarang
                </Link>
              ) : (
                <p className="text-sm text-theme-muted">Pilih episode di bawah.</p>
              )}

              <FavoriteButton item={favItem} />
            </div>
            <ShareButtons title={String(subject.title)} slug={detailPath} />

            {Boolean((subject as { description?: string }).description) && (
              <div className="mt-4 p-4 bg-theme-surface-2/50 rounded-xl border border-theme-line/20">
                <p className="text-sm text-theme-ink-2 leading-relaxed break-words whitespace-pre-wrap">
                  {String((subject as { description?: string }).description)}
                </p>
              </div>
            )}
            <div className="mt-4"><AdSlot /></div>
          </div>
        </div>
      </div>

      {isSeries && (
        <section className="mt-8 sm:mt-10 space-y-8">
          {seasons.map(({ se, episodes }) => (
            <div key={se}>
              <h2 className="font-display text-base sm:text-lg font-bold mb-3 text-theme-ink">Musim {se} <span className="text-theme-muted font-normal text-sm">({episodes.length})</span></h2>
              <div className="grid grid-cols-4 min-[420px]:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {episodes.map((ep) => (
                  <Link
                    key={ep}
                    href={`/watch/${encodeURIComponent(detailPath)}?sid=${subjectId}&se=${se}&ep=${ep}`}
                    className="flex items-center justify-center py-2.5 rounded-lg bg-theme-surface border border-theme-line/50 text-xs sm:text-sm font-medium text-theme-ink-2 hover:text-rausch hover:border-rausch/40 hover:bg-theme-surface-2/50 active:scale-[0.96] transition-all"
                    style={{ animationDelay: `${Math.min(ep * 30, 400)}ms` }}
                  >
                    EP{ep}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
