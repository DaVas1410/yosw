// Ported from src/components/Ideathon.astro. No inline <script> in the
// source.

import { t } from '../lib/i18n.js';

export function renderIdeathon({ lang }) {
  const flow = [
    { key: 'kickoff', color: 'var(--y-blue)' },
    { key: 'mentoring', color: 'var(--y-teal)' },
    { key: 'awards', color: 'var(--y-red)' },
  ];

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
        <div class="idea__flow">
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
        <a href="#registro" class="btn btn-ghost">${t(lang, 'idea.cta')}</a>
      </div>
      <figure class="idea__img" data-reveal>
        <img src="../assets/illustrations/ideathon.png" alt="${t(lang, 'idea.img_alt')}" loading="lazy" />
      </figure>
    </div>
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
  @media (max-width: 920px) {
    .idea__grid { grid-template-columns: 1fr; }
  }
</style>`;
}
