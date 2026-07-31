/* Rewrites the advertised item counts in each page's head and hero so they match
   the dataset the page actually loads.

   Run: node tools/sync-counts.js */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

const sizes = {};
fs.readdirSync(DATA)
  .filter(f => f.endsWith('.js') && f !== 'cocktail-images.js' && f !== 'cocktails.js')
  .forEach(file => {
    global.window = { defineCatalog: (type, prefix, rows) => { sizes[file] = rows.length; } };
    delete require.cache[require.resolve(path.join(DATA, file))];
    require(path.join(DATA, file));
  });

const updated = [];

fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).forEach(file => {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');

  const dataFile = (html.match(/src="data\/([^"]+\.js)"/) || [])[1];
  const total = dataFile && sizes[dataFile];
  if (!total) return;

  const hero = (html.match(/<h1 class="hero-title">(\d+)/) || [])[1];
  if (!hero || Number(hero) === total) return;

  const headEnd = html.indexOf('</head>');
  const head = html.slice(0, headEnd).split(hero).join(String(total));
  html = head + html.slice(headEnd);
  html = html.replace(`<h1 class="hero-title">${hero}`, `<h1 class="hero-title">${total}`);

  fs.writeFileSync(full, html);
  updated.push(`${file} ${hero} -> ${total}`);
});

console.log(updated.length ? updated.join('\n') : 'all counts already in sync');
