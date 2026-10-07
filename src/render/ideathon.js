// Ideatón section: intro + week flow + team facts, the sign-up CTA (its own
// Google Form, config.forms.ideathon) and the six challenges ("retos") from
// src/data/ideathon.json. Each reto card shows its one-line pitch; the full
// brief (problem, why, deliverables, useful profiles) sits in a native
// <details> so it works without JS.

import { t } from '../lib/i18n.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const RETO_COLORS = [
  'var(--y-orange)',
  'var(--y-blue)',
  'var(--y-green)',
  'var(--y-purple)',
  'var(--y-teal)',
  'var(--y-red)',
];

function renderReto({ lang, reto, i }) {
  const num = String(i + 1).padStart(2, '0');
  return `<article class="reto" style="--c: ${RETO_COLORS[i % RETO_COLORS.length]}; --delay: ${i * 70}ms" data-reveal>
        <span class="reto__num">${t(lang, 'idea.retos.label')} ${num}</span>
        <h4 class="reto__title">${escapeHtml(reto.titulo[lang])}</h4>
        <p class="reto__resumen">${escapeHtml(reto.resumen[lang])}</p>
        <details class="reto__more">
          <summary>${t(lang, 'idea.retos.more')}</summary>
          <div class="reto__body">
            <h5>${t(lang, 'idea.retos.problema')}</h5>
            <p>${escapeHtml(reto.problema[lang])}</p>
            <h5>${t(lang, 'idea.retos.porque')}</h5>
            <p>${escapeHtml(reto.porque[lang])}</p>
            <h5>${t(lang, 'idea.retos.entregables')}</h5>
            <ul>
              ${reto.entregables.map((e) => `<li>${escapeHtml(e[lang])}</li>`).join('\n              ')}
            </ul>
          </div>
        </details>
        <p class="reto__perfiles"><b>${t(lang, 'idea.retos.perfiles')}</b> ${escapeHtml(reto.perfiles[lang])}</p>
      </article>`;
}

