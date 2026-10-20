// Ported from the inline <script> in src/components/Countdown.astro (ticking
// timer). Uses breakdown() from src/lib/countdown.js instead of a local
// re-declaration. Once the event starts the widget switches to a "live"
// state (day N of the week + countdown to the closing), and to a thank-you
// note once it ends.

import { breakdown, eventPhase, eventDay } from '../lib/countdown.js';

function initCountdown(el) {
  const targetStr = el.dataset.target;
  if (!targetStr) return;
  const start = new Date(targetStr).getTime();
  const end = el.dataset.end ? new Date(el.dataset.end).getTime() : Infinity;
  const totalDays = Number.isFinite(end) ? eventDay(end, start) : 0;

  const valueEls = {
    d: el.querySelector('[data-unit="d"]'),
    h: el.querySelector('[data-unit="h"]'),
    m: el.querySelector('[data-unit="m"]'),
    s: el.querySelector('[data-unit="s"]'),
  };
  const dayEl = el.querySelector('[data-live-day]');
  let timer;

  function tick() {
    const now = Date.now();
    const phase = eventPhase(now, start, end);
    el.dataset.phase = phase;
    if (phase === 'after') {
      clearInterval(timer);
      return;
    }
    if (phase === 'live' && dayEl) {
      dayEl.textContent = dayEl.dataset.template
        .replace('{n}', String(eventDay(now, start)))
        .replace('{total}', String(totalDays));
    }
    const parts = breakdown((phase === 'live' ? end : start) - now);
    if (valueEls.d) valueEls.d.textContent = String(parts.d);
    if (valueEls.h) valueEls.h.textContent = String(parts.h);
    if (valueEls.m) valueEls.m.textContent = String(parts.m);
    if (valueEls.s) valueEls.s.textContent = String(parts.s);
  }

  timer = setInterval(tick, 1000);
  tick();
}

document.querySelectorAll('.countdown').forEach(initCountdown);
