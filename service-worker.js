// service-worker.js
// Whisper Chat Service Worker — v1 (CLEAN RESET)

const CACHE_NAME = "whisper-v1";

// Cache ONLY static assets (NO HTML navigation control)
const STATIC_ASSETS = [
  "/css/base.css",
  "/css/landing.css",
  "/css/chat.css",

  "/js/landing.js",
  "/js/chat.js",

  "/manifest.json",
  "/public/favicon.ico"
];

// INSTALL — remove all old caches, cache static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() =>
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    )
  );

  self.skipWaiting(); // activate immediately
});

// ACTIVATE — take control immediately
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// FETCH —
// 1️⃣ Never touch HTML navigation
// 2️⃣ Cache-first only for static assets
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 🔥 Let browser + Cloudflare handle HTML pages
  if (
    event.request.mode === "navigate" ||
    url.pathname.endsWith(".html")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
