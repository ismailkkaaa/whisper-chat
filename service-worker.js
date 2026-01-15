const CACHE_NAME = "whisper-v2"; // 🔥 NEW VERSION
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/chat.html",
  "/css/base.css",
  "/css/landing.css",
  "/css/chat.css",
  "/js/landing.js",
  "/js/chat.js",
  "/manifest.json",
  "/public/favicon.ico"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => caches.open(CACHE_NAME))
     .then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting(); // 🚀 activate immediately
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // 🚀 take control instantly
});

/* FETCH */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
