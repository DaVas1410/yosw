// Ported from src/components/participants/ParticipantsPreview.astro.
// No inline <script> in the source.

import { t } from '../lib/i18n.js';
import { renderParticipantCard, participantCardStyle } from './participant-card.js';

export function renderParticipantsPreview({ lang, participants, ejes }) {
  // Home teaser: 12 speakers (photos first) and 8 posters spread across the
  // tracks. Both counts fill whole rows at every breakpoint (see the grid CSS).
  const people = participants.filter((p) => p.rol !== 'poster');
  const preview = [...people.filter((p) => p.foto), ...people.filter((p) => !p.foto)].slice(0, 12);
  const allPosters = participants.filter((p) => p.rol === 'poster');
  const byEje = new Map();
  for (const p of allPosters.filter((x) => x.poster)) {
    if (!byEje.has(p.eje)) byEje.set(p.eje, []);
    byEje.get(p.eje).push(p);
  }
  const posterPreview = [];
  while (posterPreview.length < 8 && [...byEje.values()].some((l) => l.length)) {
    for (const list of byEje.values()) if (list.length && posterPreview.length < 8) posterPreview.push(list.shift());
  }
  const card = (p) => renderParticipantCard({ lang, participant: p, ejes });

  return `<section id="participantes" class="section participantes-preview">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'nav.participantes')}</span>
      <h2 class="section__title">${t(lang, 'participantes.heading')}</h2>
      <div class="divider"></div>
    </div>

    ${
      preview.length > 0
        ? `<h3 class="participantes-preview__sub" data-reveal>${t(lang, 'participantes.ponentes_heading')} <span>${people.length}</span></h3>
    <div class="participantes-preview__grid" data-reveal-stagger>
      ${preview.map(card).join('\n      ')}
    </div>
    ${
      posterPreview.length > 0
        ? `<h3 class="participantes-preview__sub" data-reveal>${t(lang, 'participantes.posters_heading')} <span>${allPosters.length}</span></h3>
    <div class="participantes-preview__grid participantes-preview__grid--posters" data-reveal-stagger>
      ${posterPreview.map(card).join('\n      ')}
    </div>`
        : ''
    }`
        : `<div class="card participantes-preview__empty" data-reveal>
      <span class="participantes-preview__empty-icon">✦</span>
      <p>${t(lang, 'stats.soon')}</p>
    </div>`
    }

    <div class="participantes-preview__foot" data-reveal>
      <a class="participantes-preview__all" href="participantes.html">
        ${t(lang, 'participantes.ver_todos')} <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</section>

${participantCardStyle}
<style>
  .participantes-preview__sub {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    margin: calc(var(--space) * 4) 0 calc(var(--space) * 2);
    font-family: var(--font-display);
    font-size: clamp(1.15rem, 2vw, 1.4rem);
    font-weight: 700;
  }
  .participantes-preview__sub span {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--color-muted);
  }
  /* 12 speakers: 6 / 4 / 3 per row; 8 posters: 8 / 4 per row. Phones show 6 + 4. */
  .participantes-preview__grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 1rem;
  }
  .participantes-preview__grid--posters { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  @media (max-width: 1100px) {
    .participantes-preview__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  @media (max-width: 760px) {
    .participantes-preview__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .participantes-preview__grid--posters { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  @media (max-width: 560px) {
    .participantes-preview__grid,
    .participantes-preview__grid--posters { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
    .participantes-preview__grid > :nth-child(n + 7),
    .participantes-preview__grid--posters > :nth-child(n + 5) { display: none; }
  }
  .participantes-preview__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: clamp(2.5rem, 7vw, 4rem);
    text-align: center;
    color: var(--color-muted);
  }
  .participantes-preview__empty:hover { transform: none; }
  .participantes-preview__empty-icon {
    font-size: 2rem;
    background: var(--grad-brand);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .participantes-preview__empty p { margin: 0; font-size: 1rem; }
  .participantes-preview__foot {
    display: flex;
    justify-content: center;
    margin-top: calc(var(--space) * 4);
  }
  .participantes-preview__all {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-body);
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600;
    padding: 0.7rem 1.6rem;
    border: 1.5px solid var(--color-accent);
    border-radius: 999px;
    transition: background 0.25s ease, color 0.25s ease, transform 0.2s ease;
  }
  .participantes-preview__all:hover {
    background: var(--color-accent);
    color: #fff;
    transform: translateY(-2px);
  }
</style>`;
}
