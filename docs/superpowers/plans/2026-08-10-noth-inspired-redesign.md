# noth.in-Inspired Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flip the YOSW site's visual base from "colorful/always-on-3D-backdrop" to a calm neutral base with the Yachay palette used as deliberate accent, rebuild Hero/Nav with bold noth.in-style typography and a single scroll-driven 3D tower object (instead of the current full-page particle field), integrate the real event logo, and replace emoji icons with inlined Lucide SVG icons.

**Architecture:** Because nearly every section (About, Ejes, Registration, Sponsors, Footer, Program, Data, Participants) is built on shared utility classes (`.section`, `.card`, `.eyebrow`, `.divider`, `.gradient-text`) defined once in `tokens.css`/`global.css`, most of the visual flip happens by editing those two files — the rest of the sections inherit automatically. Hero, Nav, and Scene3D get bespoke rebuilds. The 3D tower's scroll-to-rotation math is extracted into a small pure TypeScript module so it can be unit tested without a WebGL/DOM environment.

**Tech Stack:** Astro 7 (static), Three.js ^0.185, Vitest ^4, vanilla CSS custom properties (no Tailwind/framework), Google Fonts (Archivo + Inter), Lucide icon paths (inlined SVG, no runtime dependency).

## Global Constraints

- Node >= 22.12.0; `npm run dev` / `npm run build` / `npm test` are the only build/test entry points (see `CLAUDE.md`).
- Bilingual parity: `src/i18n/es.json` and `src/i18n/en.json` must keep identical key sets (`i18n.test.ts` enforces this) — **this plan adds no new i18n keys** (per spec non-goals).
- No changes to `src/data/*.json` schemas, Zod schemas, or business logic (calendar/timeline/live-stats/participants filtering) — visual-only redesign.
- The 9 Yachay brand hexes (`--y-red`, `--y-orange`, `--y-gold`, `--y-yellow`, `--y-green`, `--y-blue`, `--y-teal`, `--y-purple`, `--y-cyan`) are the only source of accent color — do not introduce new colors.
- Respect `prefers-reduced-motion: reduce` for all new motion (tower rotation, reveal animations already do this — preserve the pattern).
- Icons: Lucide SVGs, inlined directly as markup in `.astro` files — no CDN `<script src>` and no npm icon package dependency.

---

## File Structure

**Modify:**
- `src/styles/tokens.css` — palette flip, new font tokens, glass-blur neutralized, toned-down gradients.
- `src/styles/global.css` — remove drifting-blob background and `.page-body` scrim, retune `.card`/`.gradient-text`/`.divider` for the flat neutral look.
- `src/layouts/Base.astro` — swap Google Fonts link (Archivo + Inter replacing Space Grotesk + Inter), remove the global `<Scene3D />` mount (moves into Hero).
- `src/components/Scene3D.astro` — full rewrite: single wireframe tower object instead of particle network + icosahedron; scroll-driven rotation; accepts no props (mounted only inside Hero now).
- `src/components/Hero.astro` — rebuild layout/typography, mount `<Scene3D />` scoped to the hero.
- `src/components/Nav.astro` — real logo asset, flat bar styling, nav-link letter-spacing.
- `src/components/Registration.astro` — swap emoji for inlined Lucide icon markup.
- `src/components/Footer.astro` — animated rainbow top bar becomes a static single-accent hairline.

**Create:**
- `src/assets/brand/logo-color.png` — copied from `assets/Logo Color.png` (real event logo, replaces the placeholder text-only `logo.svg`).
- `src/components/heroTower.ts` — pure functions mapping hero scroll position to a 3D rotation angle (testable without WebGL).
- `src/components/heroTower.test.ts` — Vitest coverage for the above.

**Delete:**
- `src/assets/brand/logo.svg` — placeholder "YOSW 2026" text logo, superseded by the real asset.

---

## Task 1: Token overhaul — neutral base, accent-only palette

**Files:**
- Modify: `src/styles/tokens.css`

