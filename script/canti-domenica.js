/**
 * canti-domenica.js (versione ibrida: API backend + Google Sheets)
 */

const API_URL = 'https://corisanvito-backend.onrender.com';
const SHEET_ID = "1NYcf3upDR8YLuPX0dm__T1ArAZLXBIdNRBgzwC5GCa0";

const CORO_IDS = {
    'coro-10': '6a8222a329c53cf968d80891',
    'coro-1115': '6a8222a329c53cf968d80892',
    'coro-estate': '6a8222a329c53cf968d80893'
};

function getNomeFoglio() {
    return document.body.dataset.sheet || 'coro-10';
}

function getCoroId() {
    return CORO_IDS[getNomeFoglio()] || null;
}

/* ── Utilità ───────────────────────────────────────────────────────────── */

function normalizzaUrl(url) {
    if (!url || url === '#' || url.startsWith('http') || url.startsWith('/')) return url;
    return '/' + url;
}

function formattaDataCompleta(data) {
    return new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(data);
}

function prossimaDomenica() {
    const oggi = new Date();
    const diff = (7 - oggi.getDay()) % 7 || 7;
    const dom = new Date(oggi);
    dom.setDate(oggi.getDate() + diff);
    return 'domenica ' + new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long' }).format(dom);
}

/* ── API Backend ───────────────────────────────────────────────────────── */

async function fetchDalBackend(coroId) {
    try {
        const res = await fetch(`${API_URL}/canti-settimana/${coroId}`);
        return await res.json();
    } catch { return []; }
}

/* ── Google Sheets ─────────────────────────────────────────────────────── */

let _cachedRows = null;

