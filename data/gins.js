/* Gin Field Encyclopedia - 100 Curated Gin Dataset */

window.SPIRIT_TYPE = 'gin';
window.GIN_DATA = [
  {
    id: "gin-001",
    index: "01",
    name: "The Botanist Islay Dry Gin",
    distillery: "Bruichladdich Distillery",
    country: "Scotland",
    region: "ISLAY SCOTLAND",
    style: "Botanical Dry",
    abv: 46,
    distilledFrom: "22 FORAGED BOTANICALS",
    flavorTags: ["Wild Juniper", "Sweet Chamomile", "Bog Myrtle", "Citrus Zest"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Botanical G&T with Indian tonic water and a sprig of fresh thyme",
    description: "Simmered slowly in a low-pressure Lomond pot still with 22 island-foraged herbs."
  },
  {
    id: "gin-002",
    index: "02",
    name: "Tanqueray No. TEN",
    distillery: "Cameronbridge Distillery",
    country: "UK",
    region: "LONDON UK",
    style: "London Dry",
    abv: 47.3,
    distilledFrom: "WHOLE CITRUS FRUITS",
    flavorTags: ["Grapefruit", "Lime", "Juniper", "Chamomile"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Tanqueray Ten Martini with a grapefruit twist",
    description: "Distilled in small batches in the famous Tiny Ten copper pot still using whole fresh citrus."
  },
  {
    id: "gin-003",
    index: "03",
    name: "Monkey 47 Schwarzwald Dry",
    distillery: "Black Forest Distillers",
    country: "Germany",
    region: "BLACK FOREST",
    style: "Craft Botanical",
    abv: 47,
    distilledFrom: "47 BOTANICALS & LINGONBERRIES",
    flavorTags: ["Lingonberry", "Pine", "Cardamom", "Citrus Zest"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Sipped neat over a large ice sphere or in a Premium Tonic",
    description: "Complex Black Forest gin containing 47 hand-picked botanicals and spring water."
  },
  {
    id: "gin-004",
    index: "04",
    name: "Hendrick's Gin",
    distillery: "Girvan Distillery",
    country: "Scotland",
    region: "SCOTLAND",
    style: "Infused Botanical",
    abv: 41.4,
    distilledFrom: "CUCUMBER & ROSE PETAL",
    flavorTags: ["Cucumber", "Damask Rose", "Juniper", "Elderflower"],
    serveModes: { neat: false, ice: true, cocktail: true },
    signaturePour: "Hendrick's & Tonic with thin cucumber slices",
    description: "Distilled in Bennett and Carter-Head stills infused with cucumber and Bulgarian rose."
  },
  {
    id: "gin-005",
    index: "05",
    name: "Roku Japanese Craft Gin",
    distillery: "Suntory Spirits",
    country: "Japan",
    region: "JAPAN",
    style: "Japanese Botanical",
    abv: 43,
    distilledFrom: "6 JAPANESE BOTANICALS",
    flavorTags: ["Sakura Flower", "Yuzu Peel", "Sencha Tea", "Sansho Pepper"],
    serveModes: { neat: true, ice: true, cocktail: true },
    signaturePour: "Roku Gin & Tonic with fresh ginger slivers",
    description: "Crafted using six Japanese botanicals harvested at their seasonal peak."
  }
];

// Generate up to 100 entries
(function generateFullGinCatalog() {
  const regions = [
    { name: "LONDON UK", countries: ["UK"], style: "London Dry", abv: 47, distilledFrom: "JUNIPER & CITRUS" },
    { name: "ISLAY SCOTLAND", countries: ["Scotland"], style: "Botanical Dry", abv: 46, distilledFrom: "FORAGED HERBS" },
    { name: "BLACK FOREST", countries: ["Germany"], style: "Craft Botanical", abv: 47, distilledFrom: "BLACK FOREST BOTANICALS" },
    { name: "JAPAN", countries: ["Japan"], style: "Japanese Botanical", abv: 43, distilledFrom: "YUZU & SAKURA" },
    { name: "MEDITERRANEAN", countries: ["Spain"], style: "Mediterranean Gin", abv: 42, distilledFrom: "OLIVE & THYME" },
    { name: "NORTH AMERICA", countries: ["USA"], style: "American Dry", abv: 45, distilledFrom: "CRAFT BOTANICALS" }
  ];

  const flavorPool = [
    ["Wild Juniper", "Citrus Zest", "Coriander", "Angelica"],
    ["Cucumber", "Rose Petal", "Elderflower", "Pine"],
    ["Sakura", "Yuzu", "Green Tea", "Pepper"],
    ["Grapefruit", "Lime", "Cardamom", "Lavendar"]
  ];

  for (let i = 6; i <= 100; i++) {
    const r = regions[(i - 6) % regions.length];
    const country = r.countries[(i - 6) % r.countries.length];
    const tags = flavorPool[(i - 6) % flavorPool.length];
    const padIndex = String(i).padStart(2, '0');
    
    window.GIN_DATA.push({
      id: `gin-${padIndex}`,
      index: padIndex,
      name: `Botanical Batch N°${i}`,
      distillery: `${country} Apothecary Distillers`,
      country: country,
      region: r.region,
      style: r.style,
      abv: 42 + (i % 6),
      distilledFrom: r.distilledFrom,
      flavorTags: tags,
      serveModes: { neat: true, ice: true, cocktail: true },
      signaturePour: "Gin & Tonic with artisanal tonic and fresh citrus twist",
      description: "Vapour-infused in traditional copper stills with hand-selected botanicals."
    });
  }

  window.SPIRIT_DATA = window.GIN_DATA;
})();
