import { describe, it, expect } from 'vitest';
import calendario from '../data/calendario.json';
import { countByCategory } from './axes';

describe('countByCategory', () => {
  const counts = countByCategory(calendario);
  it('counts every event once', () => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const raw = calendario.dias.flatMap((d) => d.eventos).length;
    expect(total).toBe(raw);
  });
  it('only uses legend keys', () => {
    const legend = Object.keys(calendario.leyenda_categorias);
    for (const k of Object.keys(counts)) expect(legend).toContain(k);
  });
});
