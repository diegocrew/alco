/* Normalises the shared page shell across every HTML file: head metadata and CSP,
   the category navigation, accessibility attributes on the toolbar, count badge and
   modal, and deferred script loading.

   cocktails.html is deliberately unlisted: it keeps its noindex robots tag and is
   never added to the navigation.

   Run: node tools/normalize-pages.js        (rewrites *.html in place) */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://barman.mikusik.art';
const HIDDEN = new Set(['cocktails.html']);

const NAV = [
  ['index.html', 'Home'], ['rum.html', 'Rum'], ['vodka.html', 'Vodka'],
  ['whisky.html', 'Whisky'], ['wine.html', 'Wine'], ['gin.html', 'Gin'],
  ['cognac.html', 'Cognac'], ['brandy.html', 'Brandy'], ['tequila.html', 'Tequila'],
  ['champagne.html', 'Champagne'], ['beer.html', 'Beer'], ['absinthe.html', 'Absinthe'],
  ['liqueur.html', 'Liqueurs']
];

// frame-ancestors is intentionally absent: it is ignored when delivered in a meta tag.
const CSP = "default-src 'self'; " +
  "script-src 'self' https://unpkg.com; " +
  "style-src 'self' 'unsafe-inline' https://unpkg.com; " +
  "font-src 'self'; " +
  "img-src 'self' data: https://*.basemaps.cartocdn.com https://unpkg.com; " +
  "connect-src 'self'; base-uri 'self'; form-action 'none'";

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const decode = (s) => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function ensureHead(html, file) {
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  const desc = (html.match(/<meta name="description" content="([\s\S]*?)">/) || [])[1] || '';
  const canonical = `${SITE}/${file === 'index.html' ? '' : file}`;

  const block = [
    `  <meta http-equiv="Content-Security-Policy" content="${CSP}">`,
    '  <meta name="referrer" content="strict-origin-when-cross-origin">',
    '  <meta name="color-scheme" content="dark">',
    `  <link rel="canonical" href="${canonical}">`,
    '  <meta property="og:type" content="website">',
    `  <meta property="og:title" content="${attr(title)}">`,
    `  <meta property="og:description" content="${desc.replace(/\s+/g, ' ').trim()}">`,
    `  <meta property="og:url" content="${canonical}">`,
    '  <meta name="twitter:card" content="summary">'
  ].join('\n');

  // Drop any previously generated block so the script stays idempotent.
  html = html.replace(/[ \t]*<meta http-equiv="Content-Security-Policy"[\s\S]*?<meta name="twitter:card"[^>]*>\n/, '');
  html = html.replace(/[ \t]*<link rel="canonical"[^>]*>\n/, '');

  const anchor = html.match(/[ \t]*<meta name="robots"[\s\S]*?>[ \t]*\n/) ||
    html.match(/[ \t]*<meta name="description"[\s\S]*?>[ \t]*\n/) ||
    html.match(/[ \t]*<title>[\s\S]*?<\/title>[ \t]*\n/);
  if (!anchor) throw new Error(`${file}: no head anchor found`);
  return html.replace(anchor[0], anchor[0] + block + '\n');
}

function ensureSkipLink(html) {
  if (html.includes('class="skip-link"')) return html;
  return html.replace(/<body>\n/, '<body>\n\n  <a href="#main-content" class="skip-link">Skip to main content</a>\n');
}

function ensureMainId(html) {
  return html.replace(/<main(?![^>]*id=)([^>]*)>/, '<main id="main-content"$1>');
}

function ensureNav(html, file) {
  if (!/<nav[\s>]/.test(html)) return html;
  const items = NAV.map(([href, label]) => {
    const active = href === file;
    return `          <li><a href="${href}" class="nav-link${active ? ' active' : ''}"` +
      `${active ? ' aria-current="page"' : ''}>${label}</a></li>`;
  }).join('\n');

  return html.replace(/<nav[^>]*>[\s\S]*?<\/nav>/,
    '<nav aria-label="Drink categories">\n        <ul class="nav-links">\n' + items + '\n        </ul>\n      </nav>');
}

