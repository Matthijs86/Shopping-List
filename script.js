// ======================================
// ELEMENTEN
// ======================================

const productInput =
    document.getElementById("productInput");

const eenheidInput =
    document.getElementById("eenheidInput");

const hoeveelheidInput =
    document.getElementById("hoeveelheidInput");

const categorieInput =
    document.getElementById("categorieInput");

const toevoegenKnop =
    document.getElementById("toevoegen");

const lijstLeegmakenKnop =
    document.getElementById("lijstLeegmaken");

const boodschappenLijst =
    document.getElementById("boodschappenLijst");

const offlineStatus =
    document.getElementById("offlineStatus");


// ======================================
// LOCAL STORAGE
// ======================================

const OPSLAG_NAAM =
    "boodschappenlijst_pwa_v1";


let producten = [];


// ======================================
// PRODUCTEN LADEN
// ======================================

function laadProducten() {

    try {

        const opgeslagen =
            localStorage.getItem(OPSLAG_NAAM);


        if (opgeslagen) {

            const data =
                JSON.parse(opgeslagen);


            if (Array.isArray(data)) {

                producten = data;

            } else {

                producten = [];

            }

        }

    } catch (error) {

        console.error(
            "Fout bij laden:",
            error
        );

        producten = [];

    }

}


// ======================================
// OPSLAAN
// ======================================

function opslaan() {

    try {

        localStorage.setItem(
            OPSLAG_NAAM,
            JSON.stringify(producten)
        );

    } catch (error) {

        console.error(
            "Fout bij opslaan:",
            error
        );

    }

}


// ======================================
// AUTOMATISCHE STAP
// ======================================

function krijgStap(eenheid) {

    if (eenheid === "gram") {

        return 50;

    }


    if (eenheid === "ml") {

        return 100;

    }


    return 1;

}


// ======================================
// HOEVEELHEID OPMAKEN
// ======================================

function formatteerHoeveelheid(
    hoeveelheid,
    eenheid
) {

    const waarde =
        Number(hoeveelheid);


    if (eenheid === "gram") {

        return `${waarde} g`;

    }


    if (eenheid === "ml") {

        return `${waarde} ml`;

    }


    return `${waarde} stuk${
        waarde === 1 ? "" : "s"
    }`;

}


// ======================================
// PRODUCT TOEVOEGEN
// ======================================

function voegProductToe() {

    const naam =
        productInput.value.trim();


    const eenheid =
        eenheidInput.value;


    const hoeveelheid =
        Number(
            hoeveelheidInput.value
        );


    const categorie =
        categorieInput.value;


    // ------------------------------
    // PRODUCTNAAM
    // ------------------------------

    if (!naam) {

        alert(
            "Vul eerst een productnaam in."
        );

        productInput.focus();

        return;

    }


    // ------------------------------
    // HOEVEELHEID
    // ------------------------------

    if (
        !Number.isFinite(hoeveelheid) ||
        hoeveelheid <= 0
    ) {

        alert(
            "Vul een hoeveelheid groter dan 0 in."
        );

        hoeveelheidInput.focus();

        return;

    }


    // ------------------------------
    // BESTAAND PRODUCT
    // ------------------------------

    const bestaandProduct =
        producten.find(
            function(product) {

                return (

                    product.naam
                        .toLowerCase()
                    ===
                    naam.toLowerCase()

                    &&

                    product.eenheid
                    ===
                    eenheid

                );

            }
        );


    if (bestaandProduct) {

        bestaandProduct.hoeveelheid =
            Number(
                bestaandProduct.hoeveelheid
            )
            +
            hoeveelheid;


        bestaandProduct.categorie =
            categorie;

    }


    // ------------------------------
    // NIEUW PRODUCT
    // ------------------------------

    else {

        producten.push({

            naam: naam,

            hoeveelheid:
                hoeveelheid,

            eenheid:
                eenheid,

            categorie:
                categorie,

            gehaald:
                false

        });

    }


    // ------------------------------
    // OPSLAAN
    // ------------------------------

    opslaan();


    // ------------------------------
    // LIJST VERNIEUWEN
    // ------------------------------

    toonLijst();


    // ------------------------------
    // INPUT RESET
    // ------------------------------

    productInput.value = "";

    hoeveelheidInput.value = "1";

    productInput.focus();

}


