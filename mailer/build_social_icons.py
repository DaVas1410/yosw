"""Generate small inline social icons for the email footer (Instagram,
Facebook, LinkedIn): simple rounded-square glyphs in each platform's brand
color, not the trademarked logos themselves — email clients can't reliably
load remote icon fonts/SVGs, so these are attached as inline CID PNGs like
the header logo and watermark.

Run once (or to tweak size/colors):

    /home/davas/.uve/py311/bin/python mailer/build_social_icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(__file__).resolve().parent / "assets"
SIZE = 88  # 2x for retina; displayed at ~44px in the email
RADIUS = 22


def _rounded_square(color: str) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=RADIUS, fill=color)
    return img


def _centered_text(img: Image.Image, text: str, font_size: int) -> None:
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default(size=font_size)
    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        ((SIZE - w) / 2 - bbox[0], (SIZE - h) / 2 - bbox[1]),
        text,
        font=font,
        fill="#ffffff",
    )


def build_facebook() -> Image.Image:
    img = _rounded_square("#1877f2")
    _centered_text(img, "f", 56)
    return img


def build_linkedin() -> Image.Image:
    img = _rounded_square("#0a66c2")
    _centered_text(img, "in", 34)
    return img


def build_instagram() -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    # Approximate IG's gradient with a diagonal blend, no text needed —
    # the camera glyph reads clearly at small sizes.
    top, bottom = (0xF5, 0x8A, 0x2E), (0xC1, 0x35, 0x84)
    for y in range(SIZE):
        t = y / (SIZE - 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        ImageDraw.Draw(img).line([(0, y), (SIZE, y)], fill=(r, g, b, 255))
    mask = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=RADIUS, fill=255)
    gradient = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gradient.paste(img, (0, 0), mask)

    draw = ImageDraw.Draw(gradient)
    pad = 22
    draw.rounded_rectangle([pad, pad, SIZE - pad, SIZE - pad], radius=16, outline="#ffffff", width=5)
    r = 13
    cx, cy = SIZE / 2, SIZE / 2
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline="#ffffff", width=5)
    dot_r = 4
    draw.ellipse(
        [SIZE - pad - 14, pad + 6, SIZE - pad - 14 + dot_r * 2, pad + 6 + dot_r * 2],
        fill="#ffffff",
    )
    return gradient


def build() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    for name, fn in (("instagram", build_instagram), ("facebook", build_facebook), ("linkedin", build_linkedin)):
        path = OUT_DIR / f"icon-{name}.png"
        fn().save(path, "PNG", optimize=True)
        print(f"wrote {path}")


if __name__ == "__main__":
    build()
