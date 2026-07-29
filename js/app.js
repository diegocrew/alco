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

  const dataset = window.SPIRIT_DATA || window.RUM_DATA || [];
  if (!dataset || !cardsContainer) return;

  let currentCategoryFilter = 'all'; 
  let activeRegionFilter = 'all';

  // Automatically populate Style & Region dropdowns from dataset
  function initDynamicDropdowns() {
    if (styleSelect) {
      const styles = Array.from(new Set(dataset.map(item => item.style).filter(Boolean)));
      styleSelect.innerHTML = `<option value="all">All Styles</option>` + 
        styles.map(st => `<option value="${st}">${st}</option>`).join('');
    }

    if (regionSelect) {
      const regions = Array.from(new Set(dataset.map(item => item.region).filter(Boolean)));
      regionSelect.innerHTML = `<option value="all">All Regions</option>` + 
        regions.map(rg => `<option value="${rg}">${rg}</option>`).join('');
    }
  }

  // --------------------------------------------------
  // RENDER SPIRIT CARD (TAILORED FOR WINE, CHAMPAGNE OR GENERAL SPIRIT)
  // --------------------------------------------------
  function createSpiritCardHTML(item) {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    // Map ABV to dashoffset
    const maxAbv = 75;
    const minAbv = 8;
    const abvPercent = Math.min(Math.max((item.abv - minAbv) / (maxAbv - minAbv), 0.15), 1);
    const strokeDashoffset = circumference - (abvPercent * circumference);

    const tagsHTML = item.flavorTags ? item.flavorTags.map(tag => `<span class="tag-pill">${tag}</span>`).join('') : '';

    const isWine = (window.SPIRIT_TYPE === 'wine') || Boolean(item.color && item.serveTemp);
    const isChampagne = (window.SPIRIT_TYPE === 'champagne') || Boolean(item.champagneType && item.leesAging);

    let badgesHTML = '';
    let sourceLabel = 'ORIGIN / SOURCE';

    if (isWine) {
      sourceLabel = 'GRAPE VARIETALS';
      const colorBg = item.color === 'RED' ? '#8b263e' : (item.color === 'WHITE' ? '#d4af37' : (item.color === 'ORANGE' ? '#d97736' : '#e69c37'));
      badgesHTML = `
        <div class="serve-buttons">
          <div class="serve-btn active" style="background-color: ${colorBg}; color: #fff; border-color: ${colorBg};">${item.color || 'RED'}</div>
          <div class="serve-btn active" style="background-color: rgba(255,255,255,0.1); color: var(--text-title);">${item.serveTemp || '16°-18°C'}</div>
          <div class="serve-btn active" style="background-color: rgba(0,0,0,0.3); color: var(--accent-primary); border-color: var(--border-card);">${item.decant || 'DECANT 60M'}</div>
        </div>
      `;
    } else if (isChampagne) {
      sourceLabel = 'GRAPE BLEND';
      badgesHTML = `
        <div class="serve-buttons">
          <div class="serve-btn active" style="background-color: #f3cf7a; color: #120e0b; font-weight: 700; border-color: #f3cf7a;">${item.champagneType || 'PRESTIGE'}</div>
          <div class="serve-btn active" style="background-color: rgba(243, 207, 122, 0.15); color: var(--text-title); border-color: rgba(243, 207, 122, 0.4);">${item.leesAging || 'LEES AGED'}</div>
          <div class="serve-btn active" style="background-color: rgba(0,0,0,0.3); color: var(--accent-primary); border-color: var(--border-card);">${item.dosage || item.serveTemp || 'BRUT'}</div>
        </div>
      `;
    } else {
      const neatClass = item.serveModes && item.serveModes.neat ? 'active' : '';
      const iceClass = item.serveModes && item.serveModes.ice ? 'active' : '';
      const cocktailClass = item.serveModes && item.serveModes.cocktail ? 'active' : '';
      badgesHTML = `
        <div class="serve-buttons">
          <div class="serve-btn ${neatClass}">NEAT</div>
          <div class="serve-btn ${iceClass}">ON ICE</div>
          <div class="serve-btn ${cocktailClass}">COCKTAIL</div>
        </div>
      `;
    }

    return `
      <article class="rum-card" data-id="${item.id}">
        <div class="card-header-meta">
          <span class="card-region">${item.region}</span>
          <span class="card-index">${item.index}</span>
        </div>
        
        <h3 class="card-title">${item.name}</h3>
        <p class="card-subtitle">${item.distillery} (${item.country})</p>
        
        <div class="card-abv-section">
          <div class="abv-ring-wrapper">
            <svg class="abv-ring-svg" viewBox="0 0 60 60">
              <circle class="abv-ring-bg" cx="30" cy="30" r="${radius}"></circle>
              <circle class="abv-ring-fill" cx="30" cy="30" r="${radius}" 
                      stroke-dasharray="${circumference}" 
                      stroke-dashoffset="${strokeDashoffset}"></circle>
            </svg>
            <span class="abv-text">${item.abv}%</span>
          </div>
          <div class="abv-details">
            <span class="abv-details-label">${sourceLabel}</span>
            <span class="abv-details-val">${item.distilledFrom || 'HERITAGE STILLS'}</span>
          </div>
        </div>

        <div class="flavor-tags">
          ${tagsHTML}
        </div>

        ${badgesHTML}

        <div class="signature-pour">
          <span class="pour-label">SIGNATURE POUR</span>
          <span class="pour-text">${item.signaturePour}</span>
        </div>

        <p class="field-notes">"${item.description}"</p>
      </article>
    `;
  }

  // --------------------------------------------------
  // FILTER & RENDER LOGIC
  // --------------------------------------------------
  function filterAndRender() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedStyle = styleSelect ? styleSelect.value : 'all';
    const selectedRegion = regionSelect ? regionSelect.value : 'all';
    const sortVal = sortSelect ? sortSelect.value : 'default';

    let filtered = dataset.filter(item => {
      // Top filter button matching for general spirits
      if (currentCategoryFilter === 'neat' && (!item.serveModes || !item.serveModes.neat)) return false;
      if (currentCategoryFilter === 'ice' && (!item.serveModes || !item.serveModes.ice)) return false;
      if (currentCategoryFilter === 'cocktail' && (!item.serveModes || !item.serveModes.cocktail)) return false;
      
      // Wine specific top filters
      if (currentCategoryFilter === 'red' && item.color !== 'RED') return false;
      if (currentCategoryFilter === 'white' && item.color !== 'WHITE') return false;
      if (currentCategoryFilter === 'decant' && (!item.decant || !item.decant.includes('DECANT'))) return false;

      // Champagne specific top filters
      if (currentCategoryFilter === 'blanc-de-blancs' && (!item.champagneType || !item.champagneType.includes('BLANC DE BLANCS'))) return false;
      if (currentCategoryFilter === 'prestige' && (!item.champagneType || (!item.champagneType.includes('PRESTIGE') && !item.style.includes('Vintage')))) return false;
      if (currentCategoryFilter === 'lees' && (!item.leesAging || (!item.leesAging.includes('6 YRS') && !item.leesAging.includes('7 YRS') && !item.leesAging.includes('8 YRS') && !item.leesAging.includes('10 YRS') && !item.leesAging.includes('12 YRS')))) return false;

      // Style selector
      if (selectedStyle !== 'all' && item.style.toLowerCase() !== selectedStyle.toLowerCase()) return false;

      // Region selector or map filter
      const effectiveRegion = activeRegionFilter !== 'all' ? activeRegionFilter : selectedRegion;
      if (effectiveRegion !== 'all') {
        const itemRegionLower = item.region.toLowerCase();
        const itemCountryLower = item.country.toLowerCase();
        const targetLower = effectiveRegion.toLowerCase();
        if (!itemRegionLower.includes(targetLower) && !itemCountryLower.includes(targetLower)) return false;
      }

      // Search query match
      if (searchTerm) {
        const haystack = `${item.name} ${item.distillery} ${item.country} ${item.region} ${item.style} ${(item.flavorTags || []).join(' ')}`.toLowerCase();
        if (!haystack.includes(searchTerm)) return false;
      }

      return true;
    });

    // Sorting
    if (sortVal === 'abv-high') {
      filtered.sort((a, b) => b.abv - a.abv);
    } else if (sortVal === 'abv-low') {
      filtered.sort((a, b) => a.abv - b.abv);
    } else if (sortVal === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Render HTML
    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <p style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-title); margin-bottom: 0.5rem;">No items found matching your selection</p>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Try adjusting your filter selection, region, or search keywords.</p>
        </div>
      `;
    } else {
      cardsContainer.innerHTML = filtered.map(item => createSpiritCardHTML(item)).join('');
    }

    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} of ${dataset.length} items`;
    }

    // Attach click event for detail modal
    document.querySelectorAll('.rum-card').forEach(card => {
      card.addEventListener('click', () => {
        const itemId = card.getAttribute('data-id');
        openDetailModal(itemId);
      });
    });
  }

  // --------------------------------------------------
  // EVENT LISTENERS
  // --------------------------------------------------
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
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

  // Global helper for map filter synchronization
  window.setMapRegionFilter = function(regionName) {
    activeRegionFilter = regionName;
    if (regionSelect) regionSelect.value = regionName;
    filterAndRender();
    cardsContainer.scrollIntoView({ behavior: 'smooth' });
  };

  // --------------------------------------------------
  // MODAL LOGIC
  // --------------------------------------------------
  function openDetailModal(itemId) {
    const item = dataset.find(r => r.id === itemId);
    if (!item || !modalBackdrop || !modalBody) return;

    const isWine = (window.SPIRIT_TYPE === 'wine') || Boolean(item.color && item.serveTemp);
    const isChampagne = (window.SPIRIT_TYPE === 'champagne') || Boolean(item.champagneType && item.leesAging);

    let detailCol3 = 'Origin';
    let detailVal3 = item.country;
    if (isWine) {
      detailCol3 = 'Serving Temp & Decant';
      detailVal3 = `${item.serveTemp} • ${item.decant}`;
    } else if (isChampagne) {
      detailCol3 = 'Lees Aging & Dosage';
      detailVal3 = `${item.leesAging} • ${item.dosage}`;
    }

    modalBody.innerHTML = `
      <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-primary); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem;">
        ${item.region} • ${item.country}
      </div>
      <h2 style="font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-title); line-height: 1.2; margin-bottom: 0.5rem;">${item.name}</h2>
      <p style="font-size: 1rem; color: var(--text-body); margin-bottom: 1.5rem;">${item.distillery}</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background-color: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; border: 1px solid var(--border-card);">
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">Style / Type</span>
          <strong style="color: var(--text-title);">${item.champagneType || item.style}</strong>
        </div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">ABV</span>
          <strong style="color: var(--accent-primary);">${item.abv}%</strong>
        </div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">${(isWine || isChampagne) ? 'Grape Blend' : 'Distilled From'}</span>
          <strong style="color: var(--text-title);">${item.distilledFrom || 'Heritage Stills'}</strong>
        </div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">${detailCol3}</span>
          <strong style="color: var(--text-title);">${detailVal3}</strong>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 0.5rem;">Flavor Profile</h4>
        <div class="flavor-tags">
          ${(item.flavorTags || []).map(t => `<span class="tag-pill">${t}</span>`).join('')}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 0.25rem;">Recommended Serving & Glassware</h4>
        <p style="color: var(--text-title); font-weight: 500;">${item.signaturePour}</p>
      </div>

      <div>
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 0.5rem;">Field Notes & History</h4>
        <p style="font-family: var(--font-serif); font-style: italic; font-size: 1rem; color: var(--text-body); line-height: 1.6;">
          "${item.description}"
        </p>
      </div>
    `;

    modalBackdrop.classList.add('open');
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => modalBackdrop.classList.remove('open'));
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
    });
  }

  // Initial setup
  initDynamicDropdowns();
  filterAndRender();
});
