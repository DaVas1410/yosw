// Ported from src/components/timeline/ProgramTimeline.astro.
// The inline <script> (day tab switcher) moves verbatim to
// src/client/program-timeline.js.

import { t } from '../lib/i18n.js';
import { toTimeline } from '../lib/transform.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function displayValue(lang, value) {
  return value === 'TBD' ? t(lang, 'programa.tbd_value') : escapeHtml(value);
}

function renderSublist({ lang, talks, panelists }) {
  if (talks?.length) {
    return `<div class="agenda__extra">
              <span class="agenda__extra-heading">${t(lang, 'programa.speakers_heading')}</span>
              <ul class="agenda__sublist">
                ${talks
                  .map(
                    (talk) => `<li class="agenda__subitem">
                  ${talk.hora ? `<span class="agenda__sub-time">${escapeHtml(talk.hora)}</span>` : ''}
                  <span>${displayValue(lang, talk.speaker)}${talk.tema ? ` — ${displayValue(lang, talk.tema)}` : ''}</span>
                </li>`
                  )
                  .join('\n                ')}
              </ul>
            </div>`;
  }
  if (panelists?.length) {
    return `<div class="agenda__extra">
              <span class="agenda__extra-heading">${t(lang, 'programa.panelists_heading')}</span>
              <ul class="agenda__sublist">
                ${panelists
                  .map((p) => `<li class="agenda__subitem"><span>${displayValue(lang, p)}</span></li>`)
                  .join('\n                ')}
              </ul>
            </div>`;
  }
  return '';
}

function renderEvent({ lang, event }) {
  const timeLabel = event.end ? `${event.start}–${event.end}` : event.start;
  const categoryLabel = t(lang, `programa.categoria.${event.categoria}`);
  const hasExtra = Boolean(event.talks?.length || event.panelists?.length);
  const style = `style="--item-color: var(--cat-${event.categoria})"`;

  const summary = `<span class="agenda__time">${escapeHtml(timeLabel)}</span>
          <span class="agenda__badge">${escapeHtml(categoryLabel)}</span>
          <span class="agenda__title">${escapeHtml(event.titulo)}</span>`;

  const caption = event.detalle
    ? `<p class="agenda__caption">${escapeHtml(event.detalle)}</p>`
    : '';

  if (!hasExtra) {
    return `<li class="agenda__item" ${style}>
          <div class="agenda__row">
            ${summary}
          </div>
          ${caption}
        </li>`;
  }

  return `<li class="agenda__item" ${style}>
          <details class="agenda__details">
            <summary class="agenda__row agenda__row--toggle">
              ${summary}
              <svg class="agenda__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>
            </summary>
            <div class="agenda__content">
              ${caption}
              ${renderSublist({ lang, talks: event.talks, panelists: event.panelists })}
            </div>
          </details>
        </li>`;
}

