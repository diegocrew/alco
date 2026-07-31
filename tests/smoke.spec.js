const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* Every catalogue page, paired with the dataset it is expected to render. */
const PAGES = [
  ['rum.html', 'rums.js'],
  ['vodka.html', 'vodkas.js'],
  ['whisky.html', 'whiskies.js'],
  ['wine.html', 'wines.js'],
  ['gin.html', 'gins.js'],
  ['cognac.html', 'cognacs.js'],
  ['brandy.html', 'brandies.js'],
  ['tequila.html', 'tequilas.js'],
  ['champagne.html', 'champagnes.js'],
  ['beer.html', 'beers.js'],
  ['absinthe.html', 'absinthes.js'],
  ['liqueur.html', 'liqueurs.js'],
  ['cocktails.html', 'cocktails.js']
];

function datasetSize(file) {
  if (file === 'cocktails.js') {
    global.window = {};
    require(path.join(ROOT, 'data', file));
    return global.window.COCKTAIL_DATA.length;
  }
  let size = 0;
  global.window = { defineCatalog: (type, prefix, rows) => { size = rows.length; } };
  delete require.cache[require.resolve(path.join(ROOT, 'data', file))];
  require(path.join(ROOT, 'data', file));
  return size;
}

test.describe('catalogue pages', () => {
  for (const [page, dataFile] of PAGES) {
    const expected = datasetSize(dataFile);
    const cardSelector = page === 'cocktails.html' ? '.cocktail-entry' : '.rum-card';

    test(`${page} renders every item without console errors`, async ({ page: browserPage }) => {
      const errors = [];
      browserPage.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      browserPage.on('pageerror', e => errors.push(e.message));

      await browserPage.goto(`/${page}`);
      await expect(browserPage.locator(`#cardsContainer ${cardSelector}`)).toHaveCount(expected);
      await expect(browserPage.locator('#countBadge')).toContainText(String(expected));
      expect(errors).toEqual([]);
    });

    test(`${page} sorts by popularity`, async ({ page: browserPage }) => {
      await browserPage.goto(`/${page}`);
      await browserPage.selectOption('#sortSelect', 'popular');

      const reaches = await browserPage.$$eval(
        page === 'cocktails.html' ? '.cocktail-entry-foot' : '.card-reach',
        nodes => nodes.map(n => Number((n.textContent.match(/(\d+)/) || [])[1]))
      );

      expect(reaches.length).toBeGreaterThan(10);
      const sorted = [...reaches].sort((a, b) => b - a);
      expect(reaches).toEqual(sorted);
    });
  }
});

test('a card opens its detail modal', async ({ page }) => {
  await page.goto('/whisky.html');
  await page.locator('#cardsContainer .rum-card').first().click();
  await expect(page.locator('#detailModal')).toHaveClass(/open/);
  await expect(page.locator('#modalBody')).toContainText('Global Reach');
  await page.keyboard.press('Escape');
  await expect(page.locator('#detailModal')).not.toHaveClass(/open/);
});

test('filter state survives a reload through the URL', async ({ page }) => {
  await page.goto('/brandy.html?filter=ice&sort=popular');
  await expect(page.locator('.filter-btn[data-serve="ice"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sortSelect')).toHaveValue('popular');

  await page.selectOption('#sortSelect', 'name');
  await expect(page).toHaveURL(/sort=name/);
});

test('the map loads lazily and its pins filter the catalogue', async ({ page }) => {
  test.slow();
  const total = datasetSize('rums.js');

  // Leaflet must not be part of the delivered document; js/map.js injects it later.
  const markup = await (await page.request.get('/rum.html')).text();
  expect(markup).not.toContain('leaflet');

  await page.goto('/rum.html');
  await page.locator('#map').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => typeof window.L !== 'undefined', null, { timeout: 30000 });
  await expect(page.locator('#map .leaflet-marker-icon').first()).toBeVisible({ timeout: 30000 });

  await page.locator('#map .leaflet-marker-icon').first().click();
  await page.locator('.map-popup-btn').click();
  await expect(page.locator('#countBadge')).toHaveText(new RegExp(`^Showing (?!${total}\\b)\\d+ of ${total} items$`));
});

test('the hidden back bar stays out of the navigation', async ({ page }) => {
  for (const [file] of PAGES) {
    if (file === 'cocktails.html') continue;
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    expect(html).not.toContain('cocktails.html');
  }
  await page.goto('/cocktails.html');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
