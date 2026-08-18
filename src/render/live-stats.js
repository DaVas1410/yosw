// Ported from src/components/data/LiveStats.astro.
// The inline <script> (fetches the live sheet, calls parseSheetRows()) moves
// to src/client/live-stats.js, imported as an ES module.

import { t } from '../lib/i18n.js';

export function renderLiveStats({ lang, sheetUrl }) {
  const soonLabel = t(lang, 'stats.soon');

  const tiles = [
    { metric: 'attendees', label: t(lang, 'stats.attendees') },
    { metric: 'posters', label: t(lang, 'stats.posters') },
    { metric: 'ideaton_teams', label: t(lang, 'stats.ideaton_teams') },
    { metric: 'participants', label: t(lang, 'stats.participants') },
  ];

  return `<div class="live-stats" data-sheet-url="${sheetUrl ?? ''}" data-soon-label="${soonLabel}">
  ${tiles
    .map(
      (tile) => `<div class="live-stats__tile" data-metric="${tile.metric}">
    <span class="live-stats__value is-placeholder" data-role="value">${soonLabel}</span>
    <span class="live-stats__label">${tile.label}</span>
  </div>`
    )
    .join('\n  ')}
</div>

<style>
  .live-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: calc(var(--space) * 2.5);
  }
  .live-stats__tile {
    background: var(--color-surface);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    padding: calc(var(--space) * 3) calc(var(--space) * 2.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    text-align: center;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
  }
  .live-stats__tile:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
  .live-stats__value {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    font-weight: 700;
    line-height: 1;
    background: var(--grad-brand);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .live-stats__value.is-placeholder {
    font-size: 1.05rem;
    font-weight: 700;
    background: none;
    -webkit-background-clip: unset;
    background-clip: unset;
    color: var(--color-muted-2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .live-stats__label {
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--color-muted);
  }
  @media (max-width: 640px) {
    .live-stats { grid-template-columns: repeat(2, 1fr); }
  }
</style>

<script type="module" src="/client/live-stats.js"></script>`;
}
