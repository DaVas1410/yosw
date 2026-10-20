import { describe, it, expect } from 'vitest';
import { breakdown, eventPhase, eventDay } from './countdown';

describe('breakdown', () => {
  it('splits ms into d/h/m/s', () => {
    const ms = (((2 * 24) + 3) * 60 + 4) * 60 * 1000 + 5000;
    expect(breakdown(ms)).toEqual({ d: 2, h: 3, m: 4, s: 5 });
  });
  it('clamps negatives to zero', () => {
    expect(breakdown(-1000)).toEqual({ d: 0, h: 0, m: 0, s: 0 });
  });
});

describe('eventPhase', () => {
  const start = Date.parse('2026-10-19T09:00:00-05:00');
  const end = Date.parse('2026-10-24T12:00:00-05:00');
  it('is before until the opening', () => {
    expect(eventPhase(start - 1, start, end)).toBe('before');
  });
  it('is live from the opening until the closing', () => {
    expect(eventPhase(start, start, end)).toBe('live');
    expect(eventPhase(end - 1, start, end)).toBe('live');
  });
  it('is after once the closing passes', () => {
    expect(eventPhase(end, start, end)).toBe('after');
  });
});

describe('eventDay', () => {
  const start = Date.parse('2026-10-19T09:00:00-05:00');
  it('counts days in Ecuador local time', () => {
    expect(eventDay(start, start)).toBe(1);
    expect(eventDay(Date.parse('2026-10-19T23:59:00-05:00'), start)).toBe(1);
    expect(eventDay(Date.parse('2026-10-20T00:00:00-05:00'), start)).toBe(2);
    expect(eventDay(Date.parse('2026-10-24T11:00:00-05:00'), start)).toBe(6);
  });
});
