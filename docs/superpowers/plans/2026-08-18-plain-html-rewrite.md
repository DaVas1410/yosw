# Plain HTML/CSS/JS Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Astro build/component layer with a dependency-free Node build script that renders the existing JSON-driven, bilingual content into static HTML — same visual output, same data, same client-side behavior, no framework.

**Architecture:** `.astro` components become plain `(data, lang) => htmlString` functions under `src/render/`; pure logic (countdown math, filtering, i18n lookup, schema validation) moves to `src/lib/`; existing inline `<script>` behavior moves to standalone files under `src/client/`; `build.mjs` wires it all together and writes `dist/es/*.html` + `dist/en/*.html`.

**Tech Stack:** Node (built-in `fs`/`path`, no bundler), Vitest (kept, tests pure functions), Zod (kept, validates JSON data). Astro and `@fontsource-variable/*` are removed.

**Spec:** `docs/superpowers/specs/2026-08-18-plain-html-rewrite-design.md`

## Global Constraints

- Visual output must not change: reuse existing CSS classes/markup structure verbatim when porting each `.astro` file — read the source file being converted and preserve its class names, data-attributes, and DOM structure exactly.
- No new npm dependencies. Astro and `@fontsource-variable/manrope`/`@fontsource-variable/sora` are removed from `package.json`.
- `npm test` (Vitest) must pass after every task that touches `src/lib/`.
- `npm run build` must produce `dist/es/index.html`, `dist/es/participantes.html`, `dist/en/index.html`, `dist/en/participantes.html` plus copied CSS/assets/fonts by the end of the plan.
- Every `.astro` file has a 1:1 replacement — nothing is dropped except the redundant `src/pages/index.astro` client-side redirect (host-level `netlify.toml` redirect already covers `/` → `/es/`).

---

### Task 1: Pure logic modules + their tests

