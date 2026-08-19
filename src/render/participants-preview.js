// Ported from src/components/participants/ParticipantsPreview.astro.
// No inline <script> in the source.

import { t } from '../lib/i18n.js';
import { renderParticipantCard, participantCardStyle } from './participant-card.js';

export function renderParticipantsPreview({ lang, participants, ejes }) {
  const preview = participants.slice(0, 8);

  return `<section id="participantes" class="section participantes-preview">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'nav.participantes')}</span>
      <h2 class="section__title">${t(lang, 'participantes.heading')}</h2>
      <div class="divider"></div>
    </div>

    ${
      preview.length > 0
        ? `<div class="participantes-preview__grid" data-reveal>
      ${preview.map((p) => renderParticipantCard({ lang, participant: p, ejes })).join('\n      ')}
    </div>`
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
  .participantes-preview__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: calc(var(--space) * 2);
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