// ======================================
// LIJST TONEN
// ======================================

function toonLijst() {

    boodschappenLijst.innerHTML = "";


    // Geen producten

    if (producten.length === 0) {

        const leeg =
            document.createElement(
                "div"
            );

        leeg.className =
            "legeLijst";

        leeg.innerHTML = `
            <div class="legeLijstIcon">
                🛒
            </div>

            <h2>Je lijst is leeg</h2>

            <p>
                Voeg hierboven je eerste product toe.
            </p>
        `;

        boodschappenLijst.appendChild(
            leeg
        );

        return;

    }


    // ==================================
    // CATEGORIEËN
    // ==================================

    const groepen = {};


    producten.forEach(
        function(product, index) {

            const categorie =
                product.categorie ||
                "Overig";


            if (!groepen[categorie]) {

                groepen[categorie] = [];

            }


            groepen[categorie].push({

                product: product,

                index: index

            });

        }
    );


    // ==================================
    // CATEGORIEËN TONEN
    // ==================================

    Object.keys(groepen).forEach(
        function(categorie) {

            const categorieBlok =
                document.createElement(
                    "section"
                );

            categorieBlok.className =
                "categorie";


            const categorieTitel =
                document.createElement(
                    "h2"
                );

            categorieTitel.textContent =
                categorie;


            categorieBlok.appendChild(
                categorieTitel
            );


            // ==================================
            // PRODUCTEN
            // ==================================

            groepen[categorie].forEach(
                function(item) {

                    const product =
                        item.product;

                    const index =
                        item.index;


                    // ------------------------------
                    // PRODUCT REGEL
                    // ------------------------------

                    const productRegel =
                        document.createElement(
                            "div"
                        );

                    productRegel.className =
                        "product";


                    if (product.gehaald) {

                        productRegel.classList.add(
                            "gehaald"
                        );

                    }


                    // ------------------------------
                    // CHECKBOX
                    // ------------------------------

                    const checkbox =
                        document.createElement(
                            "input"
                        );

                    checkbox.type =
                        "checkbox";

                    checkbox.checked =
                        Boolean(
                            product.gehaald
                        );


                    // ------------------------------
                    // PRODUCT INFO
                    // ------------------------------

                    const productInfo =
                        document.createElement(
                            "div"
                        );

                    productInfo.className =
                        "productInfo";


                    const productNaam =
                        document.createElement(
                            "span"
                        );

                    productNaam.className =
                        "productNaam";

                    productNaam.textContent =
                        product.naam;


                    const hoeveelheid =
                        document.createElement(
                            "small"
                        );

                    hoeveelheid.className =
                        "hoeveelheid";


                    const hoeveelheidTekst =
                        formatteerHoeveelheid(
                            product.hoeveelheid,
                            product.eenheid
                        );


                    if (product.gehaald) {

                        hoeveelheid.textContent =
                            `${hoeveelheidTekst} gehaald`;

                    } else {

                        hoeveelheid.textContent =
                            `${hoeveelheidTekst} nodig`;

                    }


                    productInfo.appendChild(
                        productNaam
                    );

                    productInfo.appendChild(
                        hoeveelheid
                    );


                    // ------------------------------
                    // PLUS / MIN
                    // ------------------------------

                    const controls =
                        document.createElement(
                            "div"
                        );

                    controls.className =
                        "aantalControls";


                    const minKnop =
                        document.createElement(
                            "button"
                        );

                    minKnop.type =
                        "button";

                    minKnop.className =
                        "minKnop";

                    minKnop.textContent =
                        "−";


                    const aantalTekst =
                        document.createElement(
                            "span"
                        );

                    aantalTekst.className =
                        "aantalTekst";

                    aantalTekst.textContent =
                        formatteerHoeveelheid(
                            product.hoeveelheid,
                            product.eenheid
                        );


                    const plusKnop =
                        document.createElement(
                            "button"
                        );

                    plusKnop.type =
                        "button";

                    plusKnop.className =
                        "plusKnop";

                    plusKnop.textContent =
                        "+";


                    controls.appendChild(
                        minKnop
                    );

                    controls.appendChild(
                        aantalTekst
                    );

                    controls.appendChild(
                        plusKnop
                    );


                    // ------------------------------
                    // MIN
                    // ------------------------------

                    minKnop.addEventListener(
                        "click",
                        function() {

                            const stap =
                                krijgStap(
                                    product.eenheid
                                );


                            const nieuwAantal =
                                Number(
                                    product.hoeveelheid
                                )
                                -
                                stap;


                            product.hoeveelheid =
                                Math.max(
                                    1,
                                    nieuwAantal
                                );


                            opslaan();

                            toonLijst();

                        }
                    );


                    // ------------------------------
                    // PLUS
                    // ------------------------------

                    plusKnop.addEventListener(
                        "click",
                        function() {

                            const stap =
                                krijgStap(
                                    product.eenheid
                                );


                            product.hoeveelheid =
                                Number(
                                    product.hoeveelheid
                                )
                                +
                                stap;


                            opslaan();

                            toonLijst();

                        }
                    );


                    // ------------------------------
                    // CHECKBOX
                    // ------------------------------

                    checkbox.addEventListener(
                        "change",
                        function() {

                            product.gehaald =
                                checkbox.checked;


                            opslaan();

                            toonLijst();

                        }
                    );


                    // ------------------------------
                    // DELETE
                    // ------------------------------

                    const deleteKnop =
                        document.createElement(
                            "button"
                        );

                    deleteKnop.type =
                        "button";

                    deleteKnop.className =
                        "deleteKnop";

                    deleteKnop.textContent =
                        "Verwijderen";


                    deleteKnop.addEventListener(
                        "click",
                        function() {

                            producten.splice(
                                index,
                                1
                            );


                            opslaan();

                            toonLijst();

                        }
                    );


                    // ------------------------------
                    // REGEL OPBOUWEN
                    // ------------------------------

                    productRegel.appendChild(
                        checkbox
                    );

                    productRegel.appendChild(
                        productInfo
                    );

                    productRegel.appendChild(
                        controls
                    );

                    productRegel.appendChild(
                        deleteKnop
                    );


                    categorieBlok.appendChild(
                        productRegel
                    );

                }
            );


            boodschappenLijst.appendChild(
                categorieBlok
            );

        }
    );

}


