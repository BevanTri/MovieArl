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
        <p className="text-muted text-sm mb-6">Film/serial ini mungkin sudah dihapus dari sumber.</p>
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
          <p className="text-muted">Gagal memuat. Server sibuk sesaat.</p>
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

  return (
    <div className="pt-4 sm:pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 animate-fade-in">
        <div className="shrink-0 w-36 sm:w-48 md:w-52 mx-auto sm:mx-0">
          <div className="frame-card aspect-[3/4] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover.url} alt={String(subject.title)} className="w-full h-full object-cover rounded-lg" />
          </div>
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-ink leading-snug break-words">
            {String(subject.title)}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 mt-3 text-sm">
            {Boolean(subject.imdbRatingValue) && (
              <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md bg-goldchip/90 text-black">
                ★ {String(subject.imdbRatingValue)}
              </span>
            )}
            {Boolean(subject.categoryName) && (
              <span className="px-2 py-0.5 rounded surface2 border border-line text-xs text-muted">{String(subject.categoryName)}</span>
            )}
            {Boolean(subject.releaseDate) && (
              <span className="text-muted">{String(subject.releaseDate).slice(0, 4)}</span>
            )}
            {Boolean(subject.duration) && <span className="text-muted">{String(subject.duration)}</span>}
          </div>

          {Array.isArray(subject.genreList) && subject.genreList.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
              {(subject.genreList as Array<{ name?: string }>).map((g, i) => (
                <span key={i} className="px-2.5 py-0.5 text-[11px] rounded-full bg-surface2 border border-line/60 text-muted">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-center sm:justify-start gap-2.5">
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
              <p className="text-sm text-muted">Pilih episode di bawah.</p>
            )}

            <FavoriteButton item={favItem} />
          </div>
          <ShareButtons title={String(subject.title)} slug={detailPath} />

          {Boolean((subject as { description?: string }).description) && (
            <p className="mt-6 text-[13px] sm:text-sm leading-relaxed text-muted line-clamp-6 sm:line-clamp-none text-justify sm:text-left">
              {String((subject as { description?: string }).description)}
            </p>
          )}
          <div className="mt-4"><AdSlot /></div>
        </div>
      </div>

      {isSeries && (
        <section className="mt-10 space-y-8 reveal-grid">
          {seasons.map(({ se, episodes }) => (
            <div key={se}>
              <h2 className="font-display text-base sm:text-lg font-bold mb-3 text-ink">Musim {se}</h2>
              <div className="grid grid-cols-4 min-[420px]:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {episodes.map((ep) => (
                  <Link
                    key={ep}
                    href={`/watch/${encodeURIComponent(detailPath)}?sid=${subjectId}&se=${se}&ep=${ep}`}
                    className="flex items-center justify-center py-2.5 rounded-lg surface border border-line/50 text-xs sm:text-sm font-medium text-ink2 hover:text-rausch hover:border-rausch/40 active:scale-[0.96] transition-all"
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
