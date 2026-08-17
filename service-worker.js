// ======================================
// BOODSCHAPPENLIJST PWA - SERVICE WORKER
// ======================================

const CACHE_NAME = "boodschappenlijst-v7";

const APP_BESTANDEN = [
    "/Shopping-List/",
    "/Shopping-List/index.html",
    "/Shopping-List/style.css",
    "/Shopping-List/script.js",
    "/Shopping-List/manifest.json",
    "/Shopping-List/icon-192.png",
    "/Shopping-List/icon-512.png"
];


// ======================================
// INSTALL
// ======================================

self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function(cache) {

                const cachePromises =
                    APP_BESTANDEN.map(function(url) {

                        return cache
                            .add(url)
                            .catch(function(error) {

                                console.error(
                                    "Kon bestand niet cachen:",
                                    url,
                                    error
                                );

                            });

                    });

                return Promise.all(cachePromises);

            })

    );

    // Nieuwe service worker direct activeren
    self.skipWaiting();

});


// ======================================
// ACTIVATE
// ======================================

self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys()

            .then(function(cacheNames) {

                return Promise.all(

                    cacheNames.map(function(cacheName) {

                        if (cacheName !== CACHE_NAME) {

                            console.log(
                                "Oude cache verwijderen:",
                                cacheName
                            );

                            return caches.delete(
                                cacheName
                            );

                        }

                    })

                );

            })

    );

    // Nieuwe versie direct voor bestaande pagina's gebruiken
    self.clients.claim();

});


// ======================================
// FETCH
// Cache first → netwerk fallback
// ======================================

self.addEventListener("fetch", function(event) {

    // Alleen GET-verzoeken behandelen
    if (event.request.method !== "GET") {
        return;
    }


    // Alleen verzoeken van onze eigen website
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }


    event.respondWith(

        caches.match(event.request)

            .then(function(cachedResponse) {

                // Bestaat het bestand in cache?
                if (cachedResponse) {

                    return cachedResponse;

                }


                // Niet in cache → internet proberen

                return fetch(event.request)

                    .then(function(networkResponse) {

                        // Ongeldige response niet opslaan
                        if (
                            !networkResponse ||
                            networkResponse.status !== 200 ||
                            networkResponse.type === "opaque"
                        ) {

                            return networkResponse;

                        }


                        // Kopie maken voor cache
                        const responseCopy =
                            networkResponse.clone();


                        caches.open(CACHE_NAME)

                            .then(function(cache) {

                                cache.put(
                                    event.request,
                                    responseCopy
                                );

                            });


                        return networkResponse;

                    })

                    .catch(function() {

                        // Offline navigatie → index.html
                        if (
                            event.request.mode === "navigate"
                        ) {

                            return caches.match(
                                "/Shopping-List/index.html"
                            );

                        }

                    });

            })

    );

});