// Ported from src/components/participants/ParticipantCard.astro.
// No inline <script> in the source. Pure presentational.
// NOTE: src/client/participantes.js reimplements this markup client-side
// (no bundler to share between build-time Node and the browser) — keep the
// two in sync manually when editing either.

export function renderParticipantCard({ lang, participant, ejes }) {
  const eje = ejes.find((e) => e.id === participant.eje);
  const initials = participant.nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const tag = participant.enlace ? 'a' : 'div';
  const linkAttrs = participant.enlace
    ? ` href="${participant.enlace}" target="_blank" rel="noopener noreferrer"`
    : '';

  return `<${tag} class="p-card" data-participant data-eje="${participant.eje ?? ''}" data-rol="${participant.rol}" data-nombre="${participant.nombre}"${linkAttrs}>
  ${
    participant.foto
      ? `<img class="p-card__photo" src="${participant.foto}" alt="${participant.nombre}" loading="lazy" />`
      : `<div class="p-card__initials" aria-hidden="true">${initials}</div>`
  }
  <div class="p-card__body">
    <h3 class="p-card__name">${participant.nombre}</h3>
    <span class="p-card__rol">${participant.rol}</span>
    ${eje ? `<span class="p-card__eje" style="--eje-color: ${eje.color}">${eje.nombre[lang]}</span>` : ''}
  </div>
</${tag}>`;
}

export const participantCardStyle = `<style>
  .p-card {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space));
    background: var(--color-surface);
    border-radius: var(--radius);
    padding: calc(var(--space) * 2);
    text-decoration: none;
    color: var(--color-text);
    align-items: center;
    text-align: center;
  }
  .p-card__photo {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    object-fit: cover;
  }
  .p-card__initials {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-accent);
    color: var(--color-bg);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.25rem;
  }
  .p-card__body {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space) / 2);
  }
  .p-card__name {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
  .p-card__rol {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--color-muted);
    text-transform: capitalize;
  }
  .p-card__eje {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--eje-color);
    border: 1px solid var(--eje-color);
    border-radius: 999px;
    padding: 0.15rem 0.6rem;
    align-self: center;
  }
</style>`;
