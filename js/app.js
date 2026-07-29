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

  let currentServeFilter = 'all'; // 'all', 'neat', 'ice', 'cocktail'
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
  // RENDER SPIRIT CARD (IMAGE MATCHING DESIGN)
  // --------------------------------------------------
  function createSpiritCardHTML(item) {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    // Map ABV to dashoffset (range 10% to 75%)
    const maxAbv = 75;
    const minAbv = 10;
    const abvPercent = Math.min(Math.max((item.abv - minAbv) / (maxAbv - minAbv), 0.15), 1);
    const strokeDashoffset = circumference - (abvPercent * circumference);

    const tagsHTML = item.flavorTags ? item.flavorTags.map(tag => `<span class="tag-pill">${tag}</span>`).join('') : '';

    const neatClass = item.serveModes && item.serveModes.neat ? 'active' : '';
    const iceClass = item.serveModes && item.serveModes.ice ? 'active' : '';
    const cocktailClass = item.serveModes && item.serveModes.cocktail ? 'active' : '';

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
            <span class="abv-details-label">ORIGIN / SOURCE</span>
            <span class="abv-details-val">${item.distilledFrom || 'HERITAGE STILLS'}</span>
          </div>
        </div>

        <div class="flavor-tags">
          ${tagsHTML}
        </div>

        <div class="serve-buttons">
          <div class="serve-btn ${neatClass}">NEAT</div>
          <div class="serve-btn ${iceClass}">ON ICE</div>
          <div class="serve-btn ${cocktailClass}">COCKTAIL</div>
        </div>

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
      // Serve preference top buttons
      if (currentServeFilter === 'neat' && (!item.serveModes || !item.serveModes.neat)) return false;
      if (currentServeFilter === 'ice' && (!item.serveModes || !item.serveModes.ice)) return false;
      if (currentServeFilter === 'cocktail' && (!item.serveModes || !item.serveModes.cocktail)) return false;

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
          <p style="font-size: 0.9rem; color: var(--text-muted);">Try adjusting your serve preference, region, or search keywords.</p>
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
      currentServeFilter = btn.getAttribute('data-serve') || 'all';
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

    modalBody.innerHTML = `
      <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-primary); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem;">
        ${item.region} • ${item.country}
      </div>
      <h2 style="font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-title); line-height: 1.2; margin-bottom: 0.5rem;">${item.name}</h2>
      <p style="font-size: 1rem; color: var(--text-body); margin-bottom: 1.5rem;">${item.distillery}</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background-color: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; border: 1px solid var(--border-card);">
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">Style</span>
          <strong style="color: var(--text-title);">${item.style}</strong>
        </div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">ABV</span>
          <strong style="color: var(--accent-primary);">${item.abv}%</strong>
        </div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">Distilled From</span>
          <strong style="color: var(--text-title);">${item.distilledFrom || 'Heritage Stills'}</strong>
        </div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">Origin</span>
          <strong style="color: var(--text-title);">${item.country}</strong>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 0.5rem;">Flavor Profile</h4>
        <div class="flavor-tags">
          ${(item.flavorTags || []).map(t => `<span class="tag-pill">${t}</span>`).join('')}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 0.25rem;">Recommended Signature Pour</h4>
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
