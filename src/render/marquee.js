// Ported from src/components/Marquee.astro. No inline <script> in the
// source (CSS animation only), so no client script to extract.

import { t } from '../lib/i18n.js';

export function renderMarquee({ lang }) {
  const text = `${t(lang, 'brand.short')} · #HacemosCienciaYT · ${t(lang, 'brand.name')} · ${t(lang, 'hero.dates')} · ${t(lang, 'hero.venue')} · `;

  return `<div class="marquee" aria-hidden="true">
  <div class="marquee__track">
    <span>${text}</span>
    <span>${text}</span>
  </div>
</div>

<style>
  .marquee {
    background: #fff;
    border-block: 1px solid var(--color-border);
    overflow: hidden;
    position: relative;
  }
  .marquee::before,
  .marquee::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--grad-spectrum);
    z-index: 1;
  }
  .marquee::before { top: 0; }
  .marquee::after { bottom: 0; }
  .marquee__track {
    display: flex;
    width: max-content;
    animation: marquee-scroll 30s linear infinite;
    padding: 1.1rem 0;
  }
  .marquee__track span {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.15rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--y-blue);
    white-space: nowrap;
  }
  @keyframes marquee-scroll {
    to { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .marquee__track { animation: none; }
  }
</style>`;
}
