import { describe, it, expect } from 'vitest';
import { removeBackground } from './logo-bg.js';

// w×h RGBA image filled with `bg`, with a `fg` square in the middle.
function img(w, h, bg, fg, box) {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const inside = x >= box[0] && x < box[2] && y >= box[1] && y < box[3];
      d.set([...(inside ? fg : bg), 255], (y * w + x) * 4);
    }
  return d;
}
const alpha = (d, w, x, y) => d[(y * w + x) * 4 + 3];

describe('removeBackground', () => {
  it('clears a flat white background and keeps the logo', () => {
    const d = img(20, 20, [255, 255, 255], [200, 0, 0], [5, 5, 15, 15]);
    expect(removeBackground(d, 20, 20).changed).toBe(true);
    expect(alpha(d, 20, 0, 0)).toBe(0);
    expect(alpha(d, 20, 10, 10)).toBe(255);
  });

  it('keeps white enclosed inside the logo', () => {
    const d = img(20, 20, [255, 255, 255], [0, 0, 0], [4, 4, 16, 16]);
    for (let y = 8; y < 12; y++) for (let x = 8; x < 12; x++) d.set([255, 255, 255, 255], (y * 20 + x) * 4);
    removeBackground(d, 20, 20);
    expect(alpha(d, 20, 10, 10)).toBe(255);
  });

  it('leaves already-transparent images untouched', () => {
    const d = new Uint8ClampedArray(10 * 10 * 4);
    expect(removeBackground(d, 10, 10)).toEqual({ changed: false, reason: 'already-transparent' });
  });

  it('skips images whose border is not one flat colour', () => {
    const d = new Uint8ClampedArray(10 * 10 * 4);
    for (let i = 0; i < 100; i++) d.set([(i * 97) % 256, (i * 31) % 256, (i * 57) % 256, 255], i * 4);
    expect(removeBackground(d, 10, 10).changed).toBe(false);
  });
});