**Interfaces:**
- Produces: all custom properties consumed by every other file in this plan — `--color-page`, `--color-text`, `--color-surface`, `--color-surface-solid`, `--color-border`, `--color-accent`, `--color-accent-2`, `--font-display`, `--font-body`, `--glass-blur`, `--grad-brand`, `--grad-spectrum`, `--y-*` (unchanged values), `--cat-*` (unchanged values), `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--radius`.

This task has no test file (pure CSS token values) — verification is visual (Task 9) plus the existing test suite staying green (no CSS is exercised by Vitest).

- [ ] **Step 1: Replace `src/styles/tokens.css` in full**

```css
:root {
  /* ---- Warm neutral base, Yachay Tech institutional palette as accent ---- */
  --color-bg: transparent;
  --color-page: #faf8f4;
  --color-surface: #ffffff;
  --color-surface-solid: #ffffff;
  --color-text: #17140f;
  --color-muted: #6b6255;
  --color-border: rgba(30, 26, 20, 0.12);

  /* Yachay institutional brand palette (9) — unchanged values, accent-only role */
  --y-red:     #96332b;
  --y-orange:  #ba6f3a;
  --y-gold:    #c09e27;
  --y-yellow:  #cfab2a;
  --y-green:   #619745;
  --y-blue:    #328ab5;
  --y-teal:    #1f8e8b;
  --y-purple:  #805794;
  --y-cyan:    #3197ad;

  --color-accent: var(--y-blue);
  --color-accent-2: var(--y-teal);

  /* legacy accent aliases kept so older refs still resolve */
  --c-cyan: var(--y-cyan);
  --c-violet: var(--y-purple);
  --c-magenta: var(--y-red);
  --c-lime: var(--y-green);

  /* gradients — toned down: CTA keeps a soft 2-stop brand gradient,
     the old full-rainbow spectrum sweep is retired from default use */
  --grad-brand: linear-gradient(120deg, var(--y-teal) 0%, var(--y-blue) 100%);
  --grad-spectrum: linear-gradient(100deg,
    #328ab5 0%, #3197ad 16%, #1f8e8b 30%, #619745 45%,
    #cfab2a 60%, #c09e27 70%, #ba6f3a 84%, #96332b 100%);
  --grad-brand-soft: linear-gradient(120deg, #1f8e8b14 0%, #328ab514 100%);

  --glow: 0 0 40px;
  --shadow-sm: 0 1px 3px rgba(23, 20, 15, 0.06);
  --shadow-md: 0 12px 32px -14px rgba(23, 20, 15, 0.16);
  --shadow-lg: 0 24px 48px -18px rgba(23, 20, 15, 0.22);
  /* Neutralized: cards are flat/solid now, no backdrop blur. Kept at 0 so any
     component still referencing var(--glass-blur) degrades to a harmless
     no-op instead of needing an individual edit. */
  --glass-blur: 0px;

  /* eje colors — thematic subset of the brand palette */
  --color-eje-1: #328ab5; --color-eje-2: #1f8e8b; --color-eje-3: #619745;
  --color-eje-4: #805794; --color-eje-5: #c09e27;

  /* schedule categories mapped to the 9 brand colors */
  --cat-inauguracion: #328ab5;
  --cat-charlas: #3197ad;
  --cat-mesas_abiertas: #1f8e8b;
  --cat-posters: #805794;
  --cat-expos_jurados: #c09e27;
  --cat-mentorias: #ba6f3a;
  --cat-social_networking: #619745;
  --cat-premiacion: #96332b;
  --cat-academico_general: #cfab2a;

  --font-display: 'Archivo', 'Segoe UI', system-ui, sans-serif;
  --font-body: 'Inter', 'Segoe UI', system-ui, sans-serif;
  --radius: 14px; --space: 8px;
}
```

- [ ] **Step 2: Run the existing test suite to confirm nothing regresses**

Run: `npm test`
Expected: all 26 existing tests still PASS (this file has no logic, only tokens consumed by CSS).

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "style: flip tokens to neutral base with accent-only palette"
```

---

## Task 2: Global styles cleanup — retire glass/blob scrim, retune shared utilities

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Base.astro`

