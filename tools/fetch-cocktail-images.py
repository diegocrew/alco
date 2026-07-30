#!/usr/bin/env python3
"""Fetch freely licensed cocktail photography from Wikimedia Commons.

Only accepts files that are (a) under a free licence, (b) whose title matches the
cocktail name, and (c) that sit in a cocktail/drink category - so a search for
"Manhattan" cannot return a photo of the borough.
"""
import json, os, re, time, unicodedata, urllib.parse, urllib.request

TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS_DIR)
OUT_DIR = os.path.join(ROOT, "images", "cocktails")
UA = "AlcoFieldGuide/1.0 (static site build; contact: local)"
API = "https://commons.wikimedia.org/w/api.php"

FREE = re.compile(r"^(cc[- ]?by([- ]sa)?|cc0|public domain|pd|no restrictions)", re.I)
BLOCKED = re.compile(r"fair use|non-?free|copyright", re.I)
DRINKY = re.compile(r"cocktail|drink|beverage|liqueur|highball|glassware", re.I)
NOT_A_DRINK = re.compile(
    r"dress|fashion|costume|gown|insect|flower|aircraft|building|restaurant|resort", re.I)


def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")


def get(params, tries=4):
    url = API + "?" + urllib.parse.urlencode(params)
    last = None
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except Exception as e:
            last = e
            time.sleep(1.5 * (attempt + 1))
    raise last


def strip_html(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s or "")).strip()


def find(name):
    d = get({
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": f'"{name}" cocktail', "gsrnamespace": "6", "gsrlimit": "24",
        "prop": "imageinfo|categories", "cllimit": "60",
        "iiprop": "url|extmetadata", "iiurlwidth": "700",
    })

    pages = (d.get("query") or {}).get("pages") or {}
    target = norm(name)

    for p in sorted(pages.values(), key=lambda x: x.get("index", 99)):
        title = p.get("title", "")
        if not norm(title).startswith("file") and "File:" not in title:
            continue
        body = norm(title.split(":", 1)[-1])
        if target not in body:
            continue
        if NOT_A_DRINK.search(title):
            continue

        ii = (p.get("imageinfo") or [{}])[0]
        em = ii.get("extmetadata") or {}
        lic = strip_html(em.get("LicenseShortName", {}).get("value"))
        if not lic or BLOCKED.search(lic) or not FREE.match(lic):
            continue

        cats = " ".join(c.get("title", "") for c in (p.get("categories") or []))
        if not DRINKY.search(cats) and "cocktail" not in title.lower():
            continue

        url = ii.get("thumburl") or ii.get("url")
        if not url:
            continue

        return {
            "title": title, "url": url, "licence": lic,
            "author": strip_html(em.get("Artist", {}).get("value")) or "Unknown",
            "source": ii.get("descriptionurl") or "",
        }
    return None


def download(url, dest, tries=3):
    last = None
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            with open(dest, "wb") as f:
                f.write(data)
            return len(data)
        except Exception as e:
            last = e
            time.sleep(1.5 * (attempt + 1))
    raise last


def main():
    data_path = os.path.join(ROOT, "data", "cocktails.js")
    data = open(data_path, encoding="utf-8").read()
    names = [json.loads(match.group(1)) for match in re.finditer(
        r'^\s*\[\s*("(?:\\.|[^"\\])*")\s*,', data, re.M)]
    os.makedirs(OUT_DIR, exist_ok=True)

    cred_path = os.path.join(TOOLS_DIR, "cocktail-image-credits.json")
    credits = {}
    if os.path.exists(cred_path):
        credits = json.load(open(cred_path, encoding="utf-8"))

    misses = []
    for i, name in enumerate(names, 1):
        s = slug(name)
        dest_raw = os.path.join(OUT_DIR, s + ".raw")
        dest_jpg = os.path.join(OUT_DIR, s + ".jpg")
        if s in credits and (os.path.exists(dest_raw) or os.path.exists(dest_jpg)):
            continue

        try:
            info = find(name)
        except Exception as e:
            misses.append(name)
            print(f"[{i:3}/{len(names)}] ERR   {name}: {type(e).__name__}", flush=True)
            time.sleep(1.0)
            continue

        if not info:
            misses.append(name)
            print(f"[{i:3}/{len(names)}] miss  {name}", flush=True)
            time.sleep(0.8)
            continue

        try:
            download(info["url"], dest_raw)
        except Exception as e:
            misses.append(name)
            print(f"[{i:3}/{len(names)}] dlerr {name}: {type(e).__name__}", flush=True)
            time.sleep(1.0)
            continue

        credits[s] = {"name": name, "author": info["author"][:160],
                      "licence": info["licence"], "source": info["source"]}
        json.dump(credits, open(cred_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"[{i:3}/{len(names)}] ok    {name}", flush=True)
        time.sleep(0.8)

    print(f"\nHAVE {len(credits)}/{len(names)}   still missing {len(misses)}")
    if misses:
        print("missing:", ", ".join(misses))


if __name__ == "__main__":
    main()
