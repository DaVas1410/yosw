// Participants section on the home page: search + track filter, then two
// side-by-side columns (speakers & panelists | posters), each a fixed-height
// box that scrolls internally and holds everyone. Filtering is done by
// src/client/participantes.js, the same script as the full directory page.

import { t } from '../lib/i18n.js';
import { renderParticipantCard, participantCardStyle } from './participant-card.js';

export function renderParticipantsPreview({ lang, participants, ejes }) {
  const people = participants.filter((p) => p.rol !== 'poster');
  const posters = participants.filter((p) => p.rol === 'poster');
  const card = (p) => renderParticipantCard({ lang, participant: p, ejes });

  const column = (heading, list, extraClass = '') => `<section class="pp-col" data-group>
        <h3 class="pp-col__head">${heading} <span>${list.length}</span></h3>
        <div class="pp-col__scroll" tabindex="0" aria-label="${heading}">
          <div class="pp-col__grid ${extraClass}">
            ${list.map(card).join('\n            ')}
          </div>
          <p class="pp-col__empty" data-group-empty hidden>${t(lang, 'participantes.sin_resultados')}</p>
        </div>
      </section>`;

  return `<section id="participantes" class="section participantes-preview">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'nav.participantes')}</span>
      <h2 class="section__title">${t(lang, 'participantes.heading')}</h2>
      <div class="divider"></div>
    </div>

    ${
      participants.length > 0
        ? `<div class="pp-filters" data-reveal>
      <input type="search" id="participantes-search" class="pp-filters__search"
        placeholder="${t(lang, 'participantes.buscar')}" aria-label="${t(lang, 'participantes.buscar')}" />
      <select id="participantes-eje" class="pp-filters__select" aria-label="${t(lang, 'participantes.filtrar_eje')}">
        <option value="">${t(lang, 'participantes.todos_ejes')}</option>
        ${ejes.map((eje) => `<option value="${eje.id}">${eje.nombre[lang]}</option>`).join('\n        ')}
      </select>
    </div>

    <div id="participantes-grid" class="pp-cols" data-reveal>
      ${column(t(lang, 'participantes.ponentes_heading'), people)}
      ${posters.length > 0 ? column(t(lang, 'participantes.posters_heading'), posters, 'pp-col__grid--posters') : ''}
    </div>`
        : `<div class="card participantes-preview__empty" data-reveal>
      <span class="participantes-preview__empty-icon">✦</span>
      <p>${t(lang, 'stats.soon')}</p>
    </div>`
    }
  </div>
</section>

${participantCardStyle}
${participants.length > 0 ? `<script type="module" src="../client/participantes.js"></script>` : ''}
<style>
  .pp-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .pp-filters__search,
  .pp-filters__select {
    font-family: var(--font-body);
    font-size: 0.95rem;
    padding: 0.7rem 1rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--color-muted) 35%, transparent);
    background: var(--color-surface);
    color: var(--color-text);
    min-width: 0;
    max-width: 100%;
  }
  .pp-filters__search { flex: 1 1 320px; }
  .pp-filters__select { flex: 0 1 340px; }

  .pp-cols {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }
  .pp-col {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
  }
  .pp-col__head {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.15rem, 2vw, 1.4rem);
    font-weight: 700;
  }
  .pp-col__head span {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--color-muted);
  }
  /* Fixed-height box; the cards scroll inside it. */
  .pp-col__scroll {
    height: clamp(480px, 72vh, 760px);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0.75rem;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--color-muted) 8%, transparent);
    scrollbar-width: thin;
  }
  .pp-col__scroll:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  .pp-col__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }
  .pp-col__empty {
    margin: 2rem 0;
    text-align: center;
    color: var(--color-muted);
    font-family: var(--font-body);
  }
  @media (max-width: 1180px) {
    .pp-col__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 860px) {
    .pp-cols { grid-template-columns: 1fr; }
    .pp-col__scroll { height: 560px; }
  }
  @media (max-width: 380px) {
    .pp-col__scroll { padding: 0.5rem; }
    .pp-col__grid { gap: 0.5rem; }
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
</style>`;
}
