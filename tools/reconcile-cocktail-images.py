#!/usr/bin/env python3
"""Reconcile cocktail artwork.

Fills gaps in images/cocktails/ from images/intcockt/, normalises every file to the
same crop and size, then rebuilds data/cocktail-images.js from what is actually on disk.
"""
import json, os, re, shutil, subprocess, sys, unicodedata
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, "images", "cocktails")
SRC = os.path.join(ROOT, "images", "intcockt")
CREDITS = os.path.join(ROOT, "tools", "cocktail-image-credits.json")
APPLY = "--apply" in sys.argv


def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")


def cocktail_names():
    out = subprocess.check_output(
        ["node", "-e",
         'global.window={};require("./data/cocktails.js");'
         'console.log(JSON.stringify(window.COCKTAIL_DATA.map(r=>r[0])))'],
        cwd=ROOT, text=True)
    return json.loads(out)


def normalise(src_path, dest_path):
    im = Image.open(src_path)
    im.load()
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (28, 31, 40))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    w, h = im.size
    side = min(w, h)
    top = max(0, (h - side) // 2 - int(side * 0.06))
    im = im.crop(((w - side) // 2, top, (w - side) // 2 + side, top + side))
    im = im.resize((520, 520), Image.LANCZOS)
    im.save(dest_path, "JPEG", quality=78, optimize=True, progressive=True)


names = cocktail_names()
by_slug = {slug(n): n for n in names}
by_norm = {norm(n): slug(n) for n in names}

have = {os.path.splitext(f)[0] for f in os.listdir(DEST) if f.lower().endswith(".jpg")}

# Index the incoming folder by normalised stem. Absent once its contents are merged.
incoming = {}
for f in sorted(os.listdir(SRC)) if os.path.isdir(SRC) else []:
    stem, ext = os.path.splitext(f)
    if ext.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
        continue
    incoming.setdefault(norm(stem), f)

copied, unmatched_src, still_missing = [], [], []

for n in names:
    s = slug(n)
    if s in have:
        continue
    key = norm(n)
    if key in incoming:
        src = os.path.join(SRC, incoming[key])
        dst = os.path.join(DEST, s + ".jpg")
        if APPLY:
            try:
                normalise(src, dst)
            except Exception as e:
                still_missing.append((n, f"convert failed: {type(e).__name__}"))
                continue
        copied.append((n, incoming[key]))
    else:
        still_missing.append((n, "no source"))

# Incoming files that match no cocktail in the catalogue.
matched_keys = {norm(n) for n in names}
for key, f in incoming.items():
    if key not in matched_keys:
        unmatched_src.append(f)

print(f"catalogue          : {len(names)}")
print(f"already had art    : {len(have & set(by_slug))}")
print(f"copied from intcockt: {len(copied)}")
print(f"still missing      : {len(still_missing)}")
print(f"unused in intcockt : {len(unmatched_src)}")

if APPLY:
    known = json.load(open(CREDITS, encoding="utf-8")) if os.path.exists(CREDITS) else {}
    manifest = {}
    for f in sorted(os.listdir(DEST)):
        if not f.lower().endswith(".jpg"):
            continue
        s = os.path.splitext(f)[0]
        if s not in by_slug:
            continue
        entry = {"f": f}
        if s in known:
            entry.update({"a": known[s]["author"], "l": known[s]["licence"], "s": known[s]["source"]})
        manifest[s] = entry

    out = os.path.join(ROOT, "data", "cocktail-images.js")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("/* Cocktail artwork. Entries carrying a/l/s came from Wikimedia Commons under a\n"
                 "   free licence and show attribution in the recipe; the rest are supplied locally. */\n\n")
        fh.write("window.COCKTAIL_IMAGES = ")
        json.dump(manifest, fh, ensure_ascii=False, indent=1, sort_keys=True)
        fh.write(";\n")
    print(f"manifest written   : {len(manifest)} entries")

print("\n--- STILL MISSING ---")
for n, why in still_missing:
    print(f"  {n}   ({why})")

if unmatched_src:
    print("\n--- IN intcockt BUT NOT IN CATALOGUE ---")
    for f in sorted(unmatched_src):
        print(f"  {f}")
