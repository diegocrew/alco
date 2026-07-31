/* Assigns a "global reach" popularity score (1-99) to every catalogue row.

   The score is an editorial index that blends real-world sales volume with brand
   recognition: mass-market global brands score highest, cult and allocated
   bottlings lowest. Producer scores set the baseline, item overrides handle
   individual SKUs, and name rules spread entry-level vs rare expressions apart.

   Run: node tools/assign-popularity.js        (rewrites data/*.js in place) */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const DEFAULTS = {
  absinthe: 10, beer: 24, brandy: 16, champagne: 20, cognac: 14, gin: 18,
  liqueur: 20, rum: 20, tequila: 16, vodka: 20, whisky: 22, wine: 16
};

const PRODUCERS = {
  beer: {
    'Heineken': 99, 'Carlsberg Group': 94, 'Brouwerij Artois': 92, 'Asahi Breweries': 90,
    'Tsingtao Brewery': 88, "St. James's Gate Brewery": 93, 'Grupo Modelo': 74,
    'Birra Peroni': 80, 'Sapporo Breweries': 76, 'Damm': 70, 'Koninklijke Grolsch': 68,
    'Plzeňský Prazdroj': 82, 'Budějovický Budvar': 70, 'Velkopopovický Kozel': 66,
    'Rodinný Pivovar Bernard': 34, 'Paulaner Brauerei': 76, 'Erdinger Weissbräu': 74,
    'Spaten-Franziskaner-Bräu': 68, 'Staatliches Hofbräuhaus München': 64,
    'Bitburger Brauerei': 62, 'Bayerische Staatsbrauerei Weihenstephan': 58,
    'Hacker-Pschorr': 54, 'Augustiner-Bräu München': 48, 'Badische Staatsbrauerei Rothaus': 46,
    'Friesisches Brauhaus zu Jever': 46, 'Köstritzer Schwarzbierbrauerei': 48,
    'Brauerei Aying': 36, 'Klosterbrauerei Andechs': 30, 'Klosterbrauerei Weltenburg': 30,
    'Einbecker Brauhaus': 28, 'Herzoglich Bayerisches Brauhaus Tegernsee': 26,
    'Schneider Weisse': 42, 'Brauerei Gebr. Maisel': 36, 'Brauerei Heller-Trum': 28,
    'Cölner Hofbräu Früh': 32, 'Duvel Moortgat': 60, 'Bières de Chimay': 54,
    'Brouwerij der Trappisten van Westmalle': 42, "Brasserie d'Orval": 38,
    'Brasserie Dupont': 34, "Brasserie d'Achouffe": 42, 'Brouwerij Bosteels': 44,
    'Brouwerij Hoegaarden': 70, 'Brouwerij St. Bernardus': 36, 'Brasserie Lefebvre': 30,
    'Brasserie Cantillon': 20, 'Brouwerij 3 Fonteinen': 16, 'Brouwerij Boon': 24,
    'Brouwerij Lindemans': 42, "Fuller's": 50, "Timothy Taylor's": 32, 'Adnams': 28,
    'Bass Brewery': 48, "Marston's Brewery": 40, 'Samuel Smith Old Brewery': 32,
    'BrewDog': 64, 'Thornbridge Brewery': 28, 'Murphy Brewery': 44,
    'Beamish and Crawford': 28, 'Carlow Brewing': 20, 'Sierra Nevada Brewing': 58,
    'Anchor Brewing': 38, 'Stone Brewing': 46, 'Russian River Brewing': 28,
    "Bell's Brewery": 40, 'Founders Brewing': 44, 'Lagunitas Brewing': 54,
    'Dogfish Head': 44, 'Ballast Point Brewing': 38, 'Firestone Walker': 36,
    'The Alchemist': 18, 'Tree House Brewing': 20, 'Trillium Brewing': 18,
    'Deschutes Brewery': 36, 'Odell Brewing': 24, 'Toppling Goliath': 18,
    'Hill Farmstead Brewery': 12, 'North Coast Brewing': 30, 'Goose Island Beer Company': 44,
    'Brooklyn Brewery': 44, 'Left Hand Brewing': 30, 'Allagash Brewing': 30,
    'Grupa Żywiec': 70, 'Tyskie Browary Książęce': 68, 'Kompania Piwowarska': 60,
    'Perła Browary Lubelskie': 40, 'Browar Kasztelan': 38, 'Browar Łomża': 38,
    'Browar Okocim': 46, 'Browar Fortuna': 20, 'Browar Kormoran': 18,
    'Browar PINTA': 16, 'AleBrowar': 14, 'Browar w Grodzisku Wielkopolskim': 12,
    'Heineken Slovensko': 40, 'Pivovar Šariš': 40, 'Pivovar Topvar': 32,
    'Pivovar Steiger': 26, 'Banskobystrický pivovar': 20, 'Pivovar ERB': 12,
    'Pivovar Kaltenecker': 10
  },
  cognac: {
    'Hennessy': 96, 'Rémy Martin': 86, 'Martell': 80, 'Courvoisier': 76, 'Camus': 52,
    "D'Ussé": 54, 'Meukow': 44, 'Baron Otard': 38, 'Bisquit Dubouché': 34, 'Hine': 32,
    'Maison Ferrand': 38, 'Frapin': 28, 'Delamain': 26, 'Louis Royer': 26,
    'Bache-Gabrielsen': 24, 'Tesseron': 22, 'Cognac Park': 20, 'ABK6': 20,
    'Cognac Prunier': 18, 'Godet': 18, 'Braastad': 18, 'Hardy Cognac': 20,
    'Lhéraud': 14, 'Château de Montifaud': 14, 'Kelt Cognac': 12, 'Merlet': 14,
    'Birkedal Hartmann': 14, 'Cognac Deau': 12, 'Maxime Trijol': 12
  },
  whisky: {
    'John Walker & Sons': 97, 'Jack Daniel Distillery': 95, 'Jim Beam Distillery': 90,
    'Chivas Brothers': 88, "Ballantine's": 86, 'Midleton Distillery': 74,
    'John Dewar & Sons': 74, 'Maker\u2019s Mark Distillery': 74, "Maker's Mark Distillery": 74,
    'Edrington': 68, 'William Grant & Sons': 70, 'Glenfiddich Distillery': 76,
    'The Glenlivet Distillery': 74, 'The Macallan Distillery': 72,
    'Woodford Reserve Distillery': 66, 'Wild Turkey Distillery': 64,
    'Old Bushmills Distillery': 58, 'Tullamore Distillery': 54, 'Glenmorangie Distillery': 58,
    'Laphroaig Distillery': 52, 'Lagavulin Distillery': 50, 'Talisker Distillery': 48,
    'Ardbeg Distillery': 46, 'The Balvenie Distillery': 50, 'Aberlour Distillery': 48,
    'Bowmore Distillery': 44, 'Highland Park Distillery': 44, 'Oban Distillery': 40,
    'Dalmore Distillery': 42, 'Glenfarclas Distillery': 36, 'GlenDronach Distillery': 34,
    'Auchentoshan Distillery': 32, 'Glenkinchie Distillery': 30, 'Dalwhinnie Distillery': 34,
    'Bruichladdich Distillery': 34, 'Caol Ila Distillery': 30, 'Jura Distillery': 32,
    'Bunnahabhain Distillery': 24, 'Kilchoman Distillery': 18, 'Springbank Distillery': 24,
    'Glengyle Distillery': 12, 'Glen Scotia Distillery': 14, 'Isle of Arran Distillery': 22,
    'Tobermory Distillery': 18, 'Scapa Distillery': 18, 'Clynelish Distillery': 24,
    'Old Pulteney Distillery': 22, 'Balblair Distillery': 20, 'Glengoyne Distillery': 24,
    'Craigellachie Distillery': 20, 'GlenAllachie Distillery': 22, 'Tomatin Distillery': 22,
    'Knockdhu Distillery': 14, 'Tamdhu Distillery': 16, 'Deanston Distillery': 18,
    'BenRiach Distillery': 20, 'Benromach Distillery': 20, 'Compass Box': 18,
    'Buffalo Trace Distillery': 48, 'Four Roses Distillery': 50, 'Heaven Hill Distillery': 46,
    'Michter\u2019s Distillery': 36, "Michter's Distillery": 36, 'WhistlePig Farm': 30,
    'High West Distillery': 28, "Angel's Envy Distillery": 32, 'Brown-Forman': 60,
    'George Dickel Distillery': 36, 'Uncle Nearest Distillery': 28,
    'Westland Distillery': 16, 'Balcones Distilling': 16, "Stranahan's Distillery": 16,
    'Teeling Distillery': 32, 'Cooley Distillery': 26, 'Walsh Whiskey': 20,
    'Waterford Distillery': 12, 'Suntory Yamazaki': 50, 'Suntory Hakushu': 38,
    'Suntory': 48, 'Nikka Yoichi': 34, 'Nikka Miyagikyo': 30, 'Nikka Whisky': 40,
    'Chichibu Distillery': 16, 'Kavalan Distillery': 28, 'Amrut Distilleries': 24,
    'John Distilleries': 20, 'Radico Khaitan': 18, 'Penderyn Distillery': 18
  },
  gin: {
    "Gordon's": 94, 'Tanqueray Gordon & Co.': 90, 'Laverstoke Mill': 88,
    'Beefeater Distillery': 80, 'William Grant & Sons': 74, 'Greenall\u2019s': 52,
    "Greenall's": 52, 'Black Friars Distillery': 50, 'Whitley Neill': 44,
    'Sipsmith Distillery': 44, 'Black Forest Distillers': 44, 'Global Premium Brands': 42,
    'Maison Ferrand': 38, 'Nolet Distillery': 38, 'Suntory': 40, 'Torino Distillati': 38,
    'Puerto de Indias': 34, 'House Spirits': 32, 'Hayman Distillers': 32,
    'Edinburgh Gin Distillery': 28, 'The Shed Distillery': 28, 'Four Pillars': 28,
    'Chase Distillery': 24, 'Cotswolds Distillery': 24, 'Silent Pool Distillers': 24,
    "Warner's Distillery": 24, 'Portobello Road Gin': 22, "Broker's Gin": 22,
    'Bermondsey Distillery': 20, 'City of London Distillery': 20, 'Sacred Spirits': 18,
    "Ableforth's": 18, 'East London Liquor Co.': 16, 'Southwestern Distillery': 20,
    'Salcombe Distilling Co.': 14, 'Isle of Harris Distillery': 24,
    'Balmenach Distillery': 24, 'Dunnet Bay Distillers': 18, 'Port of Leith Distillery': 12,
    'Eden Mill': 14, 'Bruichladdich Distillery': 26, 'Dingle Distillery': 16,
    'Midleton Distillery': 26, 'Berry Bros. & Rudd': 18, 'Thames Distillers': 14,
    'Langley Distillery': 14, 'Avadis Distillery': 16, 'Elephant Gin': 18,
    'Rheinland Distillers': 16, 'The Duke Destillerie': 14, 'Windspiel Manufaktur': 12,
    'Berliner Brandstifter': 12, 'Altona Rum Company': 10,
    'Galician Original Distillery': 22, 'Xoriguer': 18, 'EuroWineGate': 22,
    'Christian Drouin': 14, 'Herman Jansen Distillery': 14, 'Rutte Distillery': 14,
    'Filliers Distillery': 16, 'Hernö Gin': 18, 'Kyrö Distillery': 18,
    'Helsinki Distilling Company': 10, 'Isfjord': 10, 'Distilleria Bordiga': 10,
    'Engine': 14, 'St. George Spirits': 22, 'Anchor Distilling': 16,
    "Death's Door Spirits": 14, 'Philadelphia Distilling': 18, 'Brooklyn Gin': 14,
    'Greenhook Ginsmiths': 12, 'Caledonia Spirits': 18, 'Ransom Spirits': 10,
    'Few Spirits': 14, 'Koval Distillery': 14, 'Leopold Bros': 14, '35 Maple Street': 12,
    'Golden State Distillery': 10, 'Victoria Distillers': 12, 'Domaine Pinnacle': 14,
    'Dillon\u2019s Small Batch Distillers': 10, "Dillon's Small Batch Distillers": 10,
    'Amázzoni': 12, 'The Kyoto Distillery': 22, 'Nikka Whisky': 22,
    'Asahikawa Distillery': 10, 'Archie Rose Distilling Co.': 16,
    'Never Never Distilling Co.': 12, 'Scapegrace Distilling': 16,
    'Broken Heart Spirits': 8, 'Procera Gin': 8, 'Inverroche Distillery': 16,
    'Musgrave Spirits': 10, 'Radico Khaitan': 14
  },
  vodka: {
    'Smirnoff': 98, 'The Absolut Company': 94, 'Grey Goose Distillery': 86,
    'Fifth Generation': 88, 'Latvijas Balzams': 76, 'Nolet Distillery': 76,
    'Polmos Żyrardów': 72, 'Białystok Distillery': 68, 'St. Petersburg Distillery': 70,
    'Cîroc': 68, 'Anora Group': 60, 'Wyborowa Pernod Ricard': 58, 'E. & J. Gallo': 54,
    'Campari Group': 58, 'Podlaska Distillery': 52, 'Mariinsk Distillery': 52,
    'Beam Suntory': 44, 'Deep Eddy Distilling': 42, 'Crystal Head': 42, 'Bacardi': 40,
    'Nemiroff': 42, 'Khortytsa': 42, 'Reyka': 32, 'Green Mark': 28, 'Lucas Bols': 28,
    'Effen': 24, 'Buffalo Trace Distillery': 28, 'Stumbras': 22, 'Liviko': 18,
    'Stock Spirits': 22, 'Ursus': 18, 'Suntory Spirits': 22, 'Hangar 1': 22,
    'St. George Spirits': 18, 'Prairie Organic Spirits': 18, 'Chase Distillery': 22,
    'Sipsmith Distillery': 18, 'Purity Vodka': 18, "Karlsson's Vodka": 16,
    'Vestal Vodka': 14, 'Polmos Zielona Góra': 16, 'Polmos Szczecin': 14, 'BGL Group': 14,
    'Ostoya': 12, 'Old Nitra Distillery': 10, 'Isfjord': 10, 'Royal Dirkzwager': 16,
    'Fair Spirits': 12, 'Jean-Marc XO': 14, 'Black Cow Distillery': 14,
    'The Lakes Distillery': 12, 'Castle Brands': 14, "Death's Door Spirits": 12,
    'Pennsylvania Pure Distilleries': 10, 'Distilled Resources': 10,
    'Square One Organic Spirits': 12, 'Hawaii Sea Spirits': 12, 'Woody Creek Distillers': 10,
    'Humboldt Distillery': 8, 'Iceberg Vodka Corporation': 14, 'Broken Shed': 10,
    'Nikka Whisky': 18, "Konik's Tail": 8, 'Snow Queen Vodka': 8, 'Roberto Cavalli': 12,
    'Babicka': 10, 'Synergy': 14, 'Kauffman': 16, 'Zyr': 12, 'Itkul Distillery': 10,
    'Ogilvy Spirits': 8, 'Arbikie Distillery': 12, 'Kavka': 8,
    'William Grant & Sons': 22, 'Dingle Distillery': 12, 'Uluvka': 10
  },
  rum: {
    'Bacardí': 97, 'Captain Morgan': 93, 'Havana Club': 80, 'The Kraken Rum': 60,
    'Sailor Jerry': 58, 'Appleton Estate': 58, 'Mount Gay Distilleries': 54,
    'J. Wray & Nephew': 54, 'Ron Zacapa': 52, 'Compañía Licorera de Nicaragua': 52,
    'Brugal & Co.': 52, 'Goslings': 48, 'Destilerías Unidas': 50, 'Ron Barceló': 48,
    'Maison Ferrand': 46, "Myers's Rum": 44, 'Demerara Distillers': 44,
    'Mohan Meakin': 44, 'Angostura': 42, 'Bumbu Rum Company': 42, 'Cruzan Rum': 40,
    'Destilería Serrallés': 42, 'Don Papa Rum': 38, 'Santa Teresa': 36, 'Pampero': 36,
    'Varela Hermanos': 34, 'Rhum Barbancourt': 32, 'Foursquare Distillery': 32,
    'Leblon': 32, 'Ypióca': 30, 'Santiago de Cuba': 28, 'Habitation Clément': 28,
    'Distillerie Saint James': 28, 'Dictador': 28, 'Destilería Colombiana': 28,
    'St. Lucia Distillers': 28, 'Pusser\u2019s Rum': 28, "Pusser's Rum": 28,
    'Matusalem': 28, 'Distillerie Damoiseau': 24, 'Rhum JM': 24, 'Trois Rivières': 24,
    'Hampden Estate': 24, 'Ron del Barrilito': 24, 'Distillerie Depaz': 22,
    'Destilería Cartavio': 22, 'Ron Millonario': 22, 'Distillerie Neisson': 20,
    'Worthy Park Estate': 20, 'Banks Rum': 20, 'Papa\u2019s Pilar': 18,
    "Papa's Pilar": 18, 'Lemon Hart': 20, 'Destilerías Arehucas': 18,
    'Distillerie La Favorite': 14, 'Habitation Saint-Étienne': 16,
    'Distillerie Longueteau': 14, 'Distillerie Espérance': 12, 'Distillerie Poisson': 14,
    'Distillerie Bielle': 12, 'Distillerie Arawaks': 8, 'Distillerie Le Rocher': 8,
    'Chelo Distillery': 8, 'Ron Malecon': 16, 'Casa Santana': 12, 'Novo Fogo': 14,
    'Avuá Cachaça': 12, 'Yaguara': 10, 'Rhumerie de Chamarel': 14, 'Medine Distillery': 14,
    'Grays Distilling': 12, 'Distillerie Savanna': 14, 'Isautier': 14, 'Takamaka Rum': 14,
    'Beenleigh Artisan Distillery': 12, 'Privateer Rum': 10, 'Richland Rum': 10,
    'Montanya Distillers': 10, 'Allegheny Distilling': 8, 'Koloa Rum Company': 14,
    'Kō Hana Distillers': 8, 'Bayou Rum': 14, 'Denizen Rum': 14, 'Equiano Rum': 12,
    "Ableforth's": 14, 'Ron Colón': 10, 'Charanda Uruapan': 8, 'Destilerías Aldea': 10,
    'Long Pond Distillery': 12, 'Distillerie Bologne': 10, 'La Maison du Whisky': 10,
    'Velier': 14, 'Nine Leaves Distillery': 8, 'Kikusui Distillery': 6, 'Boukman': 8,
    'Two James Spirits': 8, 'Clarendon Distillers': 10, 'Hampden & Wedderburn': 10,
    'St Nicholas Abbey': 12, 'West Indies Rum Distillery': 12, 'Ten To One': 14
  },
  tequila: {
    'Tequila Cuervo La Rojeña': 94, 'Hacienda Patrón': 88, 'Destilería Don Julio': 80,
    'Tequila Sauza': 74, 'Casa Herradura': 68, 'Tequila Cazadores': 58,
    'Destilería Clase Azul': 52, 'Clase Azul': 52, 'Casa Cuervo': 46,
    'Destilería Milagro': 44, 'Tequilera Corralejo': 42, 'Destilería Volcan': 34,
    'Casa Noble': 32, 'Codigo 1530': 30, 'Casa Dragones': 28, 'Tequila Partida': 24,
    'Destilería Komos': 22, 'Destilería Siete Leguas': 28, 'Destilería La Fortaleza': 22,
    'Destilería La Alteña': 26, 'Destilería Los Alambiques': 20,
    'Destilería El Pandillo': 18, 'Destilería Cascahuín': 16, 'Destilería Cava de Oro': 14,
    'Destilería San Nicolás': 12, 'Destilería Colonial': 12, 'Tequilera La Gonzaleña': 14,
    'Destilería Cazcanes': 12, 'Tequila Don Fulano': 14, 'Destilería Tierra de Agaves': 10,
    'Del Maguey': 34, 'Ilegal Mezcal': 28, 'Montelobos': 24, 'Union Mezcal': 20,
    'Mezcal Vago': 16, 'Rey Campero': 14, 'Bozal Mezcal': 16, 'Sombra Mezcal': 16,
    'Banhez': 14, 'Los Siete Misterios': 14, 'Bruxo Mezcal': 14, 'Alipús': 12,
    'Los Amantes': 12, 'Wahaka Mezcal': 12, 'Yola Mezcal': 12, 'Mezcal Koch': 10,
    'Nuestra Soledad': 10, 'Real Minero': 10, 'Pierde Almas': 10, 'Casa Amarás': 8,
    'Derrumbes': 10, 'Xicaru Mezcal': 10, 'Sotol Por Siempre': 8, 'Flor del Desierto': 8,
    'Sotol Ono': 6, 'La Venenosa': 8, 'Cielo Rojo': 8
  },
  champagne: {
    'Moët & Chandon': 84, 'Veuve Clicquot': 88, 'Nicolas Feuillatte': 72, 'G.H. Mumm': 74,
    'Laurent-Perrier': 66, 'Taittinger': 64, 'Piper-Heidsieck': 58, 'Lanson': 56,
    'Pommery': 50, 'Louis Roederer': 52, 'Bollinger': 54, 'Ruinart': 50, 'Pol Roger': 46,
    'Perrier-Jouët': 52, 'Krug': 44, 'Charles Heidsieck': 36, 'Billecart-Salmon': 36,
    'Deutz': 30, 'Gosset': 30, 'Henriot': 26, 'Ayala': 22, 'Drappier': 26,
    'Delamotte': 22, 'Jacquesson': 18, 'Bruno Paillard': 20, 'Alfred Gratien': 18,
    'Salon': 22, 'Philipponnat': 22, 'Jacques Selosse': 20, 'Egly-Ouriet': 16,
    'Agrapart & Fils': 14, 'Pierre Péters': 14, 'Larmandier-Bernier': 14,
    'Ulysse Collin': 12, 'Cédric Bouchard': 10, 'Marguet': 10, 'Chartogne-Taillet': 12,
    'Bérêche & Fils': 12, 'Georges Laval': 10, 'Savart': 8, 'Benoît Lahaye': 8,
    'Paul Bara': 10, 'Vilmart & Cie': 12, 'Pehu-Simonet': 8, 'Emmanuel Brochet': 8,
    'La Closerie': 10, 'Vouette et Sorbée': 8, 'Françoise Bedel': 8, 'Laherte Frères': 10,
    'Pierre Gimonnet & Fils': 14, 'Ferrari Trento': 44, 'Ca\u2019 del Bosco': 34,
    "Ca' del Bosco": 34, 'Bellavista': 28, 'Guido Berlucchi': 34, 'Bisol': 28,
    'Nino Franco': 24, 'Ruggeri': 20, 'Gramona': 22, 'Recaredo': 16,
    'Raventós i Blanc': 20, 'Codorníu': 58, 'Juvé & Camps': 32, 'Nyetimber': 28,
    'Gusbourne': 18, 'Schramsberg': 24, 'Roederer Estate': 24, 'Argyle Winery': 16
  },
  wine: {
    'Cloudy Bay': 62, "Château d'Esclans": 58, 'Concha y Toro': 50, 'Penfolds': 50,
    'Catena Zapata': 46, 'Marchesi Antinori': 46, 'Montes': 40, 'González Byass': 46,
    "Taylor's": 46, 'E. Guigal': 42, 'Opus One': 46, 'Château Mouton Rothschild': 48,
    'Château Lafite Rothschild': 50, 'Château Margaux': 46, 'Château Latour': 44,
    'Château Haut-Brion': 42, 'Château Pétrus': 44, 'Château Cheval Blanc': 40,
    "Château d'Yquem": 42, 'Domaine de la Romanée-Conti': 44, 'Tenuta San Guido': 42,
    "Tenuta dell'Ornellaia": 38, 'Vega Sicilia': 38, 'Château Lynch-Bages': 36,
    'Château Palmer': 34, 'Château Angélus': 32, "Château Cos d'Estournel": 32,
    'Château Léoville Las Cases': 30, 'Château Montrose': 28, 'Château Figeac': 28,
    'Château Pichon Longueville Baron': 30, 'Domaine de Chevalier': 20,
    'Château Climens': 18, 'Château de Beaucastel': 34, 'Paul Jaboulet Aîné': 30,
    'Trimbach': 32, 'Dr. Loosen': 36, 'Chateau Ste. Michelle & Dr. Loosen': 34,
    'Egon Müller': 26, 'Joh. Jos. Prüm': 26, 'Weingut Keller': 22, 'Blandy\u2019s': 30,
    "Blandy's": 30, 'Niepoort': 24, 'Casa Ferreirinha': 20, 'La Rioja Alta': 32,
    'R. López de Heredia': 26, 'Álvaro Palacios': 24, 'René Barbier': 16,
    'Pazo Señorans': 18, 'Bodegas Tradición': 14, 'Giacomo Conterno': 22,
    'Bruno Giacosa': 22, 'Paolo Scavino': 20, 'Biondi-Santi': 26, 'Vietti': 22,
    'Castello di Ama': 20, 'Giuseppe Quintarelli': 18, 'Pieropan': 20,
    'Passopisciaro': 14, 'Montenidoli': 10, 'Josko Gravner': 14, 'Avignonesi': 16,
    'Soldera Case Basse': 12, "Stag's Leap Wine Cellars": 36, 'Joseph Phelps': 32,
    'Shafer Vineyards': 28, 'HdV': 14, 'Beaux Frères': 16, 'Henschke': 26,
    'Grosset': 22, 'Cullen Wines': 18, 'Felton Road': 22, 'Kumeu River': 18,
    'Cheval des Andes': 22, 'Sadie Family Wines': 16, 'Klein Constantia': 22,
    'Kanonkop': 26, 'Royal Tokaji': 26, 'Domaine Sigalas': 16, 'Thymiopoulos': 12,
    "Pheasant's Tears": 12, 'Domaine Comte Georges de Vogüé': 20,
    'Domaine Armand Rousseau': 22, 'Domaine Leflaive': 22, 'Domaine Bonneau du Martray': 16,
    'Domaine François Raveneau': 16, 'Domaine des Comtes Lafon': 18,
    'Domaine Méo-Camuzet': 18, 'Domaine Michel Lafarge': 14, 'Domaine de Courcel': 12,
    'Château des Jacques': 16, 'Marcel Lapierre': 18, 'Auguste Clape': 16,
    'Château Rayas': 20, 'Georges Vernay': 16, 'François Cotat': 12, 'Nicolas Joly': 14,
    'Domaine Huet': 20, 'Couly-Dutheil': 16, 'Domaine de la Pépière': 14,
    'Domaine Zind-Humbrecht': 22, 'Domaine Tempier': 22, 'Weingut Prager': 18,
    'Emmerich Knoll': 18, 'Weingut Moric': 12, 'Weingut Friedrich Becker': 12,
    'Szepsy': 12, 'St. Andrea': 10, 'Movia': 12, 'Grgić Vina': 14, 'Prince Ştirbey': 8,
    'Château Belá': 10, 'Karpatská Perla': 8, 'Château Topoľčianky': 16, 'Elesko': 8,
    'Mrva & Stanko': 8, 'J. & J. Ostrožovič': 8, 'Sonberk': 10, 'Znovín Znojmo': 14,
    'Stapleton & Springer': 6, 'Milan Nestarec': 10, 'Château Mělník': 8
  },
  brandy: {
    'Metaxa': 62, 'Casa Pedro Domecq': 58, 'Fundador': 52, 'Asbach': 44,
    'Yerevan Brandy Company': 46, 'Osborne': 40, 'Vecchia Romagna': 38, 'KWV': 36,
    'Familia Torres': 44, 'González Byass': 36, 'Sánchez Romate': 30,
    'Williams & Humbert': 28, 'Fernando A. de Terry': 24, 'Suntory': 30,
    'Laird & Company': 26, 'Bortolo Nardini': 24, 'Nonino Distillatori': 26,
    'Jacopo Poli': 18, 'Distillerie Berta': 16, 'Distilleria Santa Teresa': 14,
    'Bepi Tosolini': 14, 'Distilleria Sibona': 14, 'Distilleria Capovilla': 10,
    'Distilleria Bocchino': 14, 'Domenis 1898': 12, 'Moët & Chandon': 26,
    'Domaine Jean-Louis Trapet': 10, 'Trimbach': 22, 'G.E. Massenez': 18,
    'Distillerie Massenez': 18, 'Schladerer': 24, 'Etter Söhne': 14,
    'Purkhart Destillerie': 14, 'Clear Creek Distillery': 16, 'Morand': 20,
    'Jelínek': 32, 'R. Jelínek': 28, 'Žufánek': 12, 'Old Herold': 20,
    'Hubert J.E.': 22, 'Łącko Growers': 12, 'Zaric': 20, 'Katsaros': 14,
    'Zsindelyes': 14, 'Christian Drouin': 22, 'Calvados Boulard': 30,
    'Père Magloire': 26, 'Château du Breuil': 18, 'Calvados Lecompte': 16,
    'Roger Groult': 14, 'Adrien Camut': 12, 'Michel Huard': 10, 'Famille Dupont': 14,
    'Coquerel': 14, 'Pierre Huet': 12, 'Bodegas Alvear': 14, 'Adega Velha': 12,
    'Hacienda La Caravedo': 22, 'Bodega San Isidro': 18, 'Macchu Pisco': 14,
    'Campo de Encanto': 12, 'Bodega La Blanco': 10, 'Bodega Tabernero': 14,
    'Waqar': 12, 'Alto del Carmen': 20, 'Capel': 26, 'Pisco Mistral': 22,
    'Van Ryn\u2019s': 22, "Van Ryn's": 22, 'Boplaas Family Vineyards': 12,
    'Oude Molen': 12, 'Germain-Robin': 12, 'Osocalis Distillery': 10,
    'Copper & Kings': 14, 'Bertoux': 12, 'St. George Spirits': 14, 'Singani 63': 14,
    'Angove Family Winemakers': 16, 'Rochelt': 10, 'Château de Laubade': 16,
    'Francis Darroze': 12, 'Delord Frères': 14, 'Baron de Sigognac': 14,
    'Maison Castarède': 10, 'Domaine Boingnères': 10, 'Château du Tariquet': 20,
    'Samalens': 14, 'Larressingle': 16, 'Janneau': 18, 'Château de Pellehaut': 12,
    'Dartigalongue': 12, 'Domaine de Laballe': 10, 'Marie Duffau': 12,
    'Château Garreau': 10, 'Bas-Armagnac Baron Gaston Legrand': 12,
    'Château de Ravignan': 10, 'Armagnac Sempé': 14, 'Ryst-Dupeyron': 12,
    'Maison Gélas': 12, 'Château Arton': 10
  },
  liqueur: {
    'Diageo': 88, 'Campari Group': 84, 'Mast-Jägermeister': 88, 'Pernod Ricard': 80,
    'Rémy Cointreau': 82, 'Illva Saronno': 76, 'Sazerac': 72, 'Fratelli Branca': 70,
    'Marnier-Lapostolle': 70, 'Brown-Forman': 64, 'Bacardi': 60, 'Lucas Bols': 58,
    'Bols': 56, 'Lillet': 58, 'William Grant & Sons': 58, 'Amaro Montenegro': 54,
    'Montenegro': 54, 'Amaro Averna': 52, 'Distell': 52, 'Suntory': 52,
    'Jan Becher': 48, 'Chartreuse Diffusion': 52, 'Bénédictine': 50,
    'Amaro Ramazzotti': 48, 'Luxardo': 50, 'Underberg': 44, 'Zwack': 42,
    'Ouzo 12': 42, 'Heering': 40, 'Dolin': 38, 'Molinari': 34, 'Caffo': 34,
    'Senior & Co.': 34, 'Pallini': 32, 'Distillerie Combier': 30, 'Maison Ferrand': 30,
    'Giffard': 30, 'Casa Lumbre': 28, 'Picon': 28, 'Strega Alberti': 28,
    'Lucano 1894': 28, 'Mr Black': 28, 'Nonino Distillatori': 26, 'Lejay Lagoute': 26,
    'Giulio Cocchi': 28, 'John D. Taylor': 24, 'Mozart Distillerie': 22, 'Braulio': 22,
    'Osborne': 22, 'Limoncello di Capri': 22, 'Italicus': 22, 'Briottet': 20,
    'Rothman & Winter': 18, 'Sipsmith': 18, 'Lazzaroni': 18, 'Silvio Meletti': 18,
    'Bortolo Nardini': 18, 'Cappelletti': 18, 'Domaine de Canton': 18, 'Bosca': 14,
    'Bigallet': 14, 'Zucca': 14, 'Rhum Clément': 18, 'Haus Alpenz': 14,
    'Tempus Fugit Spirits': 14, 'Berry Bros. & Rudd': 14, 'Schwarze und Schlichte': 14,
    'Sobieski': 14, 'Gilka': 12, 'Fernet-Vallet': 12, 'Casa D\u2019Aristi': 12,
    "Casa D'Aristi": 12, 'Destillerie Purkhart': 12, 'Varnelli': 14,
    'Distillerie Labounoux': 12, 'Agave Loco': 8, 'Nocino della Cristina': 8,
    'Arcus': 20
  },
  absinthe: {
    'Pernod Ricard': 52, 'La Fée Absinthe': 32, 'Hill\u2019s Liquere': 34,
    "Hill's Liquere": 34, 'Mari Mayans': 28, 'Hapsburg': 28,
    'Blackmint Distillerie Kübler': 26, 'Sebor': 18, 'Fruko Schulz': 20, 'Xenta': 16,
    'Tabu': 18, 'Teichenné': 14, 'Artemisia-Bugnon Distillerie': 20,
    'Matter-Luginbühl': 14, 'Distillerie Emile Pernot': 16, 'Distillerie Paul Devoille': 16,
    'Distillerie Guy': 14, 'Distillerie Lemercier Frères': 12, 'Distillerie Combier': 14,
    'Combier / Jade Liqueurs': 14, 'Combier / Viridian Spirits': 10,
    'Distilleries et Domaines de Provence': 14, 'Liquoristerie de Provence': 12,
    'St. George Spirits': 16, 'Leopold Bros': 12, 'Philadelphia Distilling': 12,
    'Marteau': 8, 'Pacific Distillery': 8, 'Delaware Phoenix Distillery': 6,
    'Tenneyson': 8, 'Copper & Kings': 10, 'Golden Moon Distillery': 6, 'Sirène': 6,
    'Corsair Distillery': 8, 'Obsello': 8, 'Destilerías Ayelo': 8,
    'Destilerías Montana': 8, 'Destilerías Deva': 8, 'Antonio Nadal Destilerías': 8,
    'L\u2019OR Special Drinks': 10, "L'OR Special Drinks": 10, 'Bairnsfather Brands': 10,
    'St. Antoine': 8, 'Green Tree': 12, 'Metelka': 8, 'Distillerie Larusée': 10,
    'Distillerie Trublion': 6, 'Distillerie Fornerod': 6, 'Distillerie Bovet': 8,
    'Distillerie Vinet Ege': 6, 'Ridge Distillery': 5, 'Letherbee Distillers': 6,
    'Germain-Robin': 6, 'Okanagan Spirits': 5, 'Fischer Distillery': 5,
    'Bohemia Spirits': 10, 'Destilerías Segarra': 6, 'Distillerie Martin': 8,
    'Wolf': 8, 'Distillerie Bovet ': 8
  }
};

