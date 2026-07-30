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
      center: [30.0, 5.0],
      zoom: 2,
      locations: [
        { name: "France", region: "BORDEAUX FRANCE", coords: [44.8378, -0.5792], description: "Bordeaux Left and Right Bank crus, Burgundy Pinot Noir, Rhône Syrah and Loire Chenin." },
        { name: "Italy", region: "TUSCANY ITALY", coords: [43.7710, 11.2486], description: "Piedmont Nebbiolo, Sangiovese Chianti Classico, Brunello, and Super Tuscans." },
        { name: "Spain", region: "RIOJA SPAIN", coords: [42.4650, -2.4456], description: "Rioja and Ribera del Duero Tempranillo, and Priorat llicorella slate." },
        { name: "Portugal", region: "DOURO PORTUGAL", coords: [41.1621, -7.7891], description: "Terraced Douro schist for port and increasingly serious dry reds." },
        { name: "Germany", region: "MOSEL GERMANY", coords: [49.9787, 7.1180], description: "Steep blue slate Mosel Riesling and Rheingau estates on the river bends." },
        { name: "Austria", region: "WACHAU AUSTRIA", coords: [48.3667, 15.4167], description: "Wachau terraces of Grüner Veltliner and Riesling above the Danube." },
        { name: "USA", region: "NAPA VALLEY USA", coords: [38.2975, -122.2868], description: "Napa Cabernet, Sonoma Chardonnay benchlands and Willamette Pinot Noir." },
        { name: "Argentina", region: "MENDOZA ARGENTINA", coords: [-33.0, -68.85], description: "High-altitude Uco Valley Malbec on alluvial Andean soils." },
        { name: "Chile", region: "CHILE", coords: [-34.5, -71.0], description: "Maipo Cabernet and rediscovered pre-phylloxera Carménère." },
        { name: "Australia", region: "BAROSSA AUSTRALIA", coords: [-34.53, 138.95], description: "Ancient-vine Barossa Shiraz and cool-climate Clare Valley Riesling." },
        { name: "New Zealand", region: "MARLBOROUGH NZ", coords: [-41.52, 173.86], description: "Marlborough Sauvignon Blanc and Central Otago Pinot Noir." },
        { name: "South Africa", region: "STELLENBOSCH SA", coords: [-33.93, 18.86], description: "Stellenbosch Cabernet and Swartland old-bush-vine Chenin Blanc." }
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
      center: [47.5, 2.0],
      zoom: 5,
      locations: [
        { name: "France", region: "REIMS FRANCE", coords: [49.258, 4.031], description: "Underground limestone Crayères cellars and Méthode Champenoise." },
        { name: "Italy", region: "VALDOBBIADENE ITALY", coords: [45.9, 11.99], description: "Glera grape Prosecco Superiore hill vineyards and Franciacorta metodo classico." },
        { name: "Spain", region: "PENEDÈS SPAIN", coords: [41.35, 1.70], description: "Penedès Cava from Macabeo, Xarel·lo and Parellada aged in stone cellars." },
        { name: "England", region: "SOUTH ENGLAND", coords: [50.94, 0.48], description: "South Downs chalk, the same Kimmeridgian seam that runs under Champagne." },
        { name: "USA", region: "CALIFORNIA USA", coords: [38.50, -122.85], description: "Anderson Valley and Napa traditional-method sparkling from Champenois houses." }
      ]
    },
    beer: {
      center: [48.0, 2.0],
      zoom: 4,
      locations: [
        { name: "Germany", region: "BAVARIA GERMANY", coords: [48.7904, 11.4979], description: "Reinheitsgebot purity law, decoction mashing, and Munich lager cellars." },
        { name: "Belgium", region: "BELGIUM", coords: [50.5039, 4.4699], description: "Trappist abbey ales, wild-fermented lambic, and Flemish red sours." },
        { name: "Czechia", region: "BOHEMIA CZECHIA", coords: [49.7475, 13.3776], description: "Plzeň: birthplace of pale lager, Saaz hops and soft Bohemian water." },
        { name: "UK", region: "ENGLAND UK", coords: [52.4862, -1.8904], description: "Cask-conditioned bitter, Burton gypsum water, and Yorkshire square ales." },
        { name: "Ireland", region: "IRELAND", coords: [53.3498, -6.2603], description: "Roasted barley dry stout poured on nitrogen at St. James's Gate." },
        { name: "USA", region: "WEST COAST USA", coords: [45.5152, -122.6784], description: "American craft hop revolution: Cascade, Citra, and hazy IPA." }
      ]
    },
    absinthe: {
      center: [46.8, 6.4],
      zoom: 7,
      locations: [
        { name: "Switzerland", region: "VAL-DE-TRAVERS", coords: [46.9226, 6.6280], description: "Birthplace of absinthe: wormwood, green anise and fennel macerations." },
        { name: "France", region: "PONTARLIER FRANCE", coords: [46.9036, 6.3547], description: "Pontarlier: historic French absinthe capital and Belle Époque distilleries." },
        { name: "Czechia", region: "BOHEMIA CZECHIA", coords: [50.0755, 14.4378], description: "Bohemian-style absinth: bitter wormwood, minimal anise, fire ritual." },
        { name: "USA", region: "USA", coords: [29.9511, -90.0715], description: "New Orleans revival distillers after the 2007 lifting of the US ban." }
      ]
    },
    liqueur: {
      center: [46.0, 6.0],
      zoom: 4,
      locations: [
        { name: "France", region: "FRANCE", coords: [45.3667, 5.8500], description: "Chartreuse herbal elixirs, Dijon crème de cassis, and Cognac-based orange liqueurs." },
        { name: "Italy", region: "ITALY", coords: [42.5, 12.5], description: "Amalfi limoncello, Saronno amaretto, Bologna amaro, and Padua aperitivo bitters." },
        { name: "Ireland", region: "IRELAND", coords: [53.3498, -6.2603], description: "Irish cream liqueurs blending dairy cream with triple-distilled whiskey." },
        { name: "Mexico", region: "MEXICO", coords: [19.4326, -99.1332], description: "Veracruz arabica coffee liqueurs and Yucatán agave-honey Xtabentún." },
        { name: "Netherlands", region: "NETHERLANDS", coords: [52.3676, 4.9041], description: "Curaçao orange peel liqueurs and Amsterdam genever-based cordials." }
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
    attributionControl: false,
    // Page scrolling must not be hijacked; the wheel only zooms after a deliberate click.
    scrollWheelZoom: false
  });

  map.on('click', () => map.scrollWheelZoom.enable());
  mapElement.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

  // The map sits in a grid column, so its box can settle after Leaflet has measured it.
  window.addEventListener('load', () => map.invalidateSize());
  if (window.ResizeObserver) {
    new ResizeObserver(() => map.invalidateSize()).observe(mapElement);
  }

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

  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  config.locations.forEach(loc => {
    const marker = L.marker(loc.coords, {
      icon: createCustomIcon(),
      title: loc.name,
      alt: `${loc.name} — ${loc.region}`,
      keyboard: true
    }).addTo(map);

    const popupContent = `
      <div class="map-popup">
        <span class="map-popup-region">${esc(loc.region)}</span>
        <h4 class="map-popup-title">${esc(loc.name)}</h4>
        <p class="map-popup-desc">${esc(loc.description)}</p>
        <button type="button" class="map-popup-btn" data-region="${esc(loc.name)}">
          Filter ${esc(spiritType.toUpperCase())} from ${esc(loc.name)}
        </button>
      </div>
    `;

    marker.bindPopup(popupContent);
  });

  // Delegated so popup markup never needs an inline event handler.
  map.on('popupopen', (e) => {
    const btn = e.popup.getElement().querySelector('.map-popup-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (typeof window.setMapRegionFilter === 'function') {
          window.setMapRegionFilter(btn.dataset.region);
        }
      }, { once: true });
    }
  });
});
