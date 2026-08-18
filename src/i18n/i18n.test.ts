import { describe, it, expect } from 'vitest';
import es from './es.json';
import en from './en.json';
import { t } from '../lib/i18n';

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