/* Individual SKUs whose reach differs sharply from their producer's baseline. */
const ITEMS = {
  beer: {
    'Guinness Draught': 96, 'Guinness Foreign Extra Stout': 58, 'Negra Modelo': 72,
    'Pacífico Clara': 70, 'Sierra Nevada Pale Ale': 64, 'Torpedo Extra IPA': 46,
    'All Day IPA': 48, 'Breakfast Stout': 40, 'Kentucky Breakfast Stout': 28,
    'Bourbon County Brand Stout': 32, 'London Pride': 56, 'Fuller\u2019s ESB': 40,
    "Fuller's ESB": 40, 'London Porter': 32, 'Żywiec Jasne Pełne': 72,
    'Żywiec Porter': 40, 'Warka Strong': 48, 'Żywiec Białe': 44, 'Okocim Porter': 32,
    'Zlatý Bažant 12°': 54, 'Kelt 12°': 32, 'Corgoň 12°': 36, 'Smädný Mních Pšeničné': 28,
    'Šariš Tmavý 11°': 28, 'Steiger Tmavý 12%': 22, 'Punk IPA': 62,
    'Weihenstephaner Hefeweissbier': 62, 'Paulaner Hefe-Weißbier Naturtrüb': 74,
    'Erdinger Weissbier': 74, 'Franziskaner Hefe-Weissbier': 66, 'Hoegaarden Witbier': 70
  },
  cognac: {
    'Rémy Martin Louis XIII': 58, 'Hennessy Paradis': 44, 'Hennessy Richard': 34,
    'Hennessy V.S': 96, 'Hennessy X.O': 80, 'Martell Cordon Bleu': 66,
    'Courvoisier V.S': 76, 'Rémy Martin 1738 Accord Royal': 70,
    'Rémy Martin Coeur de Cognac': 52, "D'Ussé V.S.O.P": 56,
    'Hennessy V.S.O.P Privilège': 90, 'Rémy Martin V.S.O.P': 84,
    "Hennessy Master Blender's Selection": 24,
    'Rémy Martin Carte Blanche à Baptiste Loiseau': 16,
    'Rémy Martin XO Excellence Cannes': 22, 'Courvoisier Master Cask Sherry': 20,
    'Rémy Martin Tercet': 20, 'Rémy Martin Club': 30, 'Rémy Martin V': 34
  },
  whisky: {
    'Jameson Original': 92, 'Jameson Black Barrel': 62, 'Redbreast 12 Year': 40,
    'Green Spot Single Pot Still': 26, 'Yellow Spot 12 Year': 20,
    'Powers John\u2019s Lane 12 Year': 22, "Powers John's Lane 12 Year": 22,
    'Midleton Very Rare': 24, 'Method and Madness Single Pot Still': 14,
    'Johnnie Walker Black Label': 94, 'Johnnie Walker Blue Label': 62,
    'Johnnie Walker Green Label': 48, 'Chivas Regal 12 Year': 86,
    'Chivas Regal 18 Year': 56, 'The Famous Grouse': 70, 'Highland Park 12 Year': 46,
    'Jack Daniel\u2019s Old No. 7': 96, "Jack Daniel's Old No. 7": 96,
    'Gentleman Jack': 58, 'Jim Beam White Label': 90, 'Knob Creek 9 Year': 52,
    'Maker\u2019s Mark': 76, "Maker's Mark": 76, 'Wild Turkey 101': 62,
    'Russell\u2019s Reserve 10 Year': 34, "Russell's Reserve 10 Year": 34,
    'Buffalo Trace Bourbon': 60, 'Blanton\u2019s Single Barrel': 46,
    "Blanton's Single Barrel": 46, 'Eagle Rare 10 Year': 44,
    'Pappy Van Winkle 15 Year': 30, 'W.L. Weller Special Reserve': 36,
    'Sazerac Rye': 38, 'E.H. Taylor Small Batch': 26, 'Elijah Craig Small Batch': 44,
    'Evan Williams Black Label': 52, 'The Macallan 12 Year Sherry Oak': 70,
    'The Glenlivet 12 Year': 74, 'Glenfiddich 12 Year': 78, 'Glenfiddich 21 Year': 40,
    'The Balvenie DoubleWood 12 Year': 54, 'Glenmorangie Original 10 Year': 60,
    'Laphroaig 10 Year': 54, 'Ardbeg 10 Year': 50, 'Lagavulin 16 Year': 52,
    'Talisker 10 Year': 50, 'Hibiki Japanese Harmony': 52,
    'Yamazaki 12 Year': 48, 'Nikka From The Barrel': 42, 'Nikka Coffey Grain': 30,
    'Bushmills Original': 60, 'Tullamore D.E.W. Original': 56,
    'Johnnie Walker Black Label 12': 94, 'Johnnie Walker Green Label 15': 46,
    'Johnnie Walker Blue Label NAS': 60, 'Chivas Regal 12': 86,
    'Knob Creek 9 Year Old': 52, "Booker's Bourbon": 34,
    "Blanton's Original Single Barrel": 46, 'Pappy Van Winkle 15 Year Old': 30,
    'Chivas Regal 18': 54, "Jack Daniel's Single Barrel Select": 42,
    "Ballantine's 17 Year Old": 30, 'Glenfiddich 15 Solera Reserve': 46,
    'Glenfiddich 12 Year Old': 76
  },
  gin: {
    'Gordon\u2019s London Dry': 94, "Gordon's London Dry": 94,
    'Tanqueray London Dry': 92, 'Tanqueray No. Ten': 62, 'Tanqueray Sevilla': 52,
    'Bombay Sapphire': 90, "Hendrick's Gin": 78, 'Beefeater London Dry': 82,
    'Beefeater 24': 46, 'Plymouth Gin': 50, 'Monkey 47 Schwarzwald Dry Gin': 46,
    'Roku Gin': 42, 'Gin Mare': 44, 'Malfy Gin con Limone': 42,
    'Aviation American Gin': 34, 'The Botanist Islay Dry Gin': 34,
    'Sipsmith London Dry': 46, 'Bulldog Gin': 30,
    "Seagram's Extra Dry": 66, 'Gin Bombay Dry': 62, 'Star of Bombay': 44,
    'Rangpur Lime Gin': 48, 'Empress 1908 Indigo': 26,
    "Beefeater Burrough's Reserve": 20, "Hendrick's Orbium": 30
  },
  vodka: {
    'Smirnoff No. 21 Red Label': 98, 'Absolut Blue': 94, 'Absolut Elyx': 34,
    'Grey Goose Original': 88, 'Tito\u2019s Handmade Vodka': 90,
    "Tito's Handmade Vodka": 90, 'Ketel One': 78, 'Belvedere Pure': 74,
    'Stolichnaya Premium': 80, 'Żubrówka Bison Grass': 70, 'Chopin Potato': 52,
    'Russian Standard Original': 70, 'Finlandia Classic': 62, 'Beluga Noble': 52,
    'Cîroc Snap Frost': 68, 'SKYY Vodka': 60, 'New Amsterdam Vodka': 54,
    'Pinnacle Original': 44, 'Crystal Head Original': 42,
    'Absolut Vodka': 94, 'Level Vodka': 30, 'Absolut Elyx Single Estate': 32,
    'Absolut Original 100': 40, 'Smirnoff No. 21': 98, 'Grey Goose': 88,
    "Tito's Handmade Vodka": 90, 'Starka 50 Year': 10,
    'Grey Goose VX': 26, 'Grey Goose Essences Strawberry & Lemongrass': 40,
    'Stolichnaya': 80, 'Stoli Elit': 26
  },
  rum: {
    'Bacardí Carta Blanca': 97, 'Bacardí Ocho': 60, 'Captain Morgan Original Spiced Gold': 93,
    'Havana Club 7 Años': 78, 'Havana Club 3 Años': 74, 'Appleton Estate Signature': 56,
    'Appleton Estate 21 Year': 22, 'Mount Gay Eclipse': 54, 'Mount Gay XO': 38,
    'El Dorado 15 Year': 44, 'Zacapa 23': 56, 'Flor de Caña 12 Year': 50,
    'Plantation 3 Stars': 46, 'Plantation Original Dark': 44,
    'Diplomático Reserva Exclusiva': 56, 'Ron Zacapa XO': 30, 'Old Monk 7 Year': 46,
    'Wray & Nephew White Overproof': 54, 'Kraken Black Spiced': 60,
    'Sailor Jerry Spiced': 58, 'Goslings Black Seal': 50, 'Angostura 1919': 38,
    'Bacardí Reserva Ocho': 58, 'Captain Morgan Original Spiced': 93,
    'Havana Club Selección de Maestros': 38, 'Havana Club Añejo Especial': 66
  },
  tequila: {
    'Jose Cuervo Especial Reposado': 94, 'Jose Cuervo Tradicional Plata': 68,
    'Patrón Silver': 88, 'Patrón Añejo': 62, 'Don Julio Blanco': 78,
    'Don Julio 1942': 66, 'Herradura Reposado': 66, 'Sauza Silver': 74,
    'Cazadores Reposado': 58, 'Clase Azul Reposado': 54, 'Espolòn Blanco': 60,
    'Milagro Silver': 44, 'Del Maguey Vida': 40, 'Casamigos Blanco': 74,
    'Casamigos Reposado': 66, 'Gran Centenario Leyenda': 26,
    'Maestro Dobel Diamante': 46, 'Gran Patrón Piedra': 24, '1800 Añejo': 58,
    'Don Julio Real': 30, 'Don Julio Reposado': 74, 'Yola 1971': 12
  },
  champagne: {
    'Moët Impérial Brut': 92, 'Veuve Clicquot Yellow Label': 88,
    'Dom Pérignon Vintage': 68, 'Dom Pérignon P2': 30, 'Dom Pérignon Rosé': 38,
    'Cristal': 56, 'Cristal Rosé': 32, 'Krug Grande Cuvée': 46,
    'Krug Clos du Mesnil': 22, 'Moët Nectar Impérial': 66, 'Moët Grand Vintage': 46,
    'Mumm Cordon Rouge': 74, 'Nicolas Feuillatte Réserve Exclusive': 72,
    'Laurent-Perrier Cuvée Rosé': 64, 'Bollinger Special Cuvée': 54,
    'Ferrari Brut Trentodoc': 46, 'Codorníu Reserva Raventós': 58,
    'Belle Epoque': 50, 'Grand Siècle': 38, 'La Grande Dame': 44,
    'Veuve Clicquot Rosé': 62, 'Ruinart Blanc de Blancs': 44
  },
  liqueur: {
    'Aperol': 92, 'Campari': 86, 'Baileys Irish Cream': 92, 'Jägermeister': 90,
    'Cointreau': 82, 'Grand Marnier Cordon Rouge': 74, 'Malibu Coconut': 84,
    'Kahlúa': 84, 'Disaronno Originale': 78, 'Fireball Cinnamon Whisky': 80,
    'Southern Comfort': 68, 'Amarula Cream': 54, 'Midori Melon': 52,
    'Fernet-Branca': 70, 'Chartreuse Verte': 52, 'St-Germain': 58,
    'Limoncello di Capri': 24, 'Becherovka': 48, 'Unicum': 42, 'Cynar': 38,
    'Sambuca Molinari Extra': 36, 'Ouzo 12': 42, 'Amaretto Disaronno': 78,
    'China Martini': 16, 'RumChata': 34, 'Nocino': 10
  },
  brandy: {
    'Metaxa 12 Stars': 62, 'Metaxa Private Reserve': 26, 'Presidente Brandy': 62,
    'Don Pedro Reserva Especial': 50, 'Asbach Uralt': 46, 'Torres 10 Gran Reserva': 50,
    'Torres 20 Hors d\u2019Age': 26, "Torres 20 Hors d'Age": 26,
    'Fundador Solera Reserva': 54, 'Carlos I Solera Gran Reserva': 40,
    'Ararat Akhtamar 10 Year': 46, 'Ararat Nairi 20 Year': 26,
    'Slivovitz Old Plum Brandy': 34, 'Slivovica': 22, 'Karpatské Brandy Špeciál': 24,
    'Śliwowica Łącka': 14, 'Rakia Sljivovica': 22, 'Kirschwasser': 26
  },
  absinthe: { 'Pernod Absinthe': 52, 'Absente 55': 26 },
  wine: {}
};