function ensureFilterButtons(html) {
  return html.replace(/<button(?![^>]*type=)([^>]*class="filter-btn[^"]*"[^>]*)>/g, '<button type="button"$1>')
    .replace(/<button([^>]*class="filter-btn([^"]*)"[^>]*)>/g, (m, inner, mods) => {
      if (/aria-pressed=/.test(inner)) return m;
      return `<button${inner} aria-pressed="${/\bactive\b/.test(mods) ? 'true' : 'false'}">`;
    });
}

function ensureFilterBar(html) {
  return html.replace(/<div class="filter-bar-container">/,
    '<div class="filter-bar-container" role="group" aria-label="Filter results">');
}

function ensureCountBadge(html) {
  // Older pages wrap the badge in an inline-styled div; collapse them onto the shared class.
  html = html.replace(/[ \t]*<div style="text-align: center; margin-bottom: 2rem;">\s*<span id="countBadge"[\s\S]*?<\/span>\s*<\/div>/,
    '    <p id="countBadge" class="count-badge" role="status" aria-live="polite"></p>');
  return html.replace(/<p id="countBadge"(?![^>]*aria-live)([^>]*)>/, '<p id="countBadge"$1 role="status" aria-live="polite">');
}

function ensureModal(html) {
  html = html.replace(/<div id="detailModal" class="modal-backdrop">/,
    '<div class="modal-backdrop" id="detailModal" role="dialog" aria-modal="true" aria-labelledby="detailModalTitle" aria-hidden="true">');
  return html.replace(/<button id="modalCloseBtn" class="modal-close-btn">/,
    '<button type="button" class="modal-close-btn" id="modalCloseBtn" aria-label="Close details">');
}

const CONTROL_LABELS = {
  searchInput: 'Search the catalogue',
  styleSelect: 'Filter by style',
  regionSelect: 'Filter by region',
  sortSelect: 'Sort results',
  eraSelect: 'Filter by era',
  glassSelect: 'Filter by glassware'
};

function ensureControlLabels(html) {
  Object.entries(CONTROL_LABELS).forEach(([id, label]) => {
    const hasVisibleLabel = new RegExp(`<label for="${id}"`).test(html);
    if (hasVisibleLabel) return;
    html = html.replace(new RegExp(`<(input|select)([^>]*id="${id}")([^>]*)>`), (m, tag, idPart, rest) => {
      if (/aria-label=/.test(rest)) return m;
      return `<${tag}${idPart}${rest} aria-label="${label}">`;
    });
  });
  return html;
}

function ensureDeferredScripts(html) {
  return html.replace(/<script src="([^"]+)"([^>]*)>/g, (m, src, rest) => {
    if (/\bdefer\b/.test(rest)) return m;
    return `<script defer src="${src}"${rest}>`;
  });
}

// Leaflet is injected by js/map.js when the map scrolls into view, so the static
// tags would only duplicate a 150 kB download on every page load.
function dropEagerLeaflet(html) {
  return html
    .replace(/[ \t]*<link rel="stylesheet" href="https:\/\/unpkg\.com\/leaflet[^\n]*\n/, '')
    .replace(/[ \t]*<script[^>]*src="https:\/\/unpkg\.com\/leaflet[^\n]*<\/script>\n/, '');
}

function useLocalFonts(html) {
  html = html.replace(/[ \t]*<link rel="preconnect" href="https:\/\/fonts\.[^\n]*\n/g, '');
  return html.replace(/[ \t]*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^\n]*\n/,
    '  <link rel="stylesheet" href="css/fonts.css">\n');
}

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const changed = [];

files.forEach(file => {
  const full = path.join(ROOT, file);
  const original = fs.readFileSync(full, 'utf8');
  const crlf = original.includes('\r\n');
  const before = crlf ? original.replace(/\r\n/g, '\n') : original;
  let html = before;

  html = ensureHead(html, file);
  html = ensureSkipLink(html);
  html = ensureMainId(html);
  if (!HIDDEN.has(file)) html = ensureNav(html, file);
  html = ensureFilterBar(html);
  html = ensureFilterButtons(html);
  html = ensureCountBadge(html);
  html = ensureModal(html);
  html = ensureControlLabels(html);
  html = ensureDeferredScripts(html);
  html = dropEagerLeaflet(html);
  html = useLocalFonts(html);

  if (html !== before) {
    fs.writeFileSync(full, crlf ? html.replace(/\n/g, '\r\n') : html);
    changed.push(file);
  }
});

console.log(`normalised ${changed.length} page(s): ${changed.join(' ') || 'none'}`);
