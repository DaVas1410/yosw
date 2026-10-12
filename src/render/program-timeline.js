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

function renderTalkItems(lang, talks) {
  return talks
    .map(
      (talk) => `<li class="agenda__subitem">
                  ${talk.hora ? `<span class="agenda__sub-time">${escapeHtml(talk.hora)}</span>` : ''}
                  <span>${displayValue(lang, talk.speaker)}${talk.tema ? ` — ${displayValue(lang, talk.tema)}` : ''}</span>
                </li>`
    )
    .join('\n                ');
}

// One talk inside a room: time, title, speaker/affiliation, axis and an
// optional short description. "TBD" speaker/title show as "por confirmar".
function renderSalaTalk({ lang, talk, ejes }) {
  const eje = talk.eje != null ? ejes.find((e) => e.id === talk.eje) : null;
  const time = talk.fin ? `${talk.hora}–${talk.fin}` : talk.hora;
  const titulo = !talk.tema || talk.tema === 'TBD' ? t(lang, 'programa.tbd_title') : escapeHtml(talk.tema);
  const speaker = talk.speaker === 'TBD' ? t(lang, 'programa.tbd_speaker') : escapeHtml(talk.speaker);
  const pending = talk.speaker === 'TBD' || !talk.tema || talk.tema === 'TBD';
  const meta = [
    `<span class="sala-talk__speaker">${speaker}</span>`,
    talk.institucion ? `<span class="sala-talk__inst">${escapeHtml(talk.institucion)}</span>` : '',
  ].filter(Boolean).join(' · ');
  return `<li class="sala-talk${pending ? ' sala-talk--tbd' : ''}"${eje ? ` style="--track-color: ${eje.color}"` : ''}>
                    <span class="sala-talk__time">${escapeHtml(time ?? '')}</span>
                    <div class="sala-talk__body">
                      <span class="sala-talk__title">${titulo}</span>
                      <span class="sala-talk__meta">${meta}</span>
                      ${talk.coautores ? `<span class="sala-talk__coaut">${t(lang, 'programa.coautores')}: ${escapeHtml(talk.coautores)}</span>` : ''}
                      ${talk.descripcion ? `<p class="sala-talk__desc">${escapeHtml(talk.descripcion[lang])}</p>` : ''}
                      ${eje ? `<span class="sala-talk__eje">${escapeHtml(eje.nombre[lang])}</span>` : ''}
                    </div>
                  </li>`;
}

// A room's talks in order, with a break row wherever a talk starts later
// than the previous one ended (e.g. the 11:30–12:00 coffee break).
function renderSalaTalks({ lang, talks, ejes }) {
  return talks
    .map((talk, i) => {
      const prev = talks[i - 1];
      const gap = prev?.fin && talk.hora && talk.hora > prev.fin
        ? `<li class="sala-talk sala-talk--break">
                    <span class="sala-talk__time">${escapeHtml(prev.fin)}–${escapeHtml(talk.hora)}</span>
                    <span class="sala-talk__title">${t(lang, 'programa.break')}</span>
                  </li>
                  `
        : '';
      return gap + renderSalaTalk({ lang, talk, ejes });
    })
    .join('\n                  ');
}

