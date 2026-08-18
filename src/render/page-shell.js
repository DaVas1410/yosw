// Ported from src/layouts/Base.astro.
// Replaces the two @fontsource-variable imports with local @font-face rules
// pointing at self-hosted woff2 files, and the reveal-on-scroll inline
// <script> with a reference to /client/scroll-reveal.js.

export function renderPageShell({ lang, title, bodyHtml }) {
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      @font-face {
        font-family: 'Manrope Variable';
        src: url('/assets/fonts/manrope-variable.woff2') format('woff2');
        font-weight: 200 800;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Sora Variable';
        src: url('/assets/fonts/sora-variable.woff2') format('woff2');
        font-weight: 100 800;
        font-style: normal;
        font-display: swap;
      }
    </style>
    <link rel="stylesheet" href="/styles/global.css" />
  </head>
  <body>
    ${bodyHtml}
    <script src="/client/scroll-reveal.js" defer></script>
  </body>
</html>`;
}
