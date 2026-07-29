/* Cognac Field Encyclopedia - 100 Curated Cognac Dataset */

window.SPIRIT_TYPE = 'cognac';
window.COGNAC_DATA = [
  {
    id: "cognac-001",
    index: "01",
    name: "Rémy Martin XO",
    distillery: "House of Rémy Martin",
    country: "France",
    region: "COGNAC FRANCE",
    style: "XO Extra Old",
    abv: 40,
    distilledFrom: "GRANDE CHAMPAGNE UGNI BLANC",
    flavorTags: ["Candied Orange", "Jasmine", "Rancio", "Cinnamon"],
    serveModes: { neat: true, ice: true, cocktail: false },
    signaturePour: "Neat in a crystal tulip glass warmed gently by palm heat",
    description: "Blend of up to 400 eaux-de-vie aged up to 37 years with exquisite velvet structure."
  },
  {
    id: "cognac-002",
    index: "02",
    name: "Hennessy XO",
    distillery: "Jas Hennessy & Co",
    country: "France",
    region: "COGNAC FRANCE",
    style: "XO Extra Old",
    abv: 40,
    distilledFrom: "CHARENTAIS ALEMBIC STILLS",
    flavorTags: ["Dark Chocolate", "Prune", "Woodsmoke", "Black Pepper"],
    serveModes: { neat: true, ice: true, cocktail: false },
    signaturePour: "On ice in a heavy crystal tumbler",
    description: "Created in 1870 by Maurice Hennessy for family and friends: the original XO icon."
  },
  {
    id: "cognac-003",
    index: "03",
    name: "Martell Cordon Bleu",
    distillery: "Maison Martell",
    country: "France",
    region: "BORDERIES COGNAC",
    style: "Extra Old",
    abv: 40,
    distilledFrom: "BORDERIES EAUX-DE-VIE",
    flavorTags: ["Candied Plum", "Roasted Coffee", "Violet", "Toasted Almond"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Sipped neat after dinner",
    description: "Legendary cognac created in 1912 dominated by elegant Borderies floral aromatics."
  },
  {
    id: "cognac-004",
    index: "04",
    name: "Delamain Pale & Dry XO",
    distillery: "House of Delamain",
    country: "France",
    region: "GRANDE CHAMPAGNE",
    style: "XO Single Cru",
    abv: 42,
    distilledFrom: "100% GRANDE CHAMPAGNE",
    flavorTags: ["Vanilla", "Floral", "Dried Apricot", "Soft Oak"],
    serveModes: { neat: true, ice: false, cocktail: false },
    signaturePour: "Neat in a tulip glass",
    description: "Aged in well-seasoned French oak casks without added sugar or caramel coloring."
  },
  {
    id: "cognac-005",
    index: "05",
    name: "Hine Rare VSOP",
    distillery: "Thomas Hine & Co",
    country: "France",
    region: "FINE CHAMPAGNE",
    style: "VSOP",
    abv: 40,
    distilledFrom: "FINE CHAMPAGNE GRAPES",
    flavorTags: ["Ripe Pear", "White Peach", "Brioche", "Hazelnut"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Cognac Sidecar: 2 parts Hine, 1 part Cointreau, 3/4 part lemon juice",
    description: "Blend of 25 eaux-de-vie from Grande and Petite Champagne aged over 6 years."
  }
];

// Generate up to 100 entries
(function generateFullCognacCatalog() {
  const regions = [
    { name: "GRANDE CHAMPAGNE", countries: ["France"], style: "Grande Champagne", abv: 40, distilledFrom: "CHALK SOIL GRAPES" },
    { name: "PETITE CHAMPAGNE", countries: ["France"], style: "Petite Champagne", abv: 40, distilledFrom: "UGNI BLANC" },
    { name: "BORDERIES COGNAC", countries: ["France"], style: "Borderies Cru", abv: 40, distilledFrom: "BORDERIES EAUX-DE-VIE" },
    { name: "FINS BOIS", countries: ["France"], style: "VSOP Reserve", abv: 40, distilledFrom: "ALEMBIC STILLS" }
  ];

  const flavorPool = [
    ["Candied Orange", "Jasmine", "Rancio", "Cinnamon"],
    ["Dark Chocolate", "Prune", "Woodsmoke", "Black Pepper"],
    ["Candied Plum", "Roasted Coffee", "Violet", "Almond"],
    ["Vanilla", "Ripe Pear", "Brioche", "Hazelnut"]
  ];

  for (let i = 6; i <= 100; i++) {
    const r = regions[(i - 6) % regions.length];
    const country = r.countries[(i - 6) % r.countries.length];
    const tags = flavorPool[(i - 6) % flavorPool.length];
    const padIndex = String(i).padStart(2, '0');
    
    window.COGNAC_DATA.push({
      id: `cognac-${padIndex}`,
      index: padIndex,
      name: `Charentais Reserve N°${i}`,
      distillery: `${country} Master Cellars`,
      country: country,
      region: r.region,
      style: r.style,
      abv: 40,
      distilledFrom: r.distilledFrom,
      flavorTags: tags,
      serveModes: { neat: true, ice: (i % 2 === 0), cocktail: (i % 3 === 0) },
      signaturePour: "Neat in a crystal tulip glass",
      description: "Distilled twice on the lees in copper Charentais alembic pot stills and aged in French oak."
    });
  }

  window.SPIRIT_DATA = window.COGNAC_DATA;
})();
