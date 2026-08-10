# YOSW website — noth.in-inspired redesign (foundation, hero/nav, section cascade)

**Date:** 2026-08-10
**Branch:** `feat/futuristic-redesign`
**Status:** approved, ready for implementation planning

## Context

The redesign branch (`2f776ae`) currently has a colorful, always-on 3D-backdrop
aesthetic (particle network + wireframe icosahedron behind every section,
frosted-glass cards, full 9-color Yachay palette everywhere, rainbow gradient
text/dividers). The real event logo (`assets/Logo Color.png`,
`assets/Logo Blanco Sombreado.png`) has now been supplied and needs to be
integrated. Using https://www.noth.in/ as inspiration, this redesign dials the
site toward a calmer, more professional, more confident-typography aesthetic:
neutral base with color used as a deliberate accent, huge bold headlines, a
single signature 3D object (an abstract render of the Yachay tower from the
logo) instead of an always-on particle field, and a professional icon system
(Lucide, inlined SVG) replacing emoji.

See memory `yosw-website-project` / `yosw-design-preferences` for prior
project history and previously-agreed directives (futuristic, animated,
Yachay palette, symmetric, Google-Calendar program, multi-page) — this spec
refines the *visual language* on top of that foundation; it does not change
the previously-agreed program/data architecture.

## Goals

1. Integrate the real logo (nav + favicon/meta as applicable).
2. Flip the visual base from "colorful everywhere / animated 3D behind all
   content" to "neutral off-white/near-black base, color as accent" —
   closer to noth.in's restraint, while keeping the Yachay 9-hue palette as
   the *only* source of accent color (no invented colors).
3. Rebuild Hero + Nav with noth.in-style bold typography, whitespace, and a
   single signature 3D object (scroll-driven rotating abstract Yachay tower)
   instead of the current full-page particle/wireframe backdrop.
4. Let the shared design-system utilities (`.section`, `.card`, `.eyebrow`,
   `.divider`, `.gradient-text`) carry the new look down into every existing
   section (About, Ejes, Registration, Sponsors, Footer, Program, Data,
   Participants) with minimal bespoke changes.
5. Establish a professional icon system (Lucide, inlined SVG) and remove
   emoji usage (currently in `Registration.astro`).

## Non-goals

- No new site architecture, pages, or content changes (per-event pages /
  `/programa` full page remain the previously-agreed *next* project, not
  part of this spec).
- No change to data schemas, i18n keys, or business logic (calendar,
  filtering, live stats, form URLs).
- No rebuild of `ProgramTimeline.astro` / `LiveStats.astro` /
  `ParticipantsPreview.astro` internals beyond what the token/utility cascade
  naturally changes — only touched if the cascade surfaces a hardcoded
  glass/gradient style that doesn't inherit correctly.

## Design

### 1. Tokens & base (`src/styles/tokens.css`, `src/styles/global.css`)

- **Palette flip:**
  - `--color-page`: warm off-white (e.g. `#faf8f4`) replacing `#f5f7fa`.
  - `--color-text`: near-black warm (e.g. `#161513`) replacing `#16222b`.
  - `--color-surface` / `--color-surface-solid`: solid warm white, **no
    translucency** (drop the `rgba(255,255,255,0.74)` glass value).
  - `--color-border`: soft warm-gray hairline (e.g.
    `rgba(30, 26, 20, 0.12)`).
  - `--y-*` (9 Yachay hues): **unchanged values**, but role shifts from
    "everywhere" to "accent-only" (icons, category tags, hover states, one
    accent bar per card, the 3D tower material bands).
- **Gradients toned down:** `--grad-spectrum` stops being the default for
  `.gradient-text` / `.divider` / footer's top bar. Those utilities switch
  to a single accent color (`var(--color-accent)`, i.e. `--y-blue`) instead
  of the full rainbow sweep, so color reads as an intentional accent rather
  than decoration. `--grad-brand` (2-3 color, used on CTA buttons) may stay
  as a subtler multi-stop but should be re-tuned to feel calmer, not
  removed (CTAs still need visual weight).
- **Typography:** add **Archivo** (bold grotesk) via the existing Google
  Fonts `<link>` pattern in `Base.astro`, weights 600/700/800, for
  `--font-display`. Keep **Inter** for `--font-body`. Push the type scale up
  significantly, especially the hero title and section titles (see Hero
  section below for specifics).
- **Cards:** `.card` drops `backdrop-filter`/glass blur entirely — flat
  white card, 1px hairline border, `box-shadow` only appears/intensifies on
  hover (kept from current hover lift behavior).
- **Remove:**
  - `.page-body` scrim (`global.css` lines ~193-215) — no longer needed
    once the background is calm neutral instead of an animated 3D scene
    behind all content.
  - `body::before` drifting pastel gradient blobs + `@keyframes drift` — no
    longer needed for the same reason.
- **Radius/shadow scale:** keep `--radius`/`--shadow-*` tokens structurally,
  just re-tune shadow values to work on a flat white background instead of
  over a busy 3D scene (softer, tighter shadows).

