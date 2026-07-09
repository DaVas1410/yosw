# YOSW 2026 Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (ES/EN), static, data-driven website for Yachay Open Science Week 2026, with an interactive program timeline, data visualizations, Google Forms registration, and a swappable brand-kit theme.

**Architecture:** Astro static site. Content lives as typed JSON in `src/data/`. Presentational sections are static (zero JS); interactivity (countdown, timeline, charts, filters, language toggle) ships as small Astro islands. Theme is driven by CSS custom-property design tokens so the design team's brand kit swaps in without structural change. Registrations use Google Forms; "live" stats read a published Google Sheet client-side (no backend). Hosted on Netlify.

**Tech Stack:** Astro 4.x, TypeScript, Vitest (unit tests for logic/data), Zod (data validation), vanilla-TS islands (no heavy UI framework), CSS custom properties.

## Global Constraints

- **Authoritative event dates:** 19–24 October 2026 (Monday–Saturday). Countdown target: `2026-10-19T09:00:00-05:00` (Ecuador, UTC−5).
- **Languages:** Spanish (default locale `es`) and English (`en`). No hardcoded UI copy — every string comes from `src/i18n/{es,en}.json`. Translatable data content uses nested `{ es, en }` objects.
- **No backend / DB / auth / CMS.** Content is edited as JSON in the repo.
- **Theme via tokens only:** components reference CSS custom properties from `src/styles/tokens.css`; no hardcoded colors/fonts in components.
- **Schedule invariant:** every event's `categoria` must be a key in `leyenda_categorias`.
- **Registration:** Google Forms; form URLs come from `src/data/config.json`.
- **Package manager:** npm. **Node:** 24.x (installed).
- **Commit after every task.**

---

### Task 1: Scaffold Astro project + tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/pages/index.astro`
- Test: `src/lib/__tests__/smoke.test.ts`

**Interfaces:**
- Produces: a working `astro build` and `npm test`; Astro i18n configured with locales `["es","en"]`, default `es`, `prefixDefaultLocale: true`.

- [ ] **Step 1: Initialize the project non-interactively**

```bash
cd "C:/Users/sedig/Documents/yosw"
npm create astro@latest . -- --template minimal --no-install --no-git --skip-houston --typescript strict
```
If it refuses because the directory is non-empty, create in a temp subfolder and move files in, preserving existing `docs/`, `CLAUDE.md`, `calendario_yosw.json`, `Propuesta_OSW_v3.docx`.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install -D vitest zod
```

- [ ] **Step 3: Configure Astro i18n** — set `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yosw.yachaytech.edu.ec',
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: true },
  },
});
```

- [ ] **Step 4: Add vitest config** — `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
```

- [ ] **Step 5: Add npm scripts** — in `package.json` `"scripts"` add: `"test": "vitest run"`, `"test:watch": "vitest"`. Keep Astro's `dev`/`build`/`preview`.

- [ ] **Step 6: Write a smoke test** — `src/lib/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
describe('toolchain', () => {
  it('runs vitest', () => { expect(1 + 1).toBe(2); });
});
```

- [ ] **Step 7: Verify build + test**

Run: `npm run build && npm test`
Expected: build writes `dist/`; test prints `1 passed`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with i18n and vitest"
```

---

