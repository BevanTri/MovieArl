import Link from "next/link";
import { getStreams, getCaptions, getDetail, type StreamSource, type Caption } from "@/lib/moviebox";
import Player from "@/components/Player";
import HistoryRecorder from "@/components/HistoryRecorder";

export const dynamic = "force-dynamic";

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
  let se = parseInt(rawSe ?? "0", 10) || 0;
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
      seasonsForNav = (resource.seasons ?? []).map((s) => ({
        se: s.se,
        episodes: (s.allEp ?? "")
          .split(",")
          .map((x) => parseInt(x.trim(), 10))
          .filter(Number.isFinite),
      }));
    }
  } catch {}

  let sources: StreamSource[] = [];
  let hlsUrls: string[] = [];
  let captions: Caption[] = [];
  try {
    if (subjectId && slug) {
      const r = await getStreams(subjectId, slug, se, ep);
      sources = r.sources;
      hlsUrls = r.hls.map((h) => h.url).filter((u): u is string => Boolean(u));
      captions = await getCaptions(subjectId, slug, se, ep);
    }
  } catch {}

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

        <Player sources={sources} hlsUrls={hlsUrls} captions={captions} poster={poster} />

        {title && (
          <HistoryRecorder
            item={{ slug, sid: subjectId, title, poster, se, ep }}
          />
        )}

        {seasonsForNav.length > 0 && (
          <section className="mt-8 space-y-6">
            {seasonsForNav.map(({ se: s, episodes }) => (
              <div key={s}>
                <h2 className="eyebrow mb-2.5">Musim {s}</h2>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {episodes.map((e) => (
                    <Link
                      key={e}
                      href={`/watch/${encodeURIComponent(slug)}?sid=${subjectId}&se=${s}&ep=${e}`}
                      className={`min-w-[44px] px-3 py-2 rounded-lg text-center text-sm border transition-all active:scale-95 ${
                        s === se && e === ep
                          ? "border-rausch bg-rausch/15 text-rausch font-semibold"
                          : "surface border-line/50 text-muted hover:text-ink hover:border-rausch/40"
                      }`}
                    >
                      {e}
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
