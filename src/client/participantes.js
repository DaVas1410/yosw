// Ported from the inline <script> in src/pages/[lang]/participantes.astro
// (search/eje/rol filter). TypeScript type annotations removed; logic
// unchanged. The participant cards are already rendered server-side (see
// src/render/participant-card.js, the source of truth for that markup) —
// this script only toggles `hidden` on the existing DOM cards based on their
// data-nombre/data-rol/data-eje attributes (data-nombre also carries the talk
// title and institution, so the search matches those). A section
// ([data-group]) with nothing visible either shows its own
// [data-group-empty] message (home page columns) or is hidden (directory).
// Used on the directory page and on the home page, which has no role filter.

import { filterParticipants } from '../lib/filter.js';

const search = document.getElementById('participantes-search');
const ejeSelect = document.getElementById('participantes-eje');
const rolSelect = document.getElementById('participantes-rol');
const grid = document.getElementById('participantes-grid');
const emptyState = document.getElementById('participantes-empty');

if (search && ejeSelect && grid) {
  const cards = Array.from(grid.querySelectorAll('[data-participant]'));
  const list = cards.map((card) => ({
    id: card.dataset.nombre ?? '',
    nombre: card.dataset.nombre ?? '',
    rol: card.dataset.rol ?? '',
    eje: card.dataset.eje ? Number(card.dataset.eje) : null,
    el: card,
  }));

  const applyFilters = () => {
    const eje = ejeSelect.value ? Number(ejeSelect.value) : undefined;
    const rol = rolSelect?.value || undefined;
    const query = search.value || undefined;
    const matches = new Set(filterParticipants(list, { eje, rol, query }).map((p) => p.el));
    let visibleCount = 0;
    for (const item of list) {
      const visible = matches.has(item.el);
      item.el.hidden = !visible;
      if (visible) visibleCount += 1;
    }
    for (const group of grid.querySelectorAll('[data-group]')) {
      const empty = !group.querySelector('[data-participant]:not([hidden])');
      const message = group.querySelector('[data-group-empty]');
      if (message) message.hidden = !empty;
      else group.hidden = empty;
    }
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  };

  search.addEventListener('input', applyFilters);
  ejeSelect.addEventListener('change', applyFilters);
  rolSelect?.addEventListener('change', applyFilters);
}
