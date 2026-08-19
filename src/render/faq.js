// Ported from src/components/Faq.astro.
// The inline <script> (accordion expand/collapse) moves verbatim to
// src/client/faq.js.

import { t } from '../lib/i18n.js';

const ITEMS = ['who', 'cost', 'submit', 'ideathon', 'certificate', 'remote'];

export function renderFaq({ lang }) {
  return `<section class="faq" id="faq">
  <div class="wrap">
    <div class="section__head" style="text-align:center" data-reveal>
      <span class="eyebrow" style="justify-content:center">${t(lang, 'faq.kicker')}</span>
      <h2 class="section__title">${t(lang, 'faq.heading')}</h2>
      <div class="divider" style="margin-inline:auto"></div>
    </div>
    <div class="faq__list" data-reveal>
      ${ITEMS.map(
        (key) => `<div class="faq__item">
        <button class="faq__q" type="button">
          ${t(lang, `faq.${key}.q`)}
          <span class="faq__chev">+</span>
        </button>
        <div class="faq__a">
          <p>${t(lang, `faq.${key}.a`)}</p>
        </div>
      </div>`
      ).join('\n      ')}
    </div>
  </div>
</section>

<style>
  .faq {
    padding: clamp(3.5rem, 9vh, 7rem) 0;
    background: var(--color-page-alt);
  }
  .faq__list {
    max-width: 820px;
    margin-inline: auto;
    display: grid;
    gap: 0.9rem;
  }
  .faq__item {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 14px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .faq__q {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    background: none;
    border: 0;
    padding: 1.1rem 1.4rem;
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 0.95rem;
    color: var(--y-blue-dk);
    cursor: pointer;
    text-align: left;
  }
  .faq__chev {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--color-page);
    display: grid;
    place-items: center;
    font-weight: 800;
    color: var(--y-blue);
    transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease;
    flex-shrink: 0;
  }
  .faq__item.is-open .faq__chev {
    transform: rotate(45deg);
    background: var(--y-blue);
    color: #fff;
  }
  .faq__a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease;
  }
  .faq__a p {
    padding: 0 1.4rem 1.2rem;
    font-size: 0.88rem;
    color: var(--color-muted);
    margin: 0;
  }
</style>

<script src="../client/faq.js" defer></script>`;
}