// Simultaneous talks: one tab per room (all rooms stack when JS is off). A
// room named "TBD" shows as "Sala N" until its real name is filled in; an
// optional room-level `eje` colours the room and names the axis it hosts.
let paralelasCount = 0;
function renderParalelas({ lang, paralelas, ejes }) {
  const uid = `salas-${lang}-${++paralelasCount}`;
  const rooms = paralelas.map((p, i) => ({
    p,
    i,
    id: `${uid}-${i + 1}`,
    eje: p.eje != null ? ejes.find((e) => e.id === p.eje) : null,
    sala: p.sala === 'TBD' ? `${t(lang, 'programa.sala')} ${i + 1}` : escapeHtml(p.sala),
  }));
  return `<div class="agenda__extra salas" data-salas>
              <span class="agenda__extra-heading">${t(lang, 'programa.paralelas_heading')}</span>
              <div class="salas__tabs" role="tablist" aria-label="${t(lang, 'programa.sala_tabs_aria')}">
                ${rooms
                  .map(
                    (r) => `<button type="button" role="tab" class="salas__tab${r.i === 0 ? ' is-active' : ''}" id="${r.id}-tab" aria-controls="${r.id}" aria-selected="${r.i === 0}" tabindex="${r.i === 0 ? 0 : -1}"${r.eje ? ` style="--track-color: ${r.eje.color}"` : ''}>
                  ${r.sala}<span class="salas__count">${r.p.talks.length}</span>
                </button>`
                  )
                  .join('\n                ')}
              </div>
              ${rooms
                .map(
                  (r) => `<div class="salas__panel${r.i === 0 ? ' is-active' : ''}" id="${r.id}" role="tabpanel" aria-labelledby="${r.id}-tab"${r.eje ? ` style="--track-color: ${r.eje.color}"` : ''}>
                <span class="salas__panel-name">${r.sala}${r.eje ? ` — ${escapeHtml(r.eje.nombre[lang])}` : ''}</span>
                <ol class="sala-talks">
                  ${renderSalaTalks({ lang, talks: r.p.talks, ejes })}
                </ol>
              </div>`
                )
                .join('\n              ')}
            </div>`;
}

