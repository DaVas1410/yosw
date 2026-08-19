// Ported from src/components/Registration.astro. No inline <script> in the
// source. SVG path data (Lucide icons) copied verbatim.

import { t } from '../lib/i18n.js';

const CARDS = [
  {
    key: 'attend',
    color: 'var(--y-blue)',
    // Lucide "ticket"
    path: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M13 5v2 M13 17v2 M13 11v2',
  },
  {
    key: 'poster',
    color: 'var(--y-teal)',
    // Lucide "presentation"
    path: 'M2 3h20 M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3 M7 21l5-5 5 5',
  },
  {
    key: 'ponentes',
    color: 'var(--y-orange)',
    // Lucide "mic"
    path: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3',
  },
];

export function renderRegistration({ lang, registerHref }) {
  return `<section id="registro" class="section registro">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'nav.registro')}</span>
      <h2 class="section__title">${t(lang, 'reg.heading')}</h2>
      <div class="divider"></div>
    </div>
    <div class="registro__grid">
      ${CARDS.map(
        (card, i) => `<article class="card card--accent registro__card" style="--accent: ${card.color}; --delay: ${i * 100}ms" data-reveal>
        <span class="registro__icon" style="color: ${card.color}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            ${card.path
              .split(' M')
              .map((d, idx) => `<path d="${idx === 0 ? d : `M${d}`}" />`)
              .join('\n            ')}
          </svg>
        </span>
        <h3 class="registro__card-title">${t(lang, `reg.${card.key}`)}</h3>
        <p class="registro__card-desc">${t(lang, `reg.${card.key}.desc`)}</p>
      </article>`
      ).join('\n      ')}
    </div>

    <div class="registro__single" data-reveal>
      <p class="registro__single-note">${t(lang, 'reg.single.note')}</p>
      ${
        registerHref
          ? `<a class="btn btn-primary" href="${registerHref}" target="_blank" rel="noopener noreferrer">
        ${t(lang, 'reg.cta.single')} <span aria-hidden="true">→</span>
      </a>`
          : `<span class="btn" aria-disabled="true">${t(lang, 'stats.soon')}</span>`
      }
    </div>
  </div>
</section>

<style>
  .registro__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: calc(var(--space) * 2.5);
  }
  .registro__card {
    transition-delay: var(--delay);
    padding: clamp(1.5rem, 3vw, 2.2rem);
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    text-align: left;
  }
  .registro__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
  .registro__icon svg {
    width: 26px;
    height: 26px;
  }
  .registro__card-title {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0.3rem 0 0;
  }
  .registro__card-desc {
    font-family: var(--font-body);
    color: var(--color-muted);
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.55;
    flex-grow: 1;
  }
  .registro__single {
    margin-top: clamp(2rem, 5vh, 3rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    text-align: center;
  }
  .registro__single-note {
    color: var(--color-muted);
    font-size: 1.05rem;
    margin: 0;
    max-width: 46ch;
  }
  @media (max-width: 760px) {
    .registro__grid { grid-template-columns: 1fr; max-width: 420px; margin-inline: auto; }
  }
</style>`;
}
