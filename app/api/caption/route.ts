import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Proxy + konversi subtitle: upstream .srt menuntut Referer themoviebox.xyz,
// dan <track> HTML5 hanya menerima WebVTT → konversi on-the-fly.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u");
  if (!raw || !raw.startsWith("https://")) {
    return NextResponse.json({ error: "missing u" }, { status: 400 });
  }

  try {
    const baseHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/148 Safari/537.36",
      Referer: "https://themoviebox.xyz/",
      "X-Client-Info": '{"timezone":"Asia/Jakarta"}',
    };
    let res = await fetch(raw, {
      headers: baseHeaders,
      cache: "no-store",
    });
    if (!res.ok) {
      const proxy = process.env.STREAM_PROXY_URL?.trim();
      if (proxy) {
        const alt = await fetch(`${proxy}?url=${encodeURIComponent(raw)}`, {
          headers: baseHeaders,
          cache: "no-store",
        });
        if (alt.ok) res = alt;
      }
    }
    if (!res.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });

    let body = await res.text();
    const trimmed = body.trimStart();

    if (!trimmed.startsWith("WEBVTT")) {
      // Konversi SRT → VTT
      const lines = trimmed.replace(/\r+/g, "").split("\n");
      const out: string[] = ["WEBVTT", ""];
      for (const line of lines) {
        if (/^\d+$/.test(line.trim())) continue; // nomor urut SRT
        out.push(line.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2"));
      }
      body = out.join("\n");
    }

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
