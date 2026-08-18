// Ported from src/components/Sede.astro. No inline <script> in the source.

import { t } from '../lib/i18n.js';

export function renderSede({ lang, config }) {
  const venue = config.venue[lang];

  return `<section class="sede" id="sede">
  <div class="wrap sede__grid">
    <div class="sede__text" data-reveal>
      <span class="eyebrow">${t(lang, 'sede.kicker')}</span>
      <h2 class="section__title">${t(lang, 'sede.heading')}</h2>
      <div class="divider" style="margin-inline:0"></div>
      <p>${t(lang, 'sede.body')}</p>
      <ul class="sede__list">
        <li>
          <svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"></path><circle cx="12" cy="10" r="2.6"></circle></svg>
          ${venue}
        </li>
        <li>
          <svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="10" rx="2"></rect><path d="M7 8V6h10v2M3 13h18"></path></svg>
          ${t(lang, 'sede.hybrid')}
        </li>
      </ul>
    </div>
    <figure class="sede__photo" data-reveal>
      <img src="/assets/illustrations/sede.jpg" alt="${t(lang, 'sede.photo_alt')}" loading="lazy" />
      <figcaption>${t(lang, 'sede.photo_caption')}</figcaption>
    </figure>
  </div>
  <div class="wrap">
    <div class="sede__map" data-reveal>
      <iframe
        title="${t(lang, 'sede.map_alt')}"
        src="https://www.google.com/maps?q=Yachay+Tech,+Urcuqu%C3%AD,+Ecuador&output=embed"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </div>
</section>

<style>
  .sede {
    padding: clamp(3.5rem, 9vh, 7rem) 0;
  }
  .sede__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
  }
  .sede__text p {
    color: var(--color-muted);
    margin: 1rem 0;
  }
  .sede__list {
    display: grid;
    gap: 0.7rem;
    margin: 1.2rem 0 0;
    list-style: none;
    padding: 0;
  }
  .sede__list li {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    font-size: 0.9rem;
    color: var(--color-muted);
  }
  .sede__list svg {
    width: 18px;
    height: 18px;
    stroke: var(--y-teal);
    fill: none;
    stroke-width: 2;
    flex-shrink: 0;
    margin-top: 0.2rem;
  }
  .sede__photo {
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
    position: relative;
    margin: 0;
  }
  .sede__photo img {
    width: 100%;
    height: 420px;
    object-fit: cover;
    transition: transform 6s ease;
  }
  .sede__photo:hover img {
    transform: scale(1.06);
  }
  .sede__photo figcaption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(transparent, rgba(18, 40, 60, 0.85));
    color: #e6eef5;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 2rem 1.2rem 0.9rem;
  }
  .sede__map {
    margin-top: 2.5rem;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
  }
  .sede__map iframe {
    display: block;
    width: 100%;
    height: 380px;
    border: 0;
  }
  @media (max-width: 920px) {
    .sede__grid { grid-template-columns: 1fr; }
  }
</style>`;
}
