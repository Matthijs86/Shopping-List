// ======================================
// BOODSCHAPPENLIJST PWA - SERVICE WORKER
// ======================================

const CACHE_NAME = "boodschappenlijst-v6";

const APP_BESTANDEN = [
    "/Shopping-List/",
    "/Shopping-List/index.html",
    "/Shopping-List/style.css",
    "/Shopping-List/script.js",
    "/Shopping-List/manifest.json",
    "/Shopping-List/icons/icon-192x192.png"
];

// ======================================
// INSTALL (Robuust individueel cachen)
// ======================================
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            const cachePromises = APP_BESTANDEN.map(function(url) {
                return cache.add(url).catch(function(error) {
                    console.error("Kon bestand niet cachen:", url, error);
                });
            });
            return Promise.all(cachePromises);
        })
    );
    self.skipWaiting();
});

// ======================================
// ACTIVATE (Oude caches opruimen)
// ======================================
self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// ======================================
// FETCH (Cache-first met netwerk fallback)
// ======================================
self.addEventListener("fetch", function(event) {
    if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(function(networkResponse) {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === "opaque") {
                    return networkResponse;
                }

                const responseCopy = networkResponse.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseCopy);
                });

                return networkResponse;
            }).catch(function() {
                if (event.request.mode === "navigate") {
                    return caches.match("/Shopping-List/index.html");
                }
            });
        })
    );
});

