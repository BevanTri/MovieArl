import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = ["hakunaymatata.com", "aoneroom.com"];

// Proxy video: CDN upstream menuntut Referer themoviebox.xyz,
// browser tidak bisa menyediakannya → pipakan byte lewat server.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u");
  if (!raw) return NextResponse.json({ error: "missing u" }, { status: 400 });

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ error: "bad url" }, { status: 400 });
  }

  if (url.protocol !== "https:" || !ALLOWED_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  const range = req.headers.get("range");
  const baseHeaders: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/148 Safari/537.36",
    Referer: "https://themoviebox.xyz/",
    "X-Client-Info": '{"timezone":"Asia/Jakarta"}',
    "X-Forwarded-For": "103.174.121.9",
    "CF-IPCountry": "ID",
    "X-Real-IP": "103.174.121.9",
    Origin: "https://themoviebox.xyz",
    ...(range ? { Range: range } : {}),
  };
  // Coba langsung dulu (viewer Indonesia lolos & cepat). Kalau ditolak/hang,
  // fallback via Worker (spoof region ID untuk host h5).
  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      headers: baseHeaders,
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    upstream = new Response(null, { status: 599 });
  }
  if (!upstream.ok && upstream.status !== 206) {
    const proxy = process.env.STREAM_PROXY_URL?.trim();
    if (proxy) {
      const proxied = await fetch(`${proxy}?url=${encodeURIComponent(url.toString())}`, {
        headers: baseHeaders,
        cache: "no-store",
      });
      if (proxied.ok || proxied.status === 206) upstream = proxied;
    }
  }

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: `upstream ${upstream.status}` }, { status: 502 });
  }

  const headers = new Headers();
  for (const key of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const v = upstream.headers.get(key);
    if (v) headers.set(key, v);
  }
  if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=3600");

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
