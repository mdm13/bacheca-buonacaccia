"""Estrae da BuonaCaccia gli eventi di Formazione Capi (Veneto e Nazionale)
con iscrizioni aperte o da aprire."""

import argparse
import csv
import sys
import time
from dataclasses import asdict, dataclass, fields
from datetime import date, datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://buonacaccia.agesci.it/"
EVENTS_URL = BASE_URL + "Events.aspx"
EVENT_URL = BASE_URL + "Event.aspx?e={}"

# Valori della colonna "Regione" della lista da tenere. Il filtro regione del sito
# non accetta "Nazionale", quindi si scarica tutto e si filtra qui.
REGIONI = {"Veneto", "Nazionale"}
CATEGORIA_FORMAZIONE_CAPI = "4000000"
PAUSA_TRA_RICHIESTE = 0.3  # secondi, per non sovraccaricare il server

# Icona "semaforo" nella colonna Stato della lista
STATI_SEMAFORO = {
    "light_red": "Da aprire",
    "light_green": "Aperte",
    "light_yellow": "Aperte (lista d'attesa)",
    "light_dual": "Aperte (lista d'attesa)",
}


@dataclass
class Evento:
    livello: str
    tipo: str
    descrizione: str
    inizio: str
    fine: str
    apertura_iscrizioni: str
    chiusura_iscrizioni: str
    posti: int | None
    iscritti: int | None
    stato: str
    localita: str
    url: str


def _parse_data(testo: str) -> date | None:
    try:
        return datetime.strptime(testo.strip(), "%d/%m/%Y").date()
    except ValueError:
        return None


def _get(session: requests.Session, url: str, data: dict | None = None) -> BeautifulSoup:
    resp = session.post(url, data=data, timeout=30) if data else session.get(url, timeout=30)
    resp.raise_for_status()
    resp.encoding = "utf-8"
    return BeautifulSoup(resp.text, "html.parser")


def _intero(testo: str) -> int | None:
    """Numero intero dal testo, None se non numerico (es. posti "(*)")."""
    testo = testo.strip()
    return int(testo) if testo.isdigit() else None


def _testo(soup: BeautifulSoup, element_id: str) -> str:
    el = soup.find(id=element_id)
    return el.get_text(strip=True) if el else ""


def fetch_lista(session: requests.Session) -> list[dict]:
    """Applica i filtri della pagina Events.aspx (postback ASP.NET) e legge la tabella."""
    soup = _get(session, EVENTS_URL)
    form = {
        inp["name"]: inp.get("value", "")
        for inp in soup.select("input[type=hidden][name]")
    }
    form.update({
        "__EVENTTARGET": "ctl00$MainContent$ddlRegion",
        "__EVENTARGUMENT": "",
        "ctl00$ddlRegionSelector": "",
        "ctl00$MainContent$ddlRegion": "",  # tutte le regioni
        "ctl00$MainContent$ddlCategory": CATEGORIA_FORMAZIONE_CAPI,
        "ctl00$MainContent$ddlSortOrder": "D",
        "ctl00$MainContent$cbShowUseful": "on",
    })
    soup = _get(session, EVENTS_URL, data=form)

    tabella = soup.find(id="MainContent_EventsGridView")
    if tabella is None:
        return []

    righe = []
    for tr in tabella.find_all("tr", recursive=False)[1:]:  # salta l'intestazione
        celle = tr.find_all("td", recursive=False)
        link = tr.find("a", href=lambda h: h and h.startswith("Event.aspx?e="))
        if not link or len(celle) < 11:
            continue
        semaforo = celle[10].find("img")
        icona = Path(semaforo["src"]).stem if semaforo else ""
        taken = tr.find(id=lambda i: i and "_Taken_" in i)
        seats = tr.find(id=lambda i: i and "_SeatsMax_" in i)
        righe.append({
            "id": link["href"].split("=", 1)[1],
            "titolo": link.get_text(strip=True),
            "regione": celle[3].get_text(strip=True),
            "inizio": celle[4].get_text(strip=True),
            "fine": celle[5].get_text(strip=True),
            "localita": celle[7].get_text(strip=True),
            "iscritti": _intero(taken.get_text()) if taken else None,
            "posti": _intero(seats.get_text()) if seats else None,
            "stato": STATI_SEMAFORO.get(icona, icona),
        })
    return righe