/* Cocktail popularity follows the bar-call frequency of the modern classics. */
const COCKTAILS = {
  'Old Fashioned': 99, 'Negroni': 97, 'Daiquiri': 94, 'Espresso Martini': 96,
  'Margarita': 95, 'Whiskey Sour': 92, 'Dry Martini': 93, 'Manhattan': 91,
  'Mojito': 90, 'Aperol Spritz': 94, 'Moscow Mule': 88, 'Paloma': 84,
  'Cosmopolitan': 82, 'Piña Colada': 84, 'Gin & Tonic': 92, 'Bloody Mary': 83,
  'Caipirinha': 80, 'Mai Tai': 78, 'French 75': 77, 'Sazerac': 74, 'Gimlet': 76,
  'Boulevardier': 75, 'Penicillin': 74, "Tommy's Margarita": 72, 'Amaretto Sour': 70,
  'Aviation': 68, 'Vesper': 68, 'Last Word': 66, 'Clover Club': 62,
  'Corpse Reviver No. 2': 64, "Bee's Knees": 62, 'Sidecar': 66, 'Zombie': 60,
  'Painkiller': 58, 'Jungle Bird': 58, 'Hanky Panky': 54, 'Paper Plane': 62,
  'Naked and Famous': 56, 'Bramble': 60, 'Southside': 52, 'Gin Basil Smash': 58,
  "Dark 'n' Stormy": 62, 'Irish Coffee': 72, 'White Russian': 74,
  'Mint Julep': 66, 'Tom Collins': 68, 'Rusty Nail': 50, 'Rob Roy': 48,
  'Sea Breeze': 52, 'Bellini': 66, 'Mimosa': 74, 'Pisco Sour': 64,
  'Michelada': 58, 'Sangría': 70, 'Screwdriver': 60, 'Black Russian': 46,
  'Vodka Martini': 70, 'Tequila Sunrise': 62, 'Cuba Libre': 70, 'Gin Fizz': 58,
  'Ramos Gin Fizz': 50, 'Singapore Sling': 56, 'Martinez': 48, 'White Lady': 50,
  'Brandy Alexander': 46, 'Grasshopper': 40, 'Hot Toddy': 58, 'Long Island Iced Tea': 66,
  'Vieux Carré': 46, 'Blood and Sand': 40, 'Brooklyn': 36, 'Bobby Burns': 26,
  'Algonquin': 22, 'Ward Eight': 22, 'Gold Rush': 52, 'New York Sour': 42,
  'Army & Navy': 26, 'Pegu Club': 30, 'Twentieth Century': 30, 'Alaska': 24,
  'Bijou': 26, 'Hemingway Daiquiri': 54, 'Planter\u2019s Punch': 42,
  "Planter's Punch": 42, 'El Presidente': 34, "Ti' Punch": 36, "Corn 'n' Oil": 24,
  "Queen's Park Swizzle": 30, 'Airmail': 26, 'Hurricane': 52, 'Fog Cutter': 26,
  'Nuclear Daiquiri': 28, 'Lemon Drop': 46, 'Harvey Wallbanger': 40, 'Salty Dog': 32,
  'Oaxaca Old Fashioned': 54, 'Mezcal Negroni': 46, 'El Diablo': 34, 'Batanga': 30,
  'Rosita': 24, 'Between the Sheets': 30, 'Japanese Cocktail': 20, 'Stinger': 28,
  'Champs-Élysées': 20, 'Brandy Crusta': 24, 'Corpse Reviver No. 1': 22,
  'Americano': 60, 'Negroni Sbagliato': 72, 'Kir Royale': 54, 'Kir': 48,
  'Death in the Afternoon': 32, 'Sherry Cobbler': 34, 'Adonis': 26, 'Bamboo': 26,
  'Black Velvet': 24, 'Shandy': 48, "Pimm's Cup": 56, 'Chartreuse Swizzle': 38,
  'Absinthe Drip': 26, 'Sgroppino': 26, 'Golden Cadillac': 16, 'Brave Bull': 18,
  'Godfather': 30, 'Bocce Ball': 12, 'Toasted Almond': 14, 'Old Cuban': 40,
  "Tommy's Mule": 20, 'Division Bell': 22, 'Bitter Giuseppe': 18, 'Bensonhurst': 16,
  'Red Hook': 24, 'Greenpoint': 24, 'Trinidad Sour': 30, 'Jasmine': 24,
  'Tuxedo No. 2': 18, 'Chrysanthemum': 18, 'Suffering Bastard': 24,
  'Hotel Nacional': 22, 'Saturn': 26, 'Scofflaw': 22, 'Remember the Maine': 20,
  'Hemingway Special': 34, 'Bee Sting': 12, 'Bramble Royale': 14, 'Garibaldi': 44,
  'Cardinale': 18, 'Boothby': 14, 'Seelbach': 20, 'Diamondback': 14,
  'Fitzgerald': 20, 'Siesta': 28, 'Kingston Negroni': 30, 'Air Mail Fizz': 12,
  'Chelsea Sidecar': 14, 'Rome with a View': 22, 'Yellow Bird': 18,
  'Mary Pickford': 24, 'Bijou Royale': 10, 'Cynar Julep': 16, 'Coffee Cocktail': 14,
  "Widow's Kiss": 16, 'Tipperary': 14, 'Improved Whiskey Cocktail': 18,
  'Fanciulli': 12, 'Toronto': 20, 'La Louisiane': 20, 'Bourbon Renewal': 18,
  'Jack Rose': 26, 'Applejack Rabbit': 12, 'Bitter Mai Tai': 18, 'Ford Cocktail': 10,
  'Turf Club': 12, 'Income Tax': 14, 'Bronx': 26, 'Monkey Gland': 18, 'Casino': 16,
  'Blood Orange Margarita': 30, 'Mezcal Paloma': 34, 'Chicago Fizz': 12,
  "Bee's Kiss": 10, 'Pink Gin': 26, 'Vermouth Cassis': 16, 'Spritz Bianco': 34,
  'Pornstar Martini': 88, 'Breakfast Martini': 46, 'Tommy Collins': 16,
  'Rhubarb Collins': 14, 'Vodka Espresso': 52, 'Fernet and Coke': 36,
  'Sherry Flip': 14, 'Milano-Torino': 28, 'Hugo': 62, 'Boulevard Sour': 12,
  'Tiki Tequila Sour': 12
};

