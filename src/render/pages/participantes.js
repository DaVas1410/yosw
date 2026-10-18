// Ported from src/pages/[lang]/participantes.astro.
// Full participants directory: search/eje/rol filter UI + full participant
// card grid (all entries, unlike the home page's 8-item preview), wired to
// src/client/participantes.js for client-side filtering.

import { t } from '../../lib/i18n.js';
import { renderPageShell } from '../page-shell.js';
import { renderNav } from '../nav.js';
import { renderParticipantCard, participantCardStyle } from '../participant-card.js';

export function renderParticipantesPage({ lang, data }) {
  const { participants, ejes } = data;
  const currentPath = `/${lang}/participantes`;
  const ROLE_ORDER = ['invitado', 'panelista', 'ponente', 'poster'];
  const roles = ROLE_ORDER.filter((rol) => participants.some((p) => p.rol === rol));
  const people = participants.filter((p) => p.rol !== 'poster');
  const posters = participants.filter((p) => p.rol === 'poster');
  const cards = (list) => list.map((p) => renderParticipantCard({ lang, participant: p, ejes })).join('\n      ');

  const bodyHtml = `${renderNav({ lang, currentPath })}

<main id="main" class="participantes-page">
  <div class="participantes-page__inner">
    <h1 class="participantes-page__heading">${t(lang, 'participantes.heading')}</h1>

    ${
      participants.length > 0
        ? `<div class="participantes-page__filters">
      <input
        type="search"
        id="participantes-search"
        class="participantes-page__search"
        placeholder="${t(lang, 'participantes.buscar')}"
        aria-label="${t(lang, 'participantes.buscar')}"
      />
      <select id="participantes-eje" class="participantes-page__select" aria-label="${t(lang, 'participantes.filtrar_eje')}">
        <option value="">${t(lang, 'participantes.todos_ejes')}</option>
        ${ejes.map((eje) => `<option value="${eje.id}">${eje.nombre[lang]}</option>`).join('\n        ')}
      </select>
      <select id="participantes-rol" class="participantes-page__select" aria-label="${t(lang, 'participantes.filtrar_rol')}">
        <option value="">${t(lang, 'participantes.todos_roles')}</option>
        ${roles.map((rol) => `<option value="${rol}">${t(lang, `participantes.rol_plural.${rol}`)}</option>`).join('\n        ')}
      </select>
    </div>

    <div id="participantes-grid">
      <section class="participantes-page__group" data-group>
        <h2 class="participantes-page__subheading">${t(lang, 'participantes.ponentes_heading')} <span class="participantes-page__count">${people.length}</span></h2>
        <div class="participantes-page__grid">
      ${cards(people)}
        </div>
      </section>
      ${
        posters.length > 0
          ? `<section class="participantes-page__group" data-group>
        <h2 class="participantes-page__subheading">${t(lang, 'participantes.posters_heading')} <span class="participantes-page__count">${posters.length}</span></h2>
        <p class="participantes-page__note">${t(lang, 'participantes.posters_lead')}</p>
        <div class="participantes-page__grid participantes-page__grid--posters">
      ${cards(posters)}
        </div>
      </section>`
          : ''
      }
    </div>

    <p id="participantes-empty" class="participantes-page__empty" hidden>
      ${t(lang, 'participantes.sin_resultados')}
    </p>`
        : `<p class="participantes-page__empty">${t(lang, 'stats.soon')}</p>`
    }

    <a class="participantes-page__back" href="./#participantes">
      ${t(lang, 'participantes.volver')}
    </a>
  </div>
</main>

${participantCardStyle}
${participants.length > 0 ? `<script type="module" src="../client/participantes.js"></script>` : ''}`;

  return renderPageShell({
    lang,
    title: `${t(lang, 'participantes.heading')} · ${t(lang, 'brand.short')}`,
    bodyHtml,
    extraStyles: ['../styles/participantes.css'],
  });
}
