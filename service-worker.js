// ======================================
// BOODSCHAPPENLIJST PWA
// SERVICE WORKER
// ======================================


// ======================================
// CACHE VERSIE
// ======================================

const CACHE_NAME =
    "boodschappenlijst-v3";


// ======================================
// BESTANDEN DIE OFFLINE BESCHIKBAAR
// MOETEN ZIJN
// ======================================

const APP_BESTANDEN = [

    "/Shopping-list/",

    "/Shopping-list/index.html",

    "/Shopping-list/style.css",

    "/Shopping-list/script.js",

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

                        return cache.addAll(
                            APP_BESTANDEN
                        );

                    }
                )

        );


        /*
         * Nieuwe service worker mag
         * direct klaarstaan.
         */

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

                                    /*
                                     * Oude versies
                                     * verwijderen.
                                     */

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


        /*
         * Nieuwe service worker
         * meteen gebruiken.
         */

        self.clients.claim();

    }
);


// ======================================
// FETCH
// ======================================

self.addEventListener(
    "fetch",
    function(event) {

        /*
         * Alleen GET-verzoeken behandelen.
         */

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

                        /*
                         * Eerst lokale cache proberen.
                         */

                        if (
                            cachedResponse
                        ) {

                            /*
                             * Voor onze eigen
                             * app-bestanden is
                             * cache prima.
                             */

                            return cachedResponse;

                        }


                        /*
                         * Staat het bestand niet
                         * in de cache?
                         * Dan internet proberen.
                         */

                        return fetch(
                            event.request
                        )
                        .then(
                            function(networkResponse) {

                                /*
                                 * Alleen geldige
                                 * responses cachen.
                                 */

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
                        );

                    }
                )

        );

    }
);