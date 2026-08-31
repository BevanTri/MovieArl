// MovieArl Stream Relay — deploy ke Cloudflare Workers (gratis)
export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Range": "bytes",
        },
      });
    }
    const url = new URL(request.url);
    if (url.searchParams.has("echo")) {
      const out = {};
      for (const [k, v] of request.headers.entries()) out[k] = v;
      return new Response(JSON.stringify({ headers: out, cf: request.cf }, null, 2), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    const target = url.searchParams.get("url");
    if (
      !target ||
      !(
        target.startsWith("https://h5.aoneroom.com/") ||
        target.startsWith("https://h5-api.aoneroom.com/") ||
        target.includes("hakunaymatata.com") ||
        target.includes("aoneroom.com")
      )
    ) {
      return new Response("bad target", { status: 400 });
    }
    const isH5 = target.startsWith("https://h5.aoneroom.com/") || target.startsWith("https://h5-api.aoneroom.com/");
    let fwd;
    if (isH5) {
      fwd = new Headers(request.headers);
      for (const k of [...fwd.keys()]) {
        if (k.toLowerCase().startsWith("x-vercel-")) fwd.delete(k);
      }
      fwd.set("X-Client-Info", '{"timezone":"Asia/Jakarta"}');
      fwd.set("X-Request-Lang", "en");
      fwd.set("X-Forwarded-For", "103.174.121.9");
      fwd.set("CF-IPCountry", "ID");
      fwd.set("X-Real-IP", "103.174.121.9");
      if (!fwd.has("Referer")) fwd.set("Referer", "https://h5.aoneroom.com/");
      if (!fwd.has("Origin")) fwd.set("Origin", "https://h5.aoneroom.com");
    } else {
      // CDN video/subtitle — hanya header minimal, strip cf/x-vercel biar tidak 427
      fwd = new Headers();
      const allowCDN = new Set(["user-agent", "referer", "range", "accept", "accept-encoding", "accept-language"]);
      for (const [k, v] of request.headers.entries()) {
        if (allowCDN.has(k.toLowerCase())) fwd.set(k, v);
      }
      if (!fwd.has("referer")) fwd.set("Referer", "https://themoviebox.xyz/");
      if (!fwd.has("user-agent")) fwd.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/148.0.0.0 Safari/537.36");
    }

    const upstream = await fetch(target, {
      method: request.method,
      headers: fwd,
      body: request.method === "POST" ? request.body : undefined,
      redirect: "follow",
    });
    const res = new Response(upstream.body, upstream);
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "*");
    // penting untuk video streaming
    const ct = upstream.headers.get("content-type");
    if (ct) res.headers.set("Content-Type", ct);
    const cr = upstream.headers.get("content-range");
    if (cr) res.headers.set("Content-Range", cr);
    const cl = upstream.headers.get("content-length");
    if (cl) res.headers.set("Content-Length", cl);
    res.headers.set("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes");
    return res;
  },
};
