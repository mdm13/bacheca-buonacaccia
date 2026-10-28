"""Genera le icone PNG dell'app (site/icons/) ridisegnando site/favicon.svg.

Servono per l'installazione come app: manifest (Android, Chrome/Edge desktop)
e apple-touch-icon (iPhone). Pillow non è una dipendenza del progetto:

    uv run --with pillow python tools/genera_icone.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

USCITA = Path(__file__).resolve().parent.parent / "site" / "icons"

SUGHERO = "#74502f"
CARTA = "#fffdf8"
SPILLA = "#c62828"
INCHIOSTRO = "#2a211a"

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


def main():
    USCITA.mkdir(parents=True, exist_ok=True)
    disegna(192, 6).save(USCITA / "icon-192.png", optimize=True)
    disegna(512, 6).save(USCITA / "icon-512.png", optimize=True)
    # maskable: sfondo pieno, bacheca dentro il cerchio sicuro (80% del lato)
    disegna(512, 0, scala=0.72).save(USCITA / "maskable-512.png", optimize=True)
    # iOS arrotonda da sé gli angoli e rende nere le trasparenze
    disegna(180, 0, scala=0.85).convert("RGB").save(USCITA / "apple-touch-icon.png", optimize=True)
    print(f"Icone scritte in {USCITA}")


if __name__ == "__main__":
    main()
