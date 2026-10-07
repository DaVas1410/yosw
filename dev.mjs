// Dev server: builds once, serves dist/ on :4321, and rebuilds whenever
// anything under src/ changes — e.g. dropping a new logo into
// src/assets/sponsors/patrocinadores/ shows up after a page refresh.
//
// Usage: npm run dev

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

let running = false;
let queued = false;

function build() {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  const started = Date.now();
  const child = spawn(process.execPath, ['build.mjs'], { cwd: rootDir, stdio: 'inherit' });
  child.on('exit', (code) => {
    running = false;
    console.log(code === 0 ? `  rebuilt in ${Date.now() - started} ms` : `  build failed (exit ${code})`);
    if (queued) {
      queued = false;
      build();
    }
  });
}

build();

let timer;
watch(path.join(rootDir, 'src'), { recursive: true }, (_event, file) => {
  if (file && /\.test\.(js|ts)$/.test(file)) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`changed: src/${file ?? ''}`);
    build();
  }, 200);
});

spawn('npx serve dist -l 4321', { cwd: rootDir, stdio: 'inherit', shell: true });
