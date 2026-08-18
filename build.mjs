// Static-site build script: reads JSON data + i18n dictionaries, validates
// data against the Zod schemas in src/data/schemas.ts, renders the home and
// participantes pages for each locale, and copies static assets into dist/.
//
// Usage: node build.mjs

import { readFileSync, mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  CalendarioSchema,
  EjesSchema,
  ParticipantsSchema,
  SponsorsSchema,
  ConfigSchema,
} from './src/data/schemas.ts';
import { renderHomePage } from './src/render/pages/home.js';
import { renderParticipantesPage } from './src/render/pages/participantes.js';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(rootDir, 'dist');

function readJson(relPath) {
  return JSON.parse(readFileSync(path.join(rootDir, relPath), 'utf-8'));
}

// --- Load + validate data -------------------------------------------------

const calendario = CalendarioSchema.parse(readJson('src/data/calendario.json'));
const ejes = EjesSchema.parse(readJson('src/data/ejes.json'));
const participants = ParticipantsSchema.parse(readJson('src/data/participants.json'));
const sponsors = SponsorsSchema.parse(readJson('src/data/sponsors.json'));
const config = ConfigSchema.parse(readJson('src/data/config.json'));

const data = { calendario, ejes, participants, sponsors, config };

// --- Render pages ----------------------------------------------------------

rmSync(distDir, { recursive: true, force: true });

for (const lang of ['es', 'en']) {
  const langDir = path.join(distDir, lang);
  mkdirSync(langDir, { recursive: true });

  const homeHtml = renderHomePage({ lang, data });
  writeFileSync(path.join(langDir, 'index.html'), homeHtml, 'utf-8');

  const participantesHtml = renderParticipantesPage({ lang, data });
  writeFileSync(path.join(langDir, 'participantes.html'), participantesHtml, 'utf-8');
}

// --- Copy static assets -----------------------------------------------------

function copyDir(srcRel, destRel) {
  const srcAbs = path.join(rootDir, srcRel);
  if (!existsSync(srcAbs)) return;
  const destAbs = path.join(distDir, destRel);
  mkdirSync(destAbs, { recursive: true });
  cpSync(srcAbs, destAbs, { recursive: true });
}

copyDir('src/styles', 'styles');
copyDir('src/assets', 'assets');
copyDir('src/client', 'client');
copyDir('src/lib', 'lib');

// Copy public/* directly into dist/ root (favicon, etc.)
const publicDir = path.join(rootDir, 'public');
if (existsSync(publicDir)) {
  cpSync(publicDir, distDir, { recursive: true });
}

console.log('Build complete: dist/');
