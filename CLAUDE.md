# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is **not a software project** — it is a content/planning repository for **Yachay Open Science Week (YOSW) 2026**, an interdisciplinary academic-scientific congress at Yachay Tech (Urcuquí, Ecuador). There is no build, test, or lint tooling. Work here means editing planning content, not code.

Primary language of the content is **Spanish**. Preserve Spanish when editing existing content unless asked otherwise.

## Files

- `Propuesta_OSW_v3.docx` — the master proposal document (v3.0). Binary Word file: read its text via `unzip -p Propuesta_OSW_v3.docx word/document.xml`. Contains background, objectives, organizational committees, thematic axes (ejes), the activity program, the day-by-day schedule, academic-flexibility requests, and sponsorship strategy.
- `calendario_yosw.json` — a structured, machine-readable version of the week's schedule (`dias[].eventos[]`), with a `leyenda_categorias` mapping event categories to hex colors. Some events carry a `nota` field flagging data that was uncertain or cut off in the original source image ("verificar").

## Working with the calendar JSON

- Every event has `categoria` that must be one of the keys in `leyenda_categorias`. Keep them in sync when adding categories or events.
- `hora_fin: null` and `nota` fields mark unconfirmed data — do not silently "clean up" these; they are intentional flags.
- Times are 24-hour `"HH:MM"` strings; dates are `YYYY-MM-DD`.

## IMPORTANT: known data discrepancy

The two files disagree on the event dates and must be reconciled before either is treated as final:

- `Propuesta_OSW_v3.docx` states **23–28 November 2026** (and internally references activities as if that week).
- `calendario_yosw.json` uses **22–28 August 2026**.

The day-of-week → activity structure is otherwise parallel between them. When editing either file, confirm which date range is authoritative rather than assuming, and flag the mismatch if it is still unresolved.

## Domain glossary (from the proposal)

- **Ejes temáticos** — the 5 thematic tracks (AI/Data Science/HPC; Salud Digital/Bioingeniería; Sostenibilidad/Territorio Inteligente; Sociedad Digital; Ciencias Fundamentales).
- **Ideatón** — multi-day interdisciplinary innovation competition with nightly mentorship sessions (Mentorías Ideatón).
- **Comité Organizador / Comité Científico** — the logistics committee and the proposal-review/scientific committee, respectively.
- **Flexibilidad académica** — the request to relax the class schedule only on the two busiest days (not a full week suspension).
