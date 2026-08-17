// ======================================
// ELEMENTEN
// ======================================

const productInput = document.getElementById("productInput");
const eenheidInput = document.getElementById("eenheidInput");
const hoeveelheidInput = document.getElementById("hoeveelheidInput");
const categorieInput = document.getElementById("categorieInput");
const toevoegenKnop = document.getElementById("toevoegen");
const lijstLeegmakenKnop = document.getElementById("lijstLeegmaken");
const boodschappenLijst = document.getElementById("boodschappenLijst");
const offlineStatus = document.getElementById("offlineStatus");


// ======================================
// LOCAL STORAGE
// ======================================

const OPSLAG_NAAM = "boodschappenlijst_pwa_v1";

let producten = [];


// ======================================
// PRODUCTEN LADEN
// ======================================

function laadProducten() {

    try {

        const opgeslagen = localStorage.getItem(OPSLAG_NAAM);

        if (opgeslagen) {

            const data = JSON.parse(opgeslagen);

            if (Array.isArray(data)) {
                producten = data;
            } else {
                producten = [];
            }

        }

    } catch (error) {

        console.error("Fout bij laden:", error);

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

        console.error("Fout bij opslaan:", error);

    }

}


// ======================================
// STAPGROOTTE
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
// EENHEID WIJZIGEN
// ======================================

eenheidInput.addEventListener("change", function() {

    const stap = krijgStap(eenheidInput.value);

    hoeveelheidInput.step = stap;
    hoeveelheidInput.value = stap;

});


// ======================================
// HOEVEELHEID OPMAKEN
// ======================================

function formatteerHoeveelheid(hoeveelheid, eenheid) {

    const waarde = Number(hoeveelheid);

    if (eenheid === "gram") {
        return `${waarde} g`;
    }

    if (eenheid === "ml") {
        return `${waarde} ml`;
    }

    return `${waarde} stuk${waarde === 1 ? "" : "s"}`;

}


// ======================================
// PRODUCT TOEVOEGEN
// ======================================

function voegProductToe() {

    const naam = productInput.value.trim();

    const eenheid = eenheidInput.value;

    const hoeveelheid = Number(
        hoeveelheidInput.value
    );

    const categorie = categorieInput.value;


    // Productnaam controleren

    if (!naam) {

        alert("Vul eerst een productnaam in.");

        productInput.focus();

        return;

    }


    // Hoeveelheid controleren

    if (
        !Number.isFinite(hoeveelheid) ||
        hoeveelheid <= 0
    ) {

        alert("Vul een hoeveelheid groter dan 0 in.");

        hoeveelheidInput.focus();

        return;

    }


    // Bestaand product zoeken

    const bestaandProduct = producten.find(
        function(product) {

            return (
                product.naam.toLowerCase() ===
                naam.toLowerCase() &&
                product.eenheid === eenheid
            );

        }
    );


    // Bestaat al → hoeveelheid optellen

    if (bestaandProduct) {

        bestaandProduct.hoeveelheid =
            Number(bestaandProduct.hoeveelheid) +
            hoeveelheid;

        bestaandProduct.categorie = categorie;

    }

    // Nieuw product

    else {

        producten.push({

            naam: naam,

            hoeveelheid: hoeveelheid,

            eenheid: eenheid,

            categorie: categorie,

            gehaald: false

        });

    }


    // Opslaan en opnieuw tonen

    opslaan();

    toonLijst();


    // Invoervelden resetten

    productInput.value = "";

    hoeveelheidInput.value =
        krijgStap(eenheidInput.value);

    productInput.focus();

}


// ======================================
// PRODUCT ALS GEHAALD MARKEREN
// ======================================

function toggleGehaald(index) {

    if (!producten[index]) {
        return;
    }

    producten[index].gehaald =
        !producten[index].gehaald;

    opslaan();

    toonLijst();

}


// ======================================
// PRODUCT VERWIJDEREN
// ======================================

function verwijderProduct(index) {

    if (!producten[index]) {
        return;
    }

    producten.splice(index, 1);

    opslaan();

    toonLijst();

}


// ======================================
// LIJST TONEN
// ======================================