**Interfaces:**
- Consumes: tokens from Task 1 (`--color-page`, `--color-surface`, `--color-border`, `--grad-brand`, `--font-display`, `--font-body`, `--radius`, `--shadow-*`).
- Produces: `.card`, `.gradient-text`, `.divider`, `.section*`, `.eyebrow` classes consumed by every section component (About, Ejes, Registration, Sponsors, Program, Data, Participants) unchanged in name/signature — only their computed appearance changes.

- [ ] **Step 1: Replace `src/styles/global.css` in full**

```css
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  position: relative;
  min-height: 100vh;
  background-color: var(--color-page);
  color: var(--color-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

img {
  max-width: 100%;
}

a {
  color: var(--color-accent);
}

::selection {
  background: var(--y-blue);
  color: #fff;
}

.wrap {
  max-width: 1100px;
  margin-inline: auto;
  padding-inline: calc(var(--space) * 3);
}

/* ---- Reusable utilities ---- */
.gradient-text {
  background: var(--grad-brand);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ---- Symmetric section scaffold ---- */
.section {
  padding: clamp(3.5rem, 9vh, 7rem) calc(var(--space) * 3);
}
.section__wrap {
  max-width: 1140px;
  margin-inline: auto;
}
.section__head {
  max-width: 720px;
  margin: 0 auto clamp(2rem, 5vh, 3.5rem);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}
.eyebrow {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.eyebrow::before,
.eyebrow::after {
  content: '';
  width: 26px;
  height: 2px;
  border-radius: 2px;
  background: var(--color-accent);
}
.section__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.9rem, 4.4vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin: 0;
}
.section__lead {
  color: var(--color-muted);
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0;
  max-width: 60ch;
}

/* ---- Card ---- */
.card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: none;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-md);
}
/* accent top-bar reveal on hover (set --accent per card) */
.card--accent::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--accent, var(--color-accent));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.card--accent:hover::before { transform: scaleX(1); }

/* static accent divider */
.divider {
  height: 2px;
  width: 120px;
  margin: 0 auto;
  border-radius: 2px;
  background: var(--color-accent);
}

.glass {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

section {
  position: relative;
  z-index: 1;
}

/* ---- Scroll reveal ---- */
[data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
[data-reveal].is-visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  [data-reveal] { opacity: 1; transform: none; transition: none; }
}
```

Note what was removed vs the prior version: the `body::before` drifting-gradient-blob block and its `@keyframes drift`, the `@keyframes shine` animation (and its use in `.gradient-text`/`.divider`, which are now static single-accent), and the entire `.page-body` scrim block (no longer needed — the page background is flat neutral everywhere, not an animated 3D scene).

- [ ] **Step 2: Update the font link in `src/layouts/Base.astro`**

Change:
```astro
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
```
to:
```astro
    <link
      href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 3: Remove the global Scene3D mount from `src/layouts/Base.astro`**

Change:
```astro
---
import '../styles/global.css';
import Scene3D from '../components/Scene3D.astro';
interface Props { lang: 'es' | 'en'; title: string; }
const { lang, title } = Astro.props;
---
```
to:
```astro
---
import '../styles/global.css';
interface Props { lang: 'es' | 'en'; title: string; }
const { lang, title } = Astro.props;
---
```
And remove the `<Scene3D />` line from the `<body>` (it now moves to Hero.astro in Task 5) — the body should start directly with `<slot />`:
```astro
  <body>
    <slot />
    <script>
```

- [ ] **Step 4: Update `src/pages/[lang]/index.astro` — drop the now-inert `.page-body` wrapper**

Change:
```astro
  <Hero lang={lang} />
  <div class="page-body">
    <About lang={lang} />
    <EjesSection lang={lang} />
    <ProgramTimeline lang={lang} />
    <DataSection lang={lang} />
    <ParticipantsPreview lang={lang} />
    <Registration lang={lang} />
    <Sponsors lang={lang} />
  </div>
  <Footer lang={lang} />
```
to:
```astro
  <Hero lang={lang} />
  <About lang={lang} />
  <EjesSection lang={lang} />
  <ProgramTimeline lang={lang} />
  <DataSection lang={lang} />
  <ParticipantsPreview lang={lang} />
  <Registration lang={lang} />
  <Sponsors lang={lang} />
  <Footer lang={lang} />
