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
