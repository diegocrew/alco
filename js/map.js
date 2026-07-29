/* Interactive World Map of Distillation - Tailored per Spirit Category */

document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('map');
  if (!mapElement || typeof L === 'undefined') return;

  const spiritType = window.SPIRIT_TYPE || 'rum';

  // Map configurations & pins per spirit category
  const spiritMapConfigs = {
    rum: {
      center: [15.0, -50.0],
      zoom: 3,
      locations: [
        { name: "Martinique", region: "FRENCH CARIBBEAN", coords: [14.6415, -61.0242], description: "AOC Protected Rhum Agricole distilled from fresh sugarcane juice." },
        { name: "Jamaica", region: "JAMAICAN CARIBBEAN", coords: [18.1096, -77.2975], description: "High ester copper pot still rums famous for rich wild fermented hogo." },
        { name: "Barbados", region: "BARBADOS", coords: [13.1939, -59.5432], description: "Birthplace of commercial rum (1703). Balanced pot and column blends." },
        { name: "Guyana", region: "SOUTH AMERICA", coords: [6.8013, -58.1551], description: "Demerara River wood Coffey and wooden pot stills producing dark molasses rums." },
        { name: "Puerto Rico", region: "SPANISH CARIBBEAN", coords: [18.2208, -66.5901], description: "Crisp column distilled light and white rums charcoal filtered for smoothness." },
        { name: "Cuba", region: "SPANISH CARIBBEAN", coords: [21.5218, -77.7812], description: "Light, dry column rums aged in oak casks for classic Mojitos and Daiquiris." },
        { name: "Venezuela", region: "SOUTH AMERICA", coords: [10.4806, -66.9036], description: "Rich solera aged rums and dark heavy pot still distillates." },
        { name: "Guatemala", region: "CENTRAL AMERICA", coords: [15.7835, -90.2308], description: "High altitude mountain aging from virgin sugarcane honey." },
        { name: "Brazil", region: "SOUTH AMERICA", coords: [-14.2350, -51.9253], description: "Cachaça: fresh sugarcane juice spirit, foundation of the Caipirinha." },
        { name: "Mauritius", region: "INDIAN OCEAN", coords: [-20.3484, 57.5522], description: "Indian Ocean island terroir combining French Agricole and English molasses traditions." }
      ]
    },
    vodka: {
      center: [55.0, 20.0],
      zoom: 4,
      locations: [
        { name: "Poland", region: "POLAND (RYE)", coords: [51.9194, 19.1451], description: "Heritage Dankowskie Rye lacustrine soil distillations." },
        { name: "Sweden", region: "SWEDEN (WHEAT)", coords: [60.1282, 18.6435], description: "Single estate winter wheat and vintage copper column stills in Åhus." },
        { name: "Finland", region: "FINLAND (BARLEY)", coords: [61.9241, 25.7482], description: "Six row arctic barley and glacial spring water filtration." },
        { name: "Latvia", region: "BALTIC REGION", coords: [56.8796, 24.6032], description: "Birch charcoal freeze filtration at sub zero temperatures." },
        { name: "Iceland", region: "ICELAND (GLACIAL)", coords: [64.9631, -19.0208], description: "Volcanic rock filtered arctic water powered by geothermal energy." }
      ]
    },
    whisky: {
      center: [45.0, -10.0],
      zoom: 3,
      locations: [
        { name: "Scotland", region: "ISLAY SCOTLAND", coords: [56.4907, -4.2026], description: "Peated Islay malts, Speyside copper stills, and Highland oak aging." },
        { name: "USA", region: "KENTUCKY USA", coords: [37.8393, -84.2700], description: "Corn mash bill bourbons aged in charred virgin American oak barrels." },
        { name: "Japan", region: "JAPAN ALPINE", coords: [36.2048, 138.2529], description: "Alpine spring water, Mizunara oak finishing, and Yamazaki precision." },
        { name: "Ireland", region: "IRELAND", coords: [53.4129, -8.2439], description: "Triple distilled single pot still whiskeys from malted and unmalted barley." }
      ]
    },
    wine: {
      center: [44.0, 5.0],
      zoom: 4,
      locations: [
        { name: "France", region: "BORDEAUX FRANCE", coords: [44.8378, -0.5792], description: "Bordeaux Left and Right Bank premier crus, Burgundy Pinot Noir terroir." },
        { name: "Italy", region: "TUSCANY ITALY", coords: [43.7710, 11.2486], description: "Sangiovese Chianti Classico, Brunello di Montalcino, and Super Tuscans." },
        { name: "Spain", region: "RIBERA DEL DUERO", coords: [41.6523, -4.7245], description: "Rioja and Ribera del Duero Tempranillo aged in oak cellars." },
        { name: "USA", region: "NAPA VALLEY USA", coords: [38.2975, -122.2868], description: "Napa Valley Cabernet Sauvignon and Sonoma Chardonnay benchlands." }
      ]
    },
    gin: {
      center: [52.0, 0.0],
      zoom: 4,
      locations: [
        { name: "UK", region: "LONDON UK", coords: [51.5074, -0.1278], description: "London Dry copper pot stills and classic juniper recipe foundations." },
        { name: "Scotland", region: "ISLAY SCOTLAND", coords: [55.8642, -4.2518], description: "Islay Lomond stills infused with native foraged island botanicals." },
        { name: "Germany", region: "BLACK FOREST", coords: [48.0, 8.2], description: "Black Forest Lingonberry and 47 hand selected botanicals." },
        { name: "Japan", region: "JAPAN", coords: [35.6762, 139.6503], description: "Yuzu peel, Sakura blossom, and green tea seasonal distillations." }
      ]
    },
    cognac: {
      center: [45.7, -0.3],
      zoom: 7,
      locations: [
        { name: "Cognac", region: "COGNAC FRANCE", coords: [45.6961, -0.3275], description: "Charente Ugni Blanc vineyards and Charentais copper alembics." },
        { name: "France", region: "GRANDE CHAMPAGNE", coords: [45.55, -0.2], description: "Chalk soil premier cru eaux de vie aged in Limousin oak." }
      ]
    },
    brandy: {
      center: [42.0, 2.0],
      zoom: 4,
      locations: [
        { name: "France", region: "GASCONY FRANCE", coords: [43.9, 0.2], description: "Bas-Armagnac single continuous stills and Normandy Calvados." },
        { name: "Spain", region: "JEREZ SPAIN", coords: [36.685, -6.136], description: "Brandy de Jerez aged in ancient Oloroso sherry solera systems." },
        { name: "Peru", region: "ICA VALLEY PERU", coords: [-14.067, -75.728], description: "Single distilled unaged grape must Pisco." }
      ]
    },
    tequila: {
      center: [20.7, -103.8],
      zoom: 6,
      locations: [
        { name: "Mexico", region: "JALISCO HIGHLANDS", coords: [20.8, -103.7], description: "Volcanic soil Blue Weber agave cooked in brick masonry ovens." },
        { name: "Oaxaca", region: "OAXACA MEXICO", coords: [17.07, -96.72], description: "Underground pit roasted Espadín agave artisanal Mezcal." }
      ]
    },
    champagne: {
      center: [49.1, 4.0],
      zoom: 7,
      locations: [
        { name: "France", region: "REIMS FRANCE", coords: [49.258, 4.031], description: "Underground limestone Crayères cellars and Méthode Champenoise." },
        { name: "Italy", region: "VALDOBBIADENE ITALY", coords: [45.9, 11.99], description: "Glera grape Prosecco Superiore hill vineyards." }
      ]
    }
  };

  const config = spiritMapConfigs[spiritType] || spiritMapConfigs.rum;

  const map = L.map('map', {
    center: config.center,
    zoom: config.zoom,
    minZoom: 2,
    maxZoom: 9,
    zoomControl: true,
    attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  const createCustomIcon = () => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background-color: var(--accent-primary, #e69c37);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #140d0a;
          box-shadow: 0 0 10px var(--accent-primary, #e69c37);
          cursor: pointer;
        "></div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  config.locations.forEach(loc => {
    const marker = L.marker(loc.coords, { icon: createCustomIcon() }).addTo(map);

    const popupContent = `
      <div style="
        font-family: 'Space Grotesk', sans-serif;
        color: #f8ede3;
        background-color: #241712;
        padding: 0.5rem;
        border-radius: 4px;
        min-width: 180px;
      ">
        <span style="font-size: 0.65rem; color: #e69c37; letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase;">${loc.region}</span>
        <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 0.2rem 0; color: #ffffff;">${loc.name}</h4>
        <p style="font-size: 0.8rem; color: #d6c6b8; margin-bottom: 0.75rem; line-height: 1.4;">${loc.description}</p>
        <button onclick="window.setMapRegionFilter('${loc.name}')" style="
          width: 100%;
          background-color: #933827;
          color: #ffffff;
          border: none;
          padding: 0.4rem 0.6rem;
          border-radius: 3px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          text-transform: uppercase;
        ">Filter ${spiritType.toUpperCase()} from ${loc.name}</button>
      </div>
    `;

    marker.bindPopup(popupContent);
  });
});
