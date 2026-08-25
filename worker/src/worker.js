// MovieArl Stream Relay — deploy ke Cloudflare Workers (gratis)
export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }
    const url = new URL(request.url);
    const target = url.searchParams.get("url");
    if (!target || !target.startsWith("https://h5.aoneroom.com/")) {
      return new Response("bad target", { status: 400 });
    }
    const upstream = await fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.method === "POST" ? request.body : undefined,
      redirect: "follow",
    });
    const res = new Response(upstream.body, upstream);
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  },
};
