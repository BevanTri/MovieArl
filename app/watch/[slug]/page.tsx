import Link from "next/link";
import type { Metadata } from "next";
import { getStreams, getCaptions, getDetail, parseSeasons, type StreamSource, type Caption } from "@/lib/moviebox";
import Player from "@/components/Player";
import HistoryRecorder from "@/components/HistoryRecorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  try {
    const result = await getDetail(decodeURIComponent(rawSlug));
    const subject = ((result?.subject ?? {}) as Record<string, unknown>) ?? {};
    const title = String(subject.title ?? "");
    if (!title) return {};
    const desc = `Nonton ${title} streaming sub Indonesia.`;
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

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sid?: string; se?: string; ep?: string }>;
}) {
  const { slug: rawSlug } = await params;
  const { sid: rawSid, se: rawSe, ep: rawEp } = await searchParams;
  const slug = decodeURIComponent(rawSlug);
  const subjectId = rawSid ?? "";
  const se = parseInt(rawSe ?? "0", 10) || 0;
  let ep = parseInt(rawEp ?? "0", 10) || 0;
  if (se > 0 && ep < 1) ep = 1;

  let title = "";
  let poster: string | null = null;
  let seasonsForNav: Array<{ se: number; episodes: number[] }> = [];

  try {
    const result = await getDetail(slug);
    if (result) {
      const subject = (result.subject ?? {}) as Record<string, unknown>;
      title = String(subject.title ?? "");
      poster = ((subject.cover ?? {}) as { url?: string }).url ?? null;
      const resource = (result.resource ?? {}) as {
        seasons?: Array<{ se: number; maxEp: number; allEp?: string }>;
      };
      seasonsForNav = parseSeasons(resource.seasons);
    }
  } catch {}

  let sources: StreamSource[] = [];
  let hlsUrls: string[] = [];
  let captions: Caption[] = [];
  try {
    if (subjectId && slug) {
      const [r, caps] = await Promise.all([
        getStreams(subjectId, slug, se, ep),
        getCaptions(subjectId, slug, se, ep),
      ]);
      sources = r.sources;
      hlsUrls = r.hls.map((h) => h.url).filter((u): u is string => Boolean(u));
      captions = caps;
    }
  } catch {}

  // Episode berikutnya: lanjut di musim yang sama, lalu musim berikutnya
  let nextHref: string | null = null;
  if (se > 0 && seasonsForNav.length) {
    const si = seasonsForNav.findIndex((s) => s.se === se);
    if (si !== -1) {
      const eps = seasonsForNav[si].episodes;
      const ei = eps.indexOf(ep);
      if (ei !== -1 && ei < eps.length - 1) {
        nextHref = `/watch/${encodeURIComponent(slug)}?sid=${subjectId}&se=${se}&ep=${eps[ei + 1]}`;
      } else if (si < seasonsForNav.length - 1 && seasonsForNav[si + 1].episodes.length) {
        const ns = seasonsForNav[si + 1];
        nextHref = `/watch/${encodeURIComponent(slug)}?sid=${subjectId}&se=${ns.se}&ep=${ns.episodes[0]}`;
      }
    }
  }

  return (
    <div className="pt-3 pb-16">
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted mb-3 min-w-0">
          <Link href="/" className="hover:text-rausch shrink-0">Beranda</Link>
          <span aria-hidden>/</span>
          <Link href={`/detail/${encodeURIComponent(slug)}`} className="hover:text-rausch truncate">
            {title || "Detail"}
          </Link>
        </nav>

        <h1 className="font-display text-lg sm:text-2xl text-ink mb-4 truncate">
          {title}
          {se > 0 && <span className="text-rausch"> · S{se}E{ep}</span>}
        </h1>

        <Player sources={sources} hlsUrls={hlsUrls} captions={captions} poster={poster} nextHref={nextHref} />

        {title && (
          <HistoryRecorder
            item={{ slug, sid: subjectId, title, poster, se, ep }}
          />
        )}

        {seasonsForNav.length > 0 && (
          <section className="mt-8 space-y-8">
            {seasonsForNav.map(({ se: s, episodes }) => (
              <div key={s}>
                <h2 className="font-display text-base sm:text-lg font-bold mb-3 text-ink">Musim {s}</h2>
                <div className="grid grid-cols-4 min-[420px]:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {episodes.map((e) => (
                    <Link
                      key={e}
                      href={`/watch/${encodeURIComponent(slug)}?sid=${subjectId}&se=${s}&ep=${e}`}
                      className={`flex items-center justify-center py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-all active:scale-[0.96] ${
                        s === se && e === ep
                          ? "border-rausch bg-rausch/15 text-rausch font-semibold"
                          : "surface border-line/50 text-ink2 hover:text-rausch hover:border-rausch/40"
                      }`}
                    >
                      EP{e}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
