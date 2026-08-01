# Guida alla migrazione → corisanvito.github.io

## 1. Rinominare il repository su GitHub

### Opzione A — Nuova organizzazione (consigliata)
1. Vai su github.com → clic sulla tua foto → **Your organizations** → **New organization**
2. Nome organizzazione: `corisanvito` (il sito diventerà `corisanvito.github.io`)
3. Crea il repo `corisanvito.github.io` dentro la nuova organizzazione
4. Clona il repo vecchio e fai push nel nuovo:
   ```bash
   git clone https://github.com/coro-delle-dieci/coro-delle-dieci.github.io.git
   cd coro-delle-dieci.github.io
   git remote set-url origin https://github.com/corisanvito/corisanvito.github.io.git
   git push -u origin main
   ```

### Opzione B — Rinominare repo e organizzazione esistenti
1. **Settings del repo** → rinomina in `corisanvito.github.io`
2. **Settings dell'organizzazione** → rinomina in `corisanvito`
   - GitHub reindirizzerà i vecchi URL automaticamente per qualche mese

---

## 2. Aggiungere i nuovi file al repo

Copia questi file/cartelle nella root del repo:

```
index.html                ← sostituisce il vecchio (nuova homepage selezione coro)
style/temi-cori.css       ← nuovo file, aggiungilo
script/canti-domenica.js  ← sostituisce il vecchio (ora unificato, multi-coro)
script/calendario.js      ← sostituisce il vecchio (legge calendar ID dal data-)
coro-10/
    index.html
    calendario.html
coro-1115/
    index.html
    calendario.html
coro-estate/
    index.html
    calendario.html
```

I vecchi file che NON vanno più usati (puoi tenerli per sicurezza ma non sono linkati):
- `script/canti-nuovi.js`       → la logica è ora dentro `canti-domenica.js`
- `script/canti-tempi-forti.js` → idem

---

## 3. Configurare i Google Calendar degli altri cori

Nel file `coro-1115/calendario.html` e `coro-estate/calendario.html`,
aggiorna il `data-calendar-id` con l'ID del calendario Google corretto:

```html
<!-- coro-1115/calendario.html -->
<body class="coro-1115" data-calendar-id="INSERIRE_ID_CALENDARIO_1115@gmail.com">

<!-- coro-estate/calendario.html -->
<body class="coro-estate" data-calendar-id="INSERIRE_ID_CALENDARIO_ESTATE@gmail.com">
```

Per trovare l'ID di un Google Calendar:
1. Apri calendar.google.com
2. Clic sui 3 puntini accanto al calendario → **Impostazioni e condivisione**
3. Scorri fino a **Integra il calendario** → copia l'**ID calendario**

---

## 4. Verificare i fogli Google Sheets

Il file Sheets condiviso (`SHEET_ID = 1NYcf3upDR8YLuPX0dm__T1ArAZLXBIdNRBgzwC5GCa0`)
deve avere tre fogli con i nomi esatti:
- `coro-10`
- `coro-1115`
- `coro-estate`

Ogni foglio deve avere la stessa struttura del foglio attuale:
```
Riga 0:  [etichetta] [vuoto] [data domenica] ... [nome tempo forte]
Riga 1+: [titolo]   [link]  [indicazione]   ... [nuovo canto testo] [nuovo canto link] ... [tempo forte testo] [tempo forte link]
```
Colonne esatte:
- A = titolo canto della domenica
- B = link canto della domenica  
- C = indicazione (Ingresso, Offertorio…) — riga 0: data domenica
- E = testo "canto da ripassare"
- F = link "canto da ripassare"
- H = testo canto tempo forte — riga 0: nome del tempo forte
- I = link canto tempo forte

---

## 5. Aggiornare i link interni al sito

Nei file della sezione `canti/` (le 160+ pagine dei singoli canti),
il link "← Torna ai canti" punta alla vecchia homepage.
Dopo la migrazione, conviene che punti a `../canti` (invariato) o alla root `../`.

Nei file `about.html`, `privacy.html`, ecc., aggiorna:
- Il titolo da "Coro delle Dieci" a "Cori di San Vito"
- Il copyright da "Coro delle Dieci" a "Cori di San Vito"
- I link nell'header che puntano a `./` (ora la root è il selettore di coro)

---

## 6. Struttura finale del repository

```
/
├── index.html                ← nuova homepage (selezione coro)
├── coro-10/
│   ├── index.html            ← homepage coro 10 (blu)
│   └── calendario.html       ← calendario coro 10
├── coro-1115/
│   ├── index.html            ← homepage coro 11:15 (verde oliva)
│   └── calendario.html       ← calendario coro 11:15
├── coro-estate/
│   ├── index.html            ← homepage coro estivo (corallo)
│   └── calendario.html       ← calendario coro estivo
├── canti/                    ← INVARIATA (condivisa da tutti i cori)
├── style/
│   ├── style.css             ← invariato
│   ├── home.css              ← invariato
│   ├── calendario.css        ← invariato
│   ├── temi-cori.css         ← NUOVO: palette per i 3 cori
│   └── ...
├── script/
│   ├── canti-domenica.js     ← SOSTITUITO: ora multi-coro + nuovi + tempi forti
│   ├── calendario.js         ← SOSTITUITO: ora legge calendar ID dal data-
│   └── ...altri invariati
└── ...resto invariato
```
