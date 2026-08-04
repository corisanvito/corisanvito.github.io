/**
 * canti-domenica.js  (versione multi-coro)
 *
 * Legge il nome del foglio Google Sheets dal body:
 *   <body data-sheet="coro-10">
 *
 * Il file Sheets ha più fogli con nomi: coro-10 | coro-1115 | coro-estate
 * La struttura delle colonne è identica per tutti i fogli.
 *
 * Struttura attesa per ogni foglio:
 *   Riga 0 (intestazione):  col A = etichetta, col C = data domenica, col H = nome tempo forte
 *   Righe 1+:
 *     A = titolo canto          B = link canto         C = indicazione (Ingresso, Offertorio…)
 *     E = testo "nuovo canto"   F = link nuovo canto
 *     H = testo tempo forte     I = link tempo forte
 */

const SHEET_ID = "1NYcf3upDR8YLuPX0dm__T1ArAZLXBIdNRBgzwC5GCa0";

function getNomeFoglio() {
    return document.body.dataset.sheet || "coro-10";
}

function getSheetUrl() {
    const foglio = encodeURIComponent(getNomeFoglio());
    return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${foglio}`;
}

/* ── Utilità URL ───────────────────────────────────────────────────────── */

/**
 * Converte i percorsi relativi (es. "canti/nome") in assoluti ("/canti/nome"),
 * così funzionano correttamente da qualsiasi sotto-cartella del sito.
 * URL già assoluti (http/https) o ancore (#) vengono restituiti invariati.
 */
function normalizzaUrl(url) {
    if (!url || url === "#" || url.startsWith("http") || url.startsWith("/")) return url;
    return "/" + url;
}

/* ── Utilità data ──────────────────────────────────────────────────────── */

function formattaDataCompleta(data) {
    const opzioni = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Intl.DateTimeFormat('it-IT', opzioni).format(data);
}

function prossimaDomenica() {
    const oggi = new Date();
    const diff = (7 - oggi.getDay()) % 7;
    const domenica = new Date(oggi);
    domenica.setDate(oggi.getDate() + diff);
    const opzioni = { day: 'numeric', month: 'long' };
    return "domenica " + new Intl.DateTimeFormat('it-IT', opzioni).format(domenica);
}

/* ── Fetch del foglio ──────────────────────────────────────────────────── */

let _cachedRows = null;

async function fetchRows() {
    if (_cachedRows) return _cachedRows;
    const response = await fetch(getSheetUrl());
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    _cachedRows = json.table.rows || [];
    return _cachedRows;
}

/* ── Canti della domenica ─────────────────────────────────────────────── */

async function caricaCantiDomenica() {
    try {
        const rows = await fetchRows();
        if (!rows.length) return;

        const titoloElem = document.getElementById("data");
        const listaCanti = document.getElementById("canti-domenica");
        if (!titoloElem || !listaCanti) return;

        // Data domenica dalla riga 0 col C (indice 2)
        const dataCell = rows[0]?.c?.[2];
        if (!dataCell?.v) {
            titoloElem.textContent = prossimaDomenica();
            listaCanti.innerHTML = "<p>Nessun canto disponibile per questa settimana.</p>";
            return;
        }

        const dataFoglio = new Date(dataCell.v);
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        if (dataFoglio < oggi) {
            titoloElem.textContent = prossimaDomenica();
            listaCanti.innerHTML = "<p>Nessun canto disponibile per questa settimana.</p>";
            return;
        }

        titoloElem.textContent = formattaDataCompleta(dataFoglio);
        listaCanti.innerHTML = "";
        let haCanti = false;

        rows.slice(1).forEach(row => {
            if (!row.c || row.c.length < 3) return;

            const titolo     = row.c[0]?.v?.trim() || "";
            const link       = normalizzaUrl(row.c[1]?.v) || "#";
            const indicazione = row.c[2]?.v?.trim() || "";

            if (!titolo || titolo.startsWith("http") || titolo.toLowerCase().includes("inserire")) return;
            if (!indicazione) return;

            haCanti = true;
            const p = document.createElement("p");
            p.classList.add("canto-link");
            p.innerHTML = `<a href="${link}"><b>${indicazione}:</b> ${titolo}</a>`;
            listaCanti.appendChild(p);
        });

        if (!haCanti) {
            listaCanti.innerHTML = "<p>Nessun canto disponibile al momento.</p>";
        }

    } catch (err) {
        console.error("Errore canti domenica:", err);
    }
}

/* ── Nuovi canti ──────────────────────────────────────────────────────── */

async function caricaCantiNuovi() {
    const listaCanti  = document.getElementById("canti-nuovi");
    const sezione     = document.getElementById("sezione-nuovi-canti");
    if (!listaCanti || !sezione) return;

    try {
        const rows = await fetchRows();
        listaCanti.innerHTML = "";
        let haCanti = false;

        rows.slice(1).forEach(row => {
            // Col E (4) = testo, col F (5) = url
            const testo = row.c?.[4]?.v;
            const url   = normalizzaUrl(row.c?.[5]?.v);
            if (!testo || !url) return;

            haCanti = true;
            const p = document.createElement("p");
            p.classList.add("canto-link");
            const a = document.createElement("a");
            a.href = url;
            a.textContent = testo;
            p.appendChild(a);
            listaCanti.appendChild(p);
        });

        sezione.style.display = haCanti ? "block" : "none";

    } catch (err) {
        console.error("Errore canti nuovi:", err);
        sezione.style.display = "none";
    }
}

/* ── Canti tempi forti ────────────────────────────────────────────────── */

async function caricaCantiTempo() {
    const listaCanti  = document.getElementById("canti-tempo");
    const sezione     = document.getElementById("tempi-forti");
    if (!listaCanti || !sezione) return;

    try {
        const rows = await fetchRows();

        // Nome del tempo forte dalla riga 0 col H (7)
        const tempoSpan = document.getElementById("tempo");
        if (tempoSpan && rows[0]?.c?.[7]?.v) {
            tempoSpan.textContent = rows[0].c[7].v;
        }

        listaCanti.innerHTML = "";
        let haCanti = false;

        rows.slice(1).forEach(row => {
            // Col H (7) = testo, col I (8) = url
            const testo = row.c?.[7]?.v;
            const url   = normalizzaUrl(row.c?.[8]?.v);
            if (!testo || !url) return;

            haCanti = true;
            const p = document.createElement("p");
            p.classList.add("canto-link");
            const a = document.createElement("a");
            a.href = url;
            a.textContent = testo;
            p.appendChild(a);
            listaCanti.appendChild(p);
        });

        sezione.style.display = haCanti ? "block" : "none";

    } catch (err) {
        console.error("Errore tempi forti:", err);
        const sezione = document.getElementById("tempi-forti");
        if (sezione) sezione.style.display = "none";
    }
}

/* ── Init ─────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
    caricaCantiDomenica();
    caricaCantiNuovi();
    caricaCantiTempo();
});