async function fetchRows() {
    if (_cachedRows) return _cachedRows;
    const foglio = encodeURIComponent(getNomeFoglio());
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${foglio}`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    _cachedRows = json.table.rows || [];
    return _cachedRows;
}

/* ── Canti domenica ────────────────────────────────────────────────────── */

async function caricaCantiDomenica() {
    const titoloElem = document.getElementById('data');
    const listaCanti = document.getElementById('canti-domenica');
    if (!titoloElem || !listaCanti) return;

    const coroId = getCoroId();

    if (coroId) {
        try {
            const canti = await fetchDalBackend(coroId);
            const domenica = canti.filter(c => c.tipo === 'domenica');

            if (domenica.length > 0) {
                const data = domenica[0].dataDomenica
                    ? new Date(domenica[0].dataDomenica)
                    : null;

                const oggi = new Date(); oggi.setHours(0, 0, 0, 0);

                if (data && data < oggi) {
                    // Data passata — mostra messaggio vuoto
                    titoloElem.textContent = prossimaDomenica();
                    listaCanti.innerHTML = '<p>Nessun canto disponibile per questa settimana.</p>';
                    return;
                }

                // Data futura o assente — mostra i canti
                titoloElem.textContent = data ? formattaDataCompleta(data) : prossimaDomenica();
                listaCanti.innerHTML = '';
                domenica.forEach(c => {
                    const p = document.createElement('p');
                    p.classList.add('canto-link');
                    p.innerHTML = `<a href="${normalizzaUrl(c.link)}"><b>${c.indicazione}:</b> ${c.titolo}</a>`;
                    listaCanti.appendChild(p);
                });
                return;
            }
        } catch { /* fallback a Sheets */ }
    }

    // Fallback Google Sheets
    try {
        const rows = await fetchRows();
        if (!rows.length) return;

        const dataCell = rows[0]?.c?.[2];
        if (!dataCell?.v) {
            titoloElem.textContent = prossimaDomenica();
            listaCanti.innerHTML = '<p>Nessun canto disponibile per questa settimana.</p>';
            return;
        }

        const dataFoglio = new Date(dataCell.v);
        const oggi = new Date(); oggi.setHours(0, 0, 0, 0);

        if (dataFoglio < oggi) {
            titoloElem.textContent = prossimaDomenica();
            listaCanti.innerHTML = '<p>Nessun canto disponibile per questa settimana.</p>';
            return;
        }

        titoloElem.textContent = formattaDataCompleta(dataFoglio);
        listaCanti.innerHTML = '';
        let haCanti = false;

        rows.slice(1).forEach(row => {
            if (!row.c || row.c.length < 3) return;
            const titolo = row.c[0]?.v?.trim() || '';
            const link = normalizzaUrl(row.c[1]?.v) || '#';
            const indicazione = row.c[2]?.v?.trim() || '';
            if (!titolo || !indicazione) return;
            if (titolo.startsWith('http') || titolo.toLowerCase().includes('inserire')) return;

            haCanti = true;
            const p = document.createElement('p');
            p.classList.add('canto-link');
            p.innerHTML = `<a href="${link}"><b>${indicazione}:</b> ${titolo}</a>`;
            listaCanti.appendChild(p);
        });

        if (!haCanti) listaCanti.innerHTML = '<p>Nessun canto disponibile al momento.</p>';
    } catch (err) {
        console.error('Errore canti domenica:', err);
    }
}

/* ── Nuovi canti ───────────────────────────────────────────────────────── */

async function caricaCantiNuovi() {
    const listaCanti = document.getElementById('canti-nuovi');
    const sezione = document.getElementById('sezione-nuovi-canti');
    if (!listaCanti || !sezione) return;

    const coroId = getCoroId();

    if (coroId) {
        try {
            const canti = await fetchDalBackend(coroId);
            const nuovi = canti.filter(c => c.tipo === 'nuovo');

            if (nuovi.length > 0) {
                listaCanti.innerHTML = '';
                nuovi.forEach(c => {
                    const p = document.createElement('p');
                    p.classList.add('canto-link');
                    const a = document.createElement('a');
                    a.href = normalizzaUrl(c.link);
                    a.textContent = c.titolo;
                    p.appendChild(a);
                    listaCanti.appendChild(p);
                });
                sezione.style.display = 'block';
                return;
            }
        } catch { /* fallback */ }
    }

    // Fallback Sheets
    try {
        const rows = await fetchRows();
        listaCanti.innerHTML = '';
        let haCanti = false;

        rows.slice(1).forEach(row => {
            const testo = row.c?.[4]?.v;
            const url = normalizzaUrl(row.c?.[5]?.v);
            if (!testo || !url) return;
            haCanti = true;
            const p = document.createElement('p');
            p.classList.add('canto-link');
            const a = document.createElement('a');
            a.href = url; a.textContent = testo;
            p.appendChild(a);
            listaCanti.appendChild(p);
        });

        sezione.style.display = haCanti ? 'block' : 'none';
    } catch (err) {
        console.error('Errore canti nuovi:', err);
        sezione.style.display = 'none';
    }
}

/* ── Tempi forti ───────────────────────────────────────────────────────── */

async function caricaCantiTempo() {
    const listaCanti = document.getElementById('canti-tempo');
    const sezione = document.getElementById('tempi-forti');
    if (!listaCanti || !sezione) return;

    const coroId = getCoroId();

    if (coroId) {
        try {
            const canti = await fetchDalBackend(coroId);
            const tempoForte = canti.filter(c => c.tipo === 'tempo_forte');

            if (tempoForte.length > 0) {
                const tempoSpan = document.getElementById('tempo');
                if (tempoSpan && tempoForte[0].tempoForte) {
                    tempoSpan.textContent = tempoForte[0].tempoForte;
                }

                listaCanti.innerHTML = '';
                tempoForte.forEach(c => {
                    const p = document.createElement('p');
                    p.classList.add('canto-link');
                    const a = document.createElement('a');
                    a.href = normalizzaUrl(c.link);
                    a.textContent = c.titolo;
                    p.appendChild(a);
                    listaCanti.appendChild(p);
                });
                sezione.style.display = 'block';
                return;
            }
        } catch { /* fallback */ }
    }

    // Fallback Sheets
    try {
        const rows = await fetchRows();
        const tempoSpan = document.getElementById('tempo');
        if (tempoSpan && rows[0]?.c?.[7]?.v) {
            tempoSpan.textContent = rows[0].c[7].v;
        }

        listaCanti.innerHTML = '';
        let haCanti = false;

        rows.slice(1).forEach(row => {
            const testo = row.c?.[7]?.v;
            const url = normalizzaUrl(row.c?.[8]?.v);
            if (!testo || !url) return;
            haCanti = true;
            const p = document.createElement('p');
            p.classList.add('canto-link');
            const a = document.createElement('a');
            a.href = url; a.textContent = testo;
            p.appendChild(a);
            listaCanti.appendChild(p);
        });

        sezione.style.display = haCanti ? 'block' : 'none';
    } catch (err) {
        console.error('Errore tempi forti:', err);
        sezione.style.display = 'none';
    }
}

/* ── Init ──────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    caricaCantiDomenica();
    caricaCantiNuovi();
    caricaCantiTempo();
});