**Files:**
- Create: `src/lib/countdown.js` (from `src/components/Countdown.ts`)
- Create: `src/lib/countdown.test.js` (from `src/components/countdown.test.ts`)
- Create: `src/lib/axes.js` (from `src/components/data/axes.ts`)
- Create: `src/lib/axes.test.js` (from `src/components/data/axes.test.ts`)
- Create: `src/lib/live-stats.js` (from `src/components/data/liveStats.ts`)
- Create: `src/lib/live-stats.test.js` (from `src/components/data/liveStats.test.ts`)
- Create: `src/lib/filter.js` (from `src/components/participants/filter.ts`)
- Create: `src/lib/filter.test.js` (from `src/components/participants/filter.test.ts`)
- Create: `src/lib/transform.js` (from `src/components/timeline/transform.ts`)
- Create: `src/lib/transform.test.js` (from `src/components/timeline/transform.test.ts`)
- Create: `src/lib/i18n.js` (from `src/i18n/index.ts`)
- Modify: `src/data/schemas.ts` → stays where it is (already framework-free); no change needed
- Reference (read, don't modify yet): the `.ts`/`.astro` originals listed above, and `src/data/schemas.ts`

**Interfaces:**
- Produces: `breakdown(ms) => {d,h,m,s}`, `countByCategory(raw) => Record<string,number>`, `parseSheetRows(rows) => Record<string,string|number>`, `filterParticipants(list, {eje,rol,query}) => Participant[]`, `toTimeline(raw, lang) => TimelineDay[]`, `t(lang, key) => string`. These exact names/signatures are consumed by Tasks 3-7.

- [ ] **Step 1: Port each `.ts` source to `.js`** — copy the exported function bodies verbatim (they're already framework-free per the survey), converting only TypeScript-only syntax (type annotations, `import type`) to plain JS. Keep imports of `src/data/schemas.ts` (Vitest/Node can run `.ts` schema files directly via the existing `tsx`/Vitest transform — confirm by running a test after).
- [ ] **Step 2: Port each `.test.ts` to `.test.js`**, updating only the import paths to point at the new `.js` siblings. Assertions stay identical.
- [ ] **Step 3: Write `src/lib/i18n.js`** exporting `LOCALES`, `t(lang, key)` reading from `src/i18n/es.json`/`src/i18n/en.json` exactly as `src/i18n/index.ts` does today.
- [ ] **Step 4: Run `npm test`** — expect all ported tests to pass with no changes to assertions (only import paths changed).
- [ ] **Step 5: Delete the old `.ts` sources and old test files** listed above under "from" once the new ones pass, and delete `src/i18n/i18n.test.ts`'s old location if moved (keep `src/i18n/i18n.test.ts` in place — it doesn't test `index.ts` internals, just key parity between `es.json`/`en.json`, so it can stay as-is; only `src/i18n/index.ts` itself is replaced by `src/lib/i18n.js` and then deleted).
- [ ] **Step 6: Commit**

```bash
git add src/lib src/i18n/i18n.test.ts
git commit -m "refactor: move pure logic from Astro-adjacent .ts to framework-free src/lib"
```

---

### Task 2: Page shell + static SVG partial

**Files:**
- Create: `src/render/page-shell.js`
- Create: `src/render/tower-draw.js`
- Reference: `src/layouts/Base.astro`, `src/components/TowerDraw.astro`

**Interfaces:**
- Consumes: nothing (no dependency on other render functions)
- Produces: `renderPageShell({lang, title, bodyHtml}) => htmlString` (full `<!doctype html>` document: charset/viewport meta, `<title>`, `@font-face` CSS pointing at `/assets/fonts/...woff2` (see Task 9 for where those files land), `<link rel="stylesheet" href="/styles/global.css">`, wraps `bodyHtml`, includes `<script src="/client/scroll-reveal.js" defer></script>` at the end of `<body>`). `renderTowerDraw({alt, caption}) => htmlString` (the hand-traced SVG markup, ported verbatim from `TowerDraw.astro`). Task 3 consumes `renderTowerDraw`; Tasks 3, 6, 7 consume `renderPageShell` only indirectly via Task 8's page assemblers.

- [ ] **Step 1: Read `src/layouts/Base.astro`** in full to capture its exact `<head>` contents and global scroll-reveal `<script>` body.
- [ ] **Step 2: Write `src/render/page-shell.js`** porting that markup into a template-literal-returning function, replacing the two `@fontsource-variable` imports with local `@font-face` `<style>` rules pointing at `/assets/fonts/manrope-variable.woff2` and `/assets/fonts/sora-variable.woff2`.
- [ ] **Step 3: Extract the scroll-reveal `<script>` body** into `src/client/scroll-reveal.js` as a standalone file (same `IntersectionObserver`/`prefers-reduced-motion` logic, no wrapping `<script>` tags — just the JS).
- [ ] **Step 4: Read `src/components/TowerDraw.astro`** in full and port its SVG markup verbatim into `src/render/tower-draw.js`, parameterizing `alt`/`caption` the same way the `.astro` props did.
- [ ] **Step 5: Commit**

```bash
git add src/render/page-shell.js src/render/tower-draw.js src/client/scroll-reveal.js
git commit -m "feat: add plain-JS page shell and tower SVG partial"
```

---

### Task 3: Nav, Hero, Countdown, Marquee render functions + their client scripts

**Files:**
- Create: `src/render/lang-toggle.js`, `src/render/nav.js`, `src/render/hero.js`, `src/render/countdown-partial.js`, `src/render/marquee.js`
- Create: `src/client/nav.js`, `src/client/countdown.js`
- Reference: `src/components/LangToggle.astro`, `src/components/Nav.astro`, `src/components/Hero.astro`, `src/components/Countdown.astro`, `src/components/Marquee.astro`

**Interfaces:**
- Consumes: `renderTowerDraw` (Task 2, used inside `nav.js`/`hero.js` if the source `.astro` files reference the tower mark — verify against the source files), `t()` from `src/lib/i18n.js` (Task 1)
- Produces: `renderLangToggle({lang, currentPath}) => htmlString`, `renderNav({lang, currentPath}) => htmlString`, `renderHero({lang}) => htmlString`, `renderCountdownPartial({lang, target}) => htmlString`, `renderMarquee({lang}) => htmlString`. Consumed by Task 8's `home.js`/`participantes.js` assemblers (nav appears on both pages).

- [ ] **Step 1: Port `LangToggle.astro`** — note it uses `Astro.url.pathname` to build the swapped-language link; replace with an explicit `currentPath` parameter the caller passes in.
- [ ] **Step 2: Port `Nav.astro`** markup into `renderNav`, embedding `renderLangToggle(...)` for the language switch link. Extract its inline `<script>` (mobile menu toggle) verbatim into `src/client/nav.js`.
- [ ] **Step 3: Port `Hero.astro`** into `renderHero`, embedding `renderCountdownPartial(...)` and `renderTowerDraw(...)` calls in the same positions the `.astro` file used `<Countdown />`/`<TowerDraw />`.
- [ ] **Step 4: Port `Countdown.astro`** markup into `renderCountdownPartial`. Extract its inline `<script>` (the ticking timer, importing `breakdown()`) into `src/client/countdown.js`, updating the import to `from '/lib/countdown.js'` (client-side ESM import — confirm `src/lib/countdown.js` uses `export function breakdown(...)` so it's importable both from Node at build time and as a browser ES module at runtime; Task 9 copies `src/lib/*.js` into `dist/lib/` for this to resolve).
- [ ] **Step 5: Port `Marquee.astro`** into `renderMarquee` (no script — CSS animation only, verify no `<script>` block exists in the source before skipping client-script extraction).
- [ ] **Step 6: Commit**

```bash
git add src/render/lang-toggle.js src/render/nav.js src/render/hero.js src/render/countdown-partial.js src/render/marquee.js src/client/nav.js src/client/countdown.js
git commit -m "feat: port nav/hero/countdown/marquee to plain render functions"
```

---

### Task 4: Cifras, About, EjesSection, Ideathon render functions + Cifras client script

**Files:**
- Create: `src/render/cifras.js`, `src/render/about.js`, `src/render/ejes-section.js`, `src/render/ideathon.js`
- Create: `src/client/cifras.js`
- Reference: `src/components/Cifras.astro`, `src/components/About.astro`, `src/components/EjesSection.astro`, `src/components/Ideathon.astro`, `src/lib/axes.js` (Task 1), `src/data/ejes.json`

**Interfaces:**
- Consumes: `countByCategory()` from `src/lib/axes.js` (Task 1) if `Cifras.astro` uses it (verify against source — the survey notes stats are "computed from calendario.json+ejes.json"), `t()` from `src/lib/i18n.js`
- Produces: `renderCifras({lang, calendario, ejes}) => htmlString`, `renderAbout({lang}) => htmlString`, `renderEjesSection({lang, ejes}) => htmlString`, `renderIdeathon({lang}) => htmlString`. Consumed by Task 8's `home.js`.

- [ ] **Step 1: Port `Cifras.astro`**, preserving its exact stat computation from `calendario.json`/`ejes.json`. Extract its inline `<script>` (count-up animation) into `src/client/cifras.js`.
- [ ] **Step 2: Port `About.astro`** (static values grid + illustration `<img>`, update the image `src` to the plain `/assets/illustrations/congreso.png` path per Task 9's asset layout).
- [ ] **Step 3: Port `EjesSection.astro`**, rendering `ejes.json` entries as cards exactly as the source does.
- [ ] **Step 4: Port `Ideathon.astro`** (static flow diagram + illustration, update image `src` to `/assets/illustrations/ideathon.png`).
- [ ] **Step 5: Commit**

```bash
git add src/render/cifras.js src/render/about.js src/render/ejes-section.js src/render/ideathon.js src/client/cifras.js
git commit -m "feat: port cifras/about/ejes-section/ideathon to plain render functions"
```

---

### Task 5: ProgramTimeline, DataSection, LiveStats render functions + their client scripts

**Files:**
- Create: `src/render/program-timeline.js`, `src/render/data-section.js`, `src/render/live-stats.js`
- Create: `src/client/program-timeline.js`, `src/client/data-section.js`, `src/client/live-stats.js`
- Reference: `src/components/timeline/ProgramTimeline.astro`, `src/components/data/DataSection.astro`, `src/components/data/LiveStats.astro`, `src/lib/transform.js`, `src/lib/axes.js`, `src/lib/live-stats.js` (all Task 1)

**Interfaces:**
- Consumes: `toTimeline()` from `src/lib/transform.js`, `countByCategory()` from `src/lib/axes.js`, `parseSheetRows()` from `src/lib/live-stats.js` (browser-side, inside `src/client/live-stats.js`), `t()` from `src/lib/i18n.js`
- Produces: `renderProgramTimeline({lang, calendario}) => htmlString`, `renderDataSection({lang, calendario}) => htmlString` (embeds `renderLiveStats(...)`), `renderLiveStats({lang, sheetUrl}) => htmlString`. Consumed by Task 8's `home.js`.

- [ ] **Step 1: Port `ProgramTimeline.astro`**, calling `toTimeline(calendario, lang)` exactly as the source does. Extract its inline `<script>` (day switcher) into `src/client/program-timeline.js`.
- [ ] **Step 2: Port `LiveStats.astro`**, preserving the `data-sheet-url` attribute the client script reads. Extract its inline `<script>` (fetches the Google Sheet, calls `parseSheetRows()`) into `src/client/live-stats.js`, importing from `/lib/live-stats.js`.
- [ ] **Step 3: Port `DataSection.astro`**, calling `countByCategory(calendario)` for its bar chart and embedding `renderLiveStats(...)` in the same position `<LiveStats />` appeared. Extract its inline `<script>` into `src/client/data-section.js`.
- [ ] **Step 4: Commit**

```bash
git add src/render/program-timeline.js src/render/data-section.js src/render/live-stats.js src/client/program-timeline.js src/client/data-section.js src/client/live-stats.js
git commit -m "feat: port program-timeline/data-section/live-stats to plain render functions"
```

---

### Task 6: ParticipantCard, ParticipantsPreview, Registration, Sponsors, Sede, Faq, Footer render functions + Faq client script

**Files:**
- Create: `src/render/participant-card.js`, `src/render/participants-preview.js`, `src/render/registration.js`, `src/render/sponsors.js`, `src/render/sede.js`, `src/render/faq.js`, `src/render/footer.js`
- Create: `src/client/faq.js`
- Reference: `src/components/participants/ParticipantCard.astro`, `src/components/participants/ParticipantsPreview.astro`, `src/components/Registration.astro`, `src/components/Sponsors.astro`, `src/components/Sede.astro`, `src/components/Faq.astro`, `src/components/Footer.astro`, `src/data/participants.json`, `src/data/sponsors.json`, `src/data/config.json`

**Interfaces:**
- Consumes: `t()` from `src/lib/i18n.js`
- Produces: `renderParticipantCard({lang, participant}) => htmlString`, `renderParticipantsPreview({lang, participants}) => htmlString` (calls `renderParticipantCard` for the first 8), `renderRegistration({lang}) => htmlString`, `renderSponsors({lang, sponsors}) => htmlString`, `renderSede({lang, config}) => htmlString`, `renderFaq({lang}) => htmlString`, `renderFooter({lang, config}) => htmlString`. Consumed by Task 8's `home.js`; `renderParticipantCard`/`renderFooter`/nav also consumed by `participantes.js`.

- [ ] **Step 1: Port `ParticipantCard.astro`** (pure presentational, no script) into `renderParticipantCard`.
- [ ] **Step 2: Port `ParticipantsPreview.astro`** into `renderParticipantsPreview`, calling `renderParticipantCard` for the first 8 entries of `participants.json` exactly as the source slices.
- [ ] **Step 3: Port `Registration.astro`** (static CTA cards with inline Lucide SVG paths — copy the SVG `<path>` data verbatim).
- [ ] **Step 4: Port `Sponsors.astro`**, grouping `sponsors.json` by tier exactly as the source does.
- [ ] **Step 5: Port `Sede.astro`**, reading venue info from `config.json` + photo (update image `src` to `/assets/illustrations/sede.jpg`).
- [ ] **Step 6: Port `Faq.astro`** into `renderFaq`. Extract its inline `<script>` (accordion expand/collapse) into `src/client/faq.js`.
- [ ] **Step 7: Port `Footer.astro`**, reading social links from `config.json`, updating the logo image reference to `/assets/brand/logo-lockup-white.png` (replacing the Astro asset-import `img.src` pattern).
- [ ] **Step 8: Commit**

```bash
git add src/render/participant-card.js src/render/participants-preview.js src/render/registration.js src/render/sponsors.js src/render/sede.js src/render/faq.js src/render/footer.js src/client/faq.js
git commit -m "feat: port participant/registration/sponsors/sede/faq/footer to plain render functions"
```

---

### Task 7: Participantes page filter script

**Files:**
- Create: `src/client/participantes.js`
- Reference: `src/pages/[lang]/participantes.astro` (inline `<script>` and `<style>` blocks), `src/lib/filter.js` (Task 1)

**Interfaces:**
- Consumes: `filterParticipants()` from `src/lib/filter.js`
- Produces: a standalone script wiring the search/eje/rol filter inputs to re-render the participant list client-side. Consumed by Task 8's `participantes.js` page assembler (included via `<script src="/client/participantes.js" defer>`).

- [ ] **Step 1: Read `src/pages/[lang]/participantes.astro`** in full, noting its inline `<script>` logic and its `<style>` block (the style block moves to `src/styles/participantes.css` in Task 9, not this task).
- [ ] **Step 2: Port the inline `<script>` body verbatim** into `src/client/participantes.js`, updating its import of `filterParticipants` to `from '/lib/filter.js'`, and having it call `renderParticipantCard`-equivalent markup client-side (reimplement the card markup inline in this script to match `src/render/participant-card.js` from Task 6 exactly, since there's no bundler to share the function between build-time Node and the browser — keep the two in sync manually and note this duplication with a one-line comment pointing at `src/render/participant-card.js` as the source of truth).
- [ ] **Step 3: Commit**

```bash
git add src/client/participantes.js
git commit -m "feat: port participantes directory filter to plain client script"
```

---

### Task 8: Page assemblers (home, participantes)

**Files:**
- Create: `src/render/pages/home.js`
- Create: `src/render/pages/participantes.js`
- Reference: `src/pages/[lang]/index.astro`, `src/pages/[lang]/participantes.astro`, all render functions from Tasks 2-7

**Interfaces:**
- Consumes: `renderPageShell` (Task 2), `renderNav`, `renderHero`, `renderMarquee` (Task 3), `renderCifras`, `renderAbout`, `renderEjesSection`, `renderIdeathon` (Task 4), `renderProgramTimeline`, `renderDataSection` (Task 5), `renderParticipantsPreview`, `renderRegistration`, `renderSponsors`, `renderSede`, `renderFaq`, `renderFooter`, `renderParticipantCard` (Task 6)
- Produces: `renderHomePage({lang, data}) => htmlString`, `renderParticipantesPage({lang, data}) => htmlString`. Consumed by `build.mjs` in Task 9.

- [ ] **Step 1: Write `src/render/pages/home.js`** exporting `renderHomePage({lang, data})`, assembling the 16 sections in the exact order `src/pages/[lang]/index.astro` lists them (Nav, Hero, Marquee, Cifras, About, EjesSection, Ideathon, ProgramTimeline, DataSection, ParticipantsPreview, Registration, Sponsors, Sede, Faq, Footer), passing each the relevant slice of `data` (calendario, ejes, participants, sponsors, config), and wrapping the concatenated body HTML with `renderPageShell({lang, title, bodyHtml})`.
- [ ] **Step 2: Write `src/render/pages/participantes.js`** exporting `renderParticipantesPage({lang, data})`, porting the full participants directory markup (search/eje/rol filter UI + full `renderParticipantCard` grid) from `src/pages/[lang]/participantes.astro`, including `<script src="/client/participantes.js" defer>` and its page-specific `<style>` block (moved to `src/styles/participantes.css`, linked via `<link rel="stylesheet">` in this page's head — extend `renderPageShell`'s signature with an optional `extraStyles` param if needed to inject this one extra stylesheet link).
- [ ] **Step 3: Commit**

```bash
git add src/render/pages/home.js src/render/pages/participantes.js src/styles/participantes.css
git commit -m "feat: add home and participantes page assemblers"
```

---

### Task 9: build.mjs, asset/font vendoring, package.json cleanup

**Files:**
- Create: `build.mjs`
- Modify: `package.json` (remove `astro`, `@astrofest/*`/`@astrojs/*`, `@fontsource-variable/manrope`, `@fontsource-variable/sora` deps; scripts: `"build": "node build.mjs"`, `"dev": "node build.mjs && npx serve dist"`, keep `"test": "vitest run"`, `"test:watch": "vitest"`)
- Create: `src/assets/fonts/manrope-variable.woff2`, `src/assets/fonts/sora-variable.woff2` (copied from `node_modules/@fontsource-variable/manrope` and `.../sora` before those packages are removed)
- Delete: `astro.config.mjs`, `tsconfig.json` (Astro-specific — replace with a minimal `tsconfig.json` only if `src/data/schemas.ts` needs one for Vitest; otherwise remove entirely)
- Reference: `netlify.toml` (confirm `publish = "dist"` and `command = "npm run build"` still hold — no change expected)

**Interfaces:**
- Consumes: `renderHomePage`, `renderParticipantesPage` (Task 8)
- Produces: `dist/es/index.html`, `dist/es/participantes.html`, `dist/en/index.html`, `dist/en/participantes.html`, `dist/styles/*.css`, `dist/assets/**`, `dist/client/*.js`, `dist/lib/*.js` (the last so `src/client/*.js` browser imports of `/lib/*.js` resolve at runtime)

- [ ] **Step 1: Before removing the Fontsource packages**, copy their variable woff2 files: `cp node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2 src/assets/fonts/manrope-variable.woff2` and the equivalent for `sora` (check the exact filename under `node_modules/@fontsource-variable/sora/files/` first, filenames vary by package version).
- [ ] **Step 2: Write `build.mjs`** — reads `src/data/*.json`, validates via the Zod schemas in `src/data/schemas.ts`, reads `src/i18n/{es,en}.json`, for each of `['es','en']` calls `renderHomePage`/`renderParticipantesPage` and writes the four HTML files to `dist/{lang}/`, then recursively copies `src/styles/`, `src/assets/`, `src/client/`, `src/lib/`, and `public/*` into the matching `dist/` subpaths.
- [ ] **Step 3: Update `package.json`** scripts and dependencies as specified above.
- [ ] **Step 4: Run `npm install`** to update `package-lock.json` after dependency removal.
- [ ] **Step 5: Run `npm run build`** and verify all four HTML files plus copied assets exist under `dist/`.
- [ ] **Step 6: Run `npx serve dist` (or open the files directly)** and manually check both `/es/` and `/en/` render with correct styling, fonts, and images, and that the countdown/nav-toggle/faq-accordion/participant-filter/live-stats all work — this is the "test the feature in a browser" verification step, not optional.
- [ ] **Step 7: Delete `astro.config.mjs`** and evaluate whether `tsconfig.json` still serves a purpose (Vitest/editor intellisense for `src/data/schemas.ts`); if not needed, delete it too.
- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add build.mjs, vendor fonts locally, remove Astro/Fontsource dependencies"
```

---

### Task 10: Delete old Astro sources, final test/build verification

**Files:**
- Delete: all remaining `src/**/*.astro` files, `src/pages/` directory (including `[lang]/`), `src/layouts/`
- Modify: `.gitignore` (ensure `dist/` and `node_modules/` are ignored, confirm `.astro/` cache entry is removed if present)

**Interfaces:** none — final cleanup task.

- [ ] **Step 1: Confirm every `.astro` file's logic has a corresponding `src/render/*.js` counterpart** by diffing the file list from the survey (Tasks 2-8) against `find src -name '*.astro'` — every file should already be superseded.
- [ ] **Step 2: Delete `src/pages/`, `src/layouts/`, and any remaining `.astro` files.**
- [ ] **Step 3: Run `npm test`** — expect all Vitest suites (Task 1's moved tests, `src/data/data.test.ts`, `src/i18n/i18n.test.ts`) to pass.
- [ ] **Step 4: Run `npm run build`** again to confirm the build still succeeds with the old sources gone (nothing in `build.mjs` or `src/render/` should import from the deleted paths).
- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove remaining Astro component/page sources"
```
