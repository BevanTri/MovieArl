import { NextResponse } from "next/server";
import { getBearerToken, STREAM_BASE, SITE_BASE, PLAYER_HEADERS } from "@/lib/moviebox";

export const dynamic = "force-dynamic";

// Diagnosis sementara: lihat respons host stream dari lingkungan deploy
export async function GET() {
  const token = await getBearerToken();
  const sid = "39921072476671784"; // Godzilla (movie)
  const slug = "godzilla-IEHsOR0QW2";
  const url = `${STREAM_BASE}/web/subject/play?subjectId=${sid}&se=0&ep=0&detailPath=${encodeURIComponent(slug)}`;

  const results: Array<Record<string, unknown>> = [];
  for (const mode of ["h5", "site", "none"] as const) {
    const origin: Record<string, string> =
      mode === "h5"
        ? { Origin: "https://h5.aoneroom.com" }
        : mode === "site"
          ? { Origin: SITE_BASE }
          : {};
    try {
      const res = await fetch(url, {
        headers: {
          ...PLAYER_HEADERS,
          ...origin,
          Referer: `https://h5.aoneroom.com/spa/videoPlayPage/movies/${slug}?id=${sid}`,
          Authorization: `Bearer ${token}`,
        },
        redirect: "follow",
        cache: "no-store",
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: { hasResource?: boolean; streams?: unknown[] };
      };
      results.push({
        mode,
        http: res.status,
        hasResource: json.data?.hasResource ?? null,
        streams: json.data?.streams?.length ?? 0,
      });
    } catch (e) {
      results.push({ mode, error: (e as Error).message });
    }
  }
  return NextResponse.json({ tokenOk: Boolean(token), results });
}