```

- [ ] **Step 5: Run the test suite**

Run: `npm test`
Expected: all 26 existing tests PASS (no logic touched).

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/Base.astro "src/pages/[lang]/index.astro"
git commit -m "style: retire glass/blob scrim, retune shared utilities to flat neutral"
```

---

## Task 3: Hero tower scroll math (pure functions + tests)

**Files:**
- Create: `src/components/heroTower.ts`
- Create: `src/components/heroTower.test.ts`

**Interfaces:**
- Produces: `computeScrollProgress(rectTop: number, rectHeight: number, viewportHeight: number): number` (clamped 0–1) and `rotationForProgress(progress: number): number` (radians), consumed by `Scene3D.astro` in Task 4.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/components/heroTower.test.ts
import { describe, expect, it } from 'vitest';
import { computeScrollProgress, rotationForProgress } from './heroTower';

describe('computeScrollProgress', () => {
  it('returns 0 when the hero top is at the viewport top', () => {
    expect(computeScrollProgress(0, 800, 800)).toBe(0);
  });

  it('returns 1 when the hero has scrolled fully past one viewport height', () => {
    expect(computeScrollProgress(-800, 800, 800)).toBe(1);
  });

  it('returns a midpoint value for a half-scrolled hero', () => {
    expect(computeScrollProgress(-400, 800, 800)).toBe(0.5);
  });

  it('clamps below 0 when the hero has not reached the top yet', () => {
    expect(computeScrollProgress(200, 800, 800)).toBe(0);
  });

  it('clamps above 1 when scrolled well past the hero', () => {
    expect(computeScrollProgress(-2000, 800, 800)).toBe(1);
  });
});

