import es from './es.json';
import en from './en.json';

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
const dicts: Record<Locale, Record<string, string>> = { es, en };

export function t(lang: Locale, key: string): string {
  return dicts[lang]?.[key] ?? key;
}
