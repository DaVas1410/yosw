// Build-time background removal for sponsor logos (pure function over raw
// RGBA pixels, no sharp dependency so it can be unit-tested directly).
//
// Most logos we receive are JPGs/PNGs on a flat white or light-grey box. The
// background colour is taken from the image border; every pixel connected to
// the border and close to that colour is made transparent (flood fill, so a
// white letter *inside* the logo survives). Pixels in a soft band around the
// threshold get partial alpha with the background colour "un-mixed" out of
// them, which keeps anti-aliased edges clean instead of leaving a halo.

const HARD = 28; // colour distance below which a pixel is pure background
const SOFT = 72; // distance at which a pixel is fully opaque logo

function dist(data, i, bg) {
  const dr = data[i] - bg[0];
  const dg = data[i + 1] - bg[1];
  const db = data[i + 2] - bg[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function borderIndices(width, height) {
  const out = [];
  for (let x = 0; x < width; x++) out.push(x, (height - 1) * width + x);
  for (let y = 1; y < height - 1; y++) out.push(y * width, y * width + width - 1);
  return out;
}

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/**
 * Makes the flat background of an RGBA image transparent, in place.
 * Returns { changed, reason } so callers can log what happened.
 */
export function removeBackground(data, width, height) {
  const border = borderIndices(width, height);
  const opaque = border.filter((p) => data[p * 4 + 3] > 16);

  // Already a transparent logo (e.g. a proper PNG export): leave it alone.
  if (opaque.length < border.length * 0.7) return { changed: false, reason: 'already-transparent' };

  const bg = [0, 1, 2].map((c) => median(opaque.map((p) => data[p * 4 + c])));
  const flat = opaque.filter((p) => dist(data, p * 4, bg) < SOFT).length;
  // The border isn't one flat colour (photo, logo bleeding off the edge):
  // removing "the background" would eat the logo, so skip.
  if (flat < border.length * 0.6) return { changed: false, reason: 'no-flat-background' };

  const seen = new Uint8Array(width * height);
  const stack = [];
  for (const p of border) {
    if (data[p * 4 + 3] <= 16 || dist(data, p * 4, bg) < SOFT) {
      seen[p] = 1;
      stack.push(p);
    }
  }

  while (stack.length) {
    const p = stack.pop();
    const i = p * 4;
    const d = dist(data, i, bg);
    if (d <= HARD) {
      data[i + 3] = 0;
    } else {
      const a = Math.min(1, (d - HARD) / (SOFT - HARD));
      for (let c = 0; c < 3; c++) {
        data[i + c] = Math.max(0, Math.min(255, Math.round((data[i + c] - bg[c] * (1 - a)) / a)));
      }
      data[i + 3] = Math.round(data[i + 3] * a);
    }
    const x = p % width;
    const y = (p - x) / width;
    const next = [];
    if (x > 0) next.push(p - 1);
    if (x < width - 1) next.push(p + 1);
    if (y > 0) next.push(p - width);
    if (y < height - 1) next.push(p + width);
    for (const q of next) {
      if (seen[q]) continue;
      seen[q] = 1;
      if (data[q * 4 + 3] <= 16 || dist(data, q * 4, bg) < SOFT) stack.push(q);
    }
  }

  return { changed: true, reason: 'flat-background-removed' };
}