function toonLijst() {

    boodschappenLijst.innerHTML = "";


    // Lege lijst

    if (producten.length === 0) {

        const leeg =
            document.createElement("div");

        leeg.className = "legeLijst";

        leeg.innerHTML = `
            <div class="legeLijstIcon">🛒</div>
            <h2>Je lijst is leeg</h2>
            <p>Voeg hierboven je eerste product toe.</p>
        `;

        boodschappenLijst.appendChild(leeg);

        return;

    }


    // Producten per categorie groeperen

    const groepen = {};


    producten.forEach(
        function(product, index) {

            const categorie =
                product.categorie || "Overig";

            if (!groepen[categorie]) {

                groepen[categorie] = [];

            }

            groepen[categorie].push({

                product: product,

                index: index

            });

        }
    );


    // Categorieën tonen

    Object.keys(groepen).forEach(
        function(categorie) {

            const categorieBlok =
                document.createElement("section");

            categorieBlok.className =
                "categorie";


            const categorieTitel =
                document.createElement("h2");

            categorieTitel.textContent =
                categorie;

            categorieBlok.appendChild(
                categorieTitel
            );


            // Producten binnen categorie

            groepen[categorie].forEach(
                function(item) {

                    const product =
                        item.product;

                    const index =
                        item.index;


                    const productRegel =
                        document.createElement("div");

                    productRegel.className =
                        "product";


                    if (product.gehaald) {

                        productRegel.classList.add(
                            "gehaald"
                        );

                    }


                    // Checkbox

                    const checkbox =
                        document.createElement("input");

                    checkbox.type =
                        "checkbox";

                    checkbox.checked =
                        product.gehaald;


                    checkbox.addEventListener(
                        "change",
                        function() {

                            toggleGehaald(index);

                        }
                    );


                    // Product informatie

                    const infoLabel =
                        document.createElement("label");

                    infoLabel.textContent =
                        `${product.naam} (${formatteerHoeveelheid(
                            product.hoeveelheid,
                            product.eenheid
                        )})`;

                    infoLabel.style.flexGrow =
                        "1";


                    infoLabel.addEventListener(
                        "click",
                        function() {

                            toggleGehaald(index);

                        }
                    );


                    // Verwijderknop

                    const verwijderKnop =
                        document.createElement("button");

                    verwijderKnop.type =
                        "button";

                    verwijderKnop.className =
                        "verwijder-btn";

                    verwijderKnop.innerHTML =
                        "&times;";


                    verwijderKnop.addEventListener(
                        "click",
                        function(event) {

                            event.stopPropagation();

                            verwijderProduct(index);

                        }
                    );


                    // Alles toevoegen

                    productRegel.appendChild(
                        checkbox
                    );

                    productRegel.appendChild(
                        infoLabel
                    );

                    productRegel.appendChild(
                        verwijderKnop
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
// KNOP: TOEVOEGEN
// ======================================

toevoegenKnop.addEventListener(
    "click",
    voegProductToe
);


// ======================================
// ENTER IN PRODUCTVELD
// ======================================

productInput.addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {

            voegProductToe();

        }

    }
);


// ======================================
// LIJST LEEGMAKEN
// ======================================

lijstLeegmakenKnop.addEventListener(
    "click",
    function() {

        if (
            producten.length > 0 &&
            confirm(
                "Weet je zeker dat je de hele lijst wilt leegmaken?"
            )
        ) {

            producten = [];

            opslaan();

            toonLijst();

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

        offlineStatus.style.opacity =
            "0.7";

    } else {

        offlineStatus.textContent =
            "⚠ Je bent offline - App werkt door";

        offlineStatus.style.opacity =
            "1";

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
// INITIALISATIE
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        laadProducten();

        toonLijst();

        updateOnlineStatus();


        // ==================================
        // SERVICE WORKER REGISTREREN
        // ==================================

        if ("serviceWorker" in navigator) {

            navigator.serviceWorker
                .register(
                    "/Shopping-List/service-worker.js"
                )

                .then(
                    function(registration) {

                        console.log(
                            "Service Worker succesvol geregistreerd:",
                            registration.scope
                        );

                    }
                )

                .catch(
                    function(error) {

                        console.error(
                            "Service Worker registratie mislukt:",
                            error
                        );

                    }
                );

        }

    }
);