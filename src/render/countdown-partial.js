// Ported from src/components/Countdown.astro. data-phase (before/live/after)
// is set by the client script and toggles which block is visible.
// The inline <script> (ticking timer) moves to src/client/countdown.js,
// importing breakdown() from src/lib/countdown.js.

import { t } from '../lib/i18n.js';

export function renderCountdownPartial({ lang, target, end, stream }) {
  // stream: truthy when a live stream is configured; the button jumps to the
  // embedded player in the #en-vivo section.
  const labels = {
    d: t(lang, 'countdown.days'),
    h: t(lang, 'countdown.hours'),
    m: t(lang, 'countdown.min'),
    s: t(lang, 'countdown.sec'),
  };

  const endAttr = end ? ` data-end="${end}"` : '';

  return `<div class="countdown" data-target="${target}"${endAttr} data-phase="before">
  <div class="countdown__live" role="status">
    <span class="countdown__pill"><i aria-hidden="true"></i> ${t(lang, 'countdown.live.badge')}</span>
    <span class="countdown__day" data-live-day data-template="${t(lang, 'countdown.live.day')}"></span>
    <p class="countdown__headline">${t(lang, 'countdown.live.headline')}</p>
    ${stream ? `<a class="btn btn-primary countdown__stream" href="#en-vivo">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"></path></svg>
      ${t(lang, 'countdown.live.stream')}
    </a>` : ''}
  </div>
  <p class="countdown__done">${t(lang, 'countdown.done')}</p>
  <div class="countdown__units">
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
  <p class="countdown__caption">${t(lang, 'countdown.live.caption')}</p>
</div>

<style>
  .countdown__live,
  .countdown__caption,
  .countdown__done { display: none; }
  .countdown[data-phase="live"] .countdown__live { display: flex; }
  .countdown[data-phase="live"] .countdown__caption { display: block; }
  .countdown[data-phase="after"] .countdown__units { display: none; }
  .countdown[data-phase="after"] .countdown__done { display: block; }
  .countdown__live {
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    margin-bottom: 1rem;
  }
  .countdown__pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    background: #d6263a;
    color: #fff;
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .countdown__pill i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fff;
    animation: countdown-pulse 1.4s ease-in-out infinite;
  }
  @keyframes countdown-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.7); }
  }
  @media (prefers-reduced-motion: reduce) {
    .countdown__pill i { animation: none; }
  }
  .countdown__day {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.05rem;
  }
  .countdown__headline {
    flex-basis: 100%;
    margin: 0;
    font-family: var(--font-body);
    color: var(--color-muted);
  }
  .countdown__stream {
    gap: 0.5rem;
  }
  .countdown__stream svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }
  .countdown__caption {
    margin: 0.6rem 0 0;
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .countdown__done {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.1rem, 2.4vw, 1.4rem);
    font-weight: 700;
  }
  .countdown__units {
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

<script type="module" src="../client/countdown.js"></script>`;
}
