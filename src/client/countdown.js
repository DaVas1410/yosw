// Ported from the inline <script> in src/components/Countdown.astro (ticking
// timer). Uses breakdown() from src/lib/countdown.js instead of a local
// re-declaration; logic otherwise unchanged.

import { breakdown } from '../lib/countdown.js';

function initCountdown(el) {
  const targetStr = el.dataset.target;
  if (!targetStr) return;
  const target = new Date(targetStr).getTime();

  const valueEls = {
    d: el.querySelector('[data-unit="d"]'),
    h: el.querySelector('[data-unit="h"]'),
    m: el.querySelector('[data-unit="m"]'),
    s: el.querySelector('[data-unit="s"]'),
  };

  function tick() {
    const parts = breakdown(target - Date.now());
    if (valueEls.d) valueEls.d.textContent = String(parts.d);
    if (valueEls.h) valueEls.h.textContent = String(parts.h);
    if (valueEls.m) valueEls.m.textContent = String(parts.m);
    if (valueEls.s) valueEls.s.textContent = String(parts.s);
  }

  tick();
  setInterval(tick, 1000);
}

document.querySelectorAll('.countdown').forEach(initCountdown);
