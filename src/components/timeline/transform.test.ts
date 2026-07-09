import { describe, it, expect } from 'vitest';
import calendario from '../../data/calendario.json';
import { toTimeline } from './transform';

describe('toTimeline', () => {
  const days = toTimeline(calendario as any, 'es');
  it('returns 6 days', () => { expect(days).toHaveLength(6); });
  it('maps category to a css var', () => {
    const ev = days[0].events[0];
    expect(ev.color).toBe(`var(--cat-${ev.categoria})`);
  });
  it('uses the requested language title', () => {
    expect(typeof days[0].events[0].titulo).toBe('string');
  });
});
