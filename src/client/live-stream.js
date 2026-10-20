// Shows the #en-vivo section and loads the YouTube player only while the
// event is live, so visitors before/after the week don't load the embed.

import { eventPhase } from '../lib/countdown.js';

const section = document.getElementById('en-vivo');
if (section) {
  const start = new Date(section.dataset.start).getTime();
  const end = section.dataset.end ? new Date(section.dataset.end).getTime() : Infinity;
  const iframe = section.querySelector('iframe[data-src]');

  function update() {
    const live = eventPhase(Date.now(), start, end) === 'live';
    section.hidden = !live;
    if (live && iframe && !iframe.src) iframe.src = iframe.dataset.src;
    if (!live && iframe) iframe.removeAttribute('src');
  }

  update();
  setInterval(update, 60000);
}
