# Cori San Vito

Sito e portale web per i cori della parrocchia di San Vito e C.M. — Spinea (VE).

Il progetto raccoglie **tre cori** (Coro delle 10, Coro delle 11:15, Coro Estivo) sotto un unico portale, con repertorio condiviso, area riservata per coristi e responsabili, e strumenti di gestione (presenze, utenti, avvisi, canti).

## Panoramica

- Homepage di selezione coro, con pagina dedicata per ciascun coro (palette colore e Google Sheet propri)
- Repertorio canti unificato, con ricerca full-text su titoli, testi e categorie
- Form pubblico per la richiesta di nuovi canti (via FormSubmit)
- Area riservata (`/portale`) con autenticazione via token, ruoli e permessi differenziati
- Calendario prove/celebrazioni per coro, integrato con Google Calendar
- Registro presenze, statistiche e classifica per coro
- Gestione utenti (creazione account, attivazione, ruoli)
- Bacheca avvisi, filtrabile per coro o generale
- Gestione canti da pannello admin (canti della settimana, repertorio completo)

## Repository correlati

Questo repository contiene solo il **frontend** (HTML/CSS/JS statico, servito via GitHub Pages). Il backend (API REST, autenticazione, modelli dati) vive in un repository separato:

- Backend: Node.js/Express, ospitato su Render
- Database: MongoDB Atlas

Le chiamate API dal frontend passano attraverso i moduli in `/script/api.js` e `/script/auth-guard.js`.

## Struttura del progetto

```text
/
├── index.html                    # Homepage — selezione coro
├── canti.html                    # Repertorio completo canti
├── privacy.html                  # Privacy e note legali
│
├── coro-10/
│   └── index.html                # Homepage Coro delle 10
├── coro-1115/
│   └── index.html                # Homepage Coro delle 11:15
├── coro-estate/
│   └── index.html                # Homepage Coro Estivo
│
├── canti/                        # Pagine dei singoli canti
│
├── portale/                      # Area riservata (richiede login)
│   ├── login.html
│   ├── index.html                # Dashboard, card dinamiche per ruolo
│   ├── profilo.html              # Dati personali, voce/strumento, cambio password
│   ├── bacheca.html              # Avvisi per coro / generali
│   ├── calendario.html           # Calendario prove e celebrazioni
│   ├── presenze.html             # Statistiche presenze (personali o per coro)
│   ├── registro.html             # Registrazione presenze (admin/direttore/responsabile)
│   ├── utenti.html               # Creazione e gestione account
│   ├── canti-admin.html          # Gestione canti della settimana e repertorio
│   └── aggiungi-canto.html       # Richiesta di un nuovo canto
│
├── system/
│   ├── grazie.html                # Conferma dopo l'invio di un canto
│   └── docs/
│       └── guida-scrittura-canti.html
│
├── style/
│   ├── style.css                  # Stili base, variabili CSS, utility riutilizzabili
│   ├── temi-cori.css              # Palette colore per coro (blu, verde oliva, terracotta)
│   ├── home.css / home-coro.css   # Homepage generale e homepage per coro
│   ├── portale.css                # Layout comune area riservata
│   ├── form.css                   # Stili form
│   ├── bacheca.css / calendario.css / presenze.css / profilo.css
│   ├── registro.css / utenti.css / canti-admin.css / tab-cori.css
│   └── dashboard.css
│
├── script/
│   ├── api.js                     # Wrapper chiamate API verso il backend
│   ├── auth-guard.js              # Protezione pagine riservate, gestione token
│   ├── canti-domenica.js          # Canti della domenica da Google Sheets
│   ├── search.js                  # Motore di ricerca canti
│   └── ...
│
├── images/                        # Favicon, icone, manifest
├── pdf-testi/                     # PDF testi canti
├── pdf-spartiti/                  # PDF spartiti
└── canti.json                     # Metadati e indice dei canti
```

## Tecnologie

### Frontend
- HTML5 semantico
- CSS3 con variabili custom properties (palette per coro sovrascritta via `temi-cori.css`)
- JavaScript vanilla (ES modules per l'area riservata)
- Font Awesome per le icone

### Integrazioni esterne
- **Google Sheets** — canti della settimana, nuovi canti, tempi forti (per coro)
- **Google Calendar** — calendario prove e celebrazioni
- **FormSubmit** — invio richieste di nuovi canti via email
- **FullCalendar** — rendering del calendario nel portale
- **counter.dev** — statistiche di visita

## Autenticazione e ruoli

L'accesso al portale richiede login (`portale/login.html`); il token viene gestito da `script/auth-guard.js` e verificato ad ogni caricamento di pagina riservata.

Ruoli previsti:
| Ruolo | Permessi |
|---|---|
| `admin` | Accesso completo a tutti i cori e le funzioni |
| `direttore` | Gestione del proprio coro: presenze, canti, utenti, bacheca |
| `responsabile` | Come direttore, permessi su funzioni organizzative |
| `corista` | Area personale: profilo, presenze, bacheca, calendario |
| `strumentista` | Come corista |

Le pagine amministrative (`utenti.html`, `registro.html`, `canti-admin.html`) richiedono uno dei ruoli `admin`, `direttore` o `responsabile`.

## Sistema di ricerca canti

- Ricerca full-text su titoli, testi e categorie
- Bonus di punteggio per corrispondenze esatte, per evitare che frasi parziali ripetute superino in ranking un titolo corrispondente per intero
- Filtraggio per categoria liturgica
- Modalità presentazione con scrolling automatico, per proiezione durante prove e celebrazioni

## Richiesta di un nuovo canto

La pagina `portale/aggiungi-canto.html` permette di proporre un canto da aggiungere al repertorio. L'invio avviene tramite FormSubmit, che recapita un'email ai responsabili con oggetto:

```
Nuovo canto da inserire: [Nome canto]
```

Dopo l'invio, l'utente viene reindirizzato a `system/grazie.html`.

Campi richiesti: nome del canto e testo (obbligatori); autore, categoria, link YouTube, numero sul libretto e note (facoltativi).

**Nota**: l'inserimento non è automatico — ogni richiesta viene verificata manualmente prima di essere pubblicata (pagina HTML, aggiornamento di `canti.json` e del repertorio).

## Design responsive

- Layout adattivo mobile/tablet/desktop, breakpoint principali a 768px e 426px
- Menu hamburger sotto i 768px
- Palette dinamica per coro tramite variabile CSS `--c-primary`, sovrascritta per `body.coro-10`, `body.coro-1115`, `body.coro-estate`