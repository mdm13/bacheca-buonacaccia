"""Genera le icone PNG dell'app (site/icons/) ridisegnando site/favicon.svg,
e l'immagine di anteprima dei link condivisi (site/og-image.png).

Le icone servono per l'installazione come app: manifest (Android, Chrome/Edge desktop)
e apple-touch-icon (iPhone); l'anteprima per WhatsApp, Telegram e social.
Pillow non è una dipendenza del progetto:

    uv run --with pillow python tools/genera_icone.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SITO = Path(__file__).resolve().parent.parent / "site"
USCITA = SITO / "icons"
FONT = SITO / "fonts"

SUGHERO = "#74502f"
CARTA = "#fffdf8"
SPILLA = "#c62828"
INCHIOSTRO = "#2a211a"
SUGHERO_A = "#664527"
SUGHERO_B = "#82593a"
CARTA_SOFT = "#f1e4d3"
# colori delle puntine per branca, come in style.css
PUNTINE = {"fc": "#1f5fa8", "lc": "#f2b705", "eg": "#2e7d32", "rs": "#c62828"}

SOVRA = 4  # supersampling: si disegna a 4x e si riduce, per bordi morbidi


def disegna(lato, angoli, scala=1.0):
    """Disegna il favicon (griglia 32x32) su un quadrato di `lato` pixel.

    `angoli`: raggio degli angoli dello sfondo in unità della griglia (0 = quadrato pieno).
    `scala`: riduce la bacheca attorno al centro, per la zona sicura delle icone maskable.
    """
    px = lato * SOVRA
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    u = px / 32  # pixel per unità della griglia

    d.rounded_rectangle((0, 0, px - 1, px - 1), radius=angoli * u, fill=SUGHERO)

    def p(x, y):
        # coordinate della griglia -> pixel, scalate attorno al centro (16, 16)
        return ((16 + (x - 16) * scala) * u, (16 + (y - 16) * scala) * u)

    def r(v):
        return v * scala * u

    d.rounded_rectangle((*p(7, 9), *p(25, 26)), radius=r(1.5), fill=CARTA)
    cx, cy = p(16, 9)
    d.ellipse((cx - r(4), cy - r(4), cx + r(4), cy + r(4)), fill=SPILLA)
    for x1, x2, y in ((11, 21, 17), (11, 18, 21)):
        a, b = p(x1, y), p(x2, y)
        d.line((a, b), fill=INCHIOSTRO, width=round(r(2)))
        for x, y_ in (a, b):  # estremi arrotondati
            d.ellipse((x - r(1), y_ - r(1), x + r(1), y_ + r(1)), fill=INCHIOSTRO)

    return img.resize((lato, lato), Image.LANCZOS)


def font(nome, size):
    return ImageFont.truetype(str(FONT / nome), size)


def locandina(larghezza, altezza, puntina, data, titolo, timbro, colore_timbro):
    """Una locandina di carta con puntina, data, titolo e timbro (su sfondo trasparente)."""
    m = 30  # margine per ombra e puntina
    img = Image.new("RGBA", (larghezza + 2 * m, altezza + 2 * m), (0, 0, 0, 0))
    ombra = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(ombra).rectangle((m + 2, m + 6, m + larghezza + 2, m + altezza + 6), fill=(0, 0, 0, 90))
    img.alpha_composite(ombra.filter(ImageFilter.GaussianBlur(8)))
    d = ImageDraw.Draw(img)
    d.rectangle((m, m, m + larghezza, m + altezza), fill=CARTA)
    d.text((m + 24, m + 30), data, font=font("barlow-condensed-latin-700-normal.woff2", 46), fill=INCHIOSTRO)
    y = m + 92
    for riga in titolo:
        d.text((m + 24, y), riga, font=font("barlow-latin-600-normal.woff2", 26), fill=INCHIOSTRO)
        y += 34
    for w in (0.8, 0.55):  # righe di testo accennate
        d.rounded_rectangle((m + 24, y + 12, m + 24 + int((larghezza - 48) * w), y + 22), radius=5, fill="#e6ded2")
        y += 26
    f = font("barlow-condensed-latin-700-normal.woff2", 28)
    x0, y0 = m + 24, m + altezza - 64
    bb = d.textbbox((x0 + 12, y0 + 6), timbro, font=f)
    d.rounded_rectangle((x0, y0, bb[2] + 12, y0 + 42), radius=4, outline=colore_timbro, width=3)
    d.text((x0 + 12, y0 + 6), timbro, font=f, fill=colore_timbro)
    cx, cy, r = m + larghezza // 2, m + 4, 13
    d.ellipse((cx - r + 1, cy - r + 3, cx + r + 1, cy + r + 3), fill=(0, 0, 0, 80))
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=puntina)
    d.ellipse((cx - 5, cy - 7, cx, cy - 2), fill=(255, 255, 255, 110))
    return img


def copertina():
    """Anteprima 1200x630 per i link condivisi: sughero, titolo e qualche locandina appuntata."""
    w, h = 1200, 630
    img = Image.new("RGBA", (w, h), SUGHERO)
    d = ImageDraw.Draw(img)
    for passo, colore, sfasa in ((7, SUGHERO_A, (0, 0)), (11, SUGHERO_B, (3, 5))):  # puntini del sughero
        for y in range(sfasa[1], h, passo):
            for x in range(sfasa[0], w, passo):
                d.ellipse((x - 1, y - 1, x + 1, y + 1), fill=colore)

    icona = disegna(132, 6)
    img.alpha_composite(icona, (72, 92))
    d.text((70, 250), "Bacheca eventi", font=font("barlow-condensed-latin-700-normal.woff2", 104), fill=CARTA)
    sotto = font("barlow-latin-500-normal.woff2", 34)
    d.text((74, 382), "Eventi AGESCI da BuonaCaccia", font=sotto, fill=CARTA_SOFT)
    d.text((74, 428), "Iscrizioni aperte e da aprire,", font=sotto, fill=CARTA_SOFT)
    d.text((74, 474), "posti liberi, filtri per regione", font=sotto, fill=CARTA_SOFT)

    fogli = [
        (locandina(300, 330, PUNTINE["fc"], "Apre 8 nov", ["CFM L/C", "Veneto"], "DA APRIRE", "#4338a8"), -4, (650, 40)),
        (locandina(300, 330, PUNTINE["eg"], "Chiude 20 nov", ["Campo di", "specialità"], "APERTE", "#2e6b2f"), 3, (880, 250)),
        (locandina(260, 250, PUNTINE["rs"], "Inizia 6 dic", ["ROSS"], "APERTE", "#2e6b2f"), 5, (950, -10)),
    ]
    for foglio, angolo, (x, y) in fogli:
        ruotato = foglio.rotate(angolo, resample=Image.BICUBIC, expand=True)
        img.alpha_composite(ruotato, (x, y)) if x >= 0 and y >= 0 else img.paste(ruotato, (x, y), ruotato)
    return img.convert("RGB")


def main():
    USCITA.mkdir(parents=True, exist_ok=True)
    disegna(192, 6).save(USCITA / "icon-192.png", optimize=True)
    disegna(512, 6).save(USCITA / "icon-512.png", optimize=True)
    # maskable: sfondo pieno, bacheca dentro il cerchio sicuro (80% del lato)
    disegna(512, 0, scala=0.72).save(USCITA / "maskable-512.png", optimize=True)
    # iOS arrotonda da sé gli angoli e rende nere le trasparenze
    disegna(180, 0, scala=0.85).convert("RGB").save(USCITA / "apple-touch-icon.png", optimize=True)
    copertina().save(SITO / "og-image.png", optimize=True)
    print(f"Icone scritte in {USCITA}, anteprima in {SITO / 'og-image.png'}")


if __name__ == "__main__":
    main()
