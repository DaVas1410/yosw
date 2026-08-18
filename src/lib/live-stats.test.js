import { describe, it, expect } from 'vitest';
import { parseSheetRows } from './live-stats';

describe('parseSheetRows', () => {
  it('sums registrations by metric', () => {
    const input = [{ metric: 'attendees', value: '3' }, { metric: 'attendees', value: '2' }, { metric: 'posters', value: '1' }];
    expect(parseSheetRows(input)).toEqual({ attendees: 5, posters: 1 });
  });
  it('returns {} for malformed input', () => {
    expect(parseSheetRows(null)).toEqual({});
    expect(parseSheetRows('nope')).toEqual({});
  });
});
