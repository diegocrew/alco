/* Downloads the Google Fonts used by the site and rewrites them as a local
   stylesheet, so pages need no third-party font requests at runtime.

   Only the latin and latin-ext subsets are kept; the catalogue text needs the
   Central European diacritics but no Cyrillic, Greek or Vietnamese glyphs.

   Run: node tools/fetch-fonts.js        (writes fonts/ and css/fonts.css) */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FONT_DIR = path.join(ROOT, 'fonts');
const CSS_FILE = path.join(ROOT, 'css', 'fonts.css');

const SOURCE = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900' +
  '&family=Inter:wght@300;400;500;600;700' +
  '&family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,400;1,600' +
  '&family=Space+Grotesk:wght@400;500;600;700&display=swap';

// A modern UA is required or Google serves legacy truetype instead of woff2.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const KEEP = new Set(['latin', 'latin-ext']);

async function main() {
  const res = await fetch(SOURCE, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Google Fonts responded ${res.status}`);
  const css = await res.text();

  fs.mkdirSync(FONT_DIR, { recursive: true });

  const blocks = css.split('/* ').slice(1);
  const out = ['/* Self-hosted copies of the four site typefaces. Regenerate with tools/fetch-fonts.js. */', ''];
  let downloaded = 0;

  for (const block of blocks) {
    const subset = block.slice(0, block.indexOf(' */')).trim();
    if (!KEEP.has(subset)) continue;

    const face = block.slice(block.indexOf('@font-face'));
    const family = (face.match(/font-family:\s*'([^']+)'/) || [])[1];
    const style = (face.match(/font-style:\s*([^;]+);/) || [])[1].trim();
    const weight = (face.match(/font-weight:\s*([^;]+);/) || [])[1].trim();
    const range = (face.match(/unicode-range:\s*([^;]+);/) || [])[1].trim();
    const url = (face.match(/url\(([^)]+)\)/) || [])[1];

    const slug = `${family.toLowerCase().replace(/\s+/g, '-')}-${style}-${weight.replace(/\s+/g, '-')}-${subset}.woff2`;
    const file = path.join(FONT_DIR, slug);

    if (!fs.existsSync(file)) {
      const font = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!font.ok) throw new Error(`${slug}: ${font.status}`);
      fs.writeFileSync(file, Buffer.from(await font.arrayBuffer()));
      downloaded++;
    }

    out.push('@font-face {');
    out.push(`  font-family: '${family}';`);
    out.push(`  font-style: ${style};`);
    out.push(`  font-weight: ${weight};`);
    out.push('  font-display: swap;');
    out.push(`  src: url('../fonts/${slug}') format('woff2');`);
    out.push(`  unicode-range: ${range};`);
    out.push('}', '');
  }

  fs.writeFileSync(CSS_FILE, out.join('\n'));
  console.log(`wrote css/fonts.css (${downloaded} new font file(s), ${fs.readdirSync(FONT_DIR).length} total)`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