describe('rotationForProgress', () => {
  it('maps progress 0 to rotation 0', () => {
    expect(rotationForProgress(0)).toBe(0);
  });

  it('maps progress 1 to a positive rotation of roughly a fifth turn', () => {
    expect(rotationForProgress(1)).toBeCloseTo(Math.PI * 0.6, 5);
  });

  it('is linear at the midpoint', () => {
    expect(rotationForProgress(0.5)).toBeCloseTo(Math.PI * 0.3, 5);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/heroTower.test.ts`
Expected: FAIL — `Cannot find module './heroTower'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```typescript
// src/components/heroTower.ts

/**
 * Scroll progress through the hero, 0 (hero top at viewport top) to 1
 * (hero has scrolled a full viewport height past the top), clamped.
 */
export function computeScrollProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number
): number {
  const scrolled = -rectTop;
  const progress = scrolled / Math.min(rectHeight, viewportHeight);
  return Math.min(1, Math.max(0, progress));
}

/** Maps 0–1 scroll progress to a rotation angle in radians. */
export function rotationForProgress(progress: number): number {
  return progress * Math.PI * 0.6;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/heroTower.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/heroTower.ts src/components/heroTower.test.ts
git commit -m "feat: add hero tower scroll-to-rotation math with tests"
```

---

## Task 4: Rewrite Scene3D — single wireframe tower, scroll-driven, hero-scoped

**Files:**
- Modify: `src/components/Scene3D.astro`

**Interfaces:**
- Consumes: `computeScrollProgress`, `rotationForProgress` from `src/components/heroTower.ts` (Task 3).
- Produces: a `<canvas id="scene3d">` element sized to fill its parent (the hero section, per Task 5) instead of the full viewport; `position: absolute` (relative to the hero) instead of `position: fixed` (relative to the viewport).

- [ ] **Step 1: Replace `src/components/Scene3D.astro` in full**

```astro
---
// Hero-scoped 3D backdrop: a single abstract wireframe rendering of the
// Yachay tower from the event logo (tapered body + crenellated top),
// banded in the brand's rainbow progression. Rotation is driven by scroll
// progress through the hero, with a light pointer-parallax tilt on top.
// Degrades to no canvas (CSS fallback in Hero.astro) when WebGL is
// unavailable or reduced-motion is set.
---

<canvas id="scene3d" aria-hidden="true"></canvas>

<style>
  #scene3d {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    display: block;
  }
  @media (prefers-reduced-motion: reduce) {
    #scene3d { display: none; }
  }
</style>

<script>
  import * as THREE from 'three';
  import { computeScrollProgress, rotationForProgress } from './heroTower';

  const canvas = document.getElementById('scene3d') as HTMLCanvasElement | null;
  const hero = canvas?.closest('.hero') as HTMLElement | null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && hero && !reduce) {
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      canvas.style.display = 'none';
      throw new Error('no webgl');
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0.4, 9);

    // Band colors follow the logo's tower, bottom to top.
    const bandColors = [0x96332b, 0xba6f3a, 0xc09e27, 0x619745, 0x1f8e8b, 0x328ab5];

    const tower = new THREE.Group();
    const bandHeight = 0.85;
    const baseRadius = 1.5;
    const topRadius = 1.1;

    bandColors.forEach((hex, i) => {
      const t0 = i / bandColors.length;
      const t1 = (i + 1) / bandColors.length;
      const r0 = baseRadius + (topRadius - baseRadius) * t0;
      const r1 = baseRadius + (topRadius - baseRadius) * t1;
      const geo = new THREE.CylinderGeometry(r1, r0, bandHeight, 10, 1, true);
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.85 })
      );
      wire.position.y = -2 + bandHeight * (i + 0.5);
      tower.add(wire);
    });

    // Crenellated top ring, in the topmost band color.
    const crenGroup = new THREE.Group();
    const crenColor = bandColors[bandColors.length - 1];
    const crenCount = 10;
    const crenRadius = topRadius + 0.05;
    for (let i = 0; i < crenCount; i++) {
      const angle = (i / crenCount) * Math.PI * 2;
      const tooth = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.35, 0.18),
        new THREE.MeshBasicMaterial({ color: crenColor, wireframe: true, transparent: true, opacity: 0.85 })
      );
      tooth.position.set(Math.cos(angle) * crenRadius, -2 + bandHeight * bandColors.length + 0.15, Math.sin(angle) * crenRadius);
      crenGroup.add(tooth);
    }
    tower.add(crenGroup);

    scene.add(tower);
    tower.position.x = 1.6;

    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    window.addEventListener('pointermove', (e) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    function resize() {
      const w = hero!.clientWidth;
      const h = hero!.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) tick();
    });

    function tick() {
      if (!running) return;
      requestAnimationFrame(tick);

      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;

      const rect = hero!.getBoundingClientRect();
      const progress = computeScrollProgress(rect.top, rect.height, window.innerHeight);
      tower.rotation.y = rotationForProgress(progress) + pointer.x * 0.25;
      tower.rotation.x = pointer.y * 0.12;

      renderer.render(scene, camera);
    }
    tick();
  }
</script>
```

- [ ] **Step 2: Run the test suite**

Run: `npm test`
Expected: all tests PASS (Scene3D has no test file — it's a thin DOM/WebGL wrapper around the tested `heroTower.ts` functions).

- [ ] **Step 3: Commit**

```bash
git add src/components/Scene3D.astro
git commit -m "feat: rewrite Scene3D as a single scroll-driven wireframe tower"
```

---

## Task 5: Rebuild Hero — bold typography, whitespace, scoped 3D tower

**Files:**
- Modify: `src/components/Hero.astro`

**Interfaces:**
- Consumes: `Scene3D` (Task 4), existing i18n keys (`brand.name`, `hero.dates`, `hero.venue`, `hero.cta`), `Countdown.astro` (unchanged), `config.eventStart` (unchanged).

- [ ] **Step 1: Replace `src/components/Hero.astro` in full**

```astro
---
import { t, type Locale } from '../i18n';
import Countdown from './Countdown.astro';
import Scene3D from './Scene3D.astro';
import config from '../data/config.json';

interface Props {
  lang: Locale;
}

const { lang } = Astro.props;

// brand.name is an untranslated proper noun ("Yachay Open Science Week
// 2026") in both locales — split the trailing year onto its own line for
// a deliberate, noth.in-style headline break without touching i18n keys.
const fullTitle = t(lang, 'brand.name');
const lastSpace = fullTitle.lastIndexOf(' ');
const titleHead = fullTitle.slice(0, lastSpace);
const titleTail = fullTitle.slice(lastSpace + 1);
---

<section class="hero">
  <Scene3D />
  <div class="hero__inner">
    <span class="hero__badge" data-reveal>Open Science · Yachay Tech</span>
    <h1 class="hero__title" data-reveal>
      {titleHead}<br /><span class="gradient-text">{titleTail}</span>
    </h1>
    <p class="hero__dates" data-reveal>{t(lang, 'hero.dates')}</p>
    <p class="hero__venue" data-reveal>{t(lang, 'hero.venue')}</p>
    <div data-reveal><Countdown lang={lang} target={config.eventStart} /></div>
    <a class="hero__cta" href="#registro" data-reveal>{t(lang, 'hero.cta')}</a>
  </div>
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    background: var(--color-page);
    color: var(--color-text);
    padding: clamp(5rem, 14vh, 10rem) calc(var(--space) * 3) clamp(4rem, 10vh, 7rem);
    min-height: 88vh;
    display: flex;
    align-items: center;
  }
  .hero__inner {
    position: relative;
    z-index: 1;
    max-width: 720px;
    margin: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: calc(var(--space) * 1.75);
  }
  .hero__badge {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-accent);
  }
  .hero__title {
    font-family: var(--font-display);
    font-size: clamp(3.2rem, 10vw, 7.5rem);
    font-weight: 800;
    line-height: 0.96;
    letter-spacing: -0.03em;
    margin: 0.2rem 0;
  }
  .hero__dates {
    font-family: var(--font-display);
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    font-size: clamp(1.1rem, 2.4vw, 1.6rem);
  }
  .hero__venue {
    font-family: var(--font-body);
    color: var(--color-muted);
    margin: 0;
    font-size: 1.05rem;
  }
  .hero__cta {
    margin-top: calc(var(--space) * 2);
    position: relative;
    display: inline-block;
    background: var(--grad-brand);
    color: #fff;
    text-decoration: none;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 1.05rem;
    padding: 0.9rem 2rem;
    border-radius: 999px;
    box-shadow: var(--shadow-md);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .hero__cta:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: var(--shadow-lg);
  }
  @media (max-width: 720px) {
    .hero__inner { max-width: 100%; }
  }
</style>
```

Note: `.hero__fade` and its rule were dropped — that gradient existed to blend the full-bleed 3D scene into the page below it; the tower is now a bounded element within the hero only, so no blend is needed.

- [ ] **Step 2: Run the dev server and visually confirm the hero renders correctly in both locales**

Run: `npm run dev`, open `http://localhost:4321/es` and `http://localhost:4321/en`.
Expected: headline breaks onto two lines with "2026" (or locale equivalent trailing word) styled as the gradient-accented line, tower renders to the right/behind at a fixed position within the hero bounds only, countdown and CTA render normally.

- [ ] **Step 3: Run the test suite**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: rebuild hero with bold display typography and scoped 3D tower"
```

---

## Task 6: Rebuild Nav — real logo, flat bar

**Files:**
- Create: `src/assets/brand/logo-color.png` (binary copy)
- Delete: `src/assets/brand/logo.svg`
- Modify: `src/components/Nav.astro`

**Interfaces:**
- Produces: nav bar markup/styling consumed by no other file (leaf component).

- [ ] **Step 1: Copy the real logo asset into `src/assets/brand`**

```bash
cp "assets/Logo Color.png" "src/assets/brand/logo-color.png"
rm src/assets/brand/logo.svg
```

- [ ] **Step 2: Update `src/components/Nav.astro`**

Change the import and `<img>` tag:
```astro
---
import { t, type Locale } from '../i18n';
import logo from '../assets/brand/logo-color.png';
import LangToggle from './LangToggle.astro';

interface Props {
  lang: Locale;
}

const { lang } = Astro.props;

const links = [
  { href: '#about', label: t(lang, 'nav.about') },
  { href: '#ejes', label: t(lang, 'nav.ejes') },
  { href: '#programa', label: t(lang, 'nav.programa') },
  { href: '#datos', label: t(lang, 'nav.datos') },
  { href: '#participantes', label: t(lang, 'nav.participantes') },
  { href: '#sponsors', label: t(lang, 'nav.sponsors') },
  { href: '#registro', label: t(lang, 'nav.registro') },
];
---

<header class="nav">
  <nav class="nav__bar">
    <a class="nav__logo" href={`/${lang}`} aria-label={t(lang, 'brand.short')}>
      <img src={logo.src} alt={t(lang, 'brand.short')} width="96" height="44" />
    </a>
    <ul class="nav__links">
      {links.map((link) => (
        <li><a href={link.href}>{link.label}</a></li>
      ))}
    </ul>
    <LangToggle lang={lang} />
  </nav>
</header>

<style>
  .nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--color-page);
    border-bottom: 1px solid var(--color-border);
  }
  .nav__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--space) * 2);
    padding: calc(var(--space) * 1.25) calc(var(--space) * 3);
    max-width: 1200px;
    margin: 0 auto;
  }
  .nav__logo img {
    display: block;
    height: 38px;
    width: auto;
  }
  .nav__links {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--space) * 2.25);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .nav__links a {
    font-family: var(--font-body);
    color: var(--color-text);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: color 0.2s ease;
  }
  .nav__links a:hover {
    color: var(--color-accent);
  }
