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
        localStorage.setItem(OPSLAG_NAAM, JSON.stringify(producten));
    } catch (error) {
        console.error("Fout bij opslaan:", error);
    }
}

// ======================================
// AUTOMATISCHE STAP & COUPLING
// ======================================

function krijgStap(eenheid) {
    if (eenheid === "gram") return 50;
    if (eenheid === "ml") return 100;
    return 1;
}

// Pas invoerstap dynamisch aan bij wijziging van eenheid
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
    if (eenheid === "gram") return `${waarde} g`;
    if (eenheid === "ml") return `${waarde} ml`;
    return `${waarde} stuk${waarde === 1 ? "" : "s"}`;
}

// ======================================
// PRODUCT TOEVOEGEN
// ======================================

function voegProductToe() {
    const naam = productInput.value.trim();
    const eenheid = eenheidInput.value;
    const hoeveelheid = Number(hoeveelheidInput.value);
    const categorie = categorieInput.value;

    if (!naam) {
        alert("Vul eerst een productnaam in.");
        productInput.focus();
        return;
    }

    if (!Number.isFinite(hoeveelheid) || hoeveelheid <= 0) {
        alert("Vul een hoeveelheid groter dan 0 in.");
        hoeveelheidInput.focus();
        return;
    }

    const bestaandProduct = producten.find(function(product) {
        return product.naam.toLowerCase() === naam.toLowerCase() && product.eenheid === eenheid;
    });

    if (bestaandProduct) {
        bestaandProduct.hoeveelheid = Number(bestaandProduct.hoeveelheid) + hoeveelheid;
        bestaandProduct.categorie = categorie;
    } else {
        producten.push({
            naam: naam,
            hoeveelheid: hoeveelheid,
            eenheid: eenheid,
            categorie: categorie,
            gehaald: false
        });
    }

    opslaan();
    toonLijst();

    productInput.value = "";
    hoeveelheidInput.value = krijgStap(eenheidInput.value);
    productInput.focus();
}

// ======================================
// FUNCTIONS VOOR GEBRUIKERSINTERACTIE
// ======================================

function toggleGehaald(index) {
    producten[index].gehaald = !producten[index].gehaald;
    opslaan();
    toonLijst();
}

function verwijderProduct(index) {
    producten.splice(index, 1);
    opslaan();
    toonLijst();
}

// ======================================
// LIJST TONEN
// ======================================

function toonLijst() {
    boodschappenLijst.innerHTML = "";

    if (producten.length === 0) {
        const leeg = document.createElement("div");
        leeg.className = "legeLijst";
        leeg.innerHTML = `
            <div class="legeLijstIcon">🛒</div>
            <h2>Je lijst is leeg</h2>
            <p>Voeg hierboven je eerste product toe.</p>
        `;
        boodschappenLijst.appendChild(leeg);
        return;
    }

    const groepen = {};
    producten.forEach(function(product, index) {
        const categorie = product.categorie || "Overig";
        if (!groepen[categorie]) {
            groepen[categorie] = [];
        }
        groepen[categorie].push({ product: product, index: index });
    });

    Object.keys(groepen).forEach(function(categorie) {
        const categorieBlok = document.createElement("section");
        categorieBlok.className = "categorie";

        const categorieTitel = document.createElement("h2");
        categorieTitel.textContent = categorie;
        categorieBlok.appendChild(categorieTitel);

        groepen[categorie].forEach(function(item) {
            const product = item.product;
            const index = item.index;

            const productRegel = document.createElement("div");
            productRegel.className = "product";
            if (product.gehaald) {
                productRegel.classList.add("gehaald");
            }

            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = product.gehaald;
            checkbox.addEventListener("change", function() {
                toggleGehaald(index);
            });

            // Naam en Hoeveelheid info
            const infoLabel = document.createElement("label");
            infoLabel.textContent = `${product.naam} (${formatteerHoeveelheid(product.hoeveelheid, product.eenheid)})`;
            infoLabel.style.flexGrow = "1";
            infoLabel.addEventListener("click", function() {
                toggleGehaald(index);
            });

            // Verwijderknop (Kruisje)
            const verwijderKnop = document.createElement("button");
            verwijderKnop.type = "button";
            verwijderKnop.className = "verwijder-btn";
            verwijderKnop.innerHTML = "&times;";
            verwijderKnop.addEventListener("click", function(e) {
                e.stopPropagation();
                verwijderProduct(index);
            });

            productRegel.appendChild(checkbox);
            productRegel.appendChild(infoLabel);
            productRegel.appendChild(verwijderKnop);
            categorieBlok.appendChild(productRegel);
        });

        boodschappenLijst.appendChild(categorieBlok);
    });
}

// ======================================
// EVENT LISTENERS KNOPPEN
// ======================================

toevoegenKnop.addEventListener("click", voegProductToe);

productInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") voegProductToe();
});

lijstLeegmakenKnop.addEventListener("click", function() {
    if (producten.length > 0 && confirm("Weet je zeker dat je de hele lijst wilt leegmaken?")) {
        producten = [];
        opslaan();
        toonLijst();
    }
});

// ======================================
// INTERNET STATUS INDICATOR
// ======================================

function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineStatus.textContent = "✓ Lijst wordt lokaal opgeslagen";
        offlineStatus.style.opacity = "0.7";
    } else {
        offlineStatus.textContent = "⚠ Je bent offline - App werkt door";
        offlineStatus.style.opacity = "1";
    }
}
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

// ======================================
// INITIALISATIE & SERVICE WORKER
// ======================================

document.addEventListener("DOMContentLoaded", function() {
    laadProducten();
    toonLijst();
    updateOnlineStatus();

    // Registreer Service Worker voor PWA functionaliteit
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/Shopping-list/sw.js") // Controleer of je bestand op GitHub sw.js of service-worker.js heet!
            .then(function(reg) {
                console.log("Service Worker succesvol geregistreerd met scope:", reg.scope);
            })
            .catch(function(error) {
                console.error("Service Worker registratie gefaald:", error);
            });
    }
});
