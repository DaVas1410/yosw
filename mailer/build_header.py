"""Generate mailer/assets/watermark.png: the site's tower drawing, faded to a
low-brightness, low-opacity watermark, meant to sit behind the email body
text (transparent background, so it composites over whatever color is
already on the <td>).

Run once (or whenever the source tower-mark asset changes):

    /home/davas/.uve/py311/bin/python mailer/build_header.py
"""

from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
BRAND_DIR = ROOT / "src" / "assets" / "brand"
OUT_PATH = Path(__file__).resolve().parent / "assets" / "watermark.png"

WATERMARK_WIDTH = 500
WATERMARK_ALPHA = 0.10  # how visible the tower is behind the text
WATERMARK_BRIGHTNESS = 1.7  # >1 washes the colors out lighter/fainter


def build() -> None:
    tower = Image.open(BRAND_DIR / "tower-mark.png").convert("RGBA")
    w = WATERMARK_WIDTH
    h = int(tower.height * (w / tower.width))
    tower = tower.resize((w, h), Image.LANCZOS)
    tower = ImageEnhance.Brightness(tower).enhance(WATERMARK_BRIGHTNESS)

    r, g, b, a = tower.split()
    a = a.point(lambda v: int(v * WATERMARK_ALPHA))
    tower = Image.merge("RGBA", (r, g, b, a))

    OUT_PATH.parent.mkdir(exist_ok=True)
    tower.save(OUT_PATH, "PNG", optimize=True)
    print(f"wrote {OUT_PATH} ({OUT_PATH.stat().st_size // 1024} KB, {w}x{h})")


if __name__ == "__main__":
    build()
