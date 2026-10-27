"""Genera site/italia-regioni.svg dai confini regionali ISTAT.

Fonte: openpolis/geojson-italy (limits_IT_regions.geojson), confini ISTAT
rilasciati con licenza CC BY 4.0. Da rilanciare solo se cambiano i confini:

    uv run python tools/genera_mappa.py [--input file.geojson]
"""

import argparse
import json
import math
import urllib.request
from pathlib import Path

URL = "https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson"
USCITA = Path(__file__).resolve().parent.parent / "site" / "italia-regioni.svg"

# Codice ISTAT della regione -> nome usato da BuonaCaccia (e quindi da eventi.json)
NOMI = {
    1: "Piemonte", 2: "Valle d'Aosta", 3: "Lombardia", 4: "Trentino Alto Adige",
    5: "Veneto", 6: "Friuli Venezia Giulia", 7: "Liguria", 8: "Emilia Romagna",
    9: "Toscana", 10: "Umbria", 11: "Marche", 12: "Lazio", 13: "Abruzzo",
    14: "Molise", 15: "Campania", 16: "Puglia", 17: "Basilicata", 18: "Calabria",
    19: "Sicilia", 20: "Sardegna",
}

LARGHEZZA = 400          # unità SVG
TOLLERANZA = 0.55        # semplificazione Douglas-Peucker, in unità SVG
AREA_MINIMA = 3.0        # anelli più piccoli (isolette) vengono scartati


def douglas_peucker(punti, tol):
    if len(punti) < 3:
        return punti
    (x1, y1), (x2, y2) = punti[0], punti[-1]
    dx, dy = x2 - x1, y2 - y1
    norma = math.hypot(dx, dy) or 1e-9
    dist_max, idx = 0.0, 0
    for i in range(1, len(punti) - 1):
        x, y = punti[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norma
        if d > dist_max:
            dist_max, idx = d, i
    if dist_max <= tol:
        return [punti[0], punti[-1]]
    return douglas_peucker(punti[: idx + 1], tol)[:-1] + douglas_peucker(punti[idx:], tol)


def semplifica_anello(punti, tol):
    """Douglas-Peucker su un anello chiuso: lo divide nel punto più lontano dall'inizio."""
    if punti[0] == punti[-1]:
        punti = punti[:-1]
    if len(punti) < 4:
        return punti
    x0, y0 = punti[0]
    k = max(range(len(punti)), key=lambda i: math.hypot(punti[i][0] - x0, punti[i][1] - y0))
    a = douglas_peucker(punti[: k + 1], tol)
    b = douglas_peucker(punti[k:] + [punti[0]], tol)
    return a[:-1] + b[:-1]


def area(anello):
    return 0.5 * sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(anello, anello[1:] + anello[:1]))


def dentro(x, y, anello):
    c = False
    for (x1, y1), (x2, y2) in zip(anello, anello[1:] + anello[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def dist_bordo(x, y, anello):
    best = float("inf")
    for (x1, y1), (x2, y2) in zip(anello, anello[1:] + anello[:1]):
        dx, dy = x2 - x1, y2 - y1
        t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / ((dx * dx + dy * dy) or 1e-9)))
        best = min(best, math.hypot(x - x1 - t * dx, y - y1 - t * dy))
    return best


def centro_visivo(anello, passi=40):
    """Punto interno lontano dai bordi: dove appoggiare la puntina."""
    xs, ys = [p[0] for p in anello], [p[1] for p in anello]
    best, punto = -1.0, (sum(xs) / len(xs), sum(ys) / len(ys))
    for i in range(passi + 1):
        for j in range(passi + 1):
            x = min(xs) + (max(xs) - min(xs)) * i / passi
            y = min(ys) + (max(ys) - min(ys)) * j / passi
            if dentro(x, y, anello):
                d = dist_bordo(x, y, anello)
                if d > best:
                    best, punto = d, (x, y)
    return punto


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, help="GeoJSON locale invece di scaricarlo")
    args = parser.parse_args()

    if args.input:
        dati = json.loads(args.input.read_text(encoding="utf-8"))
    else:
        with urllib.request.urlopen(URL, timeout=60) as r:
            dati = json.load(r)

    poligoni = {}
    for f in dati["features"]:
        nome = NOMI[f["properties"]["reg_istat_code_num"]]
        g = f["geometry"]
        poligoni[nome] = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]

    tutti = [pt for polys in poligoni.values() for poly in polys for ring in poly for pt in ring]
    lon0, lon1 = min(p[0] for p in tutti), max(p[0] for p in tutti)
    lat0, lat1 = min(p[1] for p in tutti), max(p[1] for p in tutti)
    kx = math.cos(math.radians(42))
    scala = LARGHEZZA / ((lon1 - lon0) * kx)
    altezza = math.ceil((lat1 - lat0) * scala)

    def proietta(lon, lat):
        return ((lon - lon0) * kx * scala, (lat1 - lat) * scala)

    righe = []
    for nome, polys in sorted(poligoni.items()):
        anelli = []
        for poly in polys:
            for ring in poly:
                pts = semplifica_anello([proietta(*p[:2]) for p in ring], TOLLERANZA)
                if len(pts) >= 4:
                    anelli.append(pts)
        principale = max(anelli, key=lambda a: abs(area(a)))
        anelli = [a for a in anelli if a is principale or abs(area(a)) >= AREA_MINIMA]
        d = "".join(
            "M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in a) + "Z" for a in anelli
        )
        cx, cy = centro_visivo(principale)
        righe.append(
            f'<path data-regione="{nome}" data-cx="{cx:.1f}" data-cy="{cy:.1f}" d="{d}"/>'
        )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {LARGHEZZA} {altezza}">\n'
        "<!-- Confini regionali: ISTAT, CC BY 4.0, via openpolis/geojson-italy. Generato da tools/genera_mappa.py -->\n"
        + "\n".join(righe)
        + "\n</svg>\n"
    )
    USCITA.write_text(svg, encoding="utf-8")
    print(f"{len(righe)} regioni, {len(svg) // 1024} KB -> {USCITA}")


if __name__ == "__main__":
    main()
