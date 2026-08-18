// Ported from src/components/data/DataSection.astro.
// The inline <script> (bar-fill reveal animation) moves verbatim to
// src/client/data-section.js.

import { t } from '../lib/i18n.js';
import { countByCategory } from '../lib/axes.js';
import { renderLiveStats } from './live-stats.js';

export function renderDataSection({ lang, calendario, sheetUrl }) {
  const counts = countByCategory(calendario);
  const max = Math.max(...Object.values(counts), 1);
  const bars = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, count]) => ({
      categoria,
      count,
      pct: Math.round((count / max) * 100),
      label: t(lang, `programa.categoria.${categoria}`),
    }));

  return `<section id="datos" class="section datos">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'nav.datos')}</span>
      <h2 class="section__title">${t(lang, 'datos.heading')}</h2>
      <div class="divider"></div>
    </div>

    <div class="datos__stack">
      <div class="card datos__chart" data-reveal>
        <h3 class="datos__chart-title">${t(lang, 'datos.categorias')}</h3>
        <div class="datos__bars">
          ${bars
            .map(
              (bar) => `<div class="datos__bar-row">
            <span class="datos__bar-label">${bar.label}</span>
            <div class="datos__bar-track">
              <div
                class="datos__bar-fill"
                data-pct="${bar.pct}"
                style="background: var(--cat-${bar.categoria});"
              ></div>
            </div>
            <span class="datos__bar-count">${bar.count}</span>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>

      ${renderLiveStats({ lang, sheetUrl })}
    </div>
  </div>
</section>

<style>
  .datos__stack {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3.5vw, 2.5rem);
  }
  .datos__chart {
    padding: clamp(1.75rem, 4vw, 2.75rem);
    display: flex;
    flex-direction: column;
    gap: calc(var(--space) * 2.5);
  }
  .datos__chart:hover { transform: none; }
  .datos__chart-title {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }
  .datos__bars {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space) * 1.6);
  }
  .datos__bar-row {
    display: grid;
    grid-template-columns: minmax(140px, 210px) 1fr auto;
    align-items: center;
    gap: calc(var(--space) * 1.5);
  }
  .datos__bar-label {
    font-family: var(--font-body);
    font-size: 1.02rem;
  }
  .datos__bar-track {
    background: color-mix(in srgb, var(--color-muted) 16%, transparent);
    border-radius: 999px;
    overflow: hidden;
    height: 0.95rem;
  }
  .datos__bar-fill {
    height: 100%;
    width: 0;
    border-radius: 999px;
    transition: width 1.1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .datos__bar-count {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.02rem;
    color: var(--color-text);
    min-width: 1.5rem;
    text-align: right;
  }
  @media (max-width: 560px) {
    .datos__bar-row { grid-template-columns: 1fr auto; }
    .datos__bar-label { grid-column: 1 / -1; }
  }
</style>

<script src="/client/data-section.js" defer></script>`;
}
