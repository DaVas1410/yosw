# Yachay Open Science Week (YOSW) 2026 — Website

Bilingual (Spanish/English) static site for YOSW 2026, built with [Astro](https://astro.build). No server-side runtime — the whole site builds to static HTML/CSS/JS in `dist/` and is deployed to Netlify.

## Running it

```sh
npm install       # install dependencies
npm run dev        # start dev server at http://localhost:4321
npm run build      # build the static site to ./dist/
npm run preview    # serve the ./dist/ build locally
npm test           # run the Vitest test suite (alias for `npx vitest run`)
npm run test:watch # run Vitest in watch mode
```

Requires Node >= 22.12.0.

## Site structure

- Pages live under `src/pages/[lang]/`, so every page is served at both `/es/...` and `/en/...`. `src/pages/index.astro` redirects `/` to `/es/`.
- Reusable UI is in `src/components/` (e.g. `Hero.astro`, `EjesSection.astro`, `Registration.astro`, `Sponsors.astro`, `Footer.astro`), with feature areas grouped in subfolders: `components/timeline/` (Program Timeline), `components/data/` (Ejes bars + LiveStats placeholder), `components/participants/` (Participants directory + `/participantes` sub-page).
- Shared layout is `src/layouts/Base.astro`; global styles are `src/styles/global.css` and design tokens are `src/styles/tokens.css`.
- Each feature's logic is unit-tested next to its component (e.g. `transform.ts`/`transform.test.ts`, `filter.ts`/`filter.test.ts`).

## Where the content lives

All editable content is data-driven — you should not need to touch component code to update text, schedule, people, or sponsors.

- `src/data/calendario.json` — the day-by-day event schedule (`dias[].eventos[]`), validated against `CalendarioSchema` in `src/data/schemas.ts`. Every event's `categoria` must be a key in `leyenda_categorias`. Event titles (`titulo`) are bilingual `{ es, en }` objects. Optional `lugar` shows where an event happens; optional `paralelas` turns an event into simultaneous talks (one column per room, see below).
- `src/data/ejes.json` — the thematic axes (Ejes), each with an `id`, bilingual `nombre`/`descripcion`, a `color`, and optional `logos` (filenames in `src/assets/ejes/`, shown in the wheel and the mobile cards).
- `src/data/participants.json` — the participants directory. Each entry: `id`, `nombre`, `rol`, optional `eje` (matches an axis `id`), optional `foto`, `enlace`, and bilingual `bio`. Empty (`[]`) is a valid, intentional state — the directory renders an empty-state message with filters visible until entries are added.
- `src/data/ideathon.json` — the Ideatón challenges (`retos`), each with bilingual `titulo`, `resumen`, `problema`, `porque`, `entregables[]` and `perfiles`. The sign-up form is `forms.ideathon` in `config.json`.
- `src/data/sponsors.json` — optional names/links for the sponsor and partner logos; the walls themselves come from the files in `src/assets/sponsors/{patrocinadores,colaboradores}/` (see below).
- `src/data/config.json` — site-wide settings: `eventStart` (ISO datetime, drives the countdown), `venue`, Google Form URLs, the live-stats sheet URL, and social links.
- `src/i18n/es.json` / `src/i18n/en.json` — all UI strings (labels, buttons, headings that aren't part of the data files). **Both files must have the exact same set of keys** — `src/i18n/i18n.test.ts` enforces this parity, so if you add a key to one, add it to the other.

Every data file has a Zod schema in `src/data/schemas.ts`; `src/data/data.test.ts` validates the JSON against those schemas, so malformed edits will fail `npm test`.

### Adding a participant

Append an object to `src/data/participants.json`:

```json
{
  "id": "unique-slug",
  "nombre": "Full Name",
  "rol": "Role / affiliation",
  "eje": 1,
  "foto": "/path/or/url/to/photo.jpg",
  "enlace": "https://...",
  "bio": { "es": "Bio en español", "en": "Bio in English" }
}
```

`eje`, `foto`, `enlace`, and `bio` are optional.

### Adding a sponsor or partner

Drop the logo file into the right folder — that's it:

- `src/assets/sponsors/patrocinadores/` → **Patrocinadores** wall
- `src/assets/sponsors/colaboradores/` → **Colaboradores** wall

PNG, JPG, WebP or SVG. On every build each logo gets its flat background (white, light grey…) removed automatically, is trimmed to its content and resized, so a plain JPG on a white box is fine. Logos appear sorted by filename; with `npm run dev` running, a new file shows up after a page refresh.

Optionally give it a proper name and link in `src/data/sponsors.json`, keyed by `<carpeta>/<archivo>`:

```json
{
  "patrocinadores/huawei.png": { "nombre": "Huawei", "enlace": "https://www.huawei.com" }
}
```

Without an entry, the name is derived from the filename (`el-pato-goloso.png` → "El Pato Goloso"). `npm test` fails if an entry in `sponsors.json` points at a file that no longer exists.

### Adding speakers and rooms for simultaneous talks

A block of simultaneous talks is an event in `calendario.json` with a `paralelas` array — one entry per room:

```json
"paralelas": [
  {
    "sala": "Auditorio",
    "eje": 1,
    "talks": [{ "hora": "09:30", "speaker": "Nombre Apellido", "tema": "Título de la charla" }]
  }
]
```

- `sala` is the room name; `"TBD"` renders as "Sala 1", "Sala 2"… until it's known.
- `eje` (optional) is an axis `id` from `ejes.json`; it colours the column and names the track.
- `speaker` / `tema` set to `"TBD"` render as "Por confirmar".
- For an event in a single place, add `"lugar": "Auditorio"` to show it next to the title.

### Wiring up the Google Forms and live-stats sheet

In `src/data/config.json`, fill in the `forms` URLs (`attend`, `poster`, `ideaton`) with the published Google Form links. Until a given URL is set (empty string), the Registration section shows a "próximamente" (coming soon) state for that form instead of a link.

Set `liveStatsSheetUrl` to the published URL of the Google Sheet (CSV/JSON export endpoint) backing the live stats. Until it's set, the Data dashboard shows a "próximamente" placeholder instead of live numbers.

### Swapping the brand kit

- Colors, fonts, spacing, and radii are CSS custom properties defined in `src/styles/tokens.css` (`--color-bg`, `--color-accent`, `--color-eje-1`…`--color-eje-5`, `--cat-*` schedule category colors, `--font-display`, `--font-body`, `--radius`, `--space`). Edit the values in place — components consume these tokens, not hardcoded colors.
- The `--cat-*` tokens should mirror the keys in `leyenda_categorias` in `src/data/calendario.json`; keep them in sync when categories change.
- The logo is `src/assets/brand/logo-color.png` — replace the file in place with the same filename to swap it site-wide.

## Deployment

The site deploys to Netlify via `netlify.toml`: build command `npm run build`, publish directory `dist`, with a 302 redirect from `/` to `/es/`.
