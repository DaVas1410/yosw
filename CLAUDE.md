# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is the source for the **Yachay Open Science Week (YOSW) 2026** website: a bilingual (Spanish/English) static site built with [Astro](https://astro.build), for the interdisciplinary academic-scientific congress at Yachay Tech (Urcuquí, Ecuador). It also contains the original planning documents the site content was derived from.

Primary language of the content is **Spanish**; the site itself is bilingual (`/es` and `/en` routes) with parity enforced between `src/i18n/es.json` and `src/i18n/en.json`.

## Dev, build, and test commands

```sh
npm install       # install dependencies
npm run dev        # start dev server at http://localhost:4321
npm run build      # build the static site to ./dist/
npm run preview    # serve the ./dist/ build locally
npm test           # run the Vitest test suite (alias for `npx vitest run`)
npm run test:watch # run Vitest in watch mode
```

Requires Node >= 22.12.0. Deployment is via Netlify (`netlify.toml`: build `npm run build`, publish `dist`, redirect `/` → `/es/`).

## Editing content

Site content is data-driven, not hardcoded in components:

- `src/data/*.json` — schedule (`calendario.json`), thematic axes (`ejes.json`), participants directory (`participants.json`), sponsors (`sponsors.json`), and site config (`config.json`: event start date, venue, Google Form URLs, live-stats sheet URL, social links). Each has a Zod schema in `src/data/schemas.ts`, validated by `src/data/data.test.ts`.
- `src/i18n/{es,en}.json` — all UI strings. Both files must have identical key sets (enforced by `src/i18n/i18n.test.ts`).
- `src/styles/tokens.css` — brand colors, fonts, spacing as CSS custom properties. `src/assets/brand/logo-color.png` — the logo asset.

See `README.md` for the full guide to adding participants/sponsors and wiring up forms.

## Files

- `Propuesta_OSW_v3.docx` — the master proposal document (v3.0). Binary Word file: read its text via `unzip -p Propuesta_OSW_v3.docx word/document.xml`. Contains background, objectives, organizational committees, thematic axes (ejes), the activity program, the day-by-day schedule, academic-flexibility requests, and sponsorship strategy.
- `calendario_yosw.json` — a structured, machine-readable version of the week's schedule (`dias[].eventos[]`), with a `leyenda_categorias` mapping event categories to hex colors. Some events carry a `nota` field flagging data that was uncertain or cut off in the original source image ("verificar"). This is a historical source document; the live site uses `src/data/calendario.json` (see reconciliation note below).

## Working with the calendar JSON

- Every event has `categoria` that must be one of the keys in `leyenda_categorias`. Keep them in sync when adding categories or events.
- `hora_fin: null` and `nota` fields mark unconfirmed data — do not silently "clean up" these; they are intentional flags.
- Times are 24-hour `"HH:MM"` strings; dates are `YYYY-MM-DD`.

## IMPORTANT: known data discrepancy (reconciled)

The root files historically disagreed on the event dates:

- `Propuesta_OSW_v3.docx` states **23–28 November 2026** (and internally references activities as if that week).
- `calendario_yosw.json` uses **22–28 August 2026** (including an empty opening Sunday).

**Reconciliation:** **19–24 October 2026** (Mon–Sat) is the authoritative date range for the website. `src/data/calendario.json` reflects this range — the same weekday → activity structure shifted onto Oct 19 (Mon) … Oct 24 (Sat), with the empty Sunday dropped and every `titulo` converted to a `{ es, en }` bilingual object. `Propuesta_OSW_v3.docx` and the root `calendario_yosw.json` remain historical source documents only; do not treat their dates as current.

## Domain glossary (from the proposal)

- **Ejes temáticos** — the 5 thematic tracks (AI/Data Science/HPC; Salud Digital/Bioingeniería; Sostenibilidad/Territorio Inteligente; Sociedad Digital; Ciencias Fundamentales).
- **Ideatón** — multi-day interdisciplinary innovation competition with nightly mentorship sessions (Mentorías Ideatón).
- **Comité Organizador / Comité Científico** — the logistics committee and the proposal-review/scientific committee, respectively.
- **Flexibilidad académica** — the request to relax the class schedule only on the two busiest days (not a full week suspension).