def fetch_dettaglio(session: requests.Session, event_id: str) -> dict:
    soup = _get(session, EVENT_URL.format(event_id))
    p = "MainContent_EventFormView_"
    return {
        "tipo": _testo(soup, p + "Type"),
        "apertura": _testo(soup, p + "lbSubsFrom"),
        "chiusura": _testo(soup, p + "lbSubsTo"),
        "posti": _testo(soup, p + "lbSeats"),
        "iscritti": _testo(soup, p + "lbTaken"),
    }


def raccogli_eventi() -> list[Evento]:
    oggi = date.today()
    eventi = []
    with requests.Session() as session:
        session.headers["User-Agent"] = "Mozilla/5.0 (buonacaccia-eventi script)"
        righe = [r for r in fetch_lista(session) if r["regione"] in REGIONI]
        for riga in righe:
            time.sleep(PAUSA_TRA_RICHIESTE)
            det = fetch_dettaglio(session, riga["id"])
            apertura = _parse_data(det["apertura"])
            stato = riga["stato"]
            # La data di apertura è il criterio più affidabile per "da aprire"
            if apertura and apertura > oggi:
                stato = "Da aprire"
            eventi.append(Evento(
                livello=riga["regione"],
                tipo=det["tipo"],
                descrizione=riga["titolo"],
                inizio=riga["inizio"],
                fine=riga["fine"],
                apertura_iscrizioni=det["apertura"],
                chiusura_iscrizioni=det["chiusura"],
                posti=_intero(det["posti"]) or riga["posti"],
                iscritti=_intero(det["iscritti"]) if det["iscritti"] else riga["iscritti"],
                stato=stato,
                localita=riga["localita"],
                url=EVENT_URL.format(riga["id"]),
            ))
    eventi.sort(key=lambda e: (_parse_data(e.inizio) or date.max, e.descrizione))
    return eventi


def stampa_tabella(eventi: list[Evento]) -> None:
    colonne = [
        ("Livello", "livello"), ("Tipo", "tipo"), ("Descrizione", "descrizione"),
        ("Inizio", "inizio"), ("Fine", "fine"), ("Apertura iscr.", "apertura_iscrizioni"),
        ("Posti", "posti"), ("Iscritti", "iscritti"), ("Stato", "stato"),
    ]
    righe = [
        ["" if getattr(e, attr) is None else str(getattr(e, attr)) for _, attr in colonne]
        for e in eventi
    ]
    larghezze = [
        max([len(titolo)] + [len(r[i]) for r in righe])
        for i, (titolo, _) in enumerate(colonne)
    ]
    print("  ".join(t.ljust(w) for (t, _), w in zip(colonne, larghezze)))
    print("  ".join("-" * w for w in larghezze))
    for r in righe:
        print("  ".join(v.ljust(w) for v, w in zip(r, larghezze)))
    print(f"\nTotale eventi: {len(eventi)}")


def salva_csv(eventi: list[Evento], percorso: Path) -> None:
    # utf-8-sig e separatore ';' per aprire il file correttamente in Excel italiano
    with percorso.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=[c.name for c in fields(Evento)], delimiter=";")
        writer.writeheader()
        writer.writerows(asdict(e) for e in eventi)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o", "--output", type=Path,
        default=Path(f"eventi_formazione_capi_{date.today():%Y%m%d}.csv"),
        help="percorso del file CSV (default: eventi_formazione_capi_AAAAMMGG.csv)",
    )
    parser.add_argument(
        "--solo-da-aprire", action="store_true",
        help="mostra solo gli eventi con iscrizioni non ancora aperte",
    )
    args = parser.parse_args()

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")

    try:
        eventi = raccogli_eventi()
    except requests.RequestException as exc:
        sys.exit(f"Errore di comunicazione con BuonaCaccia: {exc}")

    if args.solo_da_aprire:
        eventi = [e for e in eventi if e.stato == "Da aprire"]

    stampa_tabella(eventi)
    salva_csv(eventi, args.output)
    print(f"CSV salvato in: {args.output.resolve()}")
