import es from '../i18n/es.json';
import en from '../i18n/en.json';

export const LOCALES = ['es', 'en'];
const dicts = { es, en };

export function t(lang, key) {
  return dicts[lang]?.[key] ?? key;
}
