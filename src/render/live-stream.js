// "En vivo" section: embeds the YouTube live stream right below the hero.
// Rendered hidden; src/client/live-stream.js reveals it (and only then sets
// the iframe src) while the event is live.

import { t } from '../lib/i18n.js';
import { youtubeId } from '../lib/countdown.js';

export function renderLiveStream({ lang, config }) {
  const id = youtubeId(config.liveStreamUrl);
  if (!id) return '';
  const end = config.eventEnd ? ` data-end="${config.eventEnd}"` : '';

  return `<section class="section live" id="en-vivo" hidden data-start="${config.eventStart}"${end}>
  <div class="section__wrap live__wrap">
    <div class="section__head">
      <span class="live__pill"><i aria-hidden="true"></i> ${t(lang, 'countdown.live.badge')}</span>
      <h2 class="section__title">${t(lang, 'live.heading')}</h2>
      <p class="section__lead">${t(lang, 'live.lead')}</p>
    </div>
    <div class="live__player">
      <iframe
        title="${t(lang, 'live.iframe_title')}"
        data-src="https://www.youtube-nocookie.com/embed/${id}?rel=0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>
    <p class="live__fallback">
      <a href="${config.liveStreamUrl}" target="_blank" rel="noopener">${t(lang, 'live.open_youtube')}</a>
    </p>
  </div>
</section>

<style>
  .live__wrap {
    max-width: 1100px;
  }
  .live__pill {
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
  .live__pill i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fff;
    animation: countdown-pulse 1.4s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .live__pill i { animation: none; }
  }
  .live__player {
    position: relative;
    aspect-ratio: 16 / 9;
    border-radius: 18px;
    overflow: hidden;
    background: #000;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }
  .live__player iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  .live__fallback {
    margin: 1rem 0 0;
    text-align: center;
    font-size: 0.9rem;
  }
  .live__fallback a {
    color: var(--color-muted);
  }
</style>

<script type="module" src="../client/live-stream.js"></script>`;
}
