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
  const ejeChip = eje
    ? `<span class="p-card__eje" style="--eje-color: ${eje.color}">${escapeHtml(eje.nombre[lang])}</span>`
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
      : `<div class="p-card__poster p-card__poster--empty" aria-hidden="true"></div>`
  }
  <div class="p-card__body">
    ${ejeChip}
    <h3 class="p-card__title">${escapeHtml(titulo)}</h3>
    <p class="p-card__name">${escapeHtml(p.nombre)}</p>
    ${institucion ? `<p class="p-card__inst">${escapeHtml(institucion)}</p>` : ''}
    ${p.poster ? `<span class="p-card__cta">${t(lang, 'participantes.ver_poster')} <span aria-hidden="true">↗</span></span>` : ''}
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

  return `<${tag} class="p-card" ${dataAttrs}${linkAttrs}>
  ${
    p.foto
      ? `<img class="p-card__photo" src="../assets/${escapeHtml(p.foto)}" alt="${escapeHtml(p.nombre)}" loading="lazy" width="96" height="96" />`
      : `<div class="p-card__initials" aria-hidden="true">${escapeHtml(initials)}</div>`
  }
  <div class="p-card__body">
    <span class="p-card__rol">${rolLabel}</span>
    <h3 class="p-card__name">${escapeHtml(p.nombre)}</h3>
    ${institucion ? `<p class="p-card__inst">${escapeHtml(institucion)}</p>` : ''}
    ${ejeChip}
    ${titulo ? `<p class="p-card__talk">${escapeHtml(titulo)}</p>` : ''}
    ${when ? `<p class="p-card__when">${escapeHtml(when)}</p>` : ''}
  </div>
</${tag}>`;
}

export const participantCardStyle = `<style>
  .p-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space);
    background: var(--color-surface);
    border-radius: var(--radius);
    padding: calc(var(--space) * 2);
    text-decoration: none;
    color: var(--color-text);
    text-align: center;
  }
  .p-card[hidden] { display: none; }
  .p-card__photo,
  .p-card__initials {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    flex: none;
  }
  .p-card__photo { object-fit: cover; }
  .p-card__initials {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--grad-brand, var(--color-accent));
    color: #fff;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.35rem;
  }
  .p-card__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--space) / 2);
    min-width: 0;
    width: 100%;
  }
  .p-card__rol {
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-muted);
  }
  .p-card__name {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.25;
    margin: 0;
  }
  .p-card__inst {
    font-family: var(--font-body);
    font-size: 0.78rem;
    line-height: 1.35;
    color: var(--color-muted);
    margin: 0;
  }
  .p-card__eje {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--eje-color);
    border: 1px solid var(--eje-color);
    border-radius: 10px;
    line-height: 1.3;
    padding: 0.15rem 0.6rem;
  }
  .p-card__talk,
  .p-card__title {
    font-family: var(--font-body);
    font-size: 0.85rem;
    line-height: 1.4;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .p-card__talk { font-style: italic; }
  .p-card__when {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-accent);
    margin: 0;
  }
  .p-card--poster {
    padding: 0;
    overflow: hidden;
    align-items: stretch;
    text-align: left;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .p-card--poster:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgb(0 0 0 / 0.12); }
  .p-card--poster .p-card__body {
    align-items: flex-start;
    padding: 0 calc(var(--space) * 1.5) calc(var(--space) * 1.5);
  }
  .p-card__poster {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    object-position: top;
    background: color-mix(in srgb, var(--color-muted) 12%, transparent);
  }
  .p-card--poster .p-card__title { font-weight: 600; font-family: var(--font-display); }
  .p-card--poster .p-card__name { font-size: 0.82rem; font-weight: 500; font-family: var(--font-body); }
  .p-card__cta {
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-accent);
    margin-top: auto;
  }
</style>`;
