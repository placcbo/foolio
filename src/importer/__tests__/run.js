/**
 * Regression runner for the resume importer.
 *
 * Loads every fixture pair in `fixtures/` (`<name>.pdf|.docx` +
 * `<name>.expected.json`), runs the importer, scores the result, prints a
 * table, and diffs against the previous run stored in `.last-scores.json`.
 *
 * Exit code is non-zero if any fixture's overall score (or the aggregate mean)
 * drops by more than REGRESSION_TOLERANCE vs. the last recorded run — so a
 * regression is loud in CI and locally.
 *
 * Run with: npm run import:test
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

import { importResume } from '../index.js';
import { createEmptyResume, validateResume } from '../schema/resume.js';
import { scoreResume } from './score.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, 'fixtures');
const LAST_SCORES = join(__dirname, '.last-scores.json');
const REGRESSION_TOLERANCE = 0.02;

/**
 * Deep-merge an expected-json fragment over a full empty resume so the scorer
 * always sees a complete shape.
 * @param {any} fragment
 * @returns {import('../schema/resume.js').Resume}
 */
function hydrateExpected(fragment) {
  const base = createEmptyResume();
  const merged = { ...base, ...fragment };
  merged.basics = { ...base.basics, ...(fragment.basics || {}) };
  merged._meta = { ...base._meta, ...(fragment._meta || {}) };
  return merged;
}

/**
 * A Node stand-in for a browser `File` — enough for `importResume`.
 * @param {string} filePath
 * @returns {import('../index.js').FileLike}
 */
function fileLike(filePath) {
  const buf = readFileSync(filePath);
  return {
    name: basename(filePath),
    async arrayBuffer() {
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    },
  };
}

/** @returns {{name:string, source:string, expected:string}[]} */
function discoverFixtures() {
  if (!existsSync(FIXTURES_DIR)) return [];
  const files = readdirSync(FIXTURES_DIR);
  /** @type {{name:string, source:string, expected:string}[]} */
  const pairs = [];
  for (const f of files) {
    if (!f.endsWith('.expected.json')) continue;
    const name = f.replace(/\.expected\.json$/, '');
    const source = [`${name}.pdf`, `${name}.docx`].find((s) => files.includes(s));
    if (!source) {
      console.warn(`  ! ${name}: expected.json has no matching .pdf/.docx — skipped`);
      continue;
    }
    pairs.push({
      name,
      source: join(FIXTURES_DIR, source),
      expected: join(FIXTURES_DIR, f),
    });
  }
  return pairs.sort((a, b) => a.name.localeCompare(b.name));
}

function fmt(n) {
  return n.toFixed(2);
}

function pad(s, w) {
  s = String(s);
  return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length);
}

async function main() {
  // Sanity: an empty resume must be structurally valid (Phase 0 acceptance).
  const emptyProblems = validateResume(createEmptyResume());
  if (emptyProblems.length) {
    console.error('FATAL: createEmptyResume() failed validateResume():');
    for (const p of emptyProblems) console.error('  - ' + p);
    process.exit(2);
  }

  const fixtures = discoverFixtures();
  if (fixtures.length === 0) {
    console.error('No fixtures found in ' + FIXTURES_DIR);
    console.error('Add <name>.pdf|.docx + <name>.expected.json pairs.');
    process.exit(1);
  }

  const prev = existsSync(LAST_SCORES)
    ? JSON.parse(readFileSync(LAST_SCORES, 'utf8'))
    : { fixtures: {}, mean: null };

  console.log('');
  console.log(
    pad('FIXTURE', 34) +
      pad('BASICS', 8) +
      pad('EXP', 7) +
      pad('EDU', 7) +
      pad('SKILLS', 8) +
      pad('OVERALL', 8) +
      'Δ',
  );
  console.log('-'.repeat(80));

  /** @type {Record<string, number>} */
  const currentOverall = {};
  let regressed = false;
  let overallSum = 0;

  for (const fx of fixtures) {
    let expected;
    try {
      expected = hydrateExpected(JSON.parse(readFileSync(fx.expected, 'utf8')));
    } catch (err) {
      console.error(`  ! ${fx.name}: bad expected.json — ${err.message}`);
      regressed = true;
      continue;
    }

    let scores;
    try {
      const { resume } = await importResume(fileLike(fx.source), { pdfjs });
      const structural = validateResume(resume);
      if (structural.length) {
        console.error(`  ! ${fx.name}: importer output failed validation:`);
        for (const p of structural) console.error('      - ' + p);
        regressed = true;
      }
      scores = scoreResume(expected, resume);
    } catch (err) {
      console.error(`  ! ${fx.name}: importResume threw — ${err.stack || err.message}`);
      regressed = true;
      continue;
    }

    currentOverall[fx.name] = scores.overall;
    overallSum += scores.overall;

    const prevOverall = prev.fixtures?.[fx.name];
    const delta = prevOverall == null ? null : scores.overall - prevOverall;
    const deltaStr =
      delta == null ? '  (new)' : (delta >= 0 ? '+' : '') + delta.toFixed(3);
    if (delta != null && delta < -REGRESSION_TOLERANCE) {
      regressed = true;
    }

    console.log(
      pad(fx.name, 34) +
        pad(fmt(scores.basics), 8) +
        pad(fmt(scores.experience), 7) +
        pad(fmt(scores.education), 7) +
        pad(fmt(scores.skills), 8) +
        pad(fmt(scores.overall), 8) +
        deltaStr,
    );
  }

  const mean = overallSum / fixtures.length;
  console.log('-'.repeat(80));
  const meanDelta = prev.mean == null ? null : mean - prev.mean;
  console.log(
    pad('MEAN', 34) +
      pad('', 8) +
      pad('', 7) +
      pad('', 7) +
      pad('', 8) +
      pad(fmt(mean), 8) +
      (meanDelta == null ? '  (new)' : (meanDelta >= 0 ? '+' : '') + meanDelta.toFixed(3)),
  );
  if (meanDelta != null && meanDelta < -REGRESSION_TOLERANCE) {
    regressed = true;
  }
  console.log('');

  // Persist current run for the next diff.
  writeFileSync(
    LAST_SCORES,
    JSON.stringify({ fixtures: currentOverall, mean, ts: new Date().toISOString() }, null, 2),
  );

  if (regressed) {
    console.error(
      `REGRESSION: a score dropped more than ${REGRESSION_TOLERANCE} vs. the last run ` +
        `(or a fixture errored). See above.`,
    );
    process.exit(1);
  }
  console.log('OK: no regressions beyond tolerance.');
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
