// SW minimal: pass-through saja — cukup untuk kriteria install PWA,
// tanpa caching agresif biar stream & API selalu segar.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).catch(() => new Response("", { status: 504 })));
});
