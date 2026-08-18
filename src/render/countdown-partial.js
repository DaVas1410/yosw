// Ported from src/components/Countdown.astro.
// The inline <script> (ticking timer) moves to src/client/countdown.js,
// importing breakdown() from src/lib/countdown.js.

import { t } from '../lib/i18n.js';

export function renderCountdownPartial({ lang, target }) {
  const labels = {
    d: t(lang, 'countdown.days'),
    h: t(lang, 'countdown.hours'),
    m: t(lang, 'countdown.min'),
    s: t(lang, 'countdown.sec'),
  };

  return `<div class="countdown" data-target="${target}">
  <div class="countdown__unit">
    <span class="countdown__value" data-unit="d">0</span>
    <span class="countdown__label">${labels.d}</span>
  </div>
  <div class="countdown__unit">
    <span class="countdown__value" data-unit="h">0</span>
    <span class="countdown__label">${labels.h}</span>
  </div>
  <div class="countdown__unit">
    <span class="countdown__value" data-unit="m">0</span>
    <span class="countdown__label">${labels.m}</span>
  </div>
  <div class="countdown__unit">
    <span class="countdown__value" data-unit="s">0</span>
    <span class="countdown__label">${labels.s}</span>
  </div>
</div>

<style>
  .countdown {
    display: flex;
    gap: calc(var(--space) * 1.5);
    flex-wrap: wrap;
  }
  .countdown__unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    min-width: 74px;
    padding: 0.75rem 0.5rem;
    background: var(--color-surface);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--color-border);
    border-radius: 14px;
    box-shadow: var(--shadow-sm);
  }
  .countdown__value {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    background: var(--grad-brand);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .countdown__label {
    font-family: var(--font-body);
    font-size: 0.7rem;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
</style>

<script type="module" src="/client/countdown.js"></script>`;
}