export function renderIdeathon({ lang, ideathon, formUrl }) {
  const flow = [
    { key: 'kickoff', color: 'var(--y-blue)' },
    { key: 'mentoring', color: 'var(--y-teal)' },
    { key: 'pitches', color: 'var(--y-orange)' },
    { key: 'awards', color: 'var(--y-red)' },
  ];
  const facts = ['team', 'mix', 'external'];
  const retos = ideathon?.retos ?? [];
  const cta = formUrl
    ? `<a href="${escapeHtml(formUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">${t(lang, 'idea.cta')}</a>`
    : `<a href="#registro" class="btn btn-ghost">${t(lang, 'idea.cta')}</a>`;

  return `<section class="idea" id="ideathon">
  <div class="wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'idea.kicker')}</span>
      <h2 class="section__title">${t(lang, 'idea.heading')}</h2>
      <p class="section__lead">${t(lang, 'idea.intro')}</p>
      <div class="divider"></div>
    </div>
    <div class="idea__grid">
      <div class="idea__text" data-reveal>
        <p>${t(lang, 'idea.body')}</p>
        <ul class="idea__facts" role="list">
          ${facts.map((f) => `<li>${t(lang, `idea.facts.${f}`)}</li>`).join('\n          ')}
        </ul>
        <div class="idea__flow" data-reveal-stagger>
          ${flow
            .map(
              (step) => `<div class="idea__step" style="--c: ${step.color}">
            <b>${t(lang, `idea.flow.${step.key}.when`)}</b>
            <div>
              <h4>${t(lang, `idea.flow.${step.key}.title`)}</h4>
              <p>${t(lang, `idea.flow.${step.key}.desc`)}</p>
            </div>
          </div>`
            )
            .join('\n          ')}
        </div>
        <div class="idea__cta">
          ${cta}
          <a href="#retos" class="idea__cta-link">${t(lang, 'idea.retos.see')}</a>
        </div>
      </div>
      <figure class="idea__img" data-reveal>
        <img src="../assets/illustrations/ideathon.png" alt="${t(lang, 'idea.img_alt')}" loading="lazy" data-parallax="0.08" />
      </figure>
    </div>
${
  retos.length
    ? `
    <div class="retos" id="retos">
      <div class="retos__head" data-reveal>
        <h3 class="retos__title">${t(lang, 'idea.retos.heading')}</h3>
        <p class="retos__lead">${t(lang, 'idea.retos.lead')}</p>
      </div>
      <div class="retos__grid">
      ${retos.map((reto, i) => renderReto({ lang, reto, i })).join('\n      ')}
      </div>
      <div class="retos__foot" data-reveal>
        <p>${t(lang, 'idea.retos.docs')}</p>
        ${cta}
      </div>
    </div>`
    : ''
}
  </div>
</section>

<style>
  .idea {
    padding: clamp(3.5rem, 9vh, 7rem) 0;
    position: relative;
    overflow: hidden;
  }
  .idea__grid {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 3rem;
    align-items: center;
    margin-top: clamp(2rem, 5vh, 3.5rem);
  }
  .idea__text > p {
    color: var(--color-muted);
    margin: 0 0 1rem;
  }
  .idea__facts {
    list-style: none;
    margin: 0 0 0.4rem;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .idea__facts li {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--y-blue-dk);
    background: color-mix(in srgb, var(--y-blue) 9%, transparent);
    border-radius: 999px;
    padding: 0.32rem 0.8rem;
  }
  .idea__flow {
    display: grid;
    gap: 0.8rem;
    margin: 1.4rem 0;
  }
  .idea__step {
    display: flex;
    gap: 0.9rem;
    align-items: flex-start;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 14px;
    padding: 0.85rem 1.1rem;
    box-shadow: var(--shadow-sm);
  }
  .idea__step b {
    font-family: var(--font-display);
    color: var(--c);
    font-size: 0.8rem;
    min-width: 90px;
    padding-top: 0.1rem;
  }
  .idea__step h4 {
    font-family: var(--font-display);
    font-size: 0.92rem;
    margin: 0;
    color: var(--color-text);
  }
  .idea__step p {
    font-size: 0.82rem;
    color: var(--color-muted);
    margin: 0.2rem 0 0;
  }
  .idea__cta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem 1.4rem;
  }
  .idea__cta-link {
    font-weight: 700;
    color: var(--y-blue);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .idea__img {
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
    margin: 0;
  }
  .idea__img img {
    width: 100%;
    display: block;
  }

  /* -- retos ------------------------------------------------------------- */
  .retos {
    margin-top: clamp(3rem, 8vh, 5rem);
    scroll-margin-top: 90px;
  }
  .retos__head {
    text-align: center;
    max-width: 640px;
    margin: 0 auto clamp(1.5rem, 4vh, 2.5rem);
  }
  .retos__title {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 3vw, 1.9rem);
    margin: 0 0 0.5rem;
    color: var(--color-text);
  }
  .retos__lead {
    color: var(--color-muted);
    margin: 0;
  }
  .retos__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.1rem;
    align-items: start;
  }
  .reto {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-top: 4px solid var(--c);
    border-radius: 16px;
    padding: 1.2rem 1.25rem 1.1rem;
    box-shadow: var(--shadow-sm);
    transition-delay: var(--delay);
  }
  .reto__num {
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--c);
  }
  .reto__title {
    font-family: var(--font-display);
    font-size: 1.05rem;
    line-height: 1.3;
    margin: 0;
    color: var(--color-text);
  }
  .reto__resumen {
    font-size: 0.9rem;
    color: var(--color-muted);
    margin: 0;
  }
  .reto__more summary {
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--y-blue);
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
  .reto__more summary::-webkit-details-marker { display: none; }
  .reto__more summary::after {
    content: '';
    width: 7px;
    height: 7px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg) translateY(-2px);
    transition: transform 0.2s ease;
  }
  .reto__more[open] summary::after { transform: rotate(-135deg) translateY(-2px); }
  .reto__body {
    margin-top: 0.7rem;
    padding-top: 0.7rem;
    border-top: 1px dashed var(--color-border);
    font-size: 0.85rem;
    color: var(--color-text);
  }
  .reto__body h5 {
    font-family: var(--font-display);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--c);
    margin: 0.8rem 0 0.25rem;
  }
  .reto__body h5:first-child { margin-top: 0; }
  .reto__body p { margin: 0; line-height: 1.55; }
  .reto__body ul { margin: 0; padding-left: 1.1rem; line-height: 1.5; }
  .reto__perfiles {
    margin: auto 0 0;
    font-size: 0.8rem;
    color: var(--color-muted);
    padding-top: 0.4rem;
  }
  .reto__perfiles b { color: var(--color-text); }
  .retos__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.8rem 1.5rem;
    margin-top: clamp(1.5rem, 4vh, 2.5rem);
    text-align: center;
  }
  .retos__foot p {
    margin: 0;
    font-size: 0.88rem;
    color: var(--color-muted);
  }

  @media (max-width: 1000px) {
    .retos__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 920px) {
    .idea__grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .retos__grid { grid-template-columns: 1fr; }
  }
</style>`;
}
