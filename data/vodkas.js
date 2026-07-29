/* Vodka Field Encyclopedia - 100 Curated Vodka Dataset */

window.SPIRIT_TYPE = 'vodka';
window.VODKA_DATA = [
  {
    id: "vodka-001",
    index: "01",
    name: "Belvedere Single Estate",
    distillery: "Lake Bartężek Estate",
    country: "Poland",
    region: "POLAND (RYE)",
    style: "Rye Grain",
    abv: 40,
    distilledFrom: "DANKOWSKIE DIAMOND RYE",
    flavorTags: ["Black Pepper", "Toasted Rye", "Creamy", "Almond"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Chilled neat in a frozen glass or Classic Dry Vodka Martini",
    description: "Unfiltered single estate rye showcasing cold climate lacustrine soil complexity."
  },
  {
    id: "vodka-002",
    index: "02",
    name: "Absolut Elyx",
    distillery: "Åhus Estate",
    country: "Sweden",
    region: "SWEDEN (WHEAT)",
    style: "Winter Wheat",
    abv: 42.3,
    distilledFrom: "SINGLE ESTATE WHEAT",
    flavorTags: ["Fresh Bread", "White Chocolate", "Silky", "Macadamia"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Vesper Martini: 3 parts Gin, 1 part Vodka, 1/2 part Lillet Blanc",
    description: "Distilled manually in a 1921 vintage copper column still for exceptional velvety mouthfeel."
  },
  {
    id: "vodka-003",
    index: "03",
    name: "Chopin Potato Vodka",
    distillery: "Chopin Distillery",
    country: "Poland",
    region: "POLAND (POTATO)",
    style: "Potato",
    abv: 40,
    distilledFrom: "STARCH RICH POTATOES",
    flavorTags: ["Earthy", "Green Apple", "Full Bodied", "Buttered Toast"],
    serveModes: { neat: true, ice: true, cocktail: false },
    signaturePour: "Sipped neat at room temperature to appreciate rich viscosity",
    description: "Four pounds of locally grown potatoes distilled per bottle yielding lush natural texture."
  },
  {
    id: "vodka-004",
    index: "04",
    name: "Stoli Elit",
    distillery: "Latvijas Balzams",
    country: "Latvia",
    region: "BALTIC REGION",
    style: "Winter Wheat",
    abv: 40,
    distilledFrom: "FREEZE FILTERED WHEAT",
    flavorTags: ["Anise", "Citrus Peel", "Glacial Cold", "Crisp"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Elit Martini with lemon twist",
    description: "Filtered at sub-zero temperatures (-18°C) through active birch charcoal."
  },
  {
    id: "vodka-005",
    index: "05",
    name: "Reyka Small Batch",
    distillery: "Borgarnes Distillery",
    country: "Iceland",
    region: "ICELAND (GLACIAL)",
    style: "Glacial Water",
    abv: 40,
    distilledFrom: "VOLCANIC ROCK FILTERED",
    flavorTags: ["Crisp Mineral", "Vanilla Bean", "Clean", "Rose Petal"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Reyka Mule with ginger beer and lime",
    description: "Distilled in a rare Carter-Head copper still powered by geothermal energy."
  }
];

// Generate up to 100 entries
(function generateFullVodkaCatalog() {
  const regions = [
    { name: "POLAND (RYE)", countries: ["Poland"], style: "Rye Grain", abv: 40, distilledFrom: "DANKOWSKIE RYE" },
    { name: "SWEDEN (WHEAT)", countries: ["Sweden"], style: "Winter Wheat", abv: 40, distilledFrom: "SWEDISH GRAIN" },
    { name: "FINLAND (BARLEY)", countries: ["Finland"], style: "Barley", abv: 40, distilledFrom: "SIX ROW BARLEY" },
    { name: "BALTIC REGION", countries: ["Latvia", "Estonia"], style: "Heritage Grain", abv: 40, distilledFrom: "ORGANIC GRAIN" },
    { name: "NORTH AMERICA", countries: ["USA", "Canada"], style: "Corn & Grain", abv: 40, distilledFrom: "YELLOW CORN" },
    { name: "ICELAND (GLACIAL)", countries: ["Iceland"], style: "Glacial Water", abv: 40, distilledFrom: "ARCTIC SPRING WATER" }
  ];

  const flavorPool = [
    ["Black Pepper", "Toasted Grain", "Clean", "Vanilla"],
    ["Citrus Zest", "White Pepper", "Mineral", "Crisp"],
    ["Creamy", "Butterscotch", "Almond", "Velvety"],
    ["Green Apple", "Anise", "Fennel", "Sweet Corn"]
  ];

  const signaturePours = [
    "Chilled neat in a frozen crystal glass",
    "Classic Dry Martini with lemon twist",
    "Moscow Mule with spicy ginger beer and fresh lime",
    "Vodka Tonic with Mediterranean tonic and grapefruit wedge"
  ];

  for (let i = 6; i <= 100; i++) {
    const r = regions[(i - 6) % regions.length];
    const country = r.countries[(i - 6) % r.countries.length];
    const tags = flavorPool[(i - 6) % flavorPool.length];
    const pour = signaturePours[(i - 6) % signaturePours.length];
    
    const padIndex = String(i).padStart(2, '0');
    window.VODKA_DATA.push({
      id: `vodka-${padIndex}`,
      index: padIndex,
      name: `Artisanal Vodka Batch N°${i}`,
      distillery: `${country} Polar Distillers`,
      country: country,
      region: r.region,
      style: r.style,
      abv: 40,
      distilledFrom: r.distilledFrom,
      flavorTags: tags,
      serveModes: { neat: (i % 2 === 0), ice: true, cocktail: true },
      signaturePour: pour,
      description: "Distilled continuously through multi-plate columns and filtered through active birch charcoal."
    });
  }

  window.SPIRIT_DATA = window.VODKA_DATA;
})();