### 2. Hero + Nav

- **Nav (`Nav.astro`):** drop the frosted sticky bar → flat off-white bar
  with a hairline bottom border. Logo swaps to the real logo asset (convert
  `assets/Logo Color.png` to an optimized SVG/PNG in
  `src/assets/brand/logo.svg` — check whether a true SVG source is available
  before rasterizing; if only PNG is available, use an optimized PNG at 2x
  for retina). Nav links get slightly more letter-spacing and a small-caps
  /uppercase treatment consistent with noth.in's nav style.
- **Hero (`Hero.astro`):** restructure to noth.in-style: huge Archivo
  headline with a deliberate bilingual-safe line break, generous
  whitespace, 3D tower object positioned to one side rather than full-bleed
  behind text. Existing content (badge/eyebrow, dates, venue, countdown,
  CTA) is retained but restyled to the new type scale and neutral palette.
- **3D backdrop (`Scene3D.astro`) becomes hero-only, not fixed/global:**
  - Replace the current particle-network + wireframe-icosahedron scene with
    a single rendered object: an abstract low-poly/wireframe rendering of
    the Yachay tower from the logo, with its bands colored via the same
    rainbow progression as the logo (blue → teal → green → gold → orange →
    red), matching the logo's tower geometry (tapered cylinder body,
    crenellated top).
  - Motion: rotation driven by scroll position (map scroll progress within
    the hero to rotation angle), not passive idle-only spin. Keep pointer
    parallax as a secondary subtle effect if it doesn't conflict with
    scroll-driven rotation.
  - Canvas is scoped to the hero section only (not `position: fixed` behind
    all content) — every other section renders on the flat neutral page
    background, no canvas underneath.
  - Reduced-motion / no-WebGL fallback: static rendering of the same
    tower shape (e.g. an SVG/CSS version) or a simple gradient placeholder,
    consistent with the current fallback pattern.

### 3. Section cascade + touch-ups

Because About/Ejes/Registration/Sponsors/Footer/Program/Data/Participants
build on the shared `.section`/`.card`/`.eyebrow`/`.divider`/`.gradient-text`
utilities, they inherit the neutral-base/single-accent look automatically
once tokens + global.css utilities change. Specific touch-ups:

- **About:** no structural change — per-stat accent color already
  single-color per card.
- **Ejes:** no structural change — large translucent number + accent glow
  blob reads fine on a flat card; just loses glass blur via the cascade.
- **Registration:** replace emoji icons (🎟️📊💡) with **Lucide SVG icons**,
  inlined (no runtime/CDN dependency), colored via the card's existing
  `--accent` custom property. Icon choices: ticket icon for "attend",
  presentation/bar-chart icon for "poster", lightbulb icon for "ideaton" (or
  closest Lucide equivalents).
- **Sponsors/Footer:** footer's animated rainbow top bar
  (`--grad-spectrum` + `shine` keyframes) becomes a static single-accent
  hairline, consistent with the toned-down gradient utility from section 1.
  Sponsor logo tiles unchanged structurally.
- **Icon system guideline:** establish Lucide as the standard icon library
  project-wide. Icons are inlined as SVG (copied/trimmed from Lucide's
  source, not loaded via CDN/JS runtime) to keep the static-Astro,
  no-extra-dependency approach. Any future icon need (nav, social links,
  category markers) draws from Lucide for consistency — this becomes part
  of the project's design guideline, documented briefly in this spec so
  future work follows it.
- **Program/Data/Participants sections:** not opened in detail during this
  design pass; the token/utility cascade is expected to carry them
  correctly. Only touched if implementation reveals a hardcoded
  glass/gradient/emoji style that doesn't inherit from the shared tokens.

### 4. Motion

- Existing `[data-reveal]` scroll-fade-in pattern (IntersectionObserver-based,
  already respects `prefers-reduced-motion`) is kept as-is — it already
  matches noth.in's understated reveal treatment. No reinvention needed.
- New motion: the hero's scroll-driven tower rotation (see section 2).

## Testing

- Existing Vitest suite (26 tests: i18n parity, data schema validation,
  calendar/timeline logic, countdown) is unaffected by this visual-only
  redesign — should remain green throughout.
- Manual verification: run `npm run dev`, visually check hero, nav, and each
  cascaded section in both `/es` and `/en`, at mobile/tablet/desktop
  widths, and with `prefers-reduced-motion: reduce` simulated (DevTools) to
  confirm the 3D fallback and disabled animations work.
- No new automated tests required (no new logic, only markup/styles/assets).

## Open items for implementation planning

- Confirm whether a true vector source for the logo exists (ask organizers)
  or whether Color/White PNGs must be traced/rasterized into
  `src/assets/brand/logo.svg`.
- Lucide icon set will be hand-picked per use (ticket/poster/lightbulb for
  Registration at minimum); exact icon choices finalized during
  implementation.
