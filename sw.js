// Service Worker minimal — sèlman pou PWA enstalab (Play Store/PWABuilder mande sa).
// AUKENN kòd notifikasyon push ladan l — se sèlman "cache/fetch" debaz.
const CACHE_NAME = "sekoupyes-v1";
const CORE_ASSETS = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS).catch(function () { /* pa gen pwobl\u00e8m si youn echwe */ });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  // Estrateji "network first, cache fallback" — toujou eseye jwenn dènye vèsyon an,
  // itilize kach la SÈLMAN si rezo a pa disponib (mòd avyon, elatriye).
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