// ======================================
// LIJST LEEGMAKEN
// ======================================

lijstLeegmakenKnop.addEventListener(
    "click",
    function() {

        if (
            producten.length === 0
        ) {

            return;

        }


        const bevestiging =
            confirm(
                "Weet je zeker dat je de hele boodschappenlijst wilt verwijderen?"
            );


        if (!bevestiging) {

            return;

        }


        producten = [];


        opslaan();

        toonLijst();

    }
);


// ======================================
// TOEVOEGEN
// ======================================

toevoegenKnop.addEventListener(
    "click",
    voegProductToe
);


// ======================================
// ENTER = TOEVOEGEN
// ======================================

productInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            voegProductToe();

        }

    }
);


// ======================================
// ONLINE / OFFLINE STATUS
// ======================================

function updateOnlineStatus() {

    if (navigator.onLine) {

        offlineStatus.textContent =
            "✓ Lijst wordt lokaal opgeslagen";

        offlineStatus.classList.remove(
            "offline"
        );

    } else {

        offlineStatus.textContent =
            "● Offline — je lijst blijft beschikbaar";

        offlineStatus.classList.add(
            "offline"
        );

    }

}


window.addEventListener(
    "online",
    updateOnlineStatus
);


window.addEventListener(
    "offline",
    updateOnlineStatus
);


// ======================================
// SERVICE WORKER REGISTREREN
// ======================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    function(registration) {

                        console.log(
                            "Service worker actief:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    function(error) {

                        console.error(
                            "Service worker kon niet worden geregistreerd:",
                            error
                        );

                    }
                );

        }
    );

}


// ======================================
// START APP
// ======================================

laadProducten();

toonLijst();

updateOnlineStatus();