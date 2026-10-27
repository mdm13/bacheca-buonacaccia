# buonacaccia

Estrae da [BuonaCaccia](https://buonacaccia.agesci.it/Events.aspx) gli eventi di **Formazione Capi**
del **Veneto** e di livello **Nazionale** con iscrizioni aperte o da aprire, con descrizione, date
dell'evento, apertura/chiusura iscrizioni, posti e iscritti.

## Uso

```sh
uv run buonacaccia                       # tabella a video + CSV eventi_formazione_capi_AAAAMMGG.csv
uv run buonacaccia --solo-da-aprire      # solo eventi con iscrizioni non ancora aperte
uv run buonacaccia -o eventi.csv         # percorso CSV personalizzato
```

Il CSV usa `;` come separatore ed è codificato UTF-8 con BOM, così Excel in italiano lo apre correttamente.
