#!/usr/bin/env python3
"""Normalise downloaded cocktail photos and emit the JS manifest."""
import glob, json, os
from PIL import Image

TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS_DIR)
IMG = os.path.join(ROOT, "images", "cocktails")

credits = json.load(open(os.path.join(TOOLS_DIR, "cocktail-image-credits.json"), encoding="utf-8"))
manifest, before, after, dropped = {}, 0, 0, []

for slug, meta in sorted(credits.items()):
    raw = os.path.join(IMG, slug + ".raw")
    dest = os.path.join(IMG, slug + ".jpg")
    if not os.path.exists(raw):
        if os.path.exists(dest):
            manifest[slug] = {"f": slug + ".jpg", "a": meta["author"],
                              "l": meta["licence"], "s": meta["source"]}
        else:
            dropped.append(slug)
        continue
    try:
        im = Image.open(raw)
        im.load()
    except Exception:
        dropped.append(slug)
        os.remove(raw)
        continue

    # Flatten transparency onto the card colour so PNG cut-outs do not show white.
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (28, 31, 40))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")

    # Square-ish centre crop keeps the glass in frame when used as a cover background.
    w, h = im.size
    side = min(w, h)
    im = im.crop(((w - side) // 2, max(0, (h - side) // 2 - int(side * 0.06)),
                  (w - side) // 2 + side, max(0, (h - side) // 2 - int(side * 0.06)) + side))
    im = im.resize((520, 520), Image.LANCZOS)

    before += os.path.getsize(raw)
    im.save(dest, "JPEG", quality=78, optimize=True, progressive=True)
    after += os.path.getsize(dest)
    os.remove(raw)

    manifest[slug] = {"f": slug + ".jpg", "a": meta["author"],
                      "l": meta["licence"], "s": meta["source"]}

for stray in glob.glob(os.path.join(IMG, "*.raw")):
    os.remove(stray)

out = os.path.join(ROOT, "data", "cocktail-images.js")
with open(out, "w", encoding="utf-8") as f:
    f.write("/* Cocktail photography from Wikimedia Commons.\n"
            "   Every file is under a free licence; details are retained for requests. */\n\n")
    f.write("window.COCKTAIL_IMAGES = ")
    json.dump(manifest, f, ensure_ascii=False, indent=1, sort_keys=True)
    f.write(";\n")

print(f"images: {len(manifest)}   {before/1048576:.2f} MB -> {after/1048576:.2f} MB")
if dropped:
    print("dropped (unreadable):", ", ".join(dropped))
