import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ideathon from './ideathon.json';
import ejes from './ejes.json';
import calendario from './calendario.json';
import config from './config.json';
import { IdeathonSchema, EjesSchema, CalendarioSchema, ConfigSchema } from './schemas';

describe('ideathon.json', () => {
  const parsed = IdeathonSchema.parse(ideathon);

  it('has six retos with unique ids', () => {
    const ids = parsed.retos.map((r) => r.id);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every reto is fully bilingual', () => {
    for (const r of parsed.retos) {
      for (const f of [r.titulo, r.resumen, r.problema, r.porque, r.perfiles, ...r.entregables]) {
        expect(f.es.trim(), r.id).not.toBe('');
        expect(f.en.trim(), r.id).not.toBe('');
      }
    }
  });

  it('config links the ideathon sign-up form', () => {
    expect(ConfigSchema.parse(config).forms.ideathon).toMatch(/^https:\/\//);
  });
});

describe('eje logos', () => {
  const dir = fileURLToPath(new URL('../assets/ejes/', import.meta.url));
  it('every listed logo exists in src/assets/ejes/', () => {
    for (const e of EjesSchema.parse(ejes))
      for (const f of e.logos ?? [])
        expect(existsSync(dir + f), `missing logo for eje ${e.id}: ${f}`).toBe(true);
  });
});

describe('parallel talks', () => {
  const parsed = CalendarioSchema.parse(calendario);
  const ejeIds = EjesSchema.parse(ejes).map((e) => e.id);

  it('Wednesday has a block of simultaneous talks', () => {
    const wed = parsed.dias.find((d) => d.fecha === '2026-10-21')!;
    expect(wed.eventos.some((ev) => (ev.paralelas?.length ?? 0) >= 2)).toBe(true);
  });

  it('every track eje is a known axis', () => {
    for (const d of parsed.dias)
      for (const ev of d.eventos)
        for (const p of ev.paralelas ?? [])
          if (p.eje != null) expect(ejeIds).toContain(p.eje);
  });
});
