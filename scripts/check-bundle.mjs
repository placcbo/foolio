/**
 * Bundle-size guard (Phase 8): the importer must stay code-split, so the main
 * entry chunk must not grow by more than BUDGET bytes vs. a stored baseline.
 * The importer/pdf.js/jszip weigh well over 1.5MB and must never land in the
 * main bundle.
 *
 * Run `vite build` first, then this. Seeds the baseline on first run.
 *
 *   npm run bundle:check
 */

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BUDGET = 20 * 1024; // 20 KB
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const baselineFile = join(root, 'scripts', '.bundle-baseline.json');

const html = readFileSync(join(dist, 'index.html'), 'utf8');
const m = html.match(/assets\/(index-[A-Za-z0-9_-]+\.js)/);
if (!m) {
  console.error('Could not find the entry chunk in dist/index.html. Run `npm run build` first.');
  process.exit(2);
}
const entry = join(dist, 'assets', m[1]);
const size = statSize(entry);
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

if (!existsSync(baselineFile)) {
  writeFileSync(baselineFile, JSON.stringify({ entryBytes: size }, null, 2));
  console.log(`Seeded bundle baseline: main entry = ${kb(size)} (${m[1]}).`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselineFile, 'utf8')).entryBytes;
const delta = size - baseline;
console.log(`Main entry ${kb(size)} (baseline ${kb(baseline)}, Δ ${delta >= 0 ? '+' : ''}${kb(delta)}).`);

if (delta > BUDGET) {
  console.error(`FAIL: main entry grew by more than ${kb(BUDGET)} — importer likely leaked into the main bundle.`);
  process.exit(1);
}
console.log('OK: main entry within budget; importer stays code-split.');

function statSize(p) {
  try {
    return statSync(p).size;
  } catch {
    console.error('Missing built chunk: ' + p);
    process.exit(2);
  }
}
