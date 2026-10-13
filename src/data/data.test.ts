import { describe, it, expect } from 'vitest';
import calendario from './calendario.json';
import ejes from './ejes.json';
import config from './config.json';
import invitados from './invitados.json';
import { existsSync } from 'node:fs';
import { CalendarioSchema, EjesSchema, ConfigSchema, InvitadosSchema } from './schemas';

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
  it('invitados match schema, fall on a programme day and have their logo', () => {
    const parsed = InvitadosSchema.parse(invitados);
    const dias = CalendarioSchema.parse(calendario).dias.map((d) => d.fecha);
    for (const inv of parsed) {
      expect(dias).toContain(inv.fecha);
      expect(existsSync(new URL(`../assets/${inv.logo}`, import.meta.url))).toBe(true);
    }
  });
});
