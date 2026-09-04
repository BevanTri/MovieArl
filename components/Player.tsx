"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StreamSource, Caption } from "@/lib/moviebox";

type HlsInstance = { destroy: () => void } | null;

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

function proxied(url: string): string {
  return `/api/video?u=${encodeURIComponent(url)}`;
}

// Default 720p — seimbang antara ketajaman & kelancaran.
// Kalau tidak ada, pakai tertinggi di bawahnya yang tersedia.
function pickDefault(sources: StreamSource[]): number {
  const p = (s: StreamSource) => parseInt(s.resolution, 10) || 0;
  const idx720 = sources.findIndex((s) => p(s) === 720);
  if (idx720 !== -1) return idx720;
  let best = 0;
  for (let i = 1; i < sources.length; i++) {
    if (p(sources[i]) > p(sources[best]) && p(sources[i]) <= 720) best = i;
  }
  return best;
}

export default function Player({
  sources,
  hlsUrls,
  captions,
  poster,
  nextHref,
}: {
  sources: StreamSource[];
  hlsUrls: string[];
  captions: Caption[];
  poster?: string | null;
  nextHref?: string | null;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<HlsInstance>(null);
  const [active, setActive] = useState(() => pickDefault(sources));
  const [error, setError] = useState(false);
  // Coba langsung ke CDN dulu (IP viewer Indonesia lolos & cepat);
  // kalau ditolak, baru jatuh ke proxy server.
  const [useFallback, setUseFallback] = useState(false);
  const [rate, setRate] = useState(1);
  const [rateOpen, setRateOpen] = useState(false);
  const [showNext, setShowNext] = useState(false);

  // mp4 langsung tersedia → native video; hanya hls → hls.js
  const useHlsJs = sources.length === 0 && hlsUrls.length > 0;

  useEffect(() => {
    // Tipe React belum punya referrerPolicy untuk <video> → set atribut manual.
    // Referer kosong diterima CDN (default Ali-Swift "allow empty referer").
    videoRef.current?.setAttribute("referrerpolicy", "no-referrer");
  }, []);

  const goNext = useCallback(() => {
    if (nextHref) router.push(nextHref);
  }, [nextHref, router]);

  // Selesai → tawarkan episode berikutnya + auto lanjut 5 detik
  useEffect(() => {
    if (!showNext || !nextHref) return;
    const t = setTimeout(goNext, 5000);
    return () => clearTimeout(t);
  }, [showNext, nextHref, goNext]);

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen().catch(() => {});
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  // Shortcut keyboard (diabaikan kalau sedang mengetik)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          v.currentTime = Math.min(v.currentTime + 10, v.duration || v.currentTime + 10);
          break;
        case "ArrowLeft":
          v.currentTime = Math.max(v.currentTime - 10, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          v.volume = Math.min(v.volume + 0.1, 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          v.volume = Math.max(v.volume - 0.1, 0);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          v.muted = !v.muted;
          break;
        case "n":
          if (nextHref) goNext();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, toggleFullscreen, goNext, nextHref]);

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

  function changeRate(r: number) {
    setRate(r);
    setRateOpen(false);
    if (videoRef.current) videoRef.current.playbackRate = r;
  }

  async function enterPip() {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {
      // browser tidak mendukung
    }
  }

  function handleVideoError() {
    if (sources.length && !useFallback) {
      // CDN menolak akses langsung → pakai jalur proxy
      setUseFallback(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  function switchSource(i: number) {
    setActive(i);
    setError(false);
    const v = videoRef.current;
    if (v && sources[i]) {
      v.src = useFallback ? proxied(sources[i].url) : sources[i].url;
      v.load();
      v.playbackRate = rate;
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

  const rawUrl = sources[active]?.url ?? "";
  const videoSrc = useHlsJs ? undefined : useFallback ? proxied(rawUrl) : rawUrl || undefined;

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-line/50 shadow-[var(--shadow-card-lg)] group"
      >
        <video
          ref={videoRef}
          poster={poster ?? undefined}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full"
          src={videoSrc}
          onError={handleVideoError}
          onEnded={() => nextHref && setShowNext(true)}
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

        {showNext && nextHref && (
          <div className="absolute bottom-16 right-4 z-10 surface border border-line/60 rounded-xl px-4 py-3 shadow-card-lg text-sm flex items-center gap-3">
            <span className="text-muted">Episode selanjutnya dalam 5 dtk</span>
            <button onClick={goNext} className="px-3 py-1.5 rounded-lg bg-rausch text-white font-semibold active:scale-95 transition-transform">
              Lanjut ▶
            </button>
            <button onClick={() => setShowNext(false)} className="text-muted hover:text-ink" aria-label="Batalkan">✕</button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {sources.length > 1 &&
          sources.map((s, i) => (
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

        <div className="relative ml-auto">
          <button
            onClick={() => setRateOpen((o) => !o)}
            className="px-3 py-2 text-sm rounded-lg border surface border-line/50 text-muted hover:text-ink transition-colors"
            aria-label="Kecepatan putar"
          >
            {rate}×
          </button>
          {rateOpen && (
            <div className="absolute right-0 bottom-full mb-2 surface border border-line/60 rounded-xl overflow-hidden shadow-card-lg z-10">
              {RATES.map((r) => (
                <button
                  key={r}
                  onClick={() => changeRate(r)}
                  className={`block w-full px-4 py-2 text-sm text-left hover:bg-surface2 ${
                    r === rate ? "text-rausch font-semibold" : "text-muted"
                  }`}
                >
                  {r}×
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={enterPip}
          className="px-3 py-2 text-sm rounded-lg border surface border-line/50 text-muted hover:text-ink transition-colors"
          aria-label="Picture in Picture"
          title="Picture-in-Picture"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <rect x="12" y="12" width="7" height="5" rx="1" fill="currentColor" stroke="none" />
          </svg>
        </button>

        <button
          onClick={toggleFullscreen}
          className="px-3 py-2 text-sm rounded-lg border surface border-line/50 text-muted hover:text-ink transition-colors"
          aria-label="Layar penuh"
          title="Layar penuh (F)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
        </button>

        {nextHref && (
          <button
            onClick={goNext}
            className="px-3 py-2 text-sm rounded-lg border surface border-line/50 text-muted hover:text-rausch hover:border-rausch/40 transition-colors"
            title="Episode selanjutnya (N)"
          >
            Episode Selanjutnya ▶
          </button>
        )}
      </div>

      {useHlsJs && (
        <p className="text-xs text-muted mt-2">Memutar via HLS.</p>
      )}
    </div>
  );
}
