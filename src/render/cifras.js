// Ported from src/components/Cifras.astro.
// The inline <script> (count-up animation) moves to src/client/cifras.js.

import { t } from '../lib/i18n.js';

export function renderCifras({ lang, calendario, ejes }) {
  const totalActividades = calendario.dias.reduce((sum, dia) => sum + dia.eventos.length, 0);

  const stats = [
    { value: calendario.dias.length, label: t(lang, 'about.stat.dias'), color: '#7db6e8' },
    { value: ejes.length, label: t(lang, 'about.stat.ejes'), color: '#6fd3de' },
    { value: totalActividades, label: t(lang, 'about.stat.actividades'), color: '#a9d981' },
  ];

  return `<section class="cifras">
  <div class="wrap cifras__grid">
    ${stats
      .map(
        (stat) => `<div class="cifras__stat" data-reveal>
      <b style="color: ${stat.color}"><span class="cifras__num" data-count="${stat.value}">0</span></b>
      <span>${stat.label}</span>
    </div>`
      )
      .join('\n    ')}
  </div>
</section>

<style>
  .cifras {
    background: var(--y-blue-dk);
    color: #fff;
    padding: 3rem 0;
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
    display: flex;
    justify-content: center;
    gap: clamp(2.5rem, 8vw, 6rem);
    text-align: center;
  }
  .cifras__stat {
    min-width: 120px;
  }
  .cifras__stat b {
    font-family: var(--font-display);
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    font-weight: 800;
    display: block;
  }
  .cifras__stat span {
    font-size: 0.85rem;
    font-weight: 700;
    opacity: 0.85;
    letter-spacing: 0.04em;
  }
  @media (max-width: 560px) {
    .cifras__grid { flex-wrap: wrap; gap: 1.75rem 3rem; }
  }
</style>

<script src="../client/cifras.js" defer></script>`;
}
