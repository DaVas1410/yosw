import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import meta from './sponsors.json';
import { SponsorsMetaSchema } from './schemas';
import { listSponsorFiles } from '../build/sponsor-logos.js';

const sponsorsDir = fileURLToPath(new URL('../assets/sponsors/', import.meta.url));

describe('sponsor logos', () => {
  const files = listSponsorFiles(sponsorsDir);

  it('finds logos in both group folders', () => {
    expect(files.some((f) => f.tipo === 'sponsor')).toBe(true);
    expect(files.some((f) => f.tipo === 'colaborador')).toBe(true);
  });

  it('every sponsors.json entry points at an existing logo file', () => {
    const keys = new Set(files.map((f) => f.key));
    for (const key of Object.keys(SponsorsMetaSchema.parse(meta))) {
      expect(keys.has(key), `sponsors.json entry "${key}" has no file in src/assets/sponsors/`).toBe(true);
    }
  });
});
