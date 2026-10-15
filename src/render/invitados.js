// "Invitados especiales": headline guests (e.g. the UNESCO keynote), each as
// a wide card with the organisation's logo, the talk, when and where, and a
// link that opens that day in the programme. Data: src/data/invitados.json.

import { t } from '../lib/i18n.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const CAL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18"></path></svg>';
const PIN_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"></path><circle cx="12" cy="10" r="2.6"></circle></svg>';

function renderCard({ lang, inv, calendario }) {
  const locale = lang === 'es' ? 'es-EC' : 'en-US';
  const fecha = new Date(`${inv.fecha}T00:00:00`).toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const dayIndex = calendario.dias.findIndex((d) => d.fecha === inv.fecha);
  const ponente = inv.ponente === 'TBD' ? t(lang, 'programa.tbd_speaker') : escapeHtml(inv.ponente);
  return `<article class="invitado" data-reveal>
      <div class="invitado__logo">
        <img src="../assets/${escapeHtml(inv.logo)}" alt="${escapeHtml(inv.organizacion)}" width="262" height="56" />
      </div>
      <div class="invitado__body">
        <span class="invitado__tipo">${escapeHtml(inv.tipo[lang])}</span>
        <h3 class="invitado__titulo">${escapeHtml(inv.titulo[lang])}</h3>
        <p class="invitado__ponente"><strong>${ponente}</strong>${inv.cargo ? `<span>${escapeHtml(inv.cargo[lang])}</span>` : ` · ${escapeHtml(inv.organizacion)}`}</p>
        ${inv.resumen ? `<p class="invitado__resumen">${escapeHtml(inv.resumen[lang])}</p>` : ''}
        <ul class="invitado__meta">
          <li>${CAL_ICON}<span>${escapeHtml(fecha)} · ${escapeHtml(inv.hora_inicio)}–${escapeHtml(inv.hora_fin)}</span></li>
          <li>${PIN_ICON}<span>${escapeHtml(inv.lugar[lang])}</span></li>
        </ul>
        <a class="invitado__cta" href="#programa"${dayIndex >= 0 ? ` data-programa-dia="d${dayIndex + 1}"` : ''}>${t(lang, 'invitados.ver_programa')}</a>
      </div>
    </article>`;
}

export function renderInvitados({ lang, invitados, calendario }) {
  if (!invitados?.length) return '';
  return `<section id="invitados" class="section invitados">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'invitados.kicker')}</span>
      <h2 class="section__title">${t(lang, 'invitados.heading')}</h2>
      <div class="divider"></div>
    </div>
    <div class="invitados__list">
    ${invitados.map((inv) => renderCard({ lang, inv, calendario })).join('\n    ')}
    </div>
  </div>
</section>

<style>
  .invitados__list {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    max-width: 960px;
    margin: 0 auto;
  }
  .invitado {
    display: grid;
    grid-template-columns: minmax(220px, 0.8fr) 1.6fr;
    overflow: hidden;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius, 18px);
    box-shadow: var(--shadow-md, var(--shadow-sm));
  }
  .invitado__logo {
    display: grid;
    place-items: center;
    padding: 2rem 1.8rem;
    background: #fff;
    border-right: 1px solid var(--color-border);
  }
  .invitado__logo img {
    display: block;
    width: 100%;
    max-width: 260px;
    height: auto;
  }
  .invitado__body {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: clamp(1.4rem, 3vw, 2.2rem);
  }
  .invitado__tipo {
    align-self: flex-start;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #fff;
    background: var(--y-blue);
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
  }
  .invitado__titulo {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.15rem, 2.2vw, 1.45rem);
    line-height: 1.3;
    color: var(--y-blue-dk, var(--color-text));
    text-wrap: balance;
  }
  .invitado__ponente {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    font-weight: 600;
    color: var(--color-muted);
  }
  .invitado__ponente strong {
    font-size: 1.05rem;
    color: var(--color-text);
  }
  .invitado__resumen {
    margin: 0.2rem 0 0;
    font-size: 0.92rem;
    line-height: 1.55;
    color: var(--color-muted);
  }
  .invitado__meta {
    list-style: none;
    margin: 0.2rem 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.2rem;
    font-size: 0.9rem;
    color: var(--color-text);
  }
  .invitado__meta li {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .invitado__meta li:first-child span::first-letter {
    text-transform: uppercase;
  }
  .invitado__meta svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: var(--y-blue);
    stroke-width: 2;
    flex-shrink: 0;
  }
  .invitado__cta {
    align-self: flex-start;
    margin-top: 0.4rem;
    font-weight: 700;
    color: var(--y-blue);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .invitado__cta:hover {
    color: var(--y-blue-dk, var(--y-blue));
  }
  @media (max-width: 700px) {
    .invitado {
      grid-template-columns: 1fr;
    }
    .invitado__logo {
      border-right: 0;
      border-bottom: 1px solid var(--color-border);
      padding: 1.4rem;
    }
    .invitado__logo img {
      max-width: 200px;
    }
  }
</style>`;
}
