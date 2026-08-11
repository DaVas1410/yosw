import { describe, expect, it } from 'vitest';
import { computeScrollProgress, rotationForProgress } from './heroTower';

describe('computeScrollProgress', () => {
  it('returns 0 when the hero top is at the viewport top', () => {
    expect(computeScrollProgress(0, 800, 800)).toBe(0);
  });

  it('returns 1 when the hero has scrolled fully past one viewport height', () => {
    expect(computeScrollProgress(-800, 800, 800)).toBe(1);
  });

  it('returns a midpoint value for a half-scrolled hero', () => {
    expect(computeScrollProgress(-400, 800, 800)).toBe(0.5);
  });

  it('clamps below 0 when the hero has not reached the top yet', () => {
    expect(computeScrollProgress(200, 800, 800)).toBe(0);
  });

  it('clamps above 1 when scrolled well past the hero', () => {
    expect(computeScrollProgress(-2000, 800, 800)).toBe(1);
  });
});

describe('rotationForProgress', () => {
  it('maps progress 0 to rotation 0', () => {
    expect(rotationForProgress(0)).toBe(0);
  });

  it('maps progress 1 to a positive rotation of roughly a fifth turn', () => {
    expect(rotationForProgress(1)).toBeCloseTo(Math.PI * 0.6, 5);
  });

  it('is linear at the midpoint', () => {
    expect(rotationForProgress(0.5)).toBeCloseTo(Math.PI * 0.3, 5);
  });
});
