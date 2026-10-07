import { describe, it, expect } from 'vitest';
import { marqueeRows } from './sponsors.js';

const mk = (n) => Array.from({ length: n }, (_, i) => ({ id: `s${i}`, nombre: `S${i}` }));

describe('marqueeRows', () => {
  it('returns no rows when there are no sponsors', () => {
    expect(marqueeRows([])).toEqual([]);
  });

  it('fills every row to at least 8 tiles', () => {
    for (const n of [1, 3, 5, 9, 20]) {
      for (const row of marqueeRows(mk(n))) expect(row.length).toBeGreaterThanOrEqual(8);
    }
  });

  it('shows every sponsor in each row when there are few', () => {
    const rows = marqueeRows(mk(5));
    expect(rows).toHaveLength(2);
    for (const row of rows) expect(new Set(row.map((s) => s.id)).size).toBe(5);
  });

  it('deals many sponsors across rows without losing any', () => {
    const rows = marqueeRows(mk(20));
    expect(rows).toHaveLength(3);
    const seen = new Set(rows.flat().map((s) => s.id));
    expect(seen.size).toBe(20);
  });
});