export function renderProgramTimeline({ lang, calendario }) {
  const locale = lang === 'es' ? 'es-EC' : 'en-US';
  const timeline = toTimeline(calendario, lang);
  const days = calendario.dias.map((dia, i) => {
    const date = new Date(`${dia.fecha}T00:00:00`);
    return {
      key: `d${i + 1}`,
      weekday: date.toLocaleDateString(locale, { weekday: 'short' }).replace(/\.$/, ''),
      dayNum: date.getDate(),
      events: timeline[i].events,
    };
  });

  return `<section id="programa" class="section programa">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'nav.programa')}</span>
      <h2 class="section__title">${t(lang, 'programa.heading')}</h2>
      <p class="section__lead">${t(lang, 'programa.tbd_lead')}</p>
      <div class="divider"></div>
    </div>

    <div data-reveal>
      <div class="programa__tabs" role="tablist" aria-label="${t(lang, 'programa.dias_aria')}">
        ${days
          .map(
            (day, i) => `<button type="button" class="programa__tab${i === 0 ? ' is-active' : ''}" data-tab="${day.key}">
          ${day.weekday} ${day.dayNum}
        </button>`
          )
          .join('\n        ')}
      </div>
      ${days
        .map(
          (day, i) => `<div class="programa__panel${i === 0 ? ' is-active' : ''}" data-panel="${day.key}">
        ${
          day.events.length
            ? `<ol class="agenda">
          ${day.events.map((event) => renderEvent({ lang, event })).join('\n          ')}
        </ol>`
            : `<div class="programa__tbd">
          <span class="programa__tbd-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18"></path></svg>
          </span>
          <p>${t(lang, 'programa.tbd')}</p>
        </div>`
        }
      </div>`
        )
        .join('\n      ')}
      <p class="programa__note">${t(lang, 'programa.nota')}</p>
    </div>
  </div>
</section>

<style>
  .programa .section__wrap {
    max-width: 900px;
  }
  .programa__tabs {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.2rem;
    padding-bottom: 0.5rem;
    scrollbar-width: thin;
  }
  .programa__tab {
    border: 2px solid var(--color-border);
    background: var(--color-surface);
    border-radius: 999px;
    padding: 0.5rem 1rem;
    font-weight: 800;
    font-size: 0.83rem;
    color: var(--color-muted);
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: 0.25s ease;
    font-family: var(--font-body);
    text-transform: capitalize;
  }
  .programa__tab:hover {
    border-color: var(--y-blue);
    color: var(--y-blue);
  }
  .programa__tab.is-active {
    background: var(--y-blue);
    border-color: var(--y-blue);
    color: #fff;
  }
  .programa__panel {
    display: none;
    animation: programa-fade-in 0.4s ease;
  }
  .programa__panel.is-active {
    display: block;
  }
  @keyframes programa-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }
  .programa__tbd {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    text-align: center;
    padding: clamp(3rem, 8vw, 4.5rem) 1.5rem;
    color: var(--color-muted);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
  }
  .programa__tbd-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--y-blue) 10%, transparent);
    color: var(--y-blue);
  }
  .programa__tbd-icon svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }
  .programa__tbd p {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--y-blue-dk);
    margin: 0;
  }
  .programa__note {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.8rem;
    color: var(--color-muted-2);
    font-style: italic;
  }

  /* -- agenda list -------------------------------------------------------- */
  .agenda {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .agenda__item {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--item-color, var(--y-blue));
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .agenda__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem 0.9rem;
    padding: 0.85rem 1.1rem;
  }
  .agenda__row--toggle {
    cursor: pointer;
    list-style: none;
    user-select: none;
  }
  .agenda__row--toggle::-webkit-details-marker {
    display: none;
  }
  .agenda__row--toggle:hover {
    background: color-mix(in srgb, var(--item-color, var(--y-blue)) 6%, transparent);
  }
  .agenda__time {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.82rem;
    color: var(--color-muted);
    min-width: 100px;
  }
  .agenda__badge {
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.22rem 0.6rem;
    border-radius: 999px;
    color: #fff;
    background: var(--item-color, var(--y-blue));
    white-space: nowrap;
  }
  .agenda__title {
    flex: 1 1 auto;
    min-width: 160px;
    font-weight: 600;
    color: var(--color-text);
  }
  .agenda__caption {
    margin: -0.35rem 1.1rem 0.85rem calc(100px + 0.9rem);
    font-size: 0.8rem;
    font-style: italic;
    color: var(--color-muted-2);
  }
  @media (max-width: 560px) {
    .agenda__caption {
      margin: -0.2rem 1.1rem 0.85rem 1.1rem;
    }
  }
  .agenda__chevron {
    width: 18px;
    height: 18px;
    margin-left: auto;
    flex-shrink: 0;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    color: var(--color-muted);
    transition: transform 0.25s ease;
  }
  .agenda__details[open] .agenda__chevron {
    transform: rotate(180deg);
  }
  .agenda__content {
    padding: 0 1.1rem 1rem;
    border-top: 1px dashed var(--color-border);
    margin-top: -1px;
    padding-top: 0.8rem;
  }
  .agenda__extra-heading {
    display: block;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-muted-2);
    margin-bottom: 0.4rem;
  }
  .agenda__sublist {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .agenda__subitem {
    display: flex;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--color-text);
  }
  .agenda__sub-time {
    font-weight: 700;
    color: var(--color-muted);
    min-width: 52px;
  }
  @media (max-width: 560px) {
    .agenda__time {
      min-width: auto;
      order: 1;
    }
    .agenda__badge {
      order: 2;
    }
    .agenda__title {
      order: 3;
      flex-basis: 100%;
    }
    .agenda__chevron {
      order: 4;
      margin-left: 0;
    }
  }
</style>

<script src="../client/program-timeline.js" defer></script>`;
}
