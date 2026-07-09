import { describe, it, expect } from 'vitest';
import { parseMinutes, layoutDay, toCalendar, type CalEvent } from './calendar';
import calendario from '../../data/calendario.json';

const ev = (startMin: number, endMin: number): CalEvent => ({
  titulo: 't', categoria: 'charlas', color: '', start: '', end: null,
  startMin, endMin, col: 0, cols: 1,
});

describe('parseMinutes', () => {
  it('converts HH:MM to minutes', () => {
    expect(parseMinutes('09:00')).toBe(540);
    expect(parseMinutes('21:15')).toBe(1275);
  });
});

describe('layoutDay', () => {
  it('stacks non-overlapping events in a single column', () => {
    const events = [ev(540, 600), ev(600, 660)];
    layoutDay(events);
    expect(events.every((e) => e.cols === 1 && e.col === 0)).toBe(true);
  });
  it('places overlapping events in separate columns', () => {
    const events = [ev(540, 660), ev(600, 720)];
    layoutDay(events);
    expect(events[0].cols).toBe(2);
    expect(events[1].cols).toBe(2);
    expect(new Set(events.map((e) => e.col)).size).toBe(2);
  });
});

describe('toCalendar', () => {
  const cal = toCalendar(calendario, 'es');
  it('returns 6 days', () => {
    expect(cal.days).toHaveLength(6);
  });
  it('window is hour-aligned and covers the program', () => {
    expect(cal.startMin % 60).toBe(0);
    expect(cal.endMin % 60).toBe(0);
    expect(cal.startMin).toBeLessThanOrEqual(540); // 09:00
    expect(cal.endMin).toBeGreaterThanOrEqual(1275); // 21:15
  });
});
