/* Lints the catalogue data and the static pages.

   Run: node tools/check-site.js        (exit code 1 on any problem) */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const HIDDEN = new Set(['cocktails.html']);

const NAV = ['index.html', 'rum.html', 'vodka.html', 'whisky.html', 'wine.html', 'gin.html',
  'cognac.html', 'brandy.html', 'tequila.html', 'champagne.html', 'beer.html',
  'absinthe.html', 'liqueur.html'];

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

// --------------------------------------------------
// DATA
// --------------------------------------------------
const catalogs = new Map();

fs.readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.js') && f !== 'cocktail-images.js' && f !== 'cocktails.js')
  .forEach(file => {
    global.window = {
      defineCatalog: (type, prefix, rows) => {
        catalogs.set(file, { type, rows });
        const seen = new Set();

        rows.forEach((row, i) => {
          const at = `${file}[${i + 1}] ${row[0]}`;
          if (row.length !== 12) fail(at, `expected 12 fields, found ${row.length}`);
          if (!row[0] || !row[1]) fail(at, 'missing name or producer');
          ['country', 'region', 'style'].forEach((label, offset) => {
            if (!row[2 + offset]) fail(at, `missing ${label}`);
          });
          if (typeof row[5] !== 'number' || row[5] < 0 || row[5] > 96) fail(at, `implausible ABV ${row[5]}`);
          if (!Array.isArray(row[7]) || row[7].length !== 4) fail(at, 'needs exactly 4 flavour tags');
          if (!row[8] || !row[9]) fail(at, 'missing pour or notes');
          if (typeof row[10] !== 'number') fail(at, 'serve-mode bitmask must be a number');

          const extras = row[11];
          if (!extras || typeof extras !== 'object') fail(at, 'missing extras object');
          else if (!Number.isInteger(extras.pop) || extras.pop < 1 || extras.pop > 99) {
            fail(at, `popularity must be an integer 1-99, found ${extras.pop}`);
          }

          const key = `${row[0]}|${row[1]}`;
          if (seen.has(key)) fail(at, 'duplicate name + producer');
          seen.add(key);
        });
      }
    };
    delete require.cache[require.resolve(path.join(DATA_DIR, file))];
    require(path.join(DATA_DIR, file));
  });

global.window = {};
delete require.cache[require.resolve(path.join(DATA_DIR, 'cocktails.js'))];
require(path.join(DATA_DIR, 'cocktails.js'));
const cocktails = global.window.COCKTAIL_DATA || [];

const cocktailNames = new Set();
cocktails.forEach((row, i) => {
  const at = `cocktails.js[${i + 1}] ${row[0]}`;
  if (row.length !== 11) fail(at, `expected 11 fields, found ${row.length}`);
  if (!Array.isArray(row[5]) || row[5].some(pair => !Array.isArray(pair) || pair.length !== 2)) {
    fail(at, 'ingredients must be [measure, item] pairs');
  }
  if (!/^#[0-9a-f]{3,8}$/i.test(String(row[8]))) fail(at, `colour must be hex, found ${row[8]}`);
  if (!Number.isInteger(row[10]) || row[10] < 1 || row[10] > 99) fail(at, `popularity must be 1-99, found ${row[10]}`);
  if (cocktailNames.has(row[0])) fail(at, 'duplicate cocktail name');
  cocktailNames.add(row[0]);
});

// --------------------------------------------------
// PAGES
// --------------------------------------------------
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

pages.forEach(file => {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const at = file;

  const required = [
    ['Content-Security-Policy meta', /http-equiv="Content-Security-Policy"/],
    ['canonical link', /rel="canonical"/],
    ['og:title', /property="og:title"/],
    ['skip link', /class="skip-link"/],
    ['main#main-content', /<main id="main-content"/]
  ];
  required.forEach(([label, re]) => { if (!re.test(html)) fail(at, `missing ${label}`); });

  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) fail(at, 'still links third-party fonts');
  if (/<script[^>]+unpkg\.com/.test(html)) fail(at, 'loads Leaflet eagerly; js/map.js handles that');
  if (/<script src=/.test(html)) fail(at, 'has a script tag without defer');
  if (/<script(?![^>]*src=)/.test(html)) fail(at, 'has an inline script, which the CSP forbids');

  const navLinks = [...html.matchAll(/<li><a href="([^"]+)" class="nav-link/g)].map(m => m[1]);
  if (HIDDEN.has(file)) {
    if (navLinks.some(href => href !== 'index.html')) fail(at, 'the hidden page must not carry the category nav');
    if (!/name="robots" content="noindex/.test(html)) fail(at, 'hidden page lost its noindex tag');
  } else if (navLinks.length) {
    if (navLinks.join(',') !== NAV.join(',')) fail(at, `nav differs from the canonical list: ${navLinks.join(',')}`);
    if (!/aria-current="page"/.test(html) && file !== 'index.html') fail(at, 'nav has no current page marked');
  }

  // The back bar stays an easter egg: only the hub may link to it, and only unlisted.
  if (!HIDDEN.has(file) && file !== 'index.html' && /cocktails\.html/.test(html)) {
    fail(at, 'links to the hidden cocktails page');
  }

  const buttons = html.match(/<button[^>]*class="filter-btn[^>]*>/g) || [];
  buttons.forEach(btn => {
    if (!/aria-pressed=/.test(btn)) fail(at, 'a filter button lacks aria-pressed');
    if (!/type="button"/.test(btn)) fail(at, 'a filter button lacks type="button"');
  });
  if (buttons.length && !/id="countBadge"[^>]*aria-live/.test(html)) fail(at, 'count badge is not announced');

  // Local references must resolve.
  [...html.matchAll(/(?:src|href)="((?!https?:|#|mailto:)[^"]+)"/g)].forEach(m => {
    const target = m[1].split('?')[0];
    if (!target || !fs.existsSync(path.join(ROOT, target))) fail(at, `broken local reference ${target}`);
  });

  // Advertised counts must match the dataset the page loads.
  const dataFile = (html.match(/src="data\/([^"]+\.js)"/) || [])[1];
  const catalog = dataFile && catalogs.get(dataFile);
  if (catalog) {
    const hero = (html.match(/<h1 class="hero-title">(\d+)/) || [])[1];
    if (hero && Number(hero) !== catalog.rows.length) {
      fail(at, `hero says ${hero} items, dataset holds ${catalog.rows.length}`);
    }
    const head = (html.match(/<title>[\s\S]*?<\/title>/) || [''])[0] +
      (html.match(/<meta name="description"[\s\S]*?>/) || [''])[0];
    [...head.matchAll(/\b(\d{2,4})\b/g)].map(m => Number(m[1]))
      .filter(n => n >= 90)
      .forEach(n => {
        if (n !== catalog.rows.length) fail(at, `head metadata advertises ${n}, dataset holds ${catalog.rows.length}`);
      });
  }
});

// --------------------------------------------------
// REPORT
// --------------------------------------------------
const items = [...catalogs.values()].reduce((sum, c) => sum + c.rows.length, 0) + cocktails.length;

if (problems.length) {
  console.error(`${problems.length} problem(s) found:\n`);
  problems.forEach(p => console.error('  ' + p));
  process.exit(1);
}

console.log(`OK - ${catalogs.size + 1} datasets, ${items} items, ${pages.length} pages`);
