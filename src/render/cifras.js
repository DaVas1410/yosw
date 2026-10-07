// "Cifras" band: the congress's headline numbers, from src/data/cifras.json
// (value, optional prefix/suffix, bilingual label and one-line detail).
// Numbers count up when scrolled into view (src/client/cifras.js).

import { t } from '../lib/i18n.js';

const COLORS = ['#7db6e8', '#6fd3de', '#a9d981', '#f2c66d', '#f4a07a', '#c9a8f0'];

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function renderCifras({ lang, cifras }) {
  return `<section class="cifras" aria-label="${escapeHtml(t(lang, 'cifras.aria'))}">
  <div class="wrap cifras__grid" data-reveal-stagger>
    ${cifras
      .map(
        (c, i) => `<div class="cifras__stat">
      <b style="color: ${COLORS[i % COLORS.length]}">${c.prefijo ? escapeHtml(c.prefijo) : ''}<span class="cifras__num" data-count="${c.valor}">${c.valor}</span>${c.sufijo ? escapeHtml(c.sufijo) : ''}</b>
      <span class="cifras__label">${escapeHtml(c.etiqueta[lang])}</span>
      ${c.detalle ? `<small class="cifras__detail">${escapeHtml(c.detalle[lang])}</small>` : ''}
    </div>`
      )
      .join('\n    ')}
  </div>
</section>

<style>
  .cifras {
    background: var(--y-blue-dk);
    color: #fff;
    padding: clamp(2.5rem, 6vh, 3.5rem) 0;
    position: relative;
  }
  .cifras::before,
  .cifras::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 6px;
    background: var(--grad-spectrum);
  }
  .cifras::before { top: 0; }
  .cifras::after { bottom: 0; }
  .cifras__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(1.75rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem);
    text-align: center;
  }
  .cifras__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }
  .cifras__stat b {
    font-family: var(--font-display);
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    font-weight: 800;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .cifras__label {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    opacity: 0.92;
  }
  .cifras__detail {
    font-size: 0.75rem;
    opacity: 0.68;
    line-height: 1.35;
    max-width: 22ch;
  }
  @media (max-width: 760px) {
    .cifras__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>

<script src="../client/cifras.js" defer></script>`;
}
