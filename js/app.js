/* Main Application Logic for Rum Encyclopedia & Field Guide */

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

  if (!window.RUM_DATA || !cardsContainer) return;

  let currentServeFilter = 'all'; // 'all', 'neat', 'ice', 'cocktail'
  let activeRegionFilter = 'all';

  // --------------------------------------------------
  // RENDER RUM CARD (IMAGE MATCHING DESIGN)
  // --------------------------------------------------
  function createRumCardHTML(rum) {
    // Generate SVG ring stroke dash values based on ABV
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    // Map ABV (range 35% - 75%) to dashoffset
    const abvPercent = Math.min(Math.max((rum.abv - 30) / 45, 0.15), 1);
    const strokeDashoffset = circumference - (abvPercent * circumference);

    const tagsHTML = rum.flavorTags.map(tag => `<span class="tag-pill">${tag}</span>`).join('');

    const neatClass = rum.serveModes.neat ? 'active' : '';
    const iceClass = rum.serveModes.ice ? 'active' : '';
    const cocktailClass = rum.serveModes.cocktail ? 'active' : '';

    return `
      <article class="rum-card" data-id="${rum.id}">
        <div class="card-header-meta">
          <span class="card-region">${rum.region}</span>
          <span class="card-index">${rum.index}</span>
        </div>
        
        <h3 class="card-title">${rum.name}</h3>
        <p class="card-subtitle">${rum.distillery} (${rum.country})</p>
        
        <div class="card-abv-section">
          <div class="abv-ring-wrapper">
            <svg class="abv-ring-svg" viewBox="0 0 60 60">
              <circle class="abv-ring-bg" cx="30" cy="30" r="${radius}"></circle>
              <circle class="abv-ring-fill" cx="30" cy="30" r="${radius}" 
                      stroke-dasharray="${circumference}" 
                      stroke-dashoffset="${strokeDashoffset}"></circle>
            </svg>
            <span class="abv-text">${rum.abv}%</span>
          </div>
          <div class="abv-details">
            <span class="abv-details-label">DISTILLED FROM</span>
            <span class="abv-details-val">${rum.distilledFrom}</span>
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
          <span class="pour-text">${rum.signaturePour}</span>
        </div>

        <p class="field-notes">"${rum.description}"</p>
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

    let filtered = window.RUM_DATA.filter(rum => {
      // Serve preference top buttons
      if (currentServeFilter === 'neat' && !rum.serveModes.neat) return false;
      if (currentServeFilter === 'ice' && !rum.serveModes.ice) return false;
      if (currentServeFilter === 'cocktail' && !rum.serveModes.cocktail) return false;

      // Style selector
      if (selectedStyle !== 'all' && rum.style.toLowerCase() !== selectedStyle.toLowerCase()) return false;

      // Region selector or map filter
      const effectiveRegion = activeRegionFilter !== 'all' ? activeRegionFilter : selectedRegion;
      if (effectiveRegion !== 'all') {
        const rumRegionLower = rum.region.toLowerCase();
        const rumCountryLower = rum.country.toLowerCase();
        const targetLower = effectiveRegion.toLowerCase();
        if (!rumRegionLower.includes(targetLower) && !rumCountryLower.includes(targetLower)) return false;
      }

      // Search query match
      if (searchTerm) {
        const haystack = `${rum.name} ${rum.distillery} ${rum.country} ${rum.region} ${rum.style} ${rum.flavorTags.join(' ')}`.toLowerCase();
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
          <p style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-title); margin-bottom: 0.5rem;">No rums found matching your selection</p>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Try adjusting your serve preference, region, or search keywords.</p>
        </div>
      `;
    } else {
      cardsContainer.innerHTML = filtered.map(rum => createRumCardHTML(rum)).join('');
    }

    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} of ${window.RUM_DATA.length} rums`;
    }

    // Attach click event for detail modal
    document.querySelectorAll('.rum-card').forEach(card => {
      card.addEventListener('click', () => {
        const rumId = card.getAttribute('data-id');
        openRumModal(rumId);
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
    // Scroll to cards
    cardsContainer.scrollIntoView({ behavior: 'smooth' });
  };

  // --------------------------------------------------
  // MODAL LOGIC
  // --------------------------------------------------
  function openRumModal(rumId) {
    const rum = window.RUM_DATA.find(r => r.id === rumId);
    if (!rum || !modalBackdrop || !modalBody) return;

    modalBody.innerHTML = `
      <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-primary); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem;">
        ${rum.region} • ${rum.country}
      </div>
      <h2 style="font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-title); line-height: 1.2; margin-bottom: 0.5rem;">${rum.name}</h2>
      <p style="font-size: 1rem; color: var(--text-body); margin-bottom: 1.5rem;">${rum.distillery}</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background-color: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; border: 1px solid var(--border-card);">
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">Style</span>
          <strong style="color: var(--text-title);">${rum.style}</strong>
        </div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">ABV</span>
          <strong style="color: var(--accent-primary);">${rum.abv}%</strong>
        </div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">Distilled From</span>
          <strong style="color: var(--text-title);">${rum.distilledFrom}</strong>
        </div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; text-transform: uppercase;">Origin</span>
          <strong style="color: var(--text-title);">${rum.country}</strong>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 0.5rem;">Flavor Profile</h4>
        <div class="flavor-tags">
          ${rum.flavorTags.map(t => `<span class="tag-pill">${t}</span>`).join('')}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 0.25rem;">Recommended Signature Pour</h4>
        <p style="color: var(--text-title); font-weight: 500;">${rum.signaturePour}</p>
      </div>

      <div>
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 0.5rem;">Field Notes & History</h4>
        <p style="font-family: var(--font-serif); font-style: italic; font-size: 1rem; color: var(--text-body); line-height: 1.6;">
          "${rum.description}"
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

  // Initial render
  filterAndRender();
});