function nameModifier(name, category) {
  let delta = 0;
  if (/\bV\.?S\b/.test(name)) delta += 8;
  if (/V\.?S\.?O\.?P/i.test(name)) delta += 4;
  if (/\bX\.?O\b/i.test(name)) delta -= 6;
  if (/Paradis|Louis XIII|Hors d.Age|Très Vieill|Très Vénérable|Grande Réserve|Réserve Spéciale|Gran Reserva|Extra\b|Single Cask|Single Barrel|Riserva|Prestige/i.test(name)) delta -= 8;
  // Vintage-dated bottlings are tiny releases, but only in the categories that date them.
  if (/^(cognac|brandy|whisky|wine|champagne)$/.test(category) && /\b(18|19|20)\d{2}\b/.test(name)) delta -= 10;
  if (/\bLot \d+|\bN°|\bNo\. \d{2,}/.test(name)) delta -= 6;
  const age = name.match(/\b(\d{1,2})\s*(Year|Ans|Yr|Años|Anos)\b/i);
  if (age) {
    const years = Number(age[1]);
    if (years >= 20) delta -= 8;
    else if (years >= 15) delta -= 5;
    else if (years >= 12) delta -= 2;
  }
  return delta;
}

function scoreFor(category, name, producer) {
  const items = ITEMS[category] || {};
  if (items[name] != null) return items[name];
  const base = (PRODUCERS[category] || {})[producer];
  const value = (base == null ? DEFAULTS[category] : base) + nameModifier(name, category);
  return Math.max(4, Math.min(99, Math.round(value)));
}

