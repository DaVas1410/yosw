import { describe, it, expect } from 'vitest';
import { breakdown } from './countdown';

describe('breakdown', () => {
  it('splits ms into d/h/m/s', () => {
    const ms = (((2 * 24) + 3) * 60 + 4) * 60 * 1000 + 5000;
    expect(breakdown(ms)).toEqual({ d: 2, h: 3, m: 4, s: 5 });
  });
  it('clamps negatives to zero', () => {
    expect(breakdown(-1000)).toEqual({ d: 0, h: 0, m: 0, s: 0 });
  });
});
