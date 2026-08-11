/**
 * Scroll progress through the hero, 0 (hero top at viewport top) to 1
 * (hero has scrolled a full viewport height past the top), clamped.
 */
export function computeScrollProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number
): number {
  const scrolled = -rectTop;
  const progress = scrolled / Math.min(rectHeight, viewportHeight);
  return Math.min(1, Math.max(0, progress));
}

/** Maps 0–1 scroll progress to a rotation angle in radians. */
export function rotationForProgress(progress: number): number {
  return progress * Math.PI * 0.6;
}
