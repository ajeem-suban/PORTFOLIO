"""Turns your original banner images into the web-sized files the site uses.

HOW TO USE (Windows CMD, from the repo root):
  1. Copy your 8 original banner images (1254x1254 PNG/JPG/WebP) into  banners-src\
     and name them exactly:
        tamil-ai   aires   secrain   cullinan-ai   titan   eye-care-tool   vch-agent   news-bot
     (any of .png .jpg .jpeg .webp works, e.g. banners-src\aires.png)
  2. Run:   python scripts\make-banners.py
     (needs Pillow:  pip install pillow)
  3. It writes public\banners\<name>.webp (720 px) and <name>-360.webp (360 px).
     The pages already point at those files, so just rebuild / push.

You can re-run it any time; it only touches banners that exist in banners-src.
Banners stay in full colour. Non-square images are centre-cropped to a square.
"""
from pathlib import Path
from PIL import Image

NAMES = ["tamil-ai", "aires", "secrain", "cullinan-ai", "titan", "eye-care-tool", "vch-agent", "news-bot", "rogers"]
SRC = Path(__file__).resolve().parent.parent / "banners-src"
OUT = Path(__file__).resolve().parent.parent / "public" / "banners"
OUT.mkdir(parents=True, exist_ok=True)

done = 0
for name in NAMES:
    src = next((p for ext in (".png", ".jpg", ".jpeg", ".webp") for p in [SRC / (name + ext)] if p.exists()), None)
    if not src:
        print(f"skip   {name}: no file in banners-src")
        continue
    im = Image.open(src).convert("RGB")
    w, h = im.size
    side = min(w, h)
    im = im.crop(((w - side) // 2, (h - side) // 2, (w - side) // 2 + side, (h - side) // 2 + side))
    for size, suffix in ((720, ""), (360, "-360")):
        out = OUT / f"{name}{suffix}.webp"
        im.resize((size, size), Image.LANCZOS).save(out, "WEBP", quality=82, method=6)
        print(f"wrote  {out.name}  {out.stat().st_size // 1024} KB")
    done += 1
print(f"\n{done} of {len(NAMES)} banners processed.")
