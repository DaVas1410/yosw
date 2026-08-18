// Ported from src/components/EjesSection.astro. No inline <script> in the
// source.

import { t } from '../lib/i18n.js';

export function renderEjesSection({ lang, ejes }) {
  return `<section id="ejes" class="section ejes">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'brand.short')}</span>
      <h2 class="section__title">${t(lang, 'nav.ejes')}</h2>
      <div class="divider"></div>
    </div>
    <div class="ejes__grid">
      ${ejes
        .map(
          (eje, i) => `<article
        class="card card--accent ejes__card"
        style="--accent: ${eje.color}; --eje-color: ${eje.color}; --delay: ${i * 90}ms"
        data-reveal
      >
        <span class="ejes__num">/ ${String(eje.id).padStart(2, '0')}</span>
        <h3 class="ejes__card-title">${eje.nombre[lang]}</h3>
        ${eje.descripcion[lang] ? `<p class="ejes__card-desc">${eje.descripcion[lang]}</p>` : ''}
        <span class="ejes__glow"></span>
      </article>`
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<style>
  .ejes__grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: calc(var(--space) * 2);
  }
  @media (max-width: 1100px) {
    .ejes__grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 700px) {
    .ejes__grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .ejes__grid { grid-template-columns: 1fr; }
  }
  .ejes__card {
    transition-delay: var(--delay);
    padding: clamp(1.1rem, 2vw, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 190px;
  }
  .ejes__num {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 800;
    line-height: 1;
    color: var(--eje-color);
  }
  .ejes__card-title {
    font-family: var(--font-display);
    font-size: 1.02rem;
    font-weight: 700;
    line-height: 1.25;
    margin: 0;
    color: var(--color-text);
  }
  .ejes__card-desc {
    font-family: var(--font-body);
    color: var(--color-muted);
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }
  .ejes__glow {
    position: absolute;
    right: -40px;
    bottom: -40px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: var(--eje-color);
    opacity: 0.12;
    filter: blur(30px);
    transition: opacity 0.35s ease, transform 0.35s ease;
  }
  .ejes__card:hover .ejes__glow {
    opacity: 0.28;
    transform: scale(1.3);
  }
</style>`;
}
