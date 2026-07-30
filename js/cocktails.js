/* Cocktail compendium renderer.
   The catalogue has no photography, so each drink is drawn as its own glassware
   filled with the drink's actual colour. */

document.addEventListener('DOMContentLoaded', () => {
  const rows = window.COCKTAIL_DATA || [];
  const cardsContainer = document.getElementById('cardsContainer');
  if (!cardsContainer || rows.length === 0) return;

  const searchInput = document.getElementById('searchInput');
  const eraSelect = document.getElementById('eraSelect');
  const glassSelect = document.getElementById('glassSelect');
  const sortSelect = document.getElementById('sortSelect');
  const countBadge = document.getElementById('countBadge');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const modalBackdrop = document.getElementById('detailModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');

  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const IMAGES = window.COCKTAIL_IMAGES || {};

  const slugify = (s) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const data = rows.map(([name, base, era, glass, method, ingredients, garnish, history, colour, tip], i) => ({
    id: 'cocktail-' + String(i + 1).padStart(3, '0'),
    index: String(i + 1).padStart(3, '0'),
    name, base, era, glass, method, ingredients, garnish, history, colour,
    tip: tip || '',
    photo: IMAGES[slugify(name)] || null
  }));

  let activeBase = 'all';
  let lastFocused = null;

  // --------------------------------------------------
  // GLASSWARE ILLUSTRATION
  // --------------------------------------------------
  const GLASS_SHAPE = {
    'rocks glass': 'rocks', 'coupe glass': 'coupe', 'martini glass': 'martini',
    'collins glass': 'highball', 'highball glass': 'highball', 'flute': 'flute',
    'wine glass': 'wine', 'copper mug': 'mug', 'irish coffee mug': 'mug',
    'pint glass': 'highball', 'tiki mug': 'tiki', 'hurricane glass': 'hurricane',
    'julep tin': 'julep', 'reservoir glass': 'reservoir'
  };

  const SHAPES = {
    coupe: { liquid: 'M20,30 C20,54 33,62 50,62 C67,62 80,54 80,30 Z', outline: 'M18,28 C18,56 32,66 50,66 C68,66 82,56 82,28 Z M50,66 V92 M32,94 H68' },
    martini: { liquid: 'M24,32 H76 L50,58 Z', outline: 'M16,26 H84 L50,64 Z M50,64 V92 M32,94 H68' },
    rocks: { liquid: 'M29,52 L32,90 H68 L71,52 Z', outline: 'M26,34 L30,92 H70 L74,34 Z' },
    highball: { liquid: 'M35,38 L37,93 H63 L65,38 Z', outline: 'M33,14 L36,96 H64 L67,14 Z' },
    flute: { liquid: 'M41,26 C41,50 45,58 50,60 C55,58 59,50 59,26 Z', outline: 'M39,12 C39,52 44,62 50,64 C56,62 61,52 61,12 Z M50,64 V92 M36,94 H64' },
    wine: { liquid: 'M29,34 C29,54 38,62 50,64 C62,62 71,54 71,34 Z', outline: 'M26,20 C26,56 36,66 50,68 C64,66 74,56 74,20 Z M50,68 V92 M32,94 H68' },
    mug: { liquid: 'M31,40 H65 V90 H31 Z', outline: 'M28,26 H68 V92 H28 Z M68,38 C86,38 86,68 68,68' },
    tiki: { liquid: 'M33,38 L36,92 H64 L67,38 Z', outline: 'M30,18 L34,94 H66 L70,18 Z M38,34 H62 M40,50 H60' },
    hurricane: { liquid: 'M35,40 C32,52 36,60 39,66 C36,76 36,84 39,89 H61 C64,84 64,76 61,66 C64,60 68,52 65,40 Z', outline: 'M32,18 C28,44 34,54 38,62 C34,74 34,86 38,92 H62 C66,86 66,74 62,62 C66,54 72,44 68,18 Z' },
    julep: { liquid: 'M31,44 L34,90 H66 L69,44 Z', outline: 'M28,28 L32,94 H68 L72,28 Z M28,34 H72' },
    reservoir: { liquid: 'M36,42 H64 V52 C64,62 58,66 50,66 C42,66 36,62 36,52 Z', outline: 'M34,24 H66 V52 C66,64 59,70 50,70 C41,70 34,64 34,52 Z M50,70 V92 M34,94 H66' }
  };

  function glassSVG(glassName, colour) {
    const shape = SHAPES[GLASS_SHAPE[String(glassName).toLowerCase()] || 'rocks'];
    return `
      <svg class="glass-svg" viewBox="0 0 100 104" aria-hidden="true" focusable="false">
        <path d="${shape.liquid}" fill="${esc(colour)}" opacity="0.9"></path>
        <path d="${shape.outline}" fill="none" stroke="currentColor" stroke-width="2.4"
              stroke-linecap="round" stroke-linejoin="round" opacity="0.75"></path>
      </svg>`;
  }

  // --------------------------------------------------
  // HOW TO MAKE
  // --------------------------------------------------
  function buildSteps(c) {
    const glass = c.glass.toLowerCase();
    const steps = [];

    const rinse = c.ingredients.find(([m]) => /rinse/i.test(m));
    if (rinse) steps.push(`Rinse the ${glass} with ${rinse[1].replace(/,.*$/, '')} and tip away the excess.`);

    switch (c.method) {
      case 'Shaken':
        steps.push('Chill the glass while you work.');
        steps.push('Add every remaining ingredient to a shaker with cubed ice.');
        steps.push('Shake hard for 10 to 12 seconds, until the tin frosts over.');
        steps.push(`Double strain into the ${glass}.`);
        break;
      case 'Stirred':
        steps.push('Chill the glass while you work.');
        steps.push('Add every remaining ingredient to a mixing glass filled with cubed ice.');
        steps.push('Stir 20 to 30 seconds, until properly chilled and diluted.');
        steps.push(`Strain into the ${glass}.`);
        break;
      case 'Built':
        steps.push(`Fill the ${glass} with fresh ice.`);
        steps.push('Add the ingredients in the order listed above.');
        steps.push('Stir briefly to combine, without knocking out the carbonation.');
        break;
      case 'Swizzled':
        steps.push(`Pack the ${glass} with crushed ice.`);
        steps.push('Add every remaining ingredient.');
        steps.push('Swizzle with a bar spoon until the outside of the glass frosts.');
        steps.push('Cap with a fresh crown of crushed ice.');
        break;
      case 'Blended':
        steps.push('Add every ingredient to a blender with a scoop of crushed ice.');
        steps.push('Blend about 15 seconds, until completely smooth.');
        steps.push(`Pour into the ${glass}.`);
        break;
      default:
        steps.push(`Combine and serve in the ${glass}.`);
    }

    steps.push(/^none/i.test(c.garnish) ? 'Serve without garnish.' : `Garnish with ${c.garnish.toLowerCase()}.`);
    if (c.tip) steps.push(c.tip);
    return steps;
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  function cardHTML(c) {
    const pours = c.ingredients.map(([measure, item]) =>
      `<li><span class="pour-measure">${esc(measure)}</span><span>${esc(item)}</span></li>`).join('');

    const photo = c.photo
      ? `<img class="entry-photo" src="images/cocktails/${esc(c.photo.f)}" alt="" loading="lazy" decoding="async">`
      : '';

    return `
      <article class="cocktail-entry" data-id="${esc(c.id)}" tabindex="0" role="button"
               aria-label="${esc(c.name)}. Open full recipe and history.">
        ${photo}
        <div class="cocktail-entry-head" style="color: ${esc(c.colour)};">
          ${glassSVG(c.glass, c.colour)}
          <div>
            <span class="cocktail-entry-index">No. ${esc(c.index)}</span>
            <h3 class="cocktail-entry-name">${esc(c.name)}</h3>
            <span class="cocktail-entry-meta">${esc(c.base)} &bull; ${esc(c.method)}</span>
          </div>
        </div>
        <ul class="cocktail-pours">${pours}</ul>
        <div class="cocktail-entry-foot">
          <span>${esc(c.glass)}</span>
          <span>${esc(c.era)}</span>
        </div>
      </article>`;
  }

  function render() {
    const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const era = eraSelect ? eraSelect.value : 'all';
    const glass = glassSelect ? glassSelect.value : 'all';
    const sort = sortSelect ? sortSelect.value : 'default';

    let list = data.filter(c => {
      if (activeBase !== 'all' && c.base.toLowerCase() !== activeBase.toLowerCase()) return false;
      if (era !== 'all' && c.era !== era) return false;
      if (glass !== 'all' && c.glass !== glass) return false;
      if (term) {
        const hay = `${c.name} ${c.base} ${c.glass} ${c.method} ${c.era} ${c.ingredients.map(i => i[1]).join(' ')}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });

    if (sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'simple') list = list.slice().sort((a, b) => a.ingredients.length - b.ingredients.length);
    else if (sort === 'complex') list = list.slice().sort((a, b) => b.ingredients.length - a.ingredients.length);

    cardsContainer.innerHTML = list.length
      ? list.map(cardHTML).join('')
      : `<div class="empty-state">
           <p class="empty-state-title">No cocktails match that selection</p>
           <p class="empty-state-hint">Try a different base spirit, glass or search term.</p>
         </div>`;

    if (countBadge) countBadge.textContent = `Showing ${list.length} of ${data.length} cocktails`;
  }

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------
  function openModal(id, trigger) {
    const c = data.find(x => x.id === id);
    if (!c || !modalBackdrop || !modalBody) return;

    const pours = c.ingredients.map(([measure, item]) =>
      `<li><span class="pour-measure">${esc(measure)}</span><span>${esc(item)}</span></li>`).join('');
    const steps = buildSteps(c).map(s => `<li>${esc(s)}</li>`).join('');

    const visual = c.photo
      ? `<div class="modal-cocktail-photo" style="color: ${esc(c.colour)}; background-image: url('images/cocktails/${esc(c.photo.f)}');">
           ${glassSVG(c.glass, c.colour)}
         </div>`
      : `<div class="modal-cocktail-visual" style="color: ${esc(c.colour)};">${glassSVG(c.glass, c.colour)}</div>`;

    modalBody.innerHTML = `
      <p class="modal-eyebrow">${esc(c.base)} &bull; ${esc(c.era)}</p>
      <h2 class="modal-title" id="detailModalTitle">${esc(c.name)}</h2>
      <p class="modal-producer">${esc(c.glass)} &bull; ${esc(c.method)}</p>

      ${visual}

      <section class="modal-section">
        <h3 class="modal-section-title">Recipe</h3>
        <ul class="cocktail-pours modal-pours">${pours}</ul>
        <p class="signature-garnish">Garnish: ${esc(c.garnish)}</p>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">How to Make It</h3>
        <ol class="cocktail-steps">${steps}</ol>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">History</h3>
        <p class="modal-notes">${esc(c.history)}</p>
      </section>`;

    lastFocused = trigger || document.activeElement;
    modalBackdrop.classList.add('open');
    modalBackdrop.removeAttribute('aria-hidden');
    document.body.classList.add('modal-open');
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeModal() {
    if (!modalBackdrop || !modalBackdrop.classList.contains('open')) return;
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  // --------------------------------------------------
  // EVENTS
  // --------------------------------------------------
  cardsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.cocktail-entry');
    if (card) openModal(card.getAttribute('data-id'), card);
  });

  cardsContainer.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.cocktail-entry');
    if (!card) return;
    e.preventDefault();
    openModal(card.getAttribute('data-id'), card);
  });

  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    activeBase = btn.getAttribute('data-base') || 'all';
    render();
  }));

  if (searchInput) searchInput.addEventListener('input', render);
  [eraSelect, glassSelect, sortSelect].forEach(s => s && s.addEventListener('change', render));
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
    modalBackdrop.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = modalBackdrop.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  if (glassSelect) {
    const glasses = Array.from(new Set(data.map(c => c.glass))).sort();
    glassSelect.innerHTML = '<option value="all">All Glassware</option>' +
      glasses.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('');
  }

  render();
});
