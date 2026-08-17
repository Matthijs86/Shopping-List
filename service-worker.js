// ======================================
// BOODSCHAPPENLIJST SERVICE WORKER
// ======================================

const CACHE_NAME =
    "boodschappenlijst-cache-v1";


const BESTANDEN = [

    "./boodschappenlijst.html",

    "./style.css",

    "./script.js",

    "./manifest.json"

];


// ======================================
// INSTALLEREN
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
                            BESTANDEN
                        );

                    }
                )

        );


        // Nieuwe versie meteen activeren

        self.skipWaiting();

    }
);


// ======================================
// ACTIVEREN
// ======================================

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches.keys()
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
// BESTANDEN OPVRAGEN
// ======================================

self.addEventListener(
    "fetch",
    function(event) {

        event.respondWith(

            caches.match(
                event.request
            )
            .then(
                function(cachedResponse) {

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    return fetch(
                        event.request
                    );

                }
            )

        );

    }
);