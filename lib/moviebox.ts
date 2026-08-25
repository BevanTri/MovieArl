const SITE_BASE = "https://themoviebox.xyz";
const API_BASE = "https://h5-api.aoneroom.com/wefeed-h5api-bff";
const STREAM_BASE = "https://h5.aoneroom.com/wefeed-h5-bff";

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

const PLAYER_HEADERS: Record<string, string> = {
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

export async function getBearerToken(): Promise<string> {
  if (bearerToken) return bearerToken;
  const res = await fetch(`${API_BASE}/home?host=themoviebox.xyz`, {
    headers: DEFAULT_HEADERS,
    redirect: "follow",
    cache: "no-store",
  });
  readTokenFromXUser(res.headers.get("x-user"));
  if (!bearerToken) {
    const cookie = res.headers.get("set-cookie") ?? "";
    const m = cookie.match(/token=([^;]+)/);
    if (m) bearerToken = m[1];
  }
  return bearerToken ?? "";
}

async function mbRequest(
  url: string,
  method: "GET" | "POST" = "GET",
  payload?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<unknown> {
  const token = await getBearerToken();
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
  });
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
  };
}

export async function getHome(): Promise<HomeSection[]> {
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
): Promise<CategoryResult> {
  const data = (await mbRequest(`${API_BASE}/subject/filter`, "POST", {
    tabId,
    filter: { sort, genre: "ALL", country: "ALL", year: "ALL", language: "ALL" },
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

export function getAnimation(page = 1, sort = "RECOMMEND") {
  return getCategoryData(8, page, 24, sort);
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

export async function getDetail(slug: string): Promise<DetailData | null> {
  const res = await fetch(
    `${API_BASE}/detail?detailPath=${encodeURIComponent(slug)}`,
    {
      headers: { ...DEFAULT_HEADERS },
      redirect: "follow",
      cache: "no-store",
    },
  );

  // Judul memang sudah tidak ada di upstream — bukan error jaringan
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Upstream API error ${res.status}`);

  readTokenFromXUser(res.headers.get("x-user"));
  const json = (await res.json()) as { data?: DetailData };
  return json.data ?? {};
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

  type RawPlayData = {
    hasResource?: boolean;
    streams?: Array<{ url?: string; resolutions?: string; format?: string; size?: number }>;
    hls?: Array<{ url?: string; resolutions?: string }>;
    limited?: boolean;
  };

  async function play(): Promise<RawPlayData> {
    const token = await getBearerToken();
    const playUrl = `${STREAM_BASE}/web/subject/play?subjectId=${subjectId}&se=${qSe}&ep=${qEp}&detailPath=${encodeURIComponent(detailPath)}`;
    const referer = `${SITE_BASE.replace("themoviebox.xyz", "h5.aoneroom.com")}/spa/videoPlayPage/movies/${detailPath}?id=${subjectId}&type=/movie/detail&detailSe=${qSe}&detailEp=${qEp}&lang=en`;

    const res = await fetch(playUrl, {
      headers: {
        ...PLAYER_HEADERS,
        Referer: referer,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Stream service unavailable");
    return ((await res.json())?.data ?? {}) as RawPlayData;
  }

  let data: RawPlayData = await play();

  // Fallback terakhir: coba kombinasi se/ep lain kalau masih kosong
  if (!data.hasResource && !(data.streams ?? []).length) {
    const attempts: Array<[number, number]> = isSeries
      ? [
          [qSe, qEp === 1 ? 2 : 1],
          [1, 1],
          [0, 0],
        ]
      : [
          [1, 1],
          [0, 1],
        ];
    for (const [aSe, aEp] of attempts) {
      qSe = aSe;
      qEp = aEp;
      data = await play();
      if (data.hasResource || (data.streams ?? []).length) break;
    }
  }

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

export async function getCaptions(
  subjectId: string,
  detailPath: string,
  se = 0,
  ep = 0,
): Promise<Caption[]> {
  const token = await getBearerToken();
  const playUrl = `${STREAM_BASE}/web/subject/play?subjectId=${subjectId}&se=${se}&ep=${ep}&detailPath=${encodeURIComponent(detailPath)}`;
  const referer = `${SITE_BASE.replace("themoviebox.xyz", "h5.aoneroom.com")}/spa/videoPlayPage/movies/${detailPath}?id=${subjectId}&type=/movie/detail&detailSe=${se}&detailEp=${ep}&lang=en`;

  const res = await fetch(playUrl, {
    headers: {
      ...PLAYER_HEADERS,
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
