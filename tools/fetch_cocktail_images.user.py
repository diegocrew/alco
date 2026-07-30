#!/usr/bin/env python3
"""
fetch_cocktail_images.py

Downloads one freely licensed image per cocktail name from Openverse.
Saves images and a CSV log of source, license, and attribution details.

Openverse does not require an API key for anonymous requests.

USAGE:
    pip install requests
    python fetch_cocktail_images.py

OUTPUT (written directly to OUTPUT_DIR below - set it to your target folder):
    <Cocktail Name>.jpg   - one image per cocktail (where found)
    attribution.csv       - source, license, author, page url per image
    not_found.txt         - cocktails no source returned a result for
"""

import csv
import os
import re
import time
import requests

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

REQUEST_TIMEOUT = 15
SLEEP_BETWEEN_REQUESTS = 0.5  # be polite to free APIs

HEADERS = {"User-Agent": "CocktailWikiImageFetcher/1.0 (personal wiki project)"}

COCKTAILS = [
    "Old Fashioned","Manhattan","Sazerac","Whiskey Sour","Mint Julep","Boulevardier",
    "Rob Roy","Vieux Carré","Paper Plane","Penicillin","Gold Rush","New York Sour",
    "Blood and Sand","Rusty Nail","Irish Coffee","Hot Toddy","Brooklyn","Bobby Burns",
    "Algonquin","Ward Eight","Dry Martini","Negroni","Tom Collins","Aviation","Last Word",
    "Bee's Knees","French 75","Clover Club","Ramos Gin Fizz","Corpse Reviver No. 2",
    "White Lady","Gimlet","Southside","Bramble","Vesper","Singapore Sling","Martinez",
    "Hanky Panky","Gin Basil Smash","Army & Navy","Pegu Club","Twentieth Century","Alaska",
    "Bijou","Gin Fizz","Gin & Tonic","Daiquiri","Mojito","Mai Tai","Piña Colada",
    "Dark 'n' Stormy","Planter's Punch","Hemingway Daiquiri","Jungle Bird","Zombie",
    "Painkiller","El Presidente","Cuba Libre","Ti' Punch","Corn 'n' Oil",
    "Queen's Park Swizzle","Airmail","Hurricane","Fog Cutter","Caipirinha",
    "Nuclear Daiquiri","Moscow Mule","Espresso Martini","Cosmopolitan","Bloody Mary",
    "White Russian","Black Russian","Vodka Martini","Sea Breeze","Screwdriver",
    "Lemon Drop","Harvey Wallbanger","Salty Dog","Margarita","Tommy's Margarita",
    "Paloma","Tequila Sunrise","Naked and Famous","Oaxaca Old Fashioned","Mezcal Negroni",
    "El Diablo","Batanga","Rosita","Sidecar","Brandy Alexander","Between the Sheets",
    "Japanese Cocktail","Stinger","Champs-Élysées","Brandy Crusta","Pisco Sour",
    "Corpse Reviver No. 1","Aperol Spritz","Americano","Negroni Sbagliato","Bellini",
    "Mimosa","Kir Royale","Kir","Death in the Afternoon","Sangría","Sherry Cobbler",
    "Adonis","Bamboo","Black Velvet","Michelada","Shandy","Pimm's Cup","Amaretto Sour",
    "Grasshopper","Chartreuse Swizzle","Absinthe Drip","Sgroppino","Golden Cadillac",
    "Brave Bull","Godfather","Bocce Ball","Toasted Almond","Old Cuban","Tommy's Mule",
    "Division Bell","Bitter Giuseppe","Bensonhurst","Red Hook","Greenpoint",
    "Trinidad Sour","Jasmine","Tuxedo No. 2","Chrysanthemum","Suffering Bastard",
    "Hotel Nacional","Saturn","Scofflaw","Remember the Maine","Hemingway Special",
    "Bee Sting","Bramble Royale","Garibaldi","Cardinale","Boothby","Seelbach",
    "Diamondback","Fitzgerald","Siesta","Kingston Negroni","Air Mail Fizz",
    "Chelsea Sidecar","Rome with a View","Yellow Bird","Mary Pickford","Bijou Royale",
    "Cynar Julep","Coffee Cocktail","Widow's Kiss","Tipperary","Improved Whiskey Cocktail",
    "Fanciulli","Toronto","La Louisiane","Bourbon Renewal","Jack Rose",
    "Applejack Rabbit","Bitter Mai Tai","Ford Cocktail","Turf Club","Income Tax",
    "Bronx","Monkey Gland","Casino","Blood Orange Margarita","Mezcal Paloma",
    "Chicago Fizz","Bee's Kiss","Pink Gin","Vermouth Cassis","Spritz Bianco",
    "Pornstar Martini","Breakfast Martini","Tommy Collins","Rhubarb Collins",
    "Vodka Espresso","Fernet and Coke","Sherry Flip","Milano-Torino","Hugo",
    "Boulevard Sour","Tiki Tequila Sour",
]


