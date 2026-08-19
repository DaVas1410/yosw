// Ported from src/components/EjesSection.astro, then redesigned from a
// plain card grid into a radial "wheel" of the 5 ejes temáticos (see
// docs/superpowers/specs — bar-chart-adjacent Datos work, brainstormed
// 2026-08-18). Below ~700px the wheel gives way to the original stacked
// card list, kept verbatim as a no-JS-required fallback.

import { t } from '../lib/i18n.js';

const CX = 210;
const CY = 210;
const R_OUTER = 200;
const R_INNER = 92;
const GAP_DEG = 3.5;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutWedgePath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const startInner = polarToCartesian(cx, cy, rInner, endAngle);
  const endInner = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    'M', startOuter.x, startOuter.y,
    'A', rOuter, rOuter, 0, largeArc, 0, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', rInner, rInner, 0, largeArc, 1, startInner.x, startInner.y,
    'Z',
  ].join(' ');
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function renderEjesSection({ lang, ejes }) {
  const n = ejes.length;
  const step = 360 / n;

  const wedges = ejes
    .map((eje, i) => {
      const start = i * step + GAP_DEG / 2;
      const end = (i + 1) * step - GAP_DEG / 2;
      const mid = (start + end) / 2;
      const labelPos = polarToCartesian(CX, CY, (R_OUTER + R_INNER) / 2, mid);
      const path = donutWedgePath(CX, CY, R_OUTER, R_INNER, start, end);
      const nombre = eje.nombre[lang];
      const descripcion = eje.descripcion[lang] ?? '';

      return `<g
        class="ejes__wedge${i === 0 ? ' is-active' : ''}"
        tabindex="0"
        role="button"
        aria-pressed="${i === 0 ? 'true' : 'false'}"
        aria-label="${escapeAttr(nombre)}"
        data-title="${escapeAttr(nombre)}"
        data-desc="${escapeAttr(descripcion)}"
        style="--eje-color: ${eje.color}"
      >
        <path class="ejes__wedge-path" d="${path}" />
        <text class="ejes__wedge-num" x="${labelPos.x}" y="${labelPos.y}" text-anchor="middle" dominant-baseline="middle">${String(eje.id).padStart(2, '0')}</text>
      </g>`;
    })
    .join('\n      ');

  const first = ejes[0];

  return `<section id="ejes" class="section ejes">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'brand.short')}</span>
      <h2 class="section__title">${t(lang, 'nav.ejes')}</h2>
      <div class="divider"></div>
    </div>

    <div class="ejes__wheel-wrap" data-reveal>
      <svg class="ejes__wheel" viewBox="0 0 420 420" role="img" aria-label="${escapeAttr(t(lang, 'nav.ejes'))}">
        ${wedges}
        <circle class="ejes__hub" cx="${CX}" cy="${CY}" r="${R_INNER - 10}" />
        <text class="ejes__hub-text" x="${CX}" y="${CY - 6}" text-anchor="middle">${t(lang, 'brand.short')}</text>
        <text class="ejes__hub-sub" x="${CX}" y="${CY + 16}" text-anchor="middle">${t(lang, 'nav.ejes').toUpperCase()}</text>
      </svg>

      <div class="ejes__detail">
        <span class="ejes__detail-hint">${t(lang, 'ejes.hint')}</span>
        <span class="ejes__detail-num" id="ejes-detail-num">/ ${String(first.id).padStart(2, '0')}</span>
        <h3 class="ejes__detail-title" id="ejes-detail-title">${first.nombre[lang]}</h3>
        <p class="ejes__detail-desc" id="ejes-detail-desc">${first.descripcion[lang] ?? ''}</p>
      </div>
    </div>

    <div class="ejes__grid ejes__grid--fallback">
      ${ejes
        .map(
          (eje, i) => `<article
        class="card card--accent ejes__card"
        style="--accent: ${eje.color}; --eje-color: ${eje.color}; --delay: ${i * 90}ms"
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
  .ejes__wheel-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.5rem, 4vw, 2.5rem);
  }
  @media (min-width: 700px) {
    .ejes__wheel-wrap {
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: clamp(2rem, 5vw, 4rem);
    }
  }
  .ejes__wheel {
    width: min(420px, 84vw);
    height: auto;
    flex-shrink: 0;
    overflow: visible;
  }
  .ejes__wedge-path {
    fill: var(--eje-color);
    opacity: 0.82;
    transition: opacity 0.25s ease, transform 0.25s ease;
    transform-box: fill-box;
    transform-origin: center;
    cursor: pointer;
  }
  .ejes__wedge {
    outline: none;
  }
  .ejes__wedge:hover .ejes__wedge-path,
  .ejes__wedge:focus-visible .ejes__wedge-path,
  .ejes__wedge.is-active .ejes__wedge-path {
    opacity: 1;
    transform: scale(1.035);
  }
  .ejes__wedge:focus-visible .ejes__wedge-path {
    stroke: var(--color-surface);
    stroke-width: 3;
  }
  .ejes__wedge-num {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 800;
    fill: var(--color-surface);
    pointer-events: none;
    user-select: none;
  }
  .ejes__hub {
    fill: var(--color-surface);
    stroke: var(--color-border);
    stroke-width: 1;
  }
  .ejes__hub-text {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 800;
    fill: var(--color-text);
  }
  .ejes__hub-sub {
    font-family: var(--font-body);
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    fill: var(--color-muted);
  }
  .ejes__detail {
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    text-align: center;
  }
  @media (min-width: 700px) {
    .ejes__detail { text-align: left; }
  }
  .ejes__detail-hint {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: var(--color-muted-2);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .ejes__detail-num {
    font-family: var(--font-display);
    font-weight: 800;
    color: var(--color-accent);
    font-size: 1rem;
  }
  .ejes__detail-title {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text);
  }
  .ejes__detail-desc {
    font-family: var(--font-body);
    color: var(--color-muted);
    margin: 0;
    line-height: 1.55;
  }

  .ejes__grid--fallback { display: none; }
  @media (max-width: 699px) {
    .ejes__wheel-wrap { display: none; }
    .ejes__grid--fallback {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: calc(var(--space) * 2);
      margin-top: clamp(1.5rem, 4vw, 2.5rem);
    }
  }
  @media (max-width: 480px) {
    .ejes__grid--fallback { grid-template-columns: 1fr; }
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
</style>

<script src="../client/ejes-wheel.js" defer></script>`;
}
