// ======================================
// BOODSCHAPPENLIJST PWA
// SERVICE WORKER
// ======================================


// ======================================
// CACHE VERSIE
// ======================================

const CACHE_NAME =
    "boodschappenlijst-v4"; // Versie verhoogd om een harde update af te dwingen


// ======================================
// BESTANDEN DIE OFFLINE BESCHIKBAAR
// MOETEN ZIJN
// ======================================

const APP_BESTANDEN = [

    "/Shopping-list/",

    "/Shopping-list/index.html",

    "/Shopping-list/style.css",

    "/Shopping-list/script.js", // Controleer of dit bestand exact zo heet op GitHub!

    "/Shopping-list/manifest.json",

    "/Shopping-list/icons/icon-192x192.png"

];


// ======================================
// INSTALL
// ======================================

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    function(cache) {

                        // We gebruiken cache.addAll, maar vangen fouten op per bestand
                        return cache.addAll(APP_BESTANDEN).catch(function(error) {
                            console.error("Fout bij het cachen van bestanden:", error);
                        });

                    }
                )

        );

        self.skipWaiting();

    }
);


// ======================================
// ACTIVATE
// ======================================

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches
                .keys()
                .then(
                    function(cacheNames) {

                        return Promise.all(

                            cacheNames.map(
                                function(cacheName) {

                                    if (
                                        cacheName !==
                                        CACHE_NAME
                                    ) {

                                        return caches.delete(
                                            cacheName
                                        );

                                    }

                                }
                            )

                        );

                    }
                )

        );

        self.clients.claim();

    }
);


// ======================================
// FETCH
// ======================================

self.addEventListener(
    "fetch",
    function(event) {

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(event.request)
                .then(
                    function(cachedResponse) {

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        return fetch(
                            event.request
                        )
                        .then(
                            function(networkResponse) {

                                if (
                                    networkResponse &&
                                    networkResponse.status === 200 &&
                                    networkResponse.type !== "opaque"
                                ) {

                                    const responseCopy =
                                        networkResponse.clone();


                                    caches
                                        .open(CACHE_NAME)
                                        .then(
                                            function(cache) {

                                                cache.put(
                                                    event.request,
                                                    responseCopy
                                                );

                                            }
                                        );

                                }


                                return networkResponse;

                            }
                        ).catch(function() {
                            // Offline fallback als internet en cache falen
                            return caches.match("/Shopping-list/index.html");
                        });

                    }
                )

        );

    }
);
