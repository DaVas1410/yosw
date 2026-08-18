// Ported from the inline <script> in src/components/data/LiveStats.astro
// (fetches the live Google Sheet, calls parseSheetRows()). TypeScript type
// annotations removed; logic unchanged.

import { parseSheetRows } from '/lib/live-stats.js';

function animateTo(el, target) {
  const duration = 800;
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(target * progress);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function init() {
  const root = document.querySelector('.live-stats');
  if (!root) return;
  const sheetUrl = root.dataset.sheetUrl;
  const soonLabel = root.dataset.soonLabel ?? '';
  const tiles = root.querySelectorAll('.live-stats__tile');

  const showSoon = () => {
    tiles.forEach((tile) => {
      const valueEl = tile.querySelector('[data-role="value"]');
      if (valueEl) valueEl.textContent = soonLabel;
    });
  };

  if (!sheetUrl) {
    showSoon();
    return;
  }

  try {
    const res = await fetch(sheetUrl);
    if (!res.ok) throw new Error('fetch failed');
    const json = await res.json();
    const counts = parseSheetRows(json);
    tiles.forEach((tile) => {
      const metric = tile.dataset.metric ?? '';
      const valueEl = tile.querySelector('[data-role="value"]');
      if (!valueEl) return;
      const value = counts[metric];
      if (typeof value === 'number' && !Number.isNaN(value)) {
        valueEl.classList.remove('is-placeholder');
        animateTo(valueEl, value);
      } else {
        valueEl.textContent = soonLabel;
      }
    });
  } catch {
    showSoon();
  }
}

init();
