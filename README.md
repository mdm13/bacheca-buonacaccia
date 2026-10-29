# buonacaccia

Estrae da [BuonaCaccia](https://buonacaccia.agesci.it/Events.aspx) gli eventi AGESCI con iscrizioni aperte
o da aprire e li pubblica in una **bacheca web** (`site/`) dove cercarli per regione, branca e tipologia,
ordinarli per data di apertura delle iscrizioni, nascondere quelli pieni e salvare i filtri preferiti.

Strumento non ufficiale: i dati vengono da BuonaCaccia e le iscrizioni si fanno solo lì.

## Riga di comando

```sh
uv run buonacaccia                       # Formazione Capi Veneto + Nazionale: tabella a video + CSV
uv run buonacaccia --solo-da-aprire      # solo eventi con iscrizioni non ancora aperte
uv run buonacaccia -o eventi.csv         # percorso CSV personalizzato
uv run buonacaccia --json site/eventi.json   # dataset completo (tutte le regioni e categorie) per la bacheca
```

Il CSV usa `;` come separatore ed è codificato UTF-8 con BOM, così Excel in italiano lo apre correttamente.
Lo scaricamento completo legge anche la pagina di dettaglio di ogni evento (~160 eventi, circa un minuto).

## Bacheca web in locale

```sh
uv run buonacaccia --json site/eventi.json
uv run python -m http.server 8000 -d site
```

Poi apri http://localhost:8000. Serve un server: aprendo `index.html` con doppio clic il browser blocca
la lettura di `eventi.json`.

Nella pagina:
- i filtri si applicano subito e finiscono nell'indirizzo, quindi il link si può condividere;
- **Condividi** (in alto, utile soprattutto nell'app installata, che non ha la barra dell'indirizzo) apre la
  condivisione del telefono con il link della selezione e un breve messaggio che descrive i filtri scelti;
  dove la condivisione non c'è, copia messaggio e link negli appunti;
- **+ Appunta filtro** salva il filtro corrente come preferito (nel browser, `localStorage`); un tocco sul
  biglietto lo riapplica, **Modifica** permette di rinominarlo o eliminarlo;
- l'ultimo filtro usato viene ripristinato alla visita successiva;
- **Scegli regioni…** apre una finestra con la mappa d'Italia (clic sulle regioni) o l'elenco, più la
  casella per gli eventi nazionali; le regioni scelte compaiono come chip nell'area filtri.

La mappa (`site/italia-regioni.svg`) è generata da `tools/genera_mappa.py` dai confini regionali
**ISTAT** (licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)), tramite
[openpolis/geojson-italy](https://github.com/openpolis/geojson-italy).

La pagina si può installare come app (*Aggiungi a Home* su iPhone, *Installa app* su Android, Chrome ed
Edge): nome e icona vengono da `site/manifest.webmanifest` e `site/icons/`. Le icone ridisegnano
`site/favicon.svg`; se cambia, rigenerale con `uv run --with pillow python tools/genera_icone.py`.

Lo stesso script disegna `site/og-image.png`, l'anteprima mostrata da WhatsApp, Telegram e social quando si
condivide un link. È la stessa per ogni selezione (il sito è statico e WhatsApp non esegue il JavaScript):
il dettaglio della selezione sta nel testo del messaggio. I tag `og:` in `site/index.html` usano l'indirizzo
assoluto `https://mdm13.github.io/bacheca-buonacaccia/`: se il sito cambia indirizzo vanno aggiornati.

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/pages.yml` due volte al giorno, alle 03:23 e alle 15:23 UTC (e a ogni push su
`master`, o a mano da *Actions → Aggiorna e pubblica → Run workflow*) scarica gli eventi e pubblica `site/` su GitHub Pages.
`site/eventi.json` non è nel repository: lo genera il workflow.

Una tantum, dopo aver creato il repository su GitHub:

1. `git remote add origin https://github.com/<utente>/<repo>.git` e `git push -u origin master`;
2. su GitHub: *Settings → Pages → Build and deployment → Source: GitHub Actions*;
3. lancia il workflow da *Actions*; il sito sarà su `https://<utente>.github.io/<repo>/`.