function rewriteCatalog(file) {
  const full = path.join(DATA_DIR, file);
  let category = null;
  const rows = [];
  global.window = { defineCatalog: (type, prefix, data) => { category = type; data.forEach(r => rows.push(r)); } };
  delete require.cache[require.resolve(full)];
  require(full);

  const scores = rows.map(r => scoreFor(category, r[0], r[1]));
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  let i = 0;
  const out = lines.map(line => {
    if (!/^\s{2}\[".*\],?\s*$/.test(line)) return line;
    const pop = scores[i++];
    if (/\bpop: \d+/.test(line)) return line.replace(/\bpop: \d+/, `pop: ${pop}`);
    if (/\{[^{}]*\}\],?\s*$/.test(line)) {
      return line.replace(/\{\s*([^{}]*?)\s*\}(\],?\s*)$/, (m, inner, tail) => `{ pop: ${pop}, ${inner} }${tail}`);
    }
    return line.replace(/,\s*(\d+)(\],?\s*)$/, (m, modes, tail) => `, ${modes}, { pop: ${pop} }${tail}`);
  });

  if (i !== rows.length) throw new Error(`${file}: matched ${i} lines for ${rows.length} rows`);
  fs.writeFileSync(full, out.join('\n'));
  return { category, count: rows.length, scores };
}