</style>
```

- [ ] **Step 2: Run the dev server and visually confirm the nav renders the real logo**

Run: `npm run dev`, check the nav bar shows the "YOSW 2026 · I Congreso Interdisciplinario de Ciencias" logo with the tower icon, not the placeholder text wordmark.

- [ ] **Step 3: Run the build to confirm the PNG import resolves correctly**

Run: `npm run build`
Expected: build succeeds with no missing-asset errors.

- [ ] **Step 4: Commit**

```bash
git add src/assets/brand/logo-color.png src/components/Nav.astro
git rm src/assets/brand/logo.svg
git commit -m "feat: integrate real event logo, flatten nav bar"
```

---

## Task 7: Replace emoji with inlined Lucide icons in Registration

**Files:**
- Modify: `src/components/Registration.astro`

**Interfaces:**
- Consumes: nothing new (still driven by `config.forms.*`, existing i18n keys `reg.*`).

- [ ] **Step 1: Replace the icon markup and script in `src/components/Registration.astro`**

Change the frontmatter to drop the emoji field and add inline SVG path data per card:
```astro
---
import { t, type Locale } from '../i18n';
import config from '../data/config.json';

interface Props {
  lang: Locale;
}

const { lang } = Astro.props;

const cards = [
  {
    key: 'attend',
    href: config.forms.attend,
    color: 'var(--y-blue)',
    // Lucide "ticket"
    path: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M13 5v2 M13 17v2 M13 11v2',
  },
  {
    key: 'poster',
    href: config.forms.poster,
    color: 'var(--y-purple)',
    // Lucide "presentation"
    path: 'M2 3h20 M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3 M7 21l5-5 5 5',
  },
  {
    key: 'ideaton',
    href: config.forms.ideaton,
    color: 'var(--y-orange)',
    // Lucide "lightbulb"
    path: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4',
  },
] as const;
---

