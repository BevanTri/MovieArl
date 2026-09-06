export const SITE_BASE = "https://themoviebox.xyz";
const API_BASE = "https://h5-api.aoneroom.com/wefeed-h5api-bff";
export const STREAM_BASE = "https://h5.aoneroom.com/wefeed-h5-bff";

let bearerToken: string | null = null;

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
  Referer: `${SITE_BASE}/`,
  Origin: SITE_BASE,
  "X-Client-Info": '{"timezone":"Asia/Jakarta"}',
  "X-Request-Lang": "en",
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const PLAYER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://h5.aoneroom.com",
  "Content-Type": "application/json",
};

function readTokenFromXUser(raw: string | null): void {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    const token = parsed?.token;
    if (token) bearerToken = token;
  } catch {
    // ignore malformed header
  }
}

let bearerAt = 0;
const BEARER_TTL = 10 * 60 * 1000;
export async function getBearerToken(): Promise<string> {
  if (bearerToken && Date.now() - bearerAt < BEARER_TTL) return bearerToken;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${API_BASE}/home?host=themoviebox.xyz`, {
      headers: DEFAULT_HEADERS,
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(t));
    readTokenFromXUser(res.headers.get("x-user"));
    if (!bearerToken) {
      const cookie = res.headers.get("set-cookie") ?? "";
      const m = cookie.match(/token=([^;]+)/);
      if (m) bearerToken = m[1];
    }
    if (bearerToken) bearerAt = Date.now();
  } catch {}
  return bearerToken ?? "";
}

async function mbRequest(
  url: string,
  method: "GET" | "POST" = "GET",
  payload?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<unknown> {
  const token = await getBearerToken();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  const res = await fetch(url, {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(extraHeaders ?? {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
    redirect: "follow",
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(t));
  readTokenFromXUser(res.headers.get("x-user"));
  if (!res.ok) throw new Error(`Upstream API error ${res.status}: ${url}`);
  return res.json();
}

export type MediaItem = {
  name: string | null;
  posterUrl: string | null;
  slug: string | null;
  subjectId: string | null;
  badge?: string | null;
  rating?: string | null;
  year?: string | null;
  genre?: string | null;
  country?: string | null;
};

export type HomeSection = {
  section: string;
  items: MediaItem[];
};

type RawSubject = Record<string, unknown>;

function pickStr(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function mapSubject(sub: RawSubject): MediaItem {
  const cover = sub.cover as { url?: string } | undefined;
  const releaseDate = pickStr(sub.releaseDate);
  return {
    name: pickStr(sub.title),
    posterUrl: pickStr(cover?.url),
    slug: pickStr(sub.detailPath),
    subjectId:
      pickStr(sub.subjectId) ??
      (typeof sub.subjectId === "number" ? String(sub.subjectId) : null),
    badge: pickStr(sub.corner),
    rating: pickStr(sub.imdbRatingValue),
    year: releaseDate ? releaseDate.slice(0, 4) : null,
    genre: pickStr(sub.genre),
    country: pickStr(sub.countryName) ?? pickStr(sub.country),
  };
}

const homeCache = new Map<string, { at: number; data: HomeSection[] }>();
const HOME_TTL = 5 * 60 * 1000;
export async function getHome(): Promise<HomeSection[]> {
  const hk = "home";
  const hit = homeCache.get(hk);
  if (hit && Date.now() - hit.at < HOME_TTL) return hit.data;
  const data = (await mbRequest(`${API_BASE}/home?host=themoviebox.xyz`)) as {
    data?: { operatingList?: Array<RawSubject> };
  };
  const sections: HomeSection[] = [];
  for (const op of data.data?.operatingList ?? []) {
    const opType = op.type as string;
    const title = (op.title as string) || "Featured";

    if (opType === "BANNER") {
      const banner = op.banner as
        | { items?: Array<RawSubject & { image?: { url?: string } }> }
        | undefined;
      const items = (banner?.items ?? [])
        .filter(
          (item) =>
            typeof item.title === "string" && !item.title.includes("Communities"),
        )
        .map((item) => {
          const subject = (item.subject ?? {}) as RawSubject;
          return {
            name:
              pickStr(item.title) ?? pickStr(subject.title),
            posterUrl:
              pickStr(item.image?.url) ??
              pickStr((subject.cover as { url?: string } | undefined)?.url),
            slug:
              pickStr(item.detailPath) ??
              pickStr(subject.detailPath),
            subjectId:
              pickStr(subject.subjectId) ??
              (typeof subject.subjectId === "number"
                ? String(subject.subjectId)
                : null),
            badge: pickStr(subject.corner),
          };
        })
        .filter((i) => i.slug || i.subjectId);
      if (items.length) sections.push({ section: "Banner", items });
    } else if (
      ["SUBJECTS_MOVIE", "SUBJECTS_TV", "SUBJECTS_ANIMATION"].includes(opType)
    ) {
      const subjects = (op.subjects ?? []) as RawSubject[];
      const items = subjects.map(mapSubject).filter((i) => i.name);
      if (items.length) sections.push({ section: title, items });
    }
  }

  homeCache.set(hk, { at: Date.now(), data: sections });
  return sections;
}

export type CategoryResult = {
  page: number;
  perPage: number;
  total: number;
  items: MediaItem[];
};

async function getCategoryData(
  tabId: number,
  page = 1,
  perPage = 24,
  sort = "RECOMMEND",
  genre = "ALL",
): Promise<CategoryResult> {
  const data = (await mbRequest(`${API_BASE}/subject/filter`, "POST", {
    tabId,
    filter: { sort, genre, country: "ALL", year: "ALL", language: "ALL" },
    page,
    perPage,
  })) as { data?: Record<string, unknown> };

  const inner = data.data ?? {};
  const rawItems =
    (inner.items as RawSubject[] | undefined) ??
    (inner.subjects as RawSubject[] | undefined) ??
    [];
  const items = rawItems.map(mapSubject).filter((i) => i.name);
  const pager = (inner.pager ?? {}) as { totalCount?: number };
  const total =
    pager.totalCount ??
    (typeof inner.total === "number" ? inner.total : items.length);

  return { page, perPage, total, items };
}

export function getMovies(page = 1, sort = "RECOMMEND") {
  return getCategoryData(2, page, 24, sort);
}

export function getTvSeries(page = 1, sort = "RECOMMEND") {
  return getCategoryData(5, page, 24, sort);
}

export async function getAnimation(page = 1, sort = "RECOMMEND") {
  // strict like Mangava: filter pool by genre string, fallback to search 'anime'
  const res = await getCategoryData(8, page, 24, sort);
  const isAnim = (g?: string | null) => {
    if (!g) return false;
    const t = g.toLowerCase();
    return t.includes("animation") || t.includes("anime") || t.includes("cartoon") || t.includes("family") && t.includes("animation");
  };
  const filtered = res.items.filter((it) => isAnim(it.genre));
  if (filtered.length >= 8) return { ...res, items: filtered, total: filtered.length };
  // fallback: search anime (Vercel IP returns proper anime)
  try {
    const s = await search("anime", page);
    // search already returns anime-related, keep all but prioritize those with animation genre
    const anim = s.items.filter((it) => !it.genre || isAnim(it.genre) || it.name?.toLowerCase().includes("anime"));
    if (anim.length >= 8) return { page, perPage: 24, total: s.total, items: anim.slice(0, 24) };
    if (s.items.length) return s;
  } catch {}
  // if still not enough, return filtered (could be empty -> show empty state, not live-action)
  if (filtered.length) return { ...res, items: filtered, total: filtered.length };
  return { ...res, items: [], total: 0 };
}

const genreCache = new Map<string, { at: number; data: HomeSection[] }>();
const GENRE_TTL = 10 * 60 * 1000;
export async function getGenreShelves(): Promise<HomeSection[]> {
  const hit = genreCache.get("genres");
  if (hit && Date.now() - hit.at < GENRE_TTL) return hit.data;
  const genres = ["Action", "Horror", "Romance", "Comedy", "Sci-Fi", "Indonesia", "Hollywood", "Indo Dub"];
  const results = await Promise.all(
    genres.map(async (g) => {
      try {
        if (g === "Indonesia") {
          const r = await search("indonesia", 1);
          return { section: g, items: r.items.slice(0, 12) } as HomeSection;
        }
        if (g === "Hollywood") {
          const r = await search("hollywood", 1);
          return { section: g, items: r.items.slice(0, 12) } as HomeSection;
        }
        if (g === "Indo Dub") {
          const r = await search("indo dub", 1);
          return { section: g, items: r.items.slice(0, 12) } as HomeSection;
        }
        const r = await getCategoryData(2, 1, 24, "RECOMMEND", g);
        const filtered = r.items.filter((it) => it.genre?.toLowerCase().includes(g.toLowerCase()));
        if (filtered.length >= 3) return { section: g, items: filtered.slice(0, 12) } as HomeSection;
        const s = await search(g.toLowerCase(), 1);
        return { section: g, items: s.items.slice(0, 12) } as HomeSection;
      } catch {
        return { section: g, items: [] } as HomeSection;
      }
    }),
  );
  const filtered = results.filter((r) => r.items.length >= 3);
  genreCache.set("genres", { at: Date.now(), data: filtered });
  return filtered;
}

export async function searchSuggest(q: string): Promise<MediaItem[]> {
  const data = (await mbRequest(
    `${API_BASE}/subject/search-suggest`,
    "POST",
    { keyword: q, perPage: 10 },
  )) as { data?: Record<string, unknown> };
  const inner = data.data ?? {};
  const raw =
    (inner.items as RawSubject[] | undefined) ??
    (inner.list as RawSubject[] | undefined) ??
    [];
  const mapped = raw
    .map((item) => {
      const sub = ((item.subject ?? item) ?? {}) as RawSubject;
      return mapSubject(sub);
    })
    .filter((i) => i.slug);
  if (mapped.length) return mapped;

  // Fallback: suggest kadang cuma kasih kata tanpa subject → pakai search penuh
  try {
    const full = await search(q, 1);
    return full.items.slice(0, 10);
  } catch {
    return [];
  }
}

export async function search(q: string, page = 1): Promise<CategoryResult> {
  const data = (await mbRequest(`${API_BASE}/subject/search`, "POST", {
    keyword: q,
    page,
    perPage: 20,
  })) as { data?: Record<string, unknown> };
  const inner = data.data ?? {};
  const raw =
    (inner.items as RawSubject[] | undefined) ??
    (inner.list as RawSubject[] | undefined) ??
    [];
  const items = raw.map(mapSubject).filter((i) => i.name);
  const pager = (inner.pager ?? {}) as { totalCount?: number };
  const total =
    pager.totalCount ??
    (typeof inner.total === "number" ? inner.total : items.length);
  return { page, perPage: 20, total, items };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DetailData = any;

// Cache detail sebentar — generateMetadata + body render sama-sama butuh
const detailCache = new Map<string, { at: number; data: DetailData | null }>();
const DETAIL_CACHE_TTL = 60_000;

export async function getDetail(slug: string): Promise<DetailData | null> {
  const hit = detailCache.get(slug);
  if (hit && Date.now() - hit.at < DETAIL_CACHE_TTL) return hit.data;

  const res = await fetch(
    `${API_BASE}/detail?detailPath=${encodeURIComponent(slug)}`,
    {
      headers: { ...DEFAULT_HEADERS },
      redirect: "follow",
      cache: "no-store",
    },
  );

  let data: DetailData | null;
  if (res.status === 404) {
    // Judul memang sudah tidak ada di upstream — bukan error jaringan
    data = null;
  } else if (!res.ok) {
    throw new Error(`Upstream API error ${res.status}`);
  } else {
    readTokenFromXUser(res.headers.get("x-user"));
    data = ((await res.json()) as { data?: DetailData }).data ?? {};
  }

  detailCache.set(slug, { at: Date.now(), data });
  return data;
}

export type StreamSource = {
  resolution: string;
  format: string;
  url: string;
  size?: number | string | null;
};

export type StreamResult = {
  subjectId: string;
  se: number;
  ep: number;
  hasResource: boolean;
  sources: StreamSource[];
  hls: Array<{ url?: string; resolutions?: string }>;
  limited: boolean;
};

type RawPlayData = {
  hasResource?: boolean;
  streams?: Array<{ url?: string; resolutions?: string; format?: string; size?: number }>;
  hls?: Array<{ url?: string; resolutions?: string }>;
  limited?: boolean;
};

// Cache play response sebentar — hindari fetch ulang upstream saat refresh/seek
const playCache = new Map<string, { at: number; data: RawPlayData }>();
const PLAY_CACHE_TTL = 60_000;

async function playOnce(
  subjectId: string,
  qSe: number,
  qEp: number,
  detailPath: string,
): Promise<RawPlayData> {
  const token = await getBearerToken();
  const playUrl = `${STREAM_BASE}/web/subject/play?subjectId=${subjectId}&se=${qSe}&ep=${qEp}&detailPath=${encodeURIComponent(detailPath)}`;
  const referer = `${SITE_BASE.replace("themoviebox.xyz", "h5.aoneroom.com")}/spa/videoPlayPage/movies/${detailPath}?id=${subjectId}&type=/movie/detail&detailSe=${qSe}&detailEp=${qEp}&lang=en`;

  // Datacenter (mis. Vercel) diblokir WAF oleh host stream →
  // opsional relai lewat Cloudflare Worker (env STREAM_PROXY_URL).
  const proxy = process.env.STREAM_PROXY_URL?.trim();
  const fetchUrl = proxy ? `${proxy}?url=${encodeURIComponent(playUrl)}` : playUrl;

  const res = await fetch(fetchUrl, {
    headers: {
      ...PLAYER_HEADERS,
      Origin: "https://h5.aoneroom.com",
      Referer: referer,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) return {};
  const json = (await res.json()) as { data?: RawPlayData };
  return json.data ?? {};
}

export async function getStreams(
  subjectId: string,
  detailPath: string,
  se = 0,
  ep = 0,
): Promise<StreamResult> {
  // Series: ep wajib >=1 (ep=0 selalu kosong di upstream). Movie: se=0&ep=0.
  let qSe = se;
  let qEp = ep;
  const isSeries = qSe > 0;
  if (isSeries && qEp < 1) qEp = 1;

  const cacheKey = `${subjectId}|${qSe}|${qEp}`;
  const hit = playCache.get(cacheKey);
  if (hit && Date.now() - hit.at < PLAY_CACHE_TTL) {
    return toStreamResult(subjectId, qSe, qEp, hit.data);
  }

  let data: RawPlayData = await playOnce(subjectId, qSe, qEp, detailPath);

  // Fallback ringkas: cukup variasi nomor episode, origin/token tunggal
  if (!data.hasResource && !(data.streams ?? []).length) {
    const attempts: Array<[number, number]> = isSeries
      ? [
          [qSe, qEp === 1 ? 2 : 1],
          [1, 1],
        ]
      : [[1, 1]];
    for (const [aSe, aEp] of attempts) {
      qSe = aSe;
      qEp = aEp;
      data = await playOnce(subjectId, qSe, qEp, detailPath);
      if (data.hasResource || (data.streams ?? []).length) break;
    }
  }

  playCache.set(cacheKey, { at: Date.now(), data });
  return toStreamResult(subjectId, qSe, qEp, data);
}

function toStreamResult(
  subjectId: string,
  qSe: number,
  qEp: number,
  data: RawPlayData,
): StreamResult {
  const sources: StreamSource[] = (data.streams ?? [])
    .filter((s): s is { url: string; resolutions?: string; format?: string; size?: number } => Boolean(s.url))
    .map((s) => ({
      resolution: s.resolutions ? `${s.resolutions}p` : "HD",
      format: s.format ?? "mp4",
      url: s.url,
      size: s.size ?? null,
    }));

  return {
    subjectId,
    se: qSe,
    ep: qEp,
    hasResource: Boolean(data.hasResource) || sources.length > 0,
    sources,
    hls: data.hls ?? [],
    limited: Boolean(data.limited),
  };
}

export type Caption = {
  language?: Record<string, string>;
  url?: string;
  languageAbbr?: string;
  lan?: string;
  lanName?: string;
};

export type SeasonEpisodes = { se: number; episodes: number[] };

// allEp kadang kosong di upstream → fallback generate 1..maxEp
export function parseSeasons(
  seasons?: Array<{ se: number; maxEp?: number; allEp?: string }>,
): SeasonEpisodes[] {
  if (!seasons?.length) return [];
  return seasons
    .map((s) => {
      const eps = (s.allEp ?? "")
        .split(",")
        .map((x) => parseInt(x.trim(), 10))
        .filter((n) => Number.isFinite(n));
      const list = eps.length ? eps : Array.from({ length: s.maxEp || 0 }, (_, i) => i + 1);
      return { se: s.se, episodes: list };
    })
    .filter((s) => s.episodes.length > 0);
}

export async function getCaptions(
  subjectId: string,
  detailPath: string,
  se = 0,
  ep = 0,
): Promise<Caption[]> {
  const token = await getBearerToken();
  const playUrl = `${STREAM_BASE}/web/subject/play?subjectId=${subjectId}&se=${se}&ep=${ep}&detailPath=${encodeURIComponent(detailPath)}`;
  const referer = `${SITE_BASE.replace("themoviebox.xyz", "h5.aoneroom.com")}/spa/videoPlayPage/movies/${detailPath}?id=${subjectId}&type=/movie/detail&detailSe=${se}&detailEp=${ep}&lang=en`;

  const proxy = process.env.STREAM_PROXY_URL?.trim();
  const capPlayUrl = proxy ? `${proxy}?url=${encodeURIComponent(playUrl)}` : playUrl;
  const res = await fetch(capPlayUrl, {
    headers: {
      ...PLAYER_HEADERS,
      Origin: "https://h5.aoneroom.com",
      Referer: referer,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    data?: {
      streams?: Array<{ id?: string; format?: string }>;
      dash?: Array<{ id?: string; format?: string }>;
    };
  };
  const playData = json.data ?? {};

  let streamId: string | undefined;
  let streamFormat = "MP4";
  if (playData.streams?.length) {
    streamId = playData.streams[0].id;
    streamFormat = playData.streams[0].format ?? "MP4";
  } else if (playData.dash?.length) {
    streamId = playData.dash[0].id;
    streamFormat = playData.dash[0].format ?? "DASH";
  }
  if (!streamId) return [];

  const capRes = await mbRequest(
    `${API_BASE}/subject/caption?format=${streamFormat}&id=${streamId}&subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}`,
  );
  const inner = (capRes as { data?: unknown }).data;
  const captions: Caption[] = Array.isArray(inner)
    ? inner
    : ((inner as { captions?: Caption[] })?.captions ?? []);

  // Indonesia & Inggris dulu, sisanya mengikuti
  const prio = (c: Caption) => {
    const lan = c.languageAbbr ?? c.lan ?? "";
    if (lan === "in_id" || /indo/i.test(c.lanName ?? "")) return 0;
    if (lan === "en") return 1;
    return 2;
  };
  return captions.sort((a, b) => prio(a) - prio(b));
}
