// SW v2 — bump to force update old cache with removeChild bug (cdc1167)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async()=>{await self.clients.claim();const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))})()));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).catch(() => new Response("", { status: 504 })));
});
self.addEventListener("push", (e) => {
  const data = (() => { try { return e.data.json(); } catch { return { title: "MovieArl", body: e.data ? e.data.text() : "Update baru!" }; }})();
  e.waitUntil(self.registration.showNotification(data.title || "MovieArl", { body: data.body, icon: "/icon-192.png", badge: "/icon-192.png", data: { url: data.url || "/" } }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || "/"));
});
