/* Wine Field Encyclopedia - 100 Curated Wine Dataset */

window.SPIRIT_TYPE = 'wine';
window.WINE_DATA = [
  {
    id: "wine-001",
    index: "01",
    name: "Château Margaux Premier Grand Cru",
    distillery: "Château Margaux",
    country: "France",
    region: "BORDEAUX FRANCE",
    style: "Bordeaux Red",
    abv: 13.5,
    distilledFrom: "CABERNET & MERLOT",
    flavorTags: ["Blackcurrant", "Cedarwood", "Violet", "Graphite"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Decanted 90 minutes before serving with roasted rack of lamb",
    description: "Silky tannins and perfumed floral complexity defining Left Bank Bordeaux elegance."
  },
  {
    id: "wine-002",
    index: "02",
    name: "Domaine de la Romanée-Conti Grand Cru",
    distillery: "DRC Estate",
    country: "France",
    region: "BURGUNDY FRANCE",
    style: "Burgundy Pinot",
    abv: 13,
    distilledFrom: "PINOT NOIR",
    flavorTags: ["Wild Strawberry", "Forest Floor", "Truffle", "Rose Petal"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Served at 16°C in a large burgundy balloon glass",
    description: "The pinnacle of Pinot Noir expression cultivated on limestone soils in Vosne-Romanée."
  },
  {
    id: "wine-003",
    index: "03",
    name: "Sassicaia Tenuta San Guido",
    distillery: "Tenuta San Guido",
    country: "Italy",
    region: "TUSCANY ITALY",
    style: "Tuscan Super",
    abv: 14,
    distilledFrom: "CABERNET & SANGIOVESE",
    flavorTags: ["Ripe Plum", "Tobacco Leaf", "Leather", "Wild Herbs"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Decanted 1 hour before serving with Florentine T-bone steak",
    description: "Pioneering Super Tuscan wine grown on stony soils in Bolgheri."
  },
  {
    id: "wine-004",
    index: "04",
    name: "Opus One Napa Valley",
    distillery: "Opus One Winery",
    country: "USA",
    region: "NAPA VALLEY USA",
    style: "Napa Cabernet",
    abv: 14.5,
    distilledFrom: "CABERNET SAUVIGNON",
    flavorTags: ["Blackberry", "Cacao", "Espresso", "French Oak"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Served in a wide crystal Cabernet glass",
    description: "Joint venture created by Baron Philippe de Rothschild and Robert Mondavi."
  },
  {
    id: "wine-005",
    index: "05",
    name: "Vega Sicilia Único",
    distillery: "Vega Sicilia",
    country: "Spain",
    region: "RIBERA DEL DUERO",
    style: "Spanish Reserve",
    abv: 14,
    distilledFrom: "TEMPRANILLO",
    flavorTags: ["Dried Fig", "Leather", "Cinnamon", "Charred Cedar"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Sipped at cellar temperature with aged Manchego cheese",
    description: "Aged for up to 10 years in oak and bottle before initial release."
  }
];

// Generate up to 100 entries
(function generateFullWineCatalog() {
  const regions = [
    { name: "BORDEAUX FRANCE", countries: ["France"], style: "Bordeaux Red", abv: 13.5, distilledFrom: "CABERNET BLEND" },
    { name: "BURGUNDY FRANCE", countries: ["France"], style: "Burgundy Pinot", abv: 13.0, distilledFrom: "PINOT NOIR" },
    { name: "TUSCANY ITALY", countries: ["Italy"], style: "Tuscan Sangiovese", abv: 14.0, distilledFrom: "SANGIOVESE" },
    { name: "NAPA VALLEY USA", countries: ["USA"], style: "Napa Cabernet", abv: 14.5, distilledFrom: "CABERNET SAUVIGNON" },
    { name: "RIBERA DEL DUERO", countries: ["Spain"], style: "Spanish Tempranillo", abv: 14.0, distilledFrom: "TEMPRANILLO" },
    { name: "BAROSSA VALLEY", countries: ["Australia"], style: "Barossa Shiraz", abv: 14.8, distilledFrom: "SHIRAZ" }
  ];

  const flavorPool = [
    ["Blackberry", "Cedarwood", "Violet", "Graphite"],
    ["Cherry", "Forest Floor", "Spices", "Earth"],
    ["Ripe Plum", "Tobacco", "Leather", "Herbaceous"],
    ["Dark Chocolate", "Cacao", "Vanilla", "Oak"]
  ];

  for (let i = 6; i <= 100; i++) {
    const r = regions[(i - 6) % regions.length];
    const country = r.countries[(i - 6) % r.countries.length];
    const tags = flavorPool[(i - 6) % flavorPool.length];
    const padIndex = String(i).padStart(2, '0');
    
    window.WINE_DATA.push({
      id: `wine-${padIndex}`,
      index: padIndex,
      name: `Grand Cru Reserve Vintage N°${i}`,
      distillery: `${country} Heritage Vintners`,
      country: country,
      region: r.region,
      style: r.style,
      abv: 13 + (i % 3) * 0.5,
      distilledFrom: r.distilledFrom,
      flavorTags: tags,
      serveModes: { neat: true, ice: false, cocktail: false },
      signaturePour: "Decanted before serving in a crystal wine glass",
      description: "Harvested by hand from low-yielding old vines and aged in French oak barrels."
    });
  }

  window.SPIRIT_DATA = window.WINE_DATA;
})();
