// Sponsor/partner logos are driven by what's on disk: every image dropped in
//   src/assets/sponsors/patrocinadores/  -> "Patrocinadores" wall
//   src/assets/sponsors/colaboradores/   -> "Colaboradores" wall
// shows up on the next build, sorted by filename. src/data/sponsors.json is
// optional metadata keyed by "<carpeta>/<archivo>" (display name, link); a
// logo without an entry gets a name derived from its filename.
//
// At build time each logo gets its flat background removed (see
// logo-bg.js), is trimmed to its content, scaled down and written to
// dist/assets/sponsors/<carpeta>/<nombre>.png.

import { readdirSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { removeBackground } from './logo-bg.js';

export const SPONSOR_FOLDERS = {
  patrocinadores: 'sponsor',
  colaboradores: 'colaborador',
};

const IMAGE_EXT = /\.(png|jpe?g|webp|svg)$/i;

export function nameFromFile(file) {
  return path
    .parse(file)
    .name.replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

/** Lists the logo files per folder: [{ folder, file, key, tipo }]. */
export function listSponsorFiles(srcDir) {
  const out = [];
  for (const [folder, tipo] of Object.entries(SPONSOR_FOLDERS)) {
    const dir = path.join(srcDir, folder);
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort((a, b) => a.localeCompare(b, 'es'));
    for (const file of files) out.push({ folder, file, key: `${folder}/${file}`, tipo });
  }
  return out;
}

function outName(file) {
  const ext = path.extname(file).toLowerCase();
  const base = path.parse(file).name;
  return ext === '.svg' ? `${base}.svg` : `${base}.png`;
}

/**
 * Processes every logo into outDir and returns the sponsor list the
 * renderer expects: [{ id, nombre, tipo, logo, enlace? }], `logo` being
 * relative to /assets/sponsors/.
 */
export async function buildSponsorLogos({ srcDir, outDir, meta = {} }) {
  const { default: sharp } = await import('sharp');
  const entries = listSponsorFiles(srcDir);
  const sponsors = [];

  for (const { folder, file, key, tipo } of entries) {
    const src = path.join(srcDir, folder, file);
    const destRel = `${folder}/${outName(file)}`;
    const dest = path.join(outDir, destRel);
    mkdirSync(path.dirname(dest), { recursive: true });

    if (file.toLowerCase().endsWith('.svg')) {
      // SVGs are copied as-is: they're vector and normally transparent.
      copyFileSync(src, dest);
    } else {
      const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      removeBackground(data, info.width, info.height);
      await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .trim({ threshold: 1 })
        .resize({ width: 720, height: 240, fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true, quality: 90 })
        .toFile(dest);
    }

    const m = meta[key] ?? {};
    sponsors.push({
      id: key.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
      nombre: m.nombre ?? nameFromFile(file),
      tipo,
      logo: destRel,
      ...(m.enlace ? { enlace: m.enlace } : {}),
    });
  }
  return sponsors;
}