function renderSublist({ lang, talks, panelists }) {
  if (talks?.length) {
    return `<div class="agenda__extra">
              <span class="agenda__extra-heading">${t(lang, 'programa.speakers_heading')}</span>
              <ul class="agenda__sublist">
                ${renderTalkItems(lang, talks)}
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

const PIN_ICON = '<svg class="agenda__pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

function renderEvent({ lang, event, ejes }) {
  const timeLabel = event.end ? `${event.start}–${event.end}` : event.start;
  const categoryLabel = t(lang, `programa.categoria.${event.categoria}`);
  const hasParalelas = Boolean(event.paralelas?.length);
  const hasExtra = Boolean(event.talks?.length || event.panelists?.length || hasParalelas);
  const style = `style="--item-color: var(--cat-${event.categoria})"`;

  const tag = hasParalelas
    ? `\n          <span class="agenda__tag">${t(lang, 'programa.paralelas_tag')}</span>`
    : '';
  const lugar = event.lugar
    ? `\n          <span class="agenda__lugar">${PIN_ICON}${escapeHtml(event.lugar)}</span>`
    : '';
  const summary = `<span class="agenda__time">${escapeHtml(timeLabel)}</span>
          <span class="agenda__badge">${escapeHtml(categoryLabel)}</span>
          <span class="agenda__title">${escapeHtml(event.titulo)}</span>${tag}${lugar}`;

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
          <details class="agenda__details"${hasParalelas ? ' open' : ''}>
            <summary class="agenda__row agenda__row--toggle">
              ${summary}
              <svg class="agenda__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>
            </summary>
            <div class="agenda__content">
              ${caption}
              ${
                hasParalelas
                  ? renderParalelas({ lang, paralelas: event.paralelas, ejes })
                  : renderSublist({ lang, talks: event.talks, panelists: event.panelists })
              }
            </div>
          </details>
        </li>`;
}

export function renderProgramTimeline({ lang, calendario, ejes = [] }) {
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
      <div class="programa__tabs" data-reveal-stagger role="tablist" aria-label="${t(lang, 'programa.dias_aria')}">
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
          ${day.events.map((event) => renderEvent({ lang, event, ejes })).join('\n          ')}
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
    color: var(--color-muted);
  }
  @media (max-width: 560px) {
    .agenda__caption {
      margin: -0.2rem 1.1rem 0.85rem 1.1rem;
    }
  }
  .agenda__tag {
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.16rem 0.55rem;
    border-radius: 999px;
    color: var(--item-color, var(--y-blue));
    border: 1.5px solid currentColor;
    white-space: nowrap;
  }
  .agenda__lugar {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.78rem;
    color: var(--color-muted);
  }
  .agenda__pin {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }
  /* -- simultaneous rooms (tabs) ------------------------------------------ */
  .salas__tabs {
    display: flex;
    gap: 0.4rem;
    overflow-x: auto;
    padding-bottom: 0.3rem;
    margin-bottom: 0.6rem;
    scrollbar-width: thin;
  }
  .salas__tab {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    flex-shrink: 0;
    white-space: nowrap;
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    border: 1.5px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-muted);
    cursor: pointer;
    transition: 0.2s ease;
  }
  .salas__tab:hover {
    border-color: var(--item-color, var(--y-blue));
    color: var(--item-color, var(--y-blue));
  }
  .salas__tab.is-active {
    background: var(--item-color, var(--y-blue));
    border-color: var(--item-color, var(--y-blue));
    color: #fff;
  }
  .salas__count {
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    background: color-mix(in srgb, currentColor 16%, transparent);
  }
  .salas__panel-name {
    display: none;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.9rem;
    margin: 0.8rem 0 0.4rem;
  }
  /* Without JS every room stacks with its name; with JS only the active tab shows. */
  html:not(.js) .salas__tabs { display: none; }
  html:not(.js) .salas__panel-name { display: block; }
  .js .salas__panel:not(.is-active) { display: none; }
  .sala-talks {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .sala-talk {
    display: grid;
    grid-template-columns: 92px 1fr;
    gap: 0.2rem 0.8rem;
    padding: 0.7rem 0 0.7rem 0.75rem;
    border-left: 3px solid var(--track-color, var(--color-border));
    border-bottom: 1px solid var(--color-border);
  }
  .sala-talk:last-child {
    border-bottom: 0;
  }
  .sala-talk__time {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.78rem;
    color: var(--color-muted);
    padding-top: 0.1rem;
    white-space: nowrap;
  }
  .sala-talk__body {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }
  .sala-talk__title {
    font-weight: 700;
    font-size: 0.9rem;
    line-height: 1.35;
    color: var(--color-text);
    overflow-wrap: anywhere;
  }
  .sala-talk__meta {
    font-size: 0.8rem;
    color: var(--color-muted);
  }
  .sala-talk__speaker {
    font-weight: 700;
    color: var(--color-text);
  }
  .sala-talk__coaut {
    font-size: 0.75rem;
    color: var(--color-muted-2, var(--color-muted));
  }
  .sala-talk__desc {
    margin: 0.15rem 0 0;
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--color-muted);
  }
  .sala-talk__eje {
    align-self: flex-start;
    margin-top: 0.15rem;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.12rem 0.5rem;
    border-radius: 999px;
    color: var(--color-text);
    background: color-mix(in srgb, var(--track-color) 16%, transparent);
  }
  .sala-talk--tbd .sala-talk__title {
    font-style: italic;
    color: var(--color-muted);
  }
  .sala-talk--break {
    border-left-color: transparent;
    background: color-mix(in srgb, var(--color-muted) 7%, transparent);
    border-radius: 6px;
    padding-block: 0.45rem;
  }
  .sala-talk--break .sala-talk__title {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-muted);
  }
  @media (max-width: 560px) {
    .sala-talk {
      grid-template-columns: 1fr;
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
    color: var(--color-muted);
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
    .agenda__tag,
    .agenda__lugar {
      order: 3;
    }
    .agenda__chevron {
      order: 4;
      margin-left: 0;
    }
  }
  /* Each day's schedule cascades in when the section first reveals and again
     on every tab switch (the panel going display:none -> block restarts the
     animation). --i is set per item by motion.js. */
  .js [data-reveal].is-visible .programa__panel.is-active .agenda__item {
    animation: agenda-in 0.55s var(--ease-out) both;
    animation-delay: calc(80ms + var(--i, 0) * 45ms);
  }
  @keyframes agenda-in {
    from { opacity: 0; translate: -18px 0; }
    to { opacity: 1; translate: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .js [data-reveal].is-visible .programa__panel.is-active .agenda__item { animation: none; }
  }
</style>

<script src="../client/program-timeline.js" defer></script>`;
}
