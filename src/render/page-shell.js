// Ported from src/layouts/Base.astro.
// Replaces the two @fontsource-variable imports with local @font-face rules
// pointing at self-hosted woff2 files, and the reveal-on-scroll inline
// <script> with a reference to ../client/scroll-reveal.js.
//
// Every internal path here is "../..." rather than "/...": every real page
// this shell renders lives one directory deep (dist/es/*.html, dist/en/*.html),
// so a path relative to that depth resolves correctly whether the site is
// served from the domain root (Netlify) or a subpath (a GitHub Pages
// project site at https://user.github.io/repo/).

export function renderPageShell({ lang, title, bodyHtml, extraStyles = [] }) {
  const extraStylesHtml = extraStyles
    .map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join('\n    ');

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="icon" type="image/svg+xml" href="../favicon.svg" />
    <link rel="alternate icon" href="../favicon.ico" />
    <style>
      @font-face {
        font-family: 'Manrope Variable';
        src: url('../assets/fonts/manrope-variable.woff2') format('woff2');
        font-weight: 200 800;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Sora Variable';
        src: url('../assets/fonts/sora-variable.woff2') format('woff2');
        font-weight: 100 800;
        font-style: normal;
        font-display: swap;
      }
    </style>
    <link rel="stylesheet" href="../styles/global.css" />
    ${extraStylesHtml}
  </head>
  <body>
    ${bodyHtml}
    <script src="../client/scroll-reveal.js" defer></script>
  </body>
</html>`;
}
