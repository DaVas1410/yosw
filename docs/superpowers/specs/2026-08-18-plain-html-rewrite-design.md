# Plain HTML/CSS/JS rewrite (drop Astro)

Status: approved by user 2026-08-18. Visual design does not change — this is a re-implementation, not a redesign.

## Motivation

The Astro build/tooling layer (Node ≥22.12 requirement, `astro.config.mjs`, `tsconfig.json`, component hydration model, `[lang]` routing magic) is more machinery than a mostly-static, data-driven congress site needs. Goal: keep the JSON-driven bilingual content model, drop the framework.

## Architecture

- **Content stays as-is**: `src/data/*.json` (calendario, ejes, participants, sponsors, config) and `src/i18n/{es,en}.json` remain the source of truth, validated by Zod schemas (`src/data/schemas.ts`) exactly as today.
- **Build**: one dependency-free Node script, `build.mjs`, run via `node build.mjs` (aliased as `npm run build`). It:
  1. Reads JSON data + i18n files.
  2. Calls per-section render functions (`src/render/*.js`) that take `(data, lang) → htmlString`.
  3. Assembles each section into the page shell (former `Base.astro`) and writes static files to `dist/es/*.html` and `dist/en/*.html`.
  4. Copies `src/styles/*.css`, `src/assets/**`, `public/*` straight into `dist/`.
- **Dev server**: `npm run dev` = `node build.mjs && npx serve dist` (no watch/hot-reload initially — rebuild is fast enough to rerun by hand; can add a `--watch` flag later if it proves annoying).
- **Routing**: `/` → `/es/` redirect stays host-level only, via `netlify.toml` (the redundant Astro-level redirect in `src/pages/index.astro` is dropped, nothing replaces it). `/es/index.html`, `/es/participantes.html`, `/en/index.html`, `/en/participantes.html` are the four generated pages.
- **Client-side interactivity**: every existing inline `<script>` behavior is preserved as a plain `.js` file under `src/client/`, loaded via `<script src="/client/....js" defer></script>` in the built HTML — no behavior changes:
  - `nav.js` — mobile menu toggle
  - `countdown.js` — ticking timer (reuses `breakdown()` from `src/lib/countdown.js`, the ex-`Countdown.ts`)
  - `cifras.js` — stat count-up animation
  - `data-section.js` — chart interaction
  - `live-stats.js` — fetches the live Google Sheet client-side (reuses `parseSheetRows()`)
  - `faq.js` — accordion expand/collapse
  - `program-timeline.js` — day switcher
  - `participantes.js` — search/eje/rol filtering (reuses `filterParticipants()`)
  - `scroll-reveal.js` — global `IntersectionObserver` reveal-on-scroll (ex-`Base.astro` inline script), included on every page
- **Pure logic modules** (already framework-free, just move/rename, keep their behavior identical): `breakdown()`, `countByCategory()`, `parseSheetRows()`, `filterParticipants()`, `toTimeline()`, `t()` (i18n lookup) land under `src/lib/*.js` and are imported both by the build-time render functions and, where needed client-side, by the `src/client/*.js` files (duplicated as plain `<script>` includes, since there's no bundler to share modules between build-time Node and browser — acceptable given their small size).
- **Assets**: `src/assets/brand/*.png`, `src/assets/illustrations/*` are copied by the build script to `dist/assets/...` and referenced by plain `<img src="/assets/...">` (replaces Astro's `img.src` optimized-asset-import pattern — no image optimization step, images are already reasonably sized). Fonts: `@fontsource-variable/manrope` and `@fontsource-variable/sora` npm packages are replaced with self-hosted `@font-face` — the woff2 files are copied from `node_modules/@fontsource-variable/*` into `src/assets/fonts/` once and committed, then the npm packages are dropped as dependencies.

## Components → render functions

Each `.astro` component becomes one function in `src/render/*.js` with the same name (e.g. `Hero.astro` → `src/render/hero.js` exporting `renderHero(data, lang)`), same props-in/html-out shape, same markup/classes (so `global.css`/`tokens.css` need no changes):

`nav`, `hero`, `countdown` (used by hero), `marquee`, `cifras`, `about`, `ejes-section`, `ideathon`, `program-timeline`, `data-section`, `live-stats` (used by data-section), `participants-preview`, `participant-card` (used by participants-preview and the participantes page), `registration`, `sponsors`, `sede`, `faq`, `footer`, `lang-toggle` (used by nav), `tower-draw` (static SVG partial — kept as a standalone `.svg`-returning function or a raw string constant, not duplicated per render).

`page-shell.js` replaces `Base.astro`: renders the `<!doctype html>` wrapper, `<head>` (meta/title/font `@font-face`/`global.css` link), wraps body content, includes `scroll-reveal.js` on every page.

Two page assemblers replace the two `.astro` pages: `src/render/pages/home.js` (assembles all 16 home-page sections) and `src/render/pages/participantes.js` (participants directory with filter UI + `participantes.js` script).

## Testing

Keep Vitest (already a devDependency, no reason to drop it — it's the test runner, not framework tooling). Existing test files move with their subjects and test the same pure functions, same assertions:
- `src/lib/countdown.test.js` (ex-`countdown.test.ts`)
- `src/data/data.test.ts` — unchanged, still validates JSON against Zod schemas
- `src/i18n/i18n.test.ts` — unchanged, still asserts es/en key parity
- `src/lib/axes.test.js`, `src/lib/live-stats.test.js`, `src/lib/filter.test.js`, `src/lib/transform.test.js` — same assertions as their `.astro`-adjacent predecessors
- `src/lib/__tests__/smoke.test.ts` — kept as-is if it has content; otherwise dropped (currently empty per survey)

New: a small test for `build.mjs` isn't necessary — the render functions are unit-tested directly; the build script itself is thin glue (read JSON → call renderers → write files) and is verified by actually running `npm run build` and checking `dist/` output during implementation, not by a dedicated test.

## Error handling

No new error handling beyond what exists today: Zod schema validation already throws on malformed JSON data (`data.test.ts` catches this at test time; `build.mjs` will let the same Zod error propagate and fail the build loudly if data is malformed at build time too — no silent fallbacks).

## What gets deleted

`astro.config.mjs`, `tsconfig.json` (Astro-specific parts — a minimal one may stay if useful for editor JS/TS intellisense, otherwise removed), all `*.astro` files, `@astrofest/*`/`astro` npm dependencies, `@fontsource-variable/*` npm dependencies (replaced by vendored font files), the `[lang]` directory structure under `src/pages/`.

## Out of scope

- No visual/CSS changes.
- No change to `netlify.toml` build command target other than `npm run build` still producing `dist/` (publish dir unchanged).
- No change to data files, i18n content, or schemas beyond file relocation.
- No new features, no dependency additions beyond what's already present (Vitest, Zod stay; Astro and Fontsource go).
