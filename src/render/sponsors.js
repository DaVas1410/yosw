// Sponsors section: a logo wall that drifts across the screen — several rows
// of equal tiles (no tiers, no labels), each row scrolling in alternating
// directions. Adding one is just dropping its logo into
// src/assets/sponsors/patrocinadores/ or .../colaboradores/ (name and link
// optional in src/data/sponsors.json); rows and repetition adapt to however
// many there are.
//
// The moving rows are decorative (aria-hidden, links out of the tab order).
// The accessible version is a plain list of the same sponsors that stays
// visually hidden until it receives keyboard focus, and becomes the visible
// static grid for visitors who prefer reduced motion.

import { t } from '../lib/i18n.js';

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// `logo` is a path inside /assets/sponsors/ produced by the build
// (e.g. "patrocinadores/huawei.png", see src/build/sponsor-logos.js), or a
// full https:// URL. Pages live at /<lang>/, hence the relative "../assets/" prefix.
export function sponsorLogoSrc(logo) {
  return /^https?:\/\//.test(logo) ? logo : `../assets/sponsors/${logo}`;
}

// A row needs enough tiles to overflow a wide screen, so short rows are
// repeated until they reach this many before being doubled for the loop.
const MIN_TILES_PER_ROW = 8;

// Split sponsors into marquee rows. With few sponsors every row shows all of
// them (rotated so rows don't line up); with many, they are dealt round-robin.
export function marqueeRows(sponsors) {
  const n = sponsors.length;
  if (n === 0) return [];
  const rowCount = n <= 3 ? 1 : n <= 14 ? 2 : 3;
  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    let row;
    if (n < MIN_TILES_PER_ROW) {
      const shift = Math.floor((r * n) / rowCount);
      row = [...sponsors.slice(shift), ...sponsors.slice(0, shift)];
    } else {
      row = sponsors.filter((_, i) => i % rowCount === r);
    }
    const filled = [];
    while (filled.length < MIN_TILES_PER_ROW) filled.push(...row);
    rows.push(filled);
  }
  return rows;
}

function renderTile(s, { decorative }) {
  const nombre = escapeAttr(s.nombre);
  const inner = s.logo
    ? `<img src="${escapeAttr(sponsorLogoSrc(s.logo))}" alt="${decorative ? '' : nombre}" loading="lazy" decoding="async" />`
    : `<span class="sponsors__name">${nombre}</span>`;
  const tab = decorative ? ' tabindex="-1"' : '';
  return s.enlace
    ? `<a class="sponsors__logo" href="${escapeAttr(s.enlace)}" target="_blank" rel="noopener noreferrer" title="${nombre}"${tab}>${inner}</a>`
    : `<div class="sponsors__logo" title="${nombre}">${inner}</div>`;
}

function renderMarquee(sponsors) {
  const rows = marqueeRows(sponsors);
  return `<div class="sponsors__marquee" aria-hidden="true">
      ${rows
        .map((row, r) => {
          const set = row.map((s) => `<li>${renderTile(s, { decorative: true })}</li>`).join('');
          return `<div class="sponsors__row${r % 2 ? ' sponsors__row--reverse' : ''}" style="--dur: ${row.length * 4.5}s">
        <ul class="sponsors__track" role="list">${set}${set}</ul>
      </div>`;
        })
        .join('\n      ')}
    </div>`;
}

// Two groups, each with its own heading and logo wall. A sponsor without
// `tipo` counts as a patrocinador. An empty patrocinadores group keeps
// placeholder tiles (it is the one we're inviting people into); an empty
// colaboradores group is simply left out.
const GROUPS = ['sponsor', 'colaborador'];

function renderWall(items) {
  return items.length > 0
    ? `${renderMarquee(items)}
    <ul class="sponsors__static" role="list">
      ${items.map((s) => `<li>${renderTile(s, { decorative: false })}</li>`).join('\n      ')}
    </ul>`
    : `<ul class="sponsors__static sponsors__static--empty" role="list" aria-hidden="true">
      <li><div class="sponsors__logo sponsors__logo--placeholder"></div></li>
      <li><div class="sponsors__logo sponsors__logo--placeholder"></div></li>
      <li><div class="sponsors__logo sponsors__logo--placeholder"></div></li>
    </ul>`;
}

