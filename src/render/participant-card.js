// Ported from src/components/participants/ParticipantCard.astro.
// Two shapes share the directory grid: a person card (photo or initials,
// institution, the talk they give and when) and a poster card (poster
// thumbnail linking to the full-size image). Pure presentational; filtering
// lives in src/client/participantes.js and only toggles `hidden`.

import { t } from '../lib/i18n.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const text = (value, lang) => (value == null ? '' : typeof value === 'string' ? value : value[lang]);

// "2026-10-21" → "mié 21 oct" / "Wed, Oct 21".
function formatDay(fecha, lang) {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-EC' : 'en-US', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  }).format(new Date(`${fecha}T12:00:00Z`));
}

export function renderParticipantCard({ lang, participant: p, ejes }) {
  const eje = ejes.find((e) => e.id === p.eje);
  const titulo = p.trabajo ? text(p.trabajo.titulo, lang) : '';
  const institucion = text(p.institucion, lang);
  const searchText = [p.nombre, titulo, institucion].join(' ');
  const rolLabel = t(lang, `participantes.rol.${p.rol}`);
  // Short track label ("Salud Digital") on one line; the full name is the tooltip.
  const ejeTag = eje
    ? `<span class="p-card__eje" style="--eje-color: ${eje.color}" title="${escapeHtml(eje.nombre[lang])}">${escapeHtml(eje.nombre[lang].split(/[,:]/)[0])}</span>`
    : '';
  const dataAttrs = `data-participant data-eje="${p.eje ?? ''}" data-rol="${escapeHtml(p.rol)}" data-nombre="${escapeHtml(searchText)}"`;

  if (p.rol === 'poster') {
    // A poster without an uploaded image still gets its card, with a blank frame.
    const tagP = p.poster ? 'a' : 'article';
    const linkP = p.poster ? ` href="../assets/${escapeHtml(p.poster.full)}" target="_blank" rel="noopener"` : '';
    return `<${tagP} class="p-card p-card--poster" ${dataAttrs}${linkP}>
  ${
    p.poster
      ? `<img class="p-card__poster" src="../assets/${escapeHtml(p.poster.thumb)}" alt="${escapeHtml(`${t(lang, 'participantes.rol.poster')}: ${titulo}`)}" loading="lazy" />`
      : `<div class="p-card__poster" aria-hidden="true"></div>`
  }
  <div class="p-card__body">
    ${ejeTag || '<span class="p-card__eje"></span>'}
    <h3 class="p-card__title" title="${escapeHtml(titulo)}">${escapeHtml(titulo)}</h3>
    <p class="p-card__by">${escapeHtml(p.nombre)}</p>
  </div>
</${tagP}>`;
  }

  const initials = p.nombre
    .split(/\s+/)
    .filter((part) => /^\p{Lu}/u.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
  const when = p.trabajo?.fecha
    ? [formatDay(p.trabajo.fecha, lang), p.trabajo.hora, text(p.trabajo.lugar, lang)].filter(Boolean).join(' · ')
    : '';
  const tag = p.enlace ? 'a' : 'article';
  const linkAttrs = p.enlace ? ` href="${escapeHtml(p.enlace)}" target="_blank" rel="noopener noreferrer"` : '';

  return `<${tag} class="p-card p-card--person" ${dataAttrs}${linkAttrs}>
  ${
    p.foto
      ? `<img class="p-card__photo" src="../assets/${escapeHtml(p.foto)}" alt="${escapeHtml(p.nombre)}" loading="lazy" width="88" height="88" />`
      : `<div class="p-card__photo p-card__initials" aria-hidden="true">${escapeHtml(initials)}</div>`
  }
  <span class="p-card__rol">${rolLabel}</span>
  <h3 class="p-card__name">${escapeHtml(p.nombre)}</h3>
  <p class="p-card__inst" title="${escapeHtml(institucion)}">${escapeHtml(institucion)}</p>
  ${ejeTag || '<span class="p-card__eje"></span>'}
  <p class="p-card__talk" title="${escapeHtml(titulo)}">${escapeHtml(titulo)}</p>
  <p class="p-card__when">${escapeHtml(when)}</p>
</${tag}>`;
}

// Every text slot has a fixed number of lines (clamped and reserved even when
// empty), so all cards in a row are the same height and line up.
export const participantCardStyle = `<style>
  .p-card {
    --lh: 1.3;
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border-radius: var(--radius);
    text-decoration: none;
    color: var(--color-text);
    overflow: hidden;
    min-width: 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .p-card[hidden] { display: none; }
  a.p-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgb(0 0 0 / 0.12); }
  .p-card p, .p-card h3 { margin: 0; }
  .p-card__clamp, .p-card__name, .p-card__inst, .p-card__talk, .p-card__title, .p-card__by {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    hyphens: auto;
    line-height: var(--lh);
  }

  .p-card--person {
    align-items: center;
    text-align: center;
    gap: 0.4rem;
    padding: 1.25rem 1rem 1.1rem;
  }
  .p-card__photo {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    object-fit: cover;
    flex: none;
    margin-bottom: 0.35rem;
  }
  .p-card__initials {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--grad-brand, var(--color-accent));
    color: #fff;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.5rem;
  }
  .p-card__rol {
    font-family: var(--font-body);
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-muted);
  }
  .p-card__name {
    font-family: var(--font-display);
    font-size: 0.98rem;
    font-weight: 700;
    -webkit-line-clamp: 2;
    min-height: calc(2em * var(--lh));
  }
  .p-card__inst {
    font-family: var(--font-body);
    font-size: 0.76rem;
    color: var(--color-muted);
    -webkit-line-clamp: 1;
    min-height: calc(1em * var(--lh));
    width: 100%;
  }
  .p-card__eje {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    max-width: 100%;
    min-height: 1.1rem;
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--eje-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .p-card__eje:not(:empty)::before {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--eje-color);
    flex: none;
  }
  .p-card__talk {
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-style: italic;
    -webkit-line-clamp: 3;
    min-height: calc(3em * var(--lh));
    width: 100%;
  }
  .p-card__when {
    margin-top: auto !important;
    padding-top: 0.25rem;
    font-family: var(--font-body);
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--color-accent);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    line-height: var(--lh);
    min-height: calc(2em * var(--lh) + 0.25rem);
  }

  .p-card--poster { gap: 0; }
  .p-card__poster {
    display: block;
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    object-position: top;
    background: color-mix(in srgb, var(--color-muted) 14%, transparent);
  }
  .p-card--poster .p-card__body {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0.75rem 0.85rem 0.9rem;
  }
  .p-card__title {
    font-family: var(--font-display);
    font-size: 0.86rem;
    font-weight: 600;
    -webkit-line-clamp: 3;
    min-height: calc(3em * var(--lh));
  }
  .p-card__by {
    font-family: var(--font-body);
    font-size: 0.74rem;
    color: var(--color-muted);
    -webkit-line-clamp: 1;
  }
</style>`;
