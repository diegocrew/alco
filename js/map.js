/* Interactive World Map of Rum Distillation - Leaflet.js Implementation */

document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('map');
  if (!mapElement || typeof L === 'undefined') return;

  // Initialize map centered over Caribbean & Atlantic rum belt
  const map = L.map('map', {
    center: [15.0, -50.0],
    zoom: 3,
    minZoom: 2,
    maxZoom: 7,
    zoomControl: true,
    attributionControl: false
  });

  // Dark vector tiles from CartoDB Dark Matter for vintage mahogany look
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Key Rum Production Locations
  const rumLocations = [
    {
      name: "Martinique",
      region: "FRENCH CARIBBEAN",
      coords: [14.6415, -61.0242],
      description: "AOC Protected Rhum Agricole distilled from fresh sugarcane juice."
    },
    {
      name: "Jamaica",
      region: "JAMAICAN CARIBBEAN",
      coords: [18.1096, -77.2975],
      description: "High-ester copper pot still rums famous for rich wild-fermented hogo."
    },
    {
      name: "Barbados",
      region: "BARBADOS",
      coords: [13.1939, -59.5432],
      description: "Birthplace of commercial rum (1703). Balanced pot and column blends."
    },
    {
      name: "Guyana",
      region: "SOUTH AMERICA",
      coords: [6.8013, -58.1551],
      description: "Demerara River wood Coffey and wooden pot stills producing dark molasses rums."
    },
    {
      name: "Puerto Rico",
      region: "SPANISH CARIBBEAN",
      coords: [18.2208, -66.5901],
      description: "Crisp column-distilled light and white rums charcoal filtered for smoothness."
    },
    {
      name: "Cuba",
      region: "SPANISH CARIBBEAN",
      coords: [21.5218, -77.7812],
      description: "Light, dry column rums aged in oak casks for classic Mojitos and Daiquiris."
    },
    {
      name: "Venezuela",
      region: "SOUTH AMERICA",
      coords: [10.4806, -66.9036],
      description: "Rich solera-aged rums and dark heavy pot still distillates."
    },
    {
      name: "Guatemala",
      region: "CENTRAL AMERICA",
      coords: [15.7835, -90.2308],
      description: "High altitude mountain aging from virgin sugarcane honey."
    },
    {
      name: "Brazil",
      region: "SOUTH AMERICA",
      coords: [-14.2350, -51.9253],
      description: "Cachaça — fresh sugarcane juice spirit, foundation of the Caipirinha."
    },
    {
      name: "Mauritius",
      region: "INDIAN OCEAN",
      coords: [-20.3484, 57.5522],
      description: "Indian Ocean island terroir combining French Agricole and English molasses traditions."
    }
  ];

  // Custom Vintage Marker Icon
  const createCustomIcon = (name) => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background-color: #e69c37;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #140d0a;
          box-shadow: 0 0 10px rgba(230, 156, 55, 0.8);
          cursor: pointer;
        "></div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  // Add markers to map
  rumLocations.forEach(loc => {
    const marker = L.marker(loc.coords, { icon: createCustomIcon(loc.name) }).addTo(map);

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
        ">Filter Rums from ${loc.name}</button>
      </div>
    `;

    marker.bindPopup(popupContent);
  });
});
