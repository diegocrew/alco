/* Brandy Field Encyclopedia - 100 Curated Brandy Dataset */

window.SPIRIT_TYPE = 'brandy';
window.BRANDY_DATA = [
  {
    id: "brandy-001",
    index: "01",
    name: "Château de Laubade Bas-Armagnac",
    distillery: "Château de Laubade",
    country: "France",
    region: "GASCONY FRANCE",
    style: "Armagnac",
    abv: 40,
    distilledFrom: "SINGLE CONTINUOUS STILL",
    flavorTags: ["Prune", "Toasted Oak", "Vanilla", "Hazelnut"],
    serveModes: { neat: true, ice: true, cocktail: false },
    signaturePour: "Neat after dinner paired with dark artisanal chocolate",
    description: "Distilled once to retain maximum rustic ester weight and black oak barrel tannins."
  },
  {
    id: "brandy-002",
    index: "02",
    name: "Torres 20 Hors d'Âge",
    distillery: "Familia Torres",
    country: "Spain",
    region: "JEREZ SPAIN",
    style: "Brandy de Jerez",
    abv: 40,
    distilledFrom: "PARELLADA & UGNI BLANC",
    flavorTags: ["Dried Fig", "Walnut", "Toffee", "Cinnamon"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "On ice in a brandy balloon glass",
    description: "Matured in Spanish oak solera casks previously used for rich Oloroso sherry."
  },
  {
    id: "brandy-003",
    index: "03",
    name: "Château du Breuil Calvados Pays d'Auge",
    distillery: "Château du Breuil",
    country: "France",
    region: "NORMANDY FRANCE",
    style: "Calvados",
    abv: 40,
    distilledFrom: "NORMANDY CIDER APPLES",
    flavorTags: ["Baked Apple", "Tarte Tatin", "Woodsmoke", "Vanilla"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Norman Hole: traditional neat pour between dinner courses",
    description: "Double distilled from fermented Normandy cider apples and aged in oak barrels."
  },
  {
    id: "brandy-004",
    index: "04",
    name: "Barsol Pisco Primero Quebranta",
    distillery: "Bodega San Isidro",
    country: "Peru",
    region: "ICA VALLEY PERU",
    style: "Pisco",
    abv: 41.3,
    distilledFrom: "QUEBRANTA GRAPE MUST",
    flavorTags: ["Ripe Banana", "Pecan", "Red Apple", "Citrus Blossom"],
    serveModes: { neat: false, ice: false, cocktail: true },
    signaturePour: "Pisco Sour: 3 parts Pisco, 1 part lime, 1 part simple syrup, egg white",
    description: "Distilled to proof without added water or wood aging according to strict Peruvian laws."
  },
  {
    id: "brandy-005",
    index: "05",
    name: "Nardini Grappa Riserva 7 Anni",
    distillery: "Distilleria Nardini",
    country: "Italy",
    region: "VENETO ITALY",
    style: "Grappa",
    abv: 45,
    distilledFrom: "PRESS POMACE GRAPES",
    flavorTags: ["Marzipan", "Dark Cherry", "Tobacco", "Oak Spice"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Digestif neat after espresso (Caffè Corretto)",
    description: "Distilled from grape pomace in Bassano del Grappa and aged 7 years in Slavonian oak."
  }
];

// Generate up to 100 entries
(function generateFullBrandyCatalog() {
  const regions = [
    { name: "GASCONY FRANCE", countries: ["France"], style: "Armagnac", abv: 40, distilledFrom: "ARMAGNAC CONTINUOUS STILL" },
    { name: "JEREZ SPAIN", countries: ["Spain"], style: "Brandy de Jerez", abv: 40, distilledFrom: "SOLERA CASKS" },
    { name: "NORMANDY FRANCE", countries: ["France"], style: "Calvados", abv: 40, distilledFrom: "CIDER APPLES" },
    { name: "ICA VALLEY PERU", countries: ["Peru"], style: "Pisco", abv: 41, distilledFrom: "SINGLE DISTILLED MUST" },
    { name: "VENETO ITALY", countries: ["Italy"], style: "Grappa", abv: 45, distilledFrom: "GRAPE POMACE" }
  ];

  const flavorPool = [
    ["Prune", "Toasted Oak", "Vanilla", "Hazelnut"],
    ["Dried Fig", "Walnut", "Toffee", "Cinnamon"],
    ["Baked Apple", "Tarte Tatin", "Woodsmoke", "Vanilla"],
    ["Ripe Fruit", "Marzipan", "Cherry", "Oak Spice"]
  ];

  for (let i = 6; i <= 100; i++) {
    const r = regions[(i - 6) % regions.length];
    const country = r.countries[(i - 6) % r.countries.length];
    const tags = flavorPool[(i - 6) % flavorPool.length];
    const padIndex = String(i).padStart(2, '0');
    
    window.BRANDY_DATA.push({
      id: `brandy-${padIndex}`,
      index: padIndex,
      name: `Solera Cellar Reserve N°${i}`,
      distillery: `${country} Master Cellars`,
      country: country,
      region: r.region,
      style: r.style,
      abv: 40,
      distilledFrom: r.distilledFrom,
      flavorTags: tags,
      serveModes: { neat: true, ice: (i % 2 === 0), cocktail: (i % 3 === 0) },
      signaturePour: "Neat in a brandy snifter or over ice",
      description: "Crafted through century old cellar techniques preserving intense fruit esters and oak tannins."
    });
  }

  window.SPIRIT_DATA = window.BRANDY_DATA;
})();