<section id="registro" class="section registro">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">{t(lang, 'nav.registro')}</span>
      <h2 class="section__title">{t(lang, 'reg.heading')}</h2>
      <div class="divider"></div>
    </div>
    <div class="registro__grid">
      {cards.map((card, i) => (
        <article
          class="card card--accent registro__card"
          style={`--accent: ${card.color}; --delay: ${i * 100}ms`}
          data-reveal
        >
          <span class="registro__icon" style={`color: ${card.color}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              {card.path.split(' M').map((d, idx) => (
                <path d={idx === 0 ? d : `M${d}`} />
              ))}
            </svg>
          </span>
          <h3 class="registro__card-title">{t(lang, `reg.${card.key}`)}</h3>
          <p class="registro__card-desc">{t(lang, `reg.${card.key}.desc`)}</p>
          {card.href ? (
            <a class="registro__card-cta" href={card.href} target="_blank" rel="noopener noreferrer">
              {t(lang, 'reg.cta.open')} <span aria-hidden="true">→</span>
            </a>
          ) : (
            <span class="registro__card-cta registro__card-cta--disabled" aria-disabled="true">
              {t(lang, 'stats.soon')}
            </span>
          )}
        </article>
      ))}
    </div>
  </div>
</section>

<style>
  .registro__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: calc(var(--space) * 2.5);
  }
  .registro__card {
    transition-delay: var(--delay);
    padding: clamp(1.5rem, 3vw, 2.2rem);
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    text-align: left;
  }
  .registro__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
  .registro__icon svg {
    width: 26px;
    height: 26px;
  }
  .registro__card-title {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0.3rem 0 0;
  }
  .registro__card-desc {
    font-family: var(--font-body);
    color: var(--color-muted);
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.55;
    flex-grow: 1;
  }
  .registro__card-cta {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.4rem;
    background: var(--accent, var(--color-accent));
    color: #fff;
    text-decoration: none;
    font-family: var(--font-body);
    font-weight: 600;
    padding: 0.6rem 1.3rem;
    border-radius: 999px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .registro__card-cta:hover {
    transform: translateX(3px);
    box-shadow: var(--shadow-sm);
  }
  .registro__card-cta--disabled {
    background: color-mix(in srgb, var(--color-muted) 40%, transparent);
    color: var(--color-muted);
    cursor: not-allowed;
    pointer-events: none;
  }
  @media (max-width: 760px) {
    .registro__grid { grid-template-columns: 1fr; max-width: 420px; margin-inline: auto; }
  }
</style>
```

- [ ] **Step 2: Run the dev server and visually confirm the icons render**

Run: `npm run dev`, check the Registration section shows three line-icon monograms (ticket, presentation, lightbulb) instead of emoji, colored per card accent.

- [ ] **Step 3: Run the test suite**

Run: `npm test`
Expected: all tests PASS (no logic changed, only markup).

- [ ] **Step 4: Commit**

```bash
git add src/components/Registration.astro
git commit -m "feat: replace emoji with inlined Lucide icons in registration cards"
```

---

## Task 8: Footer — static single-accent bar

**Files:**
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: nothing new.

- [ ] **Step 1: Update the footer bar and background in `src/components/Footer.astro`**

Change:
```astro
  .footer {
    position: relative;
    background: var(--color-surface);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    color: var(--color-text);
    padding: calc(var(--space) * 6) calc(var(--space) * 3);
    border-top: 1px solid var(--color-border);
  }
  .footer::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: var(--grad-spectrum);
    background-size: 200% auto;
    animation: shine 6s linear infinite;
  }
```
to:
```astro
  .footer {
    position: relative;
    background: var(--color-page);
    color: var(--color-text);
    padding: calc(var(--space) * 6) calc(var(--space) * 3);
    border-top: 1px solid var(--color-border);
  }
  .footer::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 2px;
    background: var(--color-accent);
  }
```

- [ ] **Step 2: Run the dev server and visually confirm**

Run: `npm run dev`, scroll to the footer, confirm a static single-color hairline instead of an animated rainbow bar.

- [ ] **Step 3: Run the test suite**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro
git commit -m "style: replace footer's animated rainbow bar with a static accent hairline"
```

---

## Task 9: Full-site verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests PASS (26+ tests, including the 8 new `heroTower.test.ts` cases from Task 3).

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: build completes with no errors, no missing-asset warnings for the logo or removed `logo.svg`.

- [ ] **Step 3: Run the preview server and manually check every section**

Run: `npm run preview`, open the site and check, in both `/es` and `/en`:
- Nav shows the real logo and flat bar at desktop and mobile widths.
- Hero shows the large two-line headline, tower renders and rotates as you scroll through the hero, countdown/CTA work.
- About, Ejes, Program (calendar grid), Data (bar chart + live stats), Participants preview, Registration (icons, not emoji), Sponsors, Footer all render on the flat neutral background with single-accent card tops, no leftover glass blur or rainbow gradients.
- Toggle `prefers-reduced-motion: reduce` in DevTools → tower canvas disappears, reveal animations show content immediately with no transition.
- Resize to mobile width → nav links wrap, hero headline scales down, all grids collapse to single column per their existing responsive rules.

- [ ] **Step 4: Fix any visual issues found during manual verification**

Address inline — no separate task, since this is the terminal verification step for the whole plan.
