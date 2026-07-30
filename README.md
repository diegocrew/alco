# The Grand Spirits Field Guide

A dependency-free static encyclopedia decoding **12 drink categories**: Rum, Vodka, Whisky, Wine, Gin, Cognac, Brandy, Tequila, Champagne, Beer, Absinthe and Liqueurs. Each category page carries an origin timeline, an interactive production map, and a filterable field catalog.

No build step, no framework, no package manager. Copy the folder to any static host and it runs.

## Running locally

Any static file server works:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Structure

```
index.html            12-category hub, 5x4 board grid with 8 cocktail cards
<category>.html       13 pages, one per category
css/themes.css        12 colour palettes, selected via <html data-theme="...">
css/styles.css        shared layout and components
js/catalog.js         defineCatalog() - expands compact dataset rows
js/app.js             filtering, sorting, search, card render, detail modal
js/map.js             Leaflet map, per-category pin configuration
data/*.js             one catalog per category
```

## Data format

Datasets ship as positional rows to keep 100-entry files readable:

```js
window.defineCatalog('beer', 'beer', [
  // [name, producer, country, region, style, abv, source, tags, pour, notes, modes, extras]
  ["Pilsner Urquell", "Plzeňský Prazdroj", "Czechia", "BOHEMIA CZECHIA",
   "Czech Pale Lager", 4.4, "PILSNER MALT & SAAZ",
   ["Bready Malt", "Herbal Saaz"], "Tankové, thick wet foam",
   "The 1842 original golden lager.", 0,
   { beerStyle: "LAGER", serveTemp: "6-8°C", ibu: "IBU 40" }]
]);
```

`modes` is a bitmask: `1` neat, `2` on ice, `4` cocktail. Combine by adding (`7` = all three).

`extras` carries category-specific fields:

| Category  | Extra fields                           | Filter buttons                    |
|-----------|----------------------------------------|-----------------------------------|
| Beer      | `beerStyle`, `serveTemp`, `ibu`        | Lager / Pale Ale / Stout / Wheat   |
| Wine      | `color`, `serveTemp`, `decant`         | Red / White / Decant              |
| Champagne | `champagneType`, `leesAging`, `dosage` | Blanc de Blancs / Rosé / Prestige  |
| All other | none, uses `modes`                     | Neat / On Ice / Cocktail          |

Beer deliberately has no neat/ice/cocktail axis; it is filtered by fermentation family instead.

## Adding a category

1. Add a `[data-theme="x"]` block to `css/themes.css`.
2. Add a pin config to `spiritMapConfigs` in `js/map.js`.
3. Create `data/xs.js` calling `defineCatalog('x', 'x', [...])`.
4. Copy an existing category page, update the head, nav, hero and script tags.
5. Add a hub card to `index.html` and a nav entry to every page.

## Data integrity

Every entry is a real, commercially released product. No category pads its count by
recycling a shorter list, and no two entries within a category share a name.

| Category  | Entries | Category  | Entries |
|-----------|---------|-----------|---------|
| Whisky    | 158     | Tequila   | 105     |
| Rum       | 150     | Brandy    | 104     |
| Gin       | 143     | Champagne | 101     |
| Cognac    | 115     | Beer      | 100     |
| Wine      | 110     | Absinthe  | 100     |
| Vodka     | 106     | Liqueur   | 100     |

**1,392 distinct products across 12 categories.**

Verify at any time with:

```bash
node -e '
const f={rum:"rums",vodka:"vodkas",whisky:"whiskies",wine:"wines",gin:"gins",cognac:"cognacs",
brandy:"brandies",tequila:"tequilas",champagne:"champagnes",beer:"beers",absinthe:"absinthes",liqueur:"liqueurs"};
for(const [k,v] of Object.entries(f)){
  global.window={};
  for(const m of ["./js/catalog.js","./data/"+v+".js"]) delete require.cache[require.resolve(m)];
  require("./js/catalog.js"); require("./data/"+v+".js");
  const d=window.SPIRIT_DATA, u=new Set(d.map(x=>x.name)).size;
  console.log(k.padEnd(10), d.length, u===d.length ? "OK" : "DUPLICATES");
}'
```

## Accessibility

Cards are keyboard focusable and open on Enter or Space. The detail dialog uses `role="dialog"`, traps Tab, closes on Escape, and restores focus to the originating card. All form controls have labels; every page has a skip link.

## Attribution

Map tiles: CARTO dark basemap. Mapping library: Leaflet 1.9.4, pinned with SRI hashes. Fonts: Google Fonts.

Cocktail photography in `images/cocktails/` comes from Wikimedia Commons and is used under
free licences only (CC BY, CC BY-SA, CC0 and public domain). Photographer, licence and a link
back to the source file are shown inside each recipe, which satisfies the attribution terms.
Credits are stored in [tools/cocktail-image-credits.json](tools/cocktail-image-credits.json).

To refresh or extend the set:

```bash
python3 tools/fetch-cocktail-images.py     # searches Commons, free licences only, resumable
python3 tools/process-cocktail-images.py   # crops, resizes, writes data/cocktail-images.js
```

Drinks without a photo fall back to a generated SVG of their glassware, so the grid stays
consistent. To remove a photo you dislike, delete the file and its entry in
`data/cocktail-images.js`; that drink reverts to the illustration automatically.

Educational reference only. Please drink responsibly.