### Task 2: Design tokens + base theme + layout shell

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/assets/brand/logo.svg`

**Interfaces:**
- Produces: `Base.astro` layout (props: `lang: 'es'|'en'`, `title: string`) importing global styles; CSS variables `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-eje-1..5`, `--cat-<key>` (one per `leyenda_categorias` key), `--font-display`, `--font-body`, `--radius`, `--space`.

- [ ] **Step 1: Define tokens** — `src/styles/tokens.css`, dark placeholder theme using the calendar palette:

```css
:root {
  --color-bg: #0b1120;
  --color-surface: #131c31;
  --color-text: #e8edf7;
  --color-muted: #94a3b8;
  --color-accent: #2563eb;
  /* eje colors (placeholder — brand kit overrides) */
  --color-eje-1: #0ea5e9; --color-eje-2: #14b8a6; --color-eje-3: #22c55e;
  --color-eje-4: #8b5cf6; --color-eje-5: #f59e0b;
  /* schedule categories (mirror leyenda_categorias) */
  --cat-inauguracion: #2563eb; --cat-charlas: #0ea5e9; --cat-mesas_abiertas: #14b8a6;
  --cat-posters: #8b5cf6; --cat-expos_jurados: #f59e0b; --cat-mentorias: #ec4899;
  --cat-social_networking: #22c55e; --cat-premiacion: #f43f5e; --cat-academico_general: #64748b;
  --font-display: system-ui, 'Segoe UI', sans-serif;
  --font-body: system-ui, 'Segoe UI', sans-serif;
  --radius: 12px; --space: 8px;
}
```

- [ ] **Step 2: Global reset + base** — `src/styles/global.css`: box-sizing reset, body uses `var(--color-bg)`/`var(--color-text)`/`var(--font-body)`, `img{max-width:100%}`, container class `.wrap{max-width:1100px;margin-inline:auto;padding-inline:calc(var(--space)*3)}`. Import tokens at top: `@import './tokens.css';`.

- [ ] **Step 3: Placeholder logo** — `src/assets/brand/logo.svg`: a simple text-mark SVG reading "YOSW 2026" using `currentColor` (so it re-themes). Real logo replaces this file later.

- [ ] **Step 4: Base layout** — `src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';
interface Props { lang: 'es' | 'en'; title: string; }
const { lang, title } = Astro.props;
---
<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body><slot /></body>
</html>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add design tokens, global styles, and base layout"
```

---

### Task 3: i18n dictionaries + helper + key-parity test

**Files:**
- Create: `src/i18n/es.json`, `src/i18n/en.json`, `src/i18n/index.ts`
- Test: `src/i18n/i18n.test.ts`

**Interfaces:**
- Produces: `t(lang, key)` returning a string; `getStaticPaths`-friendly `LOCALES = ['es','en'] as const`. Dictionary keys are flat dotted strings (e.g. `nav.about`, `hero.cta`).

- [ ] **Step 1: Write the failing parity test** — `src/i18n/i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import es from './es.json';
import en from './en.json';
import { t } from './index';

const keys = (o: Record<string, unknown>) => Object.keys(o).sort();