def slugify(name: str) -> str:
    """Turn a cocktail name into a filesystem-safe filename, keeping it
    readable (e.g. 'Vieux Carre' -> 'Vieux Carre')."""
    s = name.replace("'", "")
    s = re.sub(r'[<>:"/\\|?*]', "", s)  # strip Windows-illegal chars
    s = re.sub(r"\s+", " ", s).strip()
    return s


def save_image(url: str, path: str) -> bool:
    try:
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        if r.status_code == 200 and len(r.content) > 2000:
            with open(path, "wb") as f:
                f.write(r.content)
            return True
    except requests.RequestException:
        pass
    return False


# ── Source lookup. Returns a dict or None: ──
# {image_url, source, license, author, page_url}

def try_openverse(query):
    try:
        r = requests.get(
            "https://api.openverse.org/v1/images/",
            params={"q": f"{query} cocktail", "license_type": "all-cc",
                    "page_size": 5},
            headers=HEADERS, timeout=REQUEST_TIMEOUT,
        )
        results = r.json().get("results", [])
        if results:
            item = results[0]
            return {
                "image_url": item.get("url"),
                "source": "Openverse",
                "license": f"{item.get('license', '').upper()} {item.get('license_version', '')}".strip(),
                "author": item.get("creator", "Unknown"),
                "page_url": item.get("foreign_landing_url", item.get("url")),
            }
    except (requests.RequestException, ValueError, KeyError):
        pass
    return None


SOURCE_CHAIN = [try_openverse]


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    log_rows = []
    not_found = []

    for i, name in enumerate(COCKTAILS, 1):
        slug = slugify(name)
        print(f"[{i}/{len(COCKTAILS)}] {name} ...", end=" ")
        found = None
        for source_fn in SOURCE_CHAIN:
            result = source_fn(name)
            if result and result.get("image_url"):
                found = result
                break
            time.sleep(SLEEP_BETWEEN_REQUESTS)

        if found:
            ext = ".jpg"
            path = os.path.join(OUTPUT_DIR, f"{slug}{ext}")
            if save_image(found["image_url"], path):
                print(f"OK ({found['source']})")
                log_rows.append({
                    "cocktail": name, "filename": f"{slug}{ext}",
                    "source": found["source"], "license": found["license"],
                    "author": found["author"], "page_url": found["page_url"],
                })
            else:
                print("download failed")
                not_found.append(name)
        else:
            print("not found")
            not_found.append(name)

        time.sleep(SLEEP_BETWEEN_REQUESTS)

    # Write attribution log
    with open(os.path.join(OUTPUT_DIR, "attribution.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["cocktail", "filename", "source", "license", "author", "page_url"])
        writer.writeheader()
        writer.writerows(log_rows)

    if not_found:
        with open(os.path.join(OUTPUT_DIR, "not_found.txt"), "w", encoding="utf-8") as f:
            f.write("\n".join(not_found))

    print(f"\nDone: {len(log_rows)}/{len(COCKTAILS)} images found.")
    print(f"Images saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
