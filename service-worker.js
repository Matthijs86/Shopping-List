// ======================================
// BOODSCHAPPENLIJST PWA - SERVICE WORKER
// ======================================

const CACHE_NAME = "boodschappenlijst-v5";

const APP_BESTANDEN = [
    "/Shopping-list/",
    "/Shopping-list/index.html",
    "/Shopping-list/style.css",
    "/Shopping-list/script.js",
    "/Shopping-list/manifest.json",
    "/Shopping-list/icons/icon-192x192.png"
];

// ======================================
// INSTALL (Rbuust individueel cachen)
// ======================================
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            // Probeer elk bestand los te cachen zodat één 404 niet alles blokkeert
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
    // Negeer niet-GET verzoeken en cross-origin extensies (zoals Chrome extensions)
    if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(function(networkResponse) {
                // Controleer op geldige respons voordat we cachen
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === "opaque") {
                    return networkResponse;
                }

                const responseCopy = networkResponse.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseCopy);
                });

                return networkResponse;
            }).catch(function() {
                // Offline fallback voor navigatieverzoeken
                if (event.request.mode === "navigate") {
                    return caches.match("/Shopping-list/index.html");
                }
            });
        })
    );
});

