/* Main Application Logic for Spirits Encyclopedia & Field Guides */

document.addEventListener('DOMContentLoaded', () => {
  const cardsContainer = document.getElementById('cardsContainer');
  const searchInput = document.getElementById('searchInput');
  const styleSelect = document.getElementById('styleSelect');
  const regionSelect = document.getElementById('regionSelect');
  const sortSelect = document.getElementById('sortSelect');
  const countBadge = document.getElementById('countBadge');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const modalBackdrop = document.getElementById('detailModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');

  const dataset = window.SPIRIT_DATA || [];
  if (!cardsContainer || dataset.length === 0) return;

  const category = window.SPIRIT_TYPE || 'rum';
  const isWine = category === 'wine';
  const isChampagne = category === 'champagne';
  const isBeer = category === 'beer';

  let currentCategoryFilter = 'all';
  let activeRegionFilter = 'all';
  let lastFocusedElement = null;

  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  function initDynamicDropdowns() {
    if (styleSelect) {
      const styles = Array.from(new Set(dataset.map(item => item.style).filter(Boolean))).sort();
      styleSelect.innerHTML = '<option value="all">All Styles</option>' +
        styles.map(st => `<option value="${esc(st)}">${esc(st)}</option>`).join('');
    }

    if (regionSelect) {
      const regions = Array.from(new Set(dataset.map(item => item.region).filter(Boolean))).sort();
      regionSelect.innerHTML = '<option value="all">All Regions</option>' +
        regions.map(rg => `<option value="${esc(rg)}">${esc(rg)}</option>`).join('');
    }
  }

  // --------------------------------------------------
  // RENDER CARD (WINE, CHAMPAGNE, BEER OR GENERAL SPIRIT)
  // --------------------------------------------------
  function createSpiritCardHTML(item) {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const maxAbv = 75;
    const minAbv = 3;
    const abvPercent = Math.min(Math.max((item.abv - minAbv) / (maxAbv - minAbv), 0.12), 1);
    const strokeDashoffset = circumference - (abvPercent * circumference);

    const tagsHTML = (item.flavorTags || []).map(tag => `<span class="tag-pill">${esc(tag)}</span>`).join('');

    let badgesHTML = '';
    let sourceLabel = 'ORIGIN / SOURCE';

    if (isWine) {
      sourceLabel = 'GRAPE VARIETALS';
      const colorBg = item.color === 'RED' ? '#8b263e' : (item.color === 'WHITE' ? '#d4af37' : (item.color === 'ORANGE' ? '#d97736' : '#e69c37'));
      badgesHTML = `
        <div class="serve-buttons">
          <div class="serve-btn active" style="background-color: ${esc(colorBg)}; color: #fff; border-color: ${esc(colorBg)};">${esc(item.color || 'RED')}</div>
          <div class="serve-btn active" style="background-color: rgba(255,255,255,0.1); color: var(--text-title);">${esc(item.serveTemp || '16-18°C')}</div>
          <div class="serve-btn active" style="background-color: rgba(0,0,0,0.3); color: var(--accent-primary); border-color: var(--border-card);">${esc(item.decant || 'DECANT 60M')}</div>
        </div>
      `;
    } else if (isChampagne) {
      sourceLabel = 'GRAPE BLEND';
      badgesHTML = `
        <div class="serve-buttons">
          <div class="serve-btn active" style="background-color: #f3cf7a; color: #120e0b; font-weight: 700; border-color: #f3cf7a;">${esc(item.champagneType || 'PRESTIGE')}</div>
          <div class="serve-btn active" style="background-color: rgba(243, 207, 122, 0.15); color: var(--text-title); border-color: rgba(243, 207, 122, 0.4);">${esc(item.leesAging || 'LEES AGED')}</div>
          <div class="serve-btn active" style="background-color: rgba(0,0,0,0.3); color: var(--accent-primary); border-color: var(--border-card);">${esc(item.dosage || 'BRUT')}</div>
        </div>
      `;
    } else if (isBeer) {
      sourceLabel = 'MALT BILL / HOPS';
      badgesHTML = `
        <div class="serve-buttons">
          <div class="serve-btn active" style="background-color: #c98b1d; color: #17110a; font-weight: 700; border-color: #c98b1d;">${esc(item.beerStyle || 'LAGER')}</div>
          <div class="serve-btn active" style="background-color: rgba(255,255,255,0.1); color: var(--text-title);">${esc(item.serveTemp || '6-8°C')}</div>
          <div class="serve-btn active" style="background-color: rgba(0,0,0,0.3); color: var(--accent-primary); border-color: var(--border-card);">${esc(item.ibu || 'IBU 20')}</div>
        </div>
      `;
    } else {
      const modes = item.serveModes || {};
      badgesHTML = `
        <div class="serve-buttons">
          <div class="serve-btn ${modes.neat ? 'active' : ''}">NEAT</div>
          <div class="serve-btn ${modes.ice ? 'active' : ''}">ON ICE</div>
          <div class="serve-btn ${modes.cocktail ? 'active' : ''}">COCKTAIL</div>
        </div>
      `;
    }

    return `
      <article class="rum-card" data-id="${esc(item.id)}" tabindex="0" role="button"
               aria-label="${esc(item.name)}, ${esc(item.abv)} percent alcohol. Open full field notes.">
        <div class="card-header-meta">
          <span class="card-region">${esc(item.region)}</span>
          <span class="card-index">${esc(item.index)}</span>
        </div>

        <h3 class="card-title">${esc(item.name)}</h3>
        <p class="card-subtitle">${esc(item.distillery)} (${esc(item.country)})</p>

        <div class="card-abv-section">
          <div class="abv-ring-wrapper">
            <svg class="abv-ring-svg" viewBox="0 0 60 60" aria-hidden="true" focusable="false">
              <circle class="abv-ring-bg" cx="30" cy="30" r="${radius}"></circle>
              <circle class="abv-ring-fill" cx="30" cy="30" r="${radius}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${strokeDashoffset}"></circle>
            </svg>
            <span class="abv-text">${esc(item.abv)}%</span>
          </div>
          <div class="abv-details">
            <span class="abv-details-label">${esc(sourceLabel)}</span>
            <span class="abv-details-val">${esc(item.distilledFrom || 'HERITAGE STILLS')}</span>
          </div>
        </div>

        <div class="flavor-tags">
          ${tagsHTML}
        </div>

        ${badgesHTML}

        <div class="signature-pour">
          <span class="pour-label">SIGNATURE POUR</span>
          <span class="pour-text">${esc(item.signaturePour)}</span>
        </div>

        <p class="field-notes">&ldquo;${esc(item.description)}&rdquo;</p>
      </article>
    `;
  }

  // --------------------------------------------------
  // FILTER & RENDER LOGIC
  // --------------------------------------------------
  function matchesCategoryFilter(item) {
    if (currentCategoryFilter === 'all') return true;

    if (isBeer) {
      const target = currentCategoryFilter.replace(/-/g, ' ').toUpperCase();
      return String(item.beerStyle || '').toUpperCase() === target;
    }

    if (isWine) {
      if (currentCategoryFilter === 'decant') return /DECANT/i.test(item.decant || '');
      return String(item.color || '').toUpperCase() === currentCategoryFilter.toUpperCase();
    }

    if (isChampagne) {
      const type = String(item.champagneType || '').toUpperCase();
      if (currentCategoryFilter === 'blanc-de-blancs') return type.includes('BLANC DE BLANCS');
      if (currentCategoryFilter === 'blanc-de-noirs') return type.includes('BLANC DE NOIRS');
      if (currentCategoryFilter === 'rose') return type.includes('ROSE') || type.includes('ROSÉ');
      if (currentCategoryFilter === 'prestige') return type.includes('PRESTIGE');
      if (currentCategoryFilter === 'lees') return Number(item.leesYears) >= 6;
      return true;
    }

    const modes = item.serveModes || {};
    return Boolean(modes[currentCategoryFilter]);
  }

  function filterAndRender() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedStyle = styleSelect ? styleSelect.value : 'all';
    const selectedRegion = regionSelect ? regionSelect.value : 'all';
    const sortVal = sortSelect ? sortSelect.value : 'default';

    const filtered = dataset.filter(item => {
      if (!matchesCategoryFilter(item)) return false;

      if (selectedStyle !== 'all' && String(item.style).toLowerCase() !== selectedStyle.toLowerCase()) return false;

      const effectiveRegion = activeRegionFilter !== 'all' ? activeRegionFilter : selectedRegion;
      if (effectiveRegion !== 'all') {
        const target = effectiveRegion.toLowerCase();
        const inRegion = String(item.region).toLowerCase().includes(target);
        const inCountry = String(item.country).toLowerCase().includes(target);
        if (!inRegion && !inCountry) return false;
      }

      if (searchTerm) {
        const haystack = `${item.name} ${item.distillery} ${item.country} ${item.region} ${item.style} ${(item.flavorTags || []).join(' ')}`.toLowerCase();
        if (!haystack.includes(searchTerm)) return false;
      }

      return true;
    });

    if (sortVal === 'abv-high') filtered.sort((a, b) => b.abv - a.abv);
    else if (sortVal === 'abv-low') filtered.sort((a, b) => a.abv - b.abv);
    else if (sortVal === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-title">No items found matching your selection</p>
          <p class="empty-state-hint">Try adjusting your filter selection, region, or search keywords.</p>
        </div>
      `;
    } else {
      cardsContainer.innerHTML = filtered.map(createSpiritCardHTML).join('');
    }

    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} of ${dataset.length} items`;
    }
  }

  // --------------------------------------------------
  // EVENT LISTENERS
  // --------------------------------------------------
  cardsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.rum-card');
    if (card) openDetailModal(card.getAttribute('data-id'), card);
  });

  cardsContainer.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.rum-card');
    if (!card) return;
    e.preventDefault();
    openDetailModal(card.getAttribute('data-id'), card);
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      currentCategoryFilter = btn.getAttribute('data-serve') || 'all';
      filterAndRender();
    });
  });

  if (searchInput) searchInput.addEventListener('input', filterAndRender);
  if (styleSelect) styleSelect.addEventListener('change', filterAndRender);
  if (regionSelect) regionSelect.addEventListener('change', (e) => {
    activeRegionFilter = e.target.value;
    filterAndRender();
  });
  if (sortSelect) sortSelect.addEventListener('change', filterAndRender);

  // Called by map pin clicks; only syncs the dropdown when the region exists as an option.
  window.setMapRegionFilter = function (regionName) {
    activeRegionFilter = regionName;
    if (regionSelect) {
      const known = Array.from(regionSelect.options).some(o => o.value === regionName);
      regionSelect.value = known ? regionName : 'all';
    }
    filterAndRender();
    cardsContainer.scrollIntoView({ behavior: 'smooth' });
  };

  // --------------------------------------------------
  // MODAL LOGIC
  // --------------------------------------------------
  function buildModalHTML(item) {
    let sourceLabel = 'Distilled From';
    let detailLabel = 'Origin';
    let detailValue = item.country;

    if (isWine) {
      sourceLabel = 'Grape Blend';
      detailLabel = 'Serving Temp & Decant';
      detailValue = `${item.serveTemp} • ${item.decant}`;
    } else if (isChampagne) {
      sourceLabel = 'Grape Blend';
      detailLabel = 'Lees Aging & Dosage';
      detailValue = `${item.leesAging} • ${item.dosage}`;
    } else if (isBeer) {
      sourceLabel = 'Malt Bill & Hops';
      detailLabel = 'Serving Temp & Bitterness';
      detailValue = `${item.serveTemp} • ${item.ibu}`;
    }

    return `
      <p class="modal-eyebrow">${esc(item.region)} • ${esc(item.country)}</p>
      <h2 class="modal-title" id="detailModalTitle">${esc(item.name)}</h2>
      <p class="modal-producer">${esc(item.distillery)}</p>

      <dl class="modal-spec-grid">
        <div>
          <dt>Style / Type</dt>
          <dd>${esc(item.champagneType || item.beerStyle || item.style)}</dd>
        </div>
        <div>
          <dt>ABV</dt>
          <dd class="modal-spec-accent">${esc(item.abv)}%</dd>
        </div>
        <div>
          <dt>${esc(sourceLabel)}</dt>
          <dd>${esc(item.distilledFrom || 'Heritage Stills')}</dd>
        </div>
        <div>
          <dt>${esc(detailLabel)}</dt>
          <dd>${esc(detailValue)}</dd>
        </div>
      </dl>

      <section class="modal-section">
        <h3 class="modal-section-title">Flavor Profile</h3>
        <div class="flavor-tags">
          ${(item.flavorTags || []).map(t => `<span class="tag-pill">${esc(t)}</span>`).join('')}
        </div>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">Recommended Serving &amp; Glassware</h3>
        <p class="modal-pour">${esc(item.signaturePour)}</p>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">Field Notes &amp; History</h3>
        <p class="modal-notes">&ldquo;${esc(item.description)}&rdquo;</p>
      </section>
    `;
  }

  function openDetailModal(itemId, trigger) {
    const item = dataset.find(r => r.id === itemId);
    if (!item || !modalBackdrop || !modalBody) return;

    lastFocusedElement = trigger || document.activeElement;
    modalBody.innerHTML = buildModalHTML(item);
    modalBackdrop.classList.add('open');
    modalBackdrop.removeAttribute('aria-hidden');
    document.body.classList.add('modal-open');
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeDetailModal() {
    if (!modalBackdrop || !modalBackdrop.classList.contains('open')) return;
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedElement && document.contains(lastFocusedElement)) lastFocusedElement.focus();
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDetailModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeDetailModal();
    });

    // Keep tab focus inside the dialog while it is open.
    modalBackdrop.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modalBackdrop.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetailModal();
  });

  initDynamicDropdowns();
  filterAndRender();
});