export function renderSponsors({ lang, sponsors, email, proposalUrl }) {
  const body = GROUPS.map((tipo) => ({
    tipo,
    items: sponsors.filter((s) => (s.tipo ?? 'sponsor') === tipo),
  }))
    .filter((g) => g.tipo === 'sponsor' || g.items.length > 0)
    .map(
      (g) => `<div class="sponsors__group sponsors__group--${g.tipo}">
    <div class="section__wrap">
      <h3 class="sponsors__group-title" data-reveal>${t(lang, `sponsors.group.${g.tipo}`)}</h3>
    </div>
    <div class="sponsors__wall" data-reveal>
    ${renderWall(g.items)}
    </div>
  </div>`
    )
    .join('\n  ');

  return `<section id="sponsors" class="section sponsors">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'nav.sponsors')}</span>
      <h2 class="section__title">${t(lang, 'sponsors.heading')}</h2>
      <div class="divider"></div>
    </div>
  </div>

  ${body}

  <div class="section__wrap">
    <div class="sponsors__cta" data-reveal>
      ${
        email
          ? `<p class="sponsors__contact">${t(lang, 'sponsors.cta')}: <a class="sponsors__contact-link" href="mailto:${email}">${email}</a></p>`
          : `<span class="sponsors__contact sponsors__contact--fallback">${t(lang, 'sponsors.contact.fallback')}</span>`
      }
      ${proposalUrl ? `<a class="sponsors__download" href="${proposalUrl}">${t(lang, 'sponsors.download')}</a>` : ''}
    </div>
  </div>
</section>

<style>
  .sponsors__group + .sponsors__group { margin-top: clamp(2.5rem, 6vh, 3.5rem); }
  .sponsors__group-title {
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: center;
    color: var(--color-muted);
    margin: 0 0 1.1rem;
  }
  .sponsors__wall {
    --tile-w: 210px;
    --tile-h: 104px;
    --gap: 1.1rem;
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  /* -- moving rows --------------------------------------------------------- */
  .sponsors__marquee {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    padding-block: 0.4rem;
    /* Fade tiles in and out at the screen edges. */
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
            mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  }
  .sponsors__track {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: var(--gap);
    width: max-content;
    animation: sponsors-scroll var(--dur, 40s) linear infinite;
  }
  .sponsors__track > li { flex: none; }
  /* Each track holds its tile set twice; shifting by half (plus half a gap)
     lands the second copy exactly where the first started. */
  @keyframes sponsors-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-50% - var(--gap) / 2)); }
  }
  .sponsors__row--reverse .sponsors__track { animation-direction: reverse; }
  .sponsors__marquee:hover .sponsors__track { animation-play-state: paused; }

  .sponsors__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tile-w);
    height: var(--tile-h);
    padding: 0.6rem 1rem;
    /* Logos are served with their background removed (see
       src/build/logo-bg.js), so tiles are just spacing — no box. */
    background: transparent;
    border-radius: 14px;
    text-decoration: none;
    color: var(--color-text);
    transition: transform 0.25s ease;
  }
  a.sponsors__logo:hover,
  a.sponsors__logo:focus-visible {
    transform: scale(1.06);
  }
  .sponsors__logo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .sponsors__name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.95rem;
    text-align: center;
    line-height: 1.3;
  }
  .sponsors__logo--placeholder {
    border: 1px dashed var(--color-border);
  }

  /* -- static list: screen readers, keyboard, reduced motion, empty state -- */
  .sponsors__static {
    list-style: none;
    margin: 0 auto;
    padding: 0 var(--gutter, 16px);
    max-width: 1100px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--gap);
  }
  .sponsors__marquee + .sponsors__static:not(:focus-within) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .sponsors__marquee + .sponsors__static:focus-within {
    margin-top: var(--gap);
  }

  @media (prefers-reduced-motion: reduce) {
    .sponsors__marquee { display: none; }
    .sponsors__marquee + .sponsors__static:not(:focus-within) {
      position: static;
      width: auto;
      height: auto;
      overflow: visible;
      clip-path: none;
      white-space: normal;
    }
  }

  .sponsors__cta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: calc(var(--space) * 2.5);
    margin-top: calc(var(--space) * 5);
    text-align: center;
  }
  .sponsors__contact {
    font-family: var(--font-body);
    color: var(--color-text);
    font-weight: 500;
    margin: 0;
  }
  .sponsors__contact-link {
    color: var(--color-accent);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
  }
  .sponsors__contact-link:hover { color: var(--color-accent-2); }
  .sponsors__contact--fallback { color: var(--color-muted); font-weight: 400; }
  .sponsors__download {
    font-family: var(--font-body);
    color: #fff;
    background: var(--grad-brand);
    text-decoration: none;
    font-weight: 600;
    padding: 0.7rem 1.6rem;
    border-radius: 999px;
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .sponsors__download:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 560px) {
    .sponsors__wall { --tile-w: 150px; --tile-h: 80px; --gap: 0.75rem; }
    .sponsors__logo { padding: 0.6rem 0.8rem; }
  }
</style>`;
}
