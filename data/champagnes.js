/* Champagne Field Encyclopedia - 100 Curated Champagne Dataset */

window.SPIRIT_TYPE = 'champagne';
window.CHAMPAGNE_DATA = [
  {
    id: "champagne-001",
    index: "01",
    name: "Dom Pérignon Vintage",
    distillery: "Moët & Chandon",
    country: "France",
    region: "ÉPERNAY FRANCE",
    style: "Prestige Vintage",
    abv: 12.5,
    distilledFrom: "CHARDONNAY & PINOT NOIR",
    flavorTags: ["Brioche", "Toasted Hazelnut", "White Peach", "Smoky Mineral"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Served at 8°C-10°C in a white wine tulip glass to preserve aroma",
    description: "Harvested exclusively in outstanding single vintage years, matured deep in underground chalk cellars."
  },
  {
    id: "champagne-002",
    index: "02",
    name: "Krug Grande Cuvée 170th Edition",
    distillery: "House of Krug",
    country: "France",
    region: "REIMS FRANCE",
    style: "Prestige Cuvée",
    abv: 12.5,
    distilledFrom: "140 RESERVA WINES",
    flavorTags: ["Honeyed Toast", "Dried Citrus", "Gingerbread", "Nuts"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Poured gently in a wide bowl champagne glass",
    description: "Blend of over 120 wines from more than 10 different years aging up to 7 years in cellars."
  },
  {
    id: "champagne-003",
    index: "03",
    name: "Louis Roederer Cristal",
    distillery: "Louis Roederer",
    country: "France",
    region: "REIMS FRANCE",
    style: "Prestige Vintage",
    abv: 12,
    distilledFrom: "GRAND CRU CHARDONNAY",
    flavorTags: ["Candied Citrus", "Yellow Plum", "Chalky Mineral", "White Flowers"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Sipped chilled at special celebrations",
    description: "Created in 1876 for Tsar Alexander II of Russia, packaged in flat-bottomed crystal glass."
  },
  {
    id: "champagne-004",
    index: "04",
    name: "Ru衝突 Blanc de Blancs",
    distillery: "Maison Ruinart",
    country: "France",
    region: "REIMS FRANCE",
    style: "Blanc de Blancs",
    abv: 12.5,
    distilledFrom: "100% CHARDONNAY",
    flavorTags: ["Nectarine", "Citrus Zest", "White Jasmine", "Flint"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Served chilled as an elegant aperitif",
    description: "Iconic 100% Chardonnay champagne from the oldest established champagne house (1729)."
  },
  {
    id: "champagne-005",
    index: "05",
    name: "Bollinger La Grande Année",
    distillery: "Champagne Bollinger",
    country: "France",
    region: "AŸ FRANCE",
    style: "Blanc de Noirs Vintage",
    abv: 12,
    distilledFrom: "OAK BARREL FERMENTED",
    flavorTags: ["Toasted Brioche", "Quince", "Baked Apple", "Spiced Oak"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Served at cellar temperature with seared scallops",
    description: "Fermented entirely in aged oak barrels and riddling done completely by hand."
  }
];

// Generate up to 100 entries
(function generateFullChampagneCatalog() {
  const regions = [
    { name: "REIMS FRANCE", countries: ["France"], style: "Brut Champagne", abv: 12.5, distilledFrom: "CHARDONNAY & PINOT" },
    { name: "ÉPERNAY FRANCE", countries: ["France"], style: "Blanc de Blancs", abv: 12.5, distilledFrom: "100% CHARDONNAY" },
    { name: "AŸ FRANCE", countries: ["France"], style: "Blanc de Noirs", abv: 12.0, distilledFrom: "PINOT NOIR" },
    { name: "VALDOBBIADENE ITALY", countries: ["Italy"], style: "Prosecco Superiore", abv: 11.5, distilledFrom: "GLERA GRAPES" },
    { name: "SAN SADURNÍ SPAIN", countries: ["Spain"], style: "Cava Reserva", abv: 12.0, distilledFrom: "MACABEO & XAREL-LO" }
  ];

  const flavorPool = [
    ["Brioche", "Toasted Hazelnut", "White Peach", "Smoky Mineral"],
    ["Honeyed Toast", "Dried Citrus", "Gingerbread", "Nuts"],
    ["Nectarine", "Citrus Zest", "White Jasmine", "Flint"],
    ["Toasted Brioche", "Quince", "Baked Apple", "Spiced Oak"]
  ];

  for (let i = 6; i <= 100; i++) {
    const r = regions[(i - 6) % regions.length];
    const country = r.countries[(i - 6) % r.countries.length];
    const tags = flavorPool[(i - 6) % flavorPool.length];
    const padIndex = String(i).padStart(2, '0');
    
    window.CHAMPAGNE_DATA.push({
      id: `champagne-${padIndex}`,
      index: padIndex,
      name: `Cuvée Effervescente N°${i}`,
      distillery: `${country} Master House`,
      country: country,
      region: r.region,
      style: r.style,
      abv: 12,
      distilledFrom: r.distilledFrom,
      flavorTags: tags,
      serveModes: { neat: true, ice: false, cocktail: (i % 4 === 0) },
      signaturePour: "Served chilled in a flute or tulip glass",
      description: "Crafted via Méthode Traditionnelle with secondary bottle fermentation and extended chalk cellar lees aging."
    });
  }

  window.SPIRIT_DATA = window.CHAMPAGNE_DATA;
})();
