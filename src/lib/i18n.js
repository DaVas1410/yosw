import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const es = JSON.parse(readFileSync(fileURLToPath(new URL('../i18n/es.json', import.meta.url)), 'utf-8'));
const en = JSON.parse(readFileSync(fileURLToPath(new URL('../i18n/en.json', import.meta.url)), 'utf-8'));

export const LOCALES = ['es', 'en'];
const dicts = { es, en };

export function t(lang, key) {
  return dicts[lang]?.[key] ?? key;
}
