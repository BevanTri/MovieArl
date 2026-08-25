"use client";

import { useEffect, useRef, useState } from "react";
import type { StreamSource, Caption } from "@/lib/moviebox";

type HlsInstance = { destroy: () => void } | null;

function proxied(url: string): string {
  return `/api/video?u=${encodeURIComponent(url)}`;
}

export default function Player({
  sources,
  hlsUrls,
  captions,
  poster,
}: {
  sources: StreamSource[];
  hlsUrls: string[];
  captions: Caption[];
  poster?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsInstance>(null);
  const [active, setActive] = useState(0);
  const [error, setError] = useState(false);

  // mp4 langsung tersedia → native video; hanya hls → hls.js
  const useHlsJs = sources.length === 0 && hlsUrls.length > 0;

  useEffect(() => {
    setError(false);
    if (!useHlsJs) return;
    let cancelled = false;

    (async () => {
      const mod = await import("hls.js");
      const Hls = mod.default;
      const video = videoRef.current;
      if (!video || cancelled) return;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(proxied(hlsUrls[0]));
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) setError(true);
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = proxied(hlsUrls[0]);
      } else {
        setError(true);
      }
    })();

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [useHlsJs, hlsUrls]);

  function switchSource(i: number) {
    setActive(i);
    setError(false);
    const v = videoRef.current;
    if (v && sources[i]) {
      v.src = proxied(sources[i].url);
      v.load();
      v.play().catch(() => {});
    }
  }

  if (!sources.length && !hlsUrls.length) {
    return (
      <div className="w-full aspect-video rounded-xl surface border border-line/50 flex items-center justify-center">
        <p className="text-muted text-sm">Stream tidak tersedia untuk judul ini. Coba judul lain.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-line/50 shadow-[var(--shadow-card-lg)]">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          poster={poster ?? undefined}
          controls
          playsInline
          className="absolute inset-0 w-full h-full"
          src={useHlsJs ? undefined : proxied(sources[active]?.url ?? "")}
          onError={() => setError(true)}
        >
          {captions.map((c, i) => {
            const label = c.lanName || c.language?.display || c.languageAbbr || `Sub ${i + 1}`;
            const isIndo = c.lan === "in_id" || /indo/i.test(c.lanName ?? "");
            return c.url ? (
              <track
                key={i}
                kind="subtitles"
                label={label}
                srcLang={c.languageAbbr || c.lan?.split("_")[0] || "id"}
                src={`/api/caption?u=${encodeURIComponent(c.url)}`}
                default={isIndo}
              />
            ) : null;
          })}
        </video>
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/80 text-sm text-muted">
            Gagal memuat stream — coba kualitas lain.
          </div>
        )}
      </div>

      {sources.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {sources.map((s, i) => (
            <button
              key={i}
              onClick={() => switchSource(i)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                i === active
                  ? "border-rausch text-rausch bg-rausch/10 font-semibold"
                  : "surface border-line/50 text-muted hover:text-ink"
              }`}
            >
              {s.resolution}
            </button>
          ))}
        </div>
      )}
      {useHlsJs && (
        <p className="text-xs text-muted mt-2">Memutar via HLS.</p>
      )}
    </div>
  );
}