function rewriteCocktails() {
  const full = path.join(DATA_DIR, 'cocktails.js');
  global.window = {};
  delete require.cache[require.resolve(full)];
  require(full);
  const rows = global.window.COCKTAIL_DATA;
  const scores = rows.map(r => COCKTAILS[r[0]] != null ? COCKTAILS[r[0]] : 18);

  const lines = fs.readFileSync(full, 'utf8').split('\n');
  let i = 0;
  const out = lines.map(line => {
    if (!/^\s{2}\[".*\],?\s*$/.test(line)) return line;
    const pop = scores[i++];
    if (/,\s*\d+\],?\s*$/.test(line)) return line.replace(/,\s*\d+(\],?\s*)$/, (m, tail) => `, ${pop}${tail}`);
    return line.replace(/(\],?\s*)$/, (m, tail) => `, ${pop}${tail}`);
  });
  if (i !== rows.length) throw new Error(`cocktails: matched ${i} lines for ${rows.length} rows`);
  fs.writeFileSync(full, out.join('\n'));
  return { category: 'cocktail', count: rows.length, scores };
}

const files = fs.readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.js') && f !== 'cocktail-images.js' && f !== 'cocktails.js');

const report = files.map(rewriteCatalog);
report.push(rewriteCocktails());

report.forEach(r => {
  const sorted = [...r.scores].sort((a, b) => a - b);
  const avg = Math.round(r.scores.reduce((s, v) => s + v, 0) / r.scores.length);
  console.log(
    r.category.padEnd(10),
    'n=' + String(r.count).padStart(4),
    'min=' + String(sorted[0]).padStart(3),
    'median=' + String(sorted[Math.floor(sorted.length / 2)]).padStart(3),
    'avg=' + String(avg).padStart(3),
    'max=' + String(sorted[sorted.length - 1]).padStart(3)
  );
});