describe('i18n dictionaries', () => {
  it('have identical key sets', () => {
    expect(keys(es)).toEqual(keys(en));
  });
  it('t() returns the right string', () => {
    expect(t('es', 'nav.about')).toBe((es as Record<string,string>)['nav.about']);
    expect(t('en', 'nav.about')).toBe((en as Record<string,string>)['nav.about']);
  });
  it('t() falls back to the key when missing', () => {
    expect(t('es', 'does.not.exist')).toBe('does.not.exist');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/i18n/i18n.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Create dictionaries** — `src/i18n/es.json` and `src/i18n/en.json` with the SAME flat keys. Minimum set:

```json
{
  "nav.about": "Acerca de", "nav.ejes": "Ejes", "nav.programa": "Programa",
  "nav.datos": "Datos", "nav.participantes": "Participantes",
  "nav.registro": "Registro", "nav.sponsors": "Patrocinadores",
  "hero.dates": "19–24 de octubre de 2026", "hero.venue": "Yachay Tech · Urcuquí, Ecuador",
  "hero.cta": "Registrarse", "countdown.days": "días", "countdown.hours": "horas",
  "countdown.min": "min", "countdown.sec": "seg",
  "stats.soon": "Próximamente"
}
```
(en.json mirrors every key in English: `"nav.about": "About"`, `"hero.dates": "October 19–24, 2026"`, `"stats.soon": "Coming soon"`, etc.)

- [ ] **Step 4: Implement helper** — `src/i18n/index.ts`:

```ts
import es from './es.json';
import en from './en.json';

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
const dicts: Record<Locale, Record<string, string>> = { es, en };

export function t(lang: Locale, key: string): string {
  return dicts[lang]?.[key] ?? key;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/i18n/i18n.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add bilingual i18n dictionaries with key-parity test"
```

---

### Task 4: Data files, Zod schemas, validation test (+ date reconciliation)

**Files:**
- Create: `src/data/calendario.json`, `src/data/ejes.json`, `src/data/participants.json`, `src/data/sponsors.json`, `src/data/config.json`, `src/data/schemas.ts`
- Test: `src/data/data.test.ts`
- Modify: `CLAUDE.md` (dates → October)

**Interfaces:**
- Produces: exported Zod schemas `CalendarioSchema`, `EjesSchema`, `ParticipantsSchema`, `SponsorsSchema`, `ConfigSchema` and inferred types `Evento`, `Dia`, `Eje`, `Participant`, `Sponsor`, `Config`. Translatable fields typed as `{ es: string; en: string }`.

- [ ] **Step 1: Create `calendario.json`** — copy `calendario_yosw.json`, shift dates to Oct 19–24 2026 keeping weekday→activity mapping (Mon 2026-10-19 … Sat 2026-10-24; drop the empty Sunday). Convert each event `titulo` to `{ "es": "...", "en": "..." }`. Keep `leyenda_categorias`, `hora_inicio`, `hora_fin`, `categoria`, `nota`, `subeventos`.

- [ ] **Step 2: Create `ejes.json`** — the 5 axes:

```json
[
  {"id":1,"nombre":{"es":"IA, Ciencia de Datos y HPC","en":"AI, Data Science & HPC"},"descripcion":{"es":"","en":""},"color":"var(--color-eje-1)"},
  {"id":2,"nombre":{"es":"Salud Digital, Bioingeniería e Interoperabilidad Clínica","en":"Digital Health, Bioengineering & Clinical Interoperability"},"descripcion":{"es":"","en":""},"color":"var(--color-eje-2)"},
  {"id":3,"nombre":{"es":"Sostenibilidad, Producción y Territorio Inteligente","en":"Sustainability, Production & Smart Territory"},"descripcion":{"es":"","en":""},"color":"var(--color-eje-3)"},
  {"id":4,"nombre":{"es":"Sociedad Digital: Gobierno, Educación e Identidad","en":"Digital Society: Government, Education & Identity"},"descripcion":{"es":"","en":""},"color":"var(--color-eje-4)"},
  {"id":5,"nombre":{"es":"Ciencias Fundamentales y Computación Teórica","en":"Fundamental Sciences & Theoretical Computing"},"descripcion":{"es":"","en":""},"color":"var(--color-eje-5)"}
]
```

- [ ] **Step 3: Create empty-but-valid `participants.json` and `sponsors.json`** — start as `[]`.

- [ ] **Step 4: Create `config.json`**:

```json
{
  "eventStart": "2026-10-19T09:00:00-05:00",
  "venue": {"es":"Yachay Tech · Urcuquí, Ecuador","en":"Yachay Tech · Urcuquí, Ecuador"},
  "forms": {"attend": "", "poster": "", "ideaton": ""},
  "liveStatsSheetUrl": "",
  "social": {"instagram": "", "email": ""}
}
```

- [ ] **Step 5: Write the failing validation test** — `src/data/data.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import calendario from './calendario.json';
import ejes from './ejes.json';
import config from './config.json';
import { CalendarioSchema, EjesSchema, ConfigSchema } from './schemas';

describe('data files', () => {
  it('calendario matches schema', () => {
    expect(() => CalendarioSchema.parse(calendario)).not.toThrow();
  });
  it('every event categoria is a legend key', () => {
    const parsed = CalendarioSchema.parse(calendario);
    const legend = Object.keys(parsed.leyenda_categorias);
    for (const dia of parsed.dias)
      for (const ev of dia.eventos)
        expect(legend).toContain(ev.categoria);
  });
  it('ejes and config match schemas', () => {
    expect(() => EjesSchema.parse(ejes)).not.toThrow();
    expect(() => ConfigSchema.parse(config)).not.toThrow();
  });
  it('dates are the October range', () => {
    const parsed = CalendarioSchema.parse(calendario);
    expect(parsed.dias[0].fecha).toBe('2026-10-19');
    expect(parsed.dias.at(-1)!.fecha).toBe('2026-10-24');
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run src/data/data.test.ts`
Expected: FAIL (schemas.ts missing).

- [ ] **Step 7: Implement `schemas.ts`**:

```ts
import { z } from 'zod';

const I18nStr = z.object({ es: z.string(), en: z.string() });

const Evento = z.object({
  titulo: I18nStr,
  hora_inicio: z.string(),
  hora_fin: z.string().nullable().optional(),
  categoria: z.string(),
  nota: z.string().optional(),
  subeventos: z.array(z.object({ titulo: z.string(), hora: z.string() })).optional(),
});
const Dia = z.object({
  fecha: z.string(), dia_semana: z.string(), eventos: z.array(Evento),
});
export const CalendarioSchema = z.object({
  evento: z.string(),
  leyenda_categorias: z.record(z.string(), z.string()),
  dias: z.array(Dia),
});
export const EjesSchema = z.array(z.object({
  id: z.number(), nombre: I18nStr, descripcion: I18nStr, color: z.string(),
}));
export const ParticipantsSchema = z.array(z.object({
  id: z.string(), nombre: z.string(), rol: z.string(), eje: z.number().nullable().optional(),
  foto: z.string().optional(), enlace: z.string().optional(), bio: I18nStr.optional(),
}));
export const SponsorsSchema = z.array(z.object({
  id: z.string(), nombre: z.string(),
  nivel: z.enum(['principal', 'colaborador', 'institucional']),
  logo: z.string().optional(), enlace: z.string().optional(),
}));
export const ConfigSchema = z.object({
  eventStart: z.string(),
  venue: I18nStr,
  forms: z.object({ attend: z.string(), poster: z.string(), ideaton: z.string() }),
  liveStatsSheetUrl: z.string(),
  social: z.object({ instagram: z.string(), email: z.string() }),
});

export type Evento = z.infer<typeof Evento>;
export type Dia = z.infer<typeof Dia>;
export type Eje = z.infer<typeof EjesSchema>[number];
export type Participant = z.infer<typeof ParticipantsSchema>[number];
export type Sponsor = z.infer<typeof SponsorsSchema>[number];
export type Config = z.infer<typeof ConfigSchema>;
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run src/data/data.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 9: Reconcile CLAUDE.md** — update the "known data discrepancy" section to record that **19–24 October 2026** is authoritative and `src/data/calendario.json` now reflects it (the root `calendario_yosw.json` and the docx remain historical).

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: add validated data model, October dates, and reconcile CLAUDE.md"
```

---

### Task 5: Layout shell — nav, hero, countdown island

**Files:**
- Create: `src/components/Nav.astro`, `src/components/Hero.astro`, `src/components/Countdown.ts`, `src/components/Countdown.astro`
- Test: `src/components/countdown.test.ts`
- Modify: `src/layouts/Base.astro` (add `<Nav>` slot area)

**Interfaces:**
- Consumes: `t`, `Locale` from `src/i18n`; `config.json`.
- Produces: `breakdown(msRemaining: number): { d:number; h:number; m:number; s:number }` (clamps negatives to 0); `<Hero lang>` and `<Nav lang>` components.

- [ ] **Step 1: Write failing countdown-math test** — `src/components/countdown.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { breakdown } from './Countdown';

describe('breakdown', () => {
  it('splits ms into d/h/m/s', () => {
    const ms = (((2 * 24) + 3) * 60 + 4) * 60 * 1000 + 5000;
    expect(breakdown(ms)).toEqual({ d: 2, h: 3, m: 4, s: 5 });
  });
  it('clamps negatives to zero', () => {
    expect(breakdown(-1000)).toEqual({ d: 0, h: 0, m: 0, s: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/countdown.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `Countdown.ts`**:

```ts
export function breakdown(ms: number) {
  const clamped = Math.max(0, ms);
  const s = Math.floor(clamped / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/countdown.test.ts`
Expected: PASS.

- [ ] **Step 5: `Countdown.astro`** — a client island: renders 4 number slots with labels from `t`, `<script>` recomputes `breakdown(target - Date.now())` every second (`target` from `config.eventStart`, passed via `data-target` attribute). Labels via props.

- [ ] **Step 6: `Nav.astro`** — sticky top bar: logo (`src/assets/brand/logo.svg`), anchor links using `t('nav.*')`, and a `LangToggle` placeholder link switching `/es`↔`/en` for the current path. Uses `--color-surface`.

- [ ] **Step 7: `Hero.astro`** — full-width hero: title "Yachay Open Science Week 2026", `t('hero.dates')`, `t('hero.venue')`, `<Countdown>`, primary CTA button linking to `#registro`.

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: add nav, hero, and countdown island"
```

---

### Task 6: Localized pages + About + Ejes sections + LangToggle

**Files:**
- Create: `src/pages/[lang]/index.astro`, `src/components/About.astro`, `src/components/EjesSection.astro`, `src/components/LangToggle.astro`
- Delete: `src/pages/index.astro` (replaced by localized route)
- Add root redirect: `src/pages/index.astro` → redirects to `/es/`

**Interfaces:**
- Consumes: `LOCALES`, `t`; `ejes.json`; `Base.astro`, `Nav`, `Hero`.
- Produces: routes `/es/` and `/en/` via `getStaticPaths` over `LOCALES`.

- [ ] **Step 1: Localized index** — `src/pages/[lang]/index.astro`:

```astro
---
import { LOCALES, type Locale, t } from '../../i18n';
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import Hero from '../../components/Hero.astro';
import About from '../../components/About.astro';
import EjesSection from '../../components/EjesSection.astro';
export function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}
const lang = Astro.params.lang as Locale;
---
<Base lang={lang} title="Yachay Open Science Week 2026">
  <Nav lang={lang} />
  <Hero lang={lang} />
  <About lang={lang} />
  <EjesSection lang={lang} />
</Base>
```

- [ ] **Step 2: Root redirect** — `src/pages/index.astro`:

```astro
---
return Astro.redirect('/es/');
---
```

- [ ] **Step 3: `About.astro`** — section `#about`: heading `t('nav.about')`, an intro paragraph (add keys `about.intro`, `about.objective` to both dictionaries), and a row of stat tiles (5 ejes, 6 días, 40+ actividades — add keys).

- [ ] **Step 4: `EjesSection.astro`** — section `#ejes`: import `ejes.json`, render 5 cards; each card border/accent uses the eje `color`, title `eje.nombre[lang]`.

- [ ] **Step 5: `LangToggle.astro`** — renders a link to the sibling locale: given `Astro.url.pathname`, swap leading `/es` ↔ `/en`. Wire it into `Nav.astro`.

- [ ] **Step 6: Verify build + routes**

Run: `npm run build`
Expected: `dist/es/index.html` and `dist/en/index.html` both exist.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add localized pages, about, ejes, and language toggle"
```

---

### Task 7: Program timeline island

**Files:**
- Create: `src/components/timeline/transform.ts`, `src/components/timeline/ProgramTimeline.astro`
- Test: `src/components/timeline/transform.test.ts`

**Interfaces:**
- Consumes: `calendario.json`, `CalendarioSchema`, `Locale`.
- Produces: `toTimeline(data, lang): TimelineDay[]` where `TimelineDay = { fecha; dia_semana; events: { titulo; start; end; categoria; color; nota? }[] }`. `color` resolves to `var(--cat-<categoria>)`.

- [ ] **Step 1: Write failing transform test** — `src/components/timeline/transform.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import calendario from '../../data/calendario.json';
import { toTimeline } from './transform';

describe('toTimeline', () => {
  const days = toTimeline(calendario as any, 'es');
  it('returns 6 days', () => { expect(days).toHaveLength(6); });
  it('maps category to a css var', () => {
    const ev = days[0].events[0];
    expect(ev.color).toBe(`var(--cat-${ev.categoria})`);
  });
  it('uses the requested language title', () => {
    expect(typeof days[0].events[0].titulo).toBe('string');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/timeline/transform.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `transform.ts`**:

```ts
import { CalendarioSchema, type Dia } from '../../data/schemas';
import type { Locale } from '../../i18n';

export interface TimelineEvent {
  titulo: string; start: string; end: string | null;
  categoria: string; color: string; nota?: string;
}
export interface TimelineDay {
  fecha: string; dia_semana: string; events: TimelineEvent[];
}

export function toTimeline(raw: unknown, lang: Locale): TimelineDay[] {
  const data = CalendarioSchema.parse(raw);
  return data.dias.map((dia: Dia) => ({
    fecha: dia.fecha,
    dia_semana: dia.dia_semana,
    events: dia.eventos.map((ev) => ({
      titulo: ev.titulo[lang],
      start: ev.hora_inicio,
      end: ev.hora_fin ?? null,
      categoria: ev.categoria,
      color: `var(--cat-${ev.categoria})`,
      nota: ev.nota,
    })),
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/timeline/transform.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: `ProgramTimeline.astro`** — section `#programa`: build `toTimeline(calendario, lang)`; render a horizontally-scrollable 6-column grid (one per day), each event a card colored by `event.color`, showing time + title, and a `⚠` marker when `nota` is present. Render a legend from `leyenda_categorias`. Add a client `<script>` filter: buttons per category toggle `hidden` on non-matching cards. Wrap grid in `overflow-x:auto` container (mobile: no page horizontal scroll). Wire into `[lang]/index.astro`.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: no errors; grep `dist/es/index.html` for a known event title.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add interactive program timeline"
```

---

### Task 8: Data dashboard — axes chart + live stats islands

**Files:**
- Create: `src/components/data/axes.ts`, `src/components/data/DataSection.astro`, `src/components/data/LiveStats.astro`, `src/components/data/liveStats.ts`
- Test: `src/components/data/axes.test.ts`, `src/components/data/liveStats.test.ts`

**Interfaces:**
- Consumes: `calendario.json`, `config.json`.
- Produces: `countByCategory(data): Record<string, number>`; `parseSheetRows(json): Record<string, number>` (tolerant: returns `{}` on malformed/empty input).

- [ ] **Step 1: Write failing axes test** — `src/components/data/axes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import calendario from '../../data/calendario.json';
import { countByCategory } from './axes';

describe('countByCategory', () => {
  const counts = countByCategory(calendario as any);
  it('counts every event once', () => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const raw = (calendario as any).dias.flatMap((d: any) => d.eventos).length;
    expect(total).toBe(raw);
  });
  it('only uses legend keys', () => {
    const legend = Object.keys((calendario as any).leyenda_categorias);
    for (const k of Object.keys(counts)) expect(legend).toContain(k);
  });
});
```

- [ ] **Step 2: Run to verify fail; implement `axes.ts`:**

```ts
import { CalendarioSchema } from '../../data/schemas';
export function countByCategory(raw: unknown): Record<string, number> {
  const data = CalendarioSchema.parse(raw);
  const out: Record<string, number> = {};
  for (const dia of data.dias)
    for (const ev of dia.eventos)
      out[ev.categoria] = (out[ev.categoria] ?? 0) + 1;
  return out;
}
```
Run: `npx vitest run src/components/data/axes.test.ts` → PASS.

- [ ] **Step 3: Write failing live-stats parser test** — `src/components/data/liveStats.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseSheetRows } from './liveStats';

describe('parseSheetRows', () => {
  it('sums registrations by metric', () => {
    const input = [{ metric: 'attendees', value: '3' }, { metric: 'attendees', value: '2' }, { metric: 'posters', value: '1' }];
    expect(parseSheetRows(input)).toEqual({ attendees: 5, posters: 1 });
  });
  it('returns {} for malformed input', () => {
    expect(parseSheetRows(null)).toEqual({});
    expect(parseSheetRows('nope' as any)).toEqual({});
  });
});
```

- [ ] **Step 4: Run to verify fail; implement `liveStats.ts`:**

```ts
export function parseSheetRows(rows: unknown): Record<string, number> {
  if (!Array.isArray(rows)) return {};
  const out: Record<string, number> = {};
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue;
    const metric = (r as any).metric;
    const value = Number((r as any).value);
    if (typeof metric !== 'string' || Number.isNaN(value)) continue;
    out[metric] = (out[metric] ?? 0) + value;
  }
  return out;
}
```
Run: `npx vitest run src/components/data/liveStats.test.ts` → PASS.

- [ ] **Step 5: `DataSection.astro`** — section `#datos`: render `countByCategory` as horizontal bars (width % of max, colored by `var(--cat-key)`) — pure CSS/SVG, no chart lib. Include `<LiveStats>`.

- [ ] **Step 6: `LiveStats.astro`** — 4 counter tiles (attendees / posters / ideatón teams / participants). Client `<script>`: if `config.liveStatsSheetUrl` is empty, show `t('stats.soon')`; else `fetch` it, run `parseSheetRows`, animate counts. On fetch error, fall back to `t('stats.soon')`. Wire `DataSection` into `[lang]/index.astro`.

- [ ] **Step 7: Verify build + test**

Run: `npm run build && npx vitest run src/components/data`
Expected: build OK; tests PASS.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add data dashboard with axes chart and live stats"
```

---

### Task 9: Participants directory (section + sub-page + filter)

**Files:**
- Create: `src/components/participants/filter.ts`, `src/components/participants/ParticipantCard.astro`, `src/components/participants/ParticipantsPreview.astro`, `src/pages/[lang]/participantes.astro`
- Test: `src/components/participants/filter.test.ts`

**Interfaces:**
- Consumes: `participants.json`, `ejes.json`, `Locale`.
- Produces: `filterParticipants(list, { eje?, rol?, query? }): Participant[]`.

- [ ] **Step 1: Write failing filter test** — `src/components/participants/filter.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { filterParticipants } from './filter';
import type { Participant } from '../../data/schemas';

const list: Participant[] = [
  { id: 'a', nombre: 'Ana', rol: 'speaker', eje: 1 },
  { id: 'b', nombre: 'Beto', rol: 'poster', eje: 2 },
  { id: 'c', nombre: 'Ana Lucía', rol: 'poster', eje: 1 },
];

describe('filterParticipants', () => {
  it('filters by eje', () => {
    expect(filterParticipants(list, { eje: 1 }).map(p => p.id)).toEqual(['a', 'c']);
  });
  it('filters by rol', () => {
    expect(filterParticipants(list, { rol: 'poster' }).map(p => p.id)).toEqual(['b', 'c']);
  });
  it('searches name case-insensitively', () => {
    expect(filterParticipants(list, { query: 'ana' }).map(p => p.id)).toEqual(['a', 'c']);
  });
  it('returns all with no criteria', () => {
    expect(filterParticipants(list, {})).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run to verify fail; implement `filter.ts`:**

```ts
import type { Participant } from '../../data/schemas';
export interface FilterCriteria { eje?: number; rol?: string; query?: string; }
export function filterParticipants(list: Participant[], c: FilterCriteria): Participant[] {
  const q = c.query?.trim().toLowerCase();
  return list.filter((p) =>
    (c.eje == null || p.eje === c.eje) &&
    (c.rol == null || p.rol === c.rol) &&
    (!q || p.nombre.toLowerCase().includes(q))
  );
}
```
Run: `npx vitest run src/components/participants/filter.test.ts` → PASS.

- [ ] **Step 3: `ParticipantCard.astro`** — photo (or initials placeholder), name, rol badge, eje tag, optional link.

- [ ] **Step 4: `ParticipantsPreview.astro`** — section `#participantes` on the home page: show first 8 from `participants.json`, or a `t('stats.soon')` empty-state when the list is empty, plus a "ver todos" link to `/[lang]/participantes`.

- [ ] **Step 5: `[lang]/participantes.astro`** — full page (`getStaticPaths` over `LOCALES`): renders `Base` + `Nav`, all participants, and a client `<script>` wiring search box + eje/rol `<select>`s to `filterParticipants`, toggling card visibility. Empty-state when list is empty.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: `dist/es/participantes/index.html` and `dist/en/participantes/index.html` exist.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add participants directory with filtering"
```

---

### Task 10: Registration, sponsors, footer

**Files:**
- Create: `src/components/Registration.astro`, `src/components/Sponsors.astro`, `src/components/Footer.astro`
- Add asset: `public/propuesta-yosw-2026.pdf` (placeholder note if not yet exported)
- Modify: `src/pages/[lang]/index.astro` (add the three sections)

**Interfaces:**
- Consumes: `config.json` (`forms`, `social`), `sponsors.json`, `t`.

- [ ] **Step 1: `Registration.astro`** — section `#registro`: three cards (attend / poster / ideatón). Each links to `config.forms.<key>`; if empty, render a disabled button with `t('stats.soon')`. Add dictionary keys `reg.attend`, `reg.poster`, `reg.ideaton`, `reg.attend.desc`, etc. (both languages).

- [ ] **Step 2: `Sponsors.astro`** — section `#sponsors`: three tier groups (principal / colaborador / institucional) from `sponsors.json`; when empty, show tier headings with placeholder logo boxes and a `t('sponsors.cta')` contact line (mailto `config.social.email`). Include a "descargar propuesta (PDF)" link to `/propuesta-yosw-2026.pdf`.

- [ ] **Step 3: `Footer.astro`** — organizing committee note, contact email, Instagram link from `config.social`, copyright.

- [ ] **Step 4: Wire all three into `[lang]/index.astro`** after `ParticipantsPreview`.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: no errors; `#registro`, `#sponsors` anchors present in `dist/es/index.html`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add registration, sponsors, and footer sections"
```

---

### Task 11: Netlify config, README, and full-site verification

**Files:**
- Create: `netlify.toml`, `README.md`
- Modify: `CLAUDE.md` (add build/run/test commands + data-editing guide)

- [ ] **Step 1: `netlify.toml`**:

```toml
[build]
  command = "npm run build"
  publish = "dist"
[[redirects]]
  from = "/"
  to = "/es/"
  status = 302
```

- [ ] **Step 2: `README.md`** — how to run (`npm install`, `npm run dev`, `npm run build`, `npm test`), where content lives (`src/data/*.json`, `src/i18n/*.json`), how to add participants/sponsors, how to wire Google Form URLs + the live-stats sheet in `config.json`, and how to swap the brand kit (edit `tokens.css`, replace `src/assets/brand/logo.svg`).

- [ ] **Step 3: Update `CLAUDE.md`** — add the dev/build/test commands and a short "editing content" section pointing at `src/data/` and `src/i18n/`.

- [ ] **Step 4: Full build + test**

Run: `npm run build && npm test`
Expected: build succeeds; all vitest suites PASS.

- [ ] **Step 5: Browser verification (use the `run`/`verify` skills)** — `npm run dev`, then open `http://localhost:4321/es/`:
  - Countdown ticks down.
  - Language toggle `/es`↔`/en` preserves the section/path.
  - Timeline shows 6 days with colored events + working category filter.
  - Axes bars render; LiveStats shows "próximamente".
  - `/es/participantes` empty-state renders; filters present.
  - No horizontal page scroll at 375px width.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: add Netlify config, README, and dev docs; verify full site"
```

---

## Self-Review Notes

- **Spec coverage:** Purpose 1–6 → Tasks 5–10; stack/i18n/theming → Tasks 1–3; data model → Task 4; timeline → 7; data viz → 8; participants → 9; registration/sponsors → 10; hosting/verification/reconciliation → 4 (dates) + 11. All spec sections mapped.
- **Placeholder scan:** empty `participants.json`/`sponsors.json` and blank `config.json` form URLs are intentional runtime placeholders (Phase 2 fills them), not plan gaps — every task ships working code + tests.
- **Type consistency:** `Locale`, `t`, `CalendarioSchema`, `toTimeline`, `countByCategory`, `parseSheetRows`, `filterParticipants`, `breakdown` names/signatures are consistent across the tasks that consume them.
