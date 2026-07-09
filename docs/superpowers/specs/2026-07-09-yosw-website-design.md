# YOSW 2026 Website — Design Spec

**Date:** 2026-07-09
**Status:** Approved (design), pending implementation plan
**Event:** Yachay Open Science Week (YOSW) 2026 — Yachay Tech, Urcuquí, Ecuador
**Authoritative dates:** **19–24 October 2026** (Monday–Saturday)

---

## 1. Purpose

A public website for YOSW 2026 that:

1. **Informs / promotes** the congress (what it is, dates, thematic axes, objectives).
2. **Shows the program** as an interactive, color-coded 6-day timeline.
3. **Collects registrations** (attendees, poster submissions, ideatón teams) via hosted forms.
4. **Attracts sponsors** (tiers, contact, downloadable proposal).
5. **Presents participants/exhibitors** in a filterable directory (populated over time).
6. **Visualizes data** — thematic breakdown and live participation stats.

Reference for *vibe only* (not content): CompuFest Yachay Tech — dark, tech-forward, single-page with anchor nav, countdown, stat tiles, section-per-topic.

## 2. Non-goals (YAGNI)

- No custom backend, database, or server code.
- No authentication / user accounts.
- No CMS/admin panel — content is edited as JSON in the repo.
- No payment processing.

## 3. Stack & hosting

- **Framework:** Astro (static output, "islands" for interactivity, built-in i18n, typed data collections).
- **Hosting:** Netlify (free tier; good form/redirect handling).
- **Charts:** lightweight, island-rendered; palettes follow the `dataviz` skill (accessible, light/dark aware).
- **Registration:** Google Forms (bilingual), responses collected in a Google Sheet.
- **"Live" stats:** the same Google Sheet published as JSON/CSV, fetched client-side to animate counters. Fully static, no backend. Shows placeholders ("próximamente") until data exists.

## 4. Internationalization

- Bilingual **ES / EN** from launch, with a language toggle.
- Astro i18n routing: `/es/...` and `/en/...`. Default locale: **es**.
- All UI strings live in dictionaries `src/i18n/es.json` and `src/i18n/en.json`. No hardcoded copy.
- Data files (schedule, participants) carry both-language fields where content differs (e.g., `titulo_es` / `titulo_en`) OR a nested `{ es, en }` object. **Decision:** use nested `{ es, en }` objects for translatable content fields.

## 5. Theming (brand kit arrives later)

The design team will provide a logo + brand kit later. The site is built to absorb it with **no structural change**:

- **Design tokens** as CSS custom properties: colors, typography, spacing, radii — defined in one `tokens.css`.
- **Placeholder palette:** the 9 category colors already in `calendario_yosw.json` plus a dark tech-forward base theme.
- **Logo:** a `<Logo>` component renders from a single swappable asset slot (`src/assets/brand/logo.svg` placeholder). Sponsor logos use placeholder boxes with alt text until real assets arrive.
- Swapping the brand kit = replace token values + drop in logo/sponsor assets. No layout rework.

## 6. Site structure

**Main landing page** (single long page, anchor navigation):

1. **Hero** — title, dates (19–24 Oct 2026), venue, countdown timer, primary "Registrarse" CTA, ES/EN toggle, logo slot.
2. **About** — what YOSW is + general objective; key stat tiles.
3. **Ejes temáticos** — the 5 thematic tracks as cards.
4. **Program timeline** ⭐ — interactive 6-day, color-coded schedule from `calendario.json`. Centerpiece.
5. **Data dashboard** — thematic-axes breakdown + live participation counters.
6. **Participants** — preview grid; links to full directory page.
7. **Registration** — cards for the 3 tracks (attend / poster / ideatón) → Google Forms.
8. **Sponsors** — tiers, logo placeholders, "download proposal PDF", sponsorship contact.
9. **Footer** — organizing committee, contact, social links.

**Sub-pages:**

- `/participantes` — full filterable/searchable directory (by eje, role: speaker/exhibitor/poster).
- `/programa` — optional full-screen schedule view (same data as the timeline section).

## 7. Components & islands

Static (no JS): Hero shell, About, Ejes cards, Sponsors, Footer.
Interactive islands (JS only where needed):

- `CountdownTimer` — counts down to 2026-10-19.
- `ProgramTimeline` — renders days/events from `calendario.json`, category color legend, filter by category/eje, event detail on click.
- `AxesChart` — distribution of activities across the 5 ejes.
- `LiveStats` — animated counters fed by the published Google Sheet (graceful placeholder on empty/error).
- `ParticipantDirectory` — searchable/filterable grid.
- `LangToggle` — switches `/es` ↔ `/en` preserving the current path.

Each island has one clear responsibility, reads typed data, and is independently testable.

## 8. Data model (`src/data/`)

- **`calendario.json`** — the existing `calendario_yosw.json`, dates shifted to Oct 19–24, translatable fields as `{ es, en }`. Keeps `leyenda_categorias`. Invariant: every event `categoria` ∈ `leyenda_categorias` keys.
- **`ejes.json`** — the 5 thematic axes: `{ id, nombre:{es,en}, descripcion:{es,en}, color }`.
- **`participants.json`** — array of `{ id, nombre, rol, eje, foto?, enlace?, bio?:{es,en} }`. Starts small, grows over time.
- **`sponsors.json`** — array of `{ id, nombre, nivel, logo?, enlace? }`; `nivel` ∈ tiers (principal / colaborador / institucional).
- **`config.json`** — event-wide constants: dates, venue, form URLs, published-sheet URL, social links.

`nota` / `null` fields in the schedule are intentional "unconfirmed" flags and are surfaced (not silently dropped).

## 9. Registration flow

- Three Google Forms (attend, poster, ideatón), each bilingual or duplicated per language.
- Registration section links/embeds them; form URLs live in `config.json`.
- Responses collect in a Google Sheet → published as JSON/CSV → consumed by `LiveStats`.

## 10. Verification

- `astro build` succeeds with no errors.
- Both `/es` and `/en` routes render every section.
- Timeline reflects `calendario.json` (spot-check a day's events and colors).
- Drive the page in a real browser: countdown ticks, language toggle preserves position, charts render, `LiveStats` degrades gracefully with no data.
- Responsive: no horizontal scroll on mobile; timeline scrolls within its own container.

## 11. Data reconciliation (side task)

Shift `calendario.json` to 19–24 October 2026 and update `CLAUDE.md` / the proposal reference so all sources agree on the October dates. The weekday→activity mapping is preserved; only the date range changes.

## 12. Phasing

- **Phase 1 (launch):** Hero, About, Ejes, Program timeline, Registration (forms live), Sponsors (placeholders), Footer, bilingual, tokenized theme. LiveStats + directory show placeholders.
- **Phase 2 (as data arrives):** populate participants directory, activate LiveStats from the sheet, enrich AxesChart, drop in real brand kit + sponsor logos.
