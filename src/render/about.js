// Ported from src/components/About.astro. No inline <script> in the source.

import { t } from '../lib/i18n.js';

export function renderAbout({ lang }) {
  const values = [
    { color: 'var(--y-blue)', title: t(lang, 'about.value.inter'), desc: t(lang, 'about.value.inter.desc') },
    { color: 'var(--y-teal)', title: t(lang, 'about.value.open'), desc: t(lang, 'about.value.open.desc') },
    { color: 'var(--y-green)', title: t(lang, 'about.value.community'), desc: t(lang, 'about.value.community.desc') },
    { color: 'var(--y-orange)', title: t(lang, 'about.value.link'), desc: t(lang, 'about.value.link.desc') },
  ];

  return `<section id="about" class="section about">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'brand.short')}</span>
      <h2 class="section__title">${t(lang, 'nav.about')}</h2>
      <div class="divider"></div>
    </div>
    <div class="about__grid">
      <div class="about__text" data-reveal>
        <p>${t(lang, 'about.intro')}</p>
        <p>${t(lang, 'about.objective')}</p>
        <div class="about__values">
          ${values
            .map(
              (v) => `<div class="about__value">
            <i style="background: ${v.color}"></i>
            <h4>${v.title}</h4>
            <p>${v.desc}</p>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
      <figure class="about__media" data-reveal>
        <img src="/assets/illustrations/congreso.png" alt="${t(lang, 'about.media_alt')}" loading="lazy" />
        <figcaption>${t(lang, 'about.media_caption')}</figcaption>
      </figure>
    </div>
  </div>
</section>

<style>
  .about__grid {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 3rem;
    align-items: center;
  }
  .about__text p {
    color: var(--color-muted);
    margin: 0 0 1rem;
    line-height: 1.65;
  }
  .about__values {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1.6rem;
  }
  .about__value {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 14px;
    padding: 1.1rem 1.2rem;
    box-shadow: var(--shadow-sm);
    transition: transform 0.3s ease;
  }
  .about__value:hover { transform: translateY(-5px); }
  .about__value i {
    width: 34px;
    height: 5px;
    border-radius: 99px;
    display: block;
    margin-bottom: 0.7rem;
  }
  .about__value h4 {
    font-family: var(--font-display);
    font-size: 0.95rem;
    margin: 0 0 0.25rem;
    color: var(--color-text);
  }
  .about__value p {
    font-size: 0.83rem;
    color: var(--color-muted);
    margin: 0;
  }
  .about__media {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    margin: 0;
  }
  .about__media img {
    width: 100%;
    height: 300px;
    object-fit: cover;
  }
  .about__media figcaption {
    padding: 0.8rem 1.1rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--color-muted-2);
  }
  @media (max-width: 920px) {
    .about__grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .about__values { grid-template-columns: 1fr; }
  }
</style>`;
}
