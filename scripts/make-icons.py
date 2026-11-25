"""Builds the app icons from the IRADA logo.

    python3 scripts/make-icons.py

Reads src/assets/logos/irada-logo-transparent.png (white ring and lime bolt on transparent) and
writes, into assets/:

  icon.png                       iOS and default icon: the mark on the violet gradient, opaque
  android-icon-background.png    Android adaptive icon, back layer: the gradient
  android-icon-foreground.png    Android adaptive icon, front layer: the mark, inside the safe zone
  android-icon-monochrome.png    Android 13+ themed icon: the mark in one colour
  favicon.png                    Web tab icon

Needs Pillow and NumPy (pip install pillow numpy). Re-run it after changing the logo.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / 'src/assets/logos/irada-logo-transparent.png'
OUT = ROOT / 'assets'
SIZE = 1024

# Brand colours from src/theme.ts
TOP_LEFT = (0x6A, 0x47, 0xFA)  # stageMid
MIDDLE = (0x5B, 0x3D, 0xF5)  # violet
BOTTOM_RIGHT = (0x2A, 0x12, 0x90)  # between violetDeep and night
GLOW = (0xB9, 0xA6, 0xFF)


def mark() -> Image.Image:
    """The round mark (ring and bolt), cut from the top of the full logo."""
    logo = Image.open(LOGO).convert('RGBA')
    alpha = np.array(logo.split()[3])
    rows = np.where(alpha.max(axis=1) > 20)[0]
    # The mark is the first block of rows; the wordmark starts after the first empty gap.
    gaps = np.where(np.diff(rows) > 1)[0]
    bottom = rows[gaps[0]] if len(gaps) else rows[-1]
    top = rows[0]
    cols = np.where(alpha[top:bottom + 1].max(axis=0) > 20)[0]
    return logo.crop((cols[0], top, cols[-1] + 1, bottom + 1))


def gradient(size: int) -> Image.Image:
    """Diagonal violet gradient with a soft glow in the middle, matching the app's screens."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32) / (size - 1)
    t = (x + y) / 2  # 0 at top left, 1 at bottom right
    a, m, b = (np.array(c, np.float32) for c in (TOP_LEFT, MIDDLE, BOTTOM_RIGHT))
    first = t[..., None] < 0.45
    k1 = (t / 0.45)[..., None]
    k2 = ((t - 0.45) / 0.55)[..., None]
    rgb = np.where(first, a + (m - a) * k1, m + (b - m) * k2)
    # Radial glow behind the mark
    d = np.sqrt((x - 0.5) ** 2 + (y - 0.47) ** 2)
    glow = np.clip(1 - d / 0.42, 0, 1) ** 2 * 0.38
    rgb = rgb + (np.array(GLOW, np.float32) - rgb) * glow[..., None]
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')


def place(canvas: Image.Image, art: Image.Image, height_ratio: float) -> Image.Image:
    """Pastes art centred on canvas, scaled so its height is height_ratio of the canvas."""
    h = round(canvas.height * height_ratio)
    w = round(art.width * h / art.height)
    art = art.resize((w, h), Image.LANCZOS)
    # A faint shadow lifts the mark off the gradient.
    shadow = Image.new('RGBA', art.size, (14, 8, 48, 0))
    shadow.putalpha(art.split()[3].point(lambda v: v * 0.35))
    shadow = shadow.filter(ImageFilter.GaussianBlur(canvas.width * 0.012))
    x, y = (canvas.width - w) // 2, (canvas.height - h) // 2
    canvas.alpha_composite(shadow, (x, y + round(canvas.height * 0.012)))
    canvas.alpha_composite(art, (x, y))
    return canvas


def main():
    m = mark()
    bg = gradient(SIZE)

    # iOS: opaque, full bleed (iOS rounds the corners itself). Mark at 58% of the height.
    icon = place(bg.convert('RGBA'), m, 0.58)
    icon.convert('RGB').save(OUT / 'icon.png', optimize=True)

    # Android adaptive icon. The launcher may cut the front layer to a circle as small as the
    # middle 66%, so the mark stays within about 45% of the height.
    bg.save(OUT / 'android-icon-background.png', optimize=True)
    fg = place(Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0)), m, 0.45)
    fg.save(OUT / 'android-icon-foreground.png', optimize=True)

    # Android 13+ themed icon: one colour, the system tints it.
    mono = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    h = round(SIZE * 0.45)
    w = round(m.width * h / m.height)
    shape = m.resize((w, h), Image.LANCZOS).split()[3]
    white = Image.new('RGBA', (w, h), (255, 255, 255, 255))
    white.putalpha(shape)
    mono.alpha_composite(white, ((SIZE - w) // 2, (SIZE - h) // 2))
    mono.save(OUT / 'android-icon-monochrome.png', optimize=True)

    # Web tab icon: the iOS icon with rounded corners, small.
    fav = icon.resize((196, 196), Image.LANCZOS)
    radius_mask = Image.new('L', (196 * 4, 196 * 4), 0)
    ImageDraw.Draw(radius_mask).rounded_rectangle((0, 0, 196 * 4 - 1, 196 * 4 - 1), radius=196 * 4 * 0.22, fill=255)
    fav.putalpha(radius_mask.resize((196, 196), Image.LANCZOS))
    fav.resize((48, 48), Image.LANCZOS).save(OUT / 'favicon.png', optimize=True)

    for name in ('icon.png', 'android-icon-background.png', 'android-icon-foreground.png',
                 'android-icon-monochrome.png', 'favicon.png'):
        im = Image.open(OUT / name)
        print(f'{name}: {im.size[0]}x{im.size[1]} {im.mode}')


if __name__ == '__main__':
    main()
