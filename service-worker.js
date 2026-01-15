// ================================
// Whisper Chat Service Worker
// Version: v1 (CLEAN RESET)
// ================================

const CACHE_NAME = "whisper-v1";

// Core app shell (NEW STRUCTURE ONLY)
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

// INSTALL — delete ALL old caches and cache fresh files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() =>
      caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
    )
  );

  // Activate immediately
  self.skipWaiting();
});

// ACTIVATE — claim control immediately
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

// FETCH — cache-first for static assets
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
