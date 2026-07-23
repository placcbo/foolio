/**
 * Phase 1 acceptance test — PDF extraction + layout reconstruction.
 *
 * Runs the exact pipeline the importer uses (`runPdfPipeline`) against the
 * synthetic fixtures, via pdf.js's legacy (worker-less) build for Node.
 *
 *   node --test src/importer/__tests__/extract.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { runPdfPipeline } from '../index.js';

const DIR = dirname(fileURLToPath(import.meta.url));
const fixture = (n) => new Uint8Array(readFileSync(join(DIR, 'fixtures', n)));

async function pipeline(name) {
  return runPdfPipeline(fixture(name), pdfjs);
}

test('001 single-column: reading order matches visual order', async () => {
  const { lines, rawText, multiColumn } = await pipeline('001-ats-single-column.pdf');

  assert.equal(multiColumn, false, 'single-column PDF must not be flagged multiColumn');
  assert.equal(lines[0].text, 'Amara Okafor', 'name is the first line');

  const order = ['SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS'];
  const idx = order.map((h) => rawText.indexOf(h));
  for (const i of idx) assert.ok(i >= 0, 'every section heading present');
  for (let i = 1; i < idx.length; i += 1) {
    assert.ok(idx[i - 1] < idx[i], `${order[i - 1]} precedes ${order[i]}`);
  }
});

test('001: words are neither broken nor fused', async () => {
  const { rawText } = await pipeline('001-ats-single-column.pdf');

  // Fused: a space that should exist is missing.
  assert.match(rawText, /Senior Backend Engineer/, 'title stays spaced, not "SeniorBackend"');
  assert.match(rawText, /REST APIs/);
  // Broken: a word that should be whole is split by a spurious space.
  for (const w of ['reconciliation', 'integrations', 'Kubernetes', 'PostgreSQL', 'Engineer']) {
    assert.ok(rawText.includes(w), `intact word: ${w}`);
  }
  assert.doesNotMatch(rawText, /\bde vel oper\b/i);
});

test('001: cells split a title from its right-aligned date', async () => {
  const { lines } = await pipeline('001-ats-single-column.pdf');
  // Match the experience title row (has the date), not the headline under the
  // name which is the same text without a date.
  const titleLine = lines.find(
    (l) => l.text.startsWith('Senior Backend Engineer') && /Jan 2021/.test(l.text),
  );
  assert.ok(titleLine, 'found the title line');
  assert.equal(titleLine.cells.length, 2, 'title line splits into two cells');
  assert.equal(titleLine.cells[0], 'Senior Backend Engineer');
  assert.match(titleLine.cells[1], /Jan 2021\s*-\s*Present/);
});

test('002 two-column: sidebar is not interleaved with the main column', async () => {
  const { rawText, multiColumn } = await pipeline('002-canva-two-column.pdf');

  assert.equal(multiColumn, true, 'two-column PDF flagged multiColumn');

  // Full-width header survives at the top.
  assert.ok(rawText.startsWith('Liam Chen'), 'name leads the document');
  assert.match(rawText, /Product Designer/);

  const iContact = rawText.indexOf('CONTACT');
  const iLanguages = rawText.indexOf('LANGUAGES');
  const iSummary = rawText.indexOf('SUMMARY');
  const iExperience = rawText.indexOf('EXPERIENCE');
  for (const [n, i] of Object.entries({ iContact, iLanguages, iSummary, iExperience })) {
    assert.ok(i >= 0, `${n} present`);
  }
  // The ENTIRE sidebar column precedes the main column — no line-by-line
  // interleaving (which naive concatenation produces).
  assert.ok(iContact < iLanguages, 'sidebar reads top-to-bottom');
  assert.ok(iLanguages < iSummary, 'whole sidebar precedes main column');
  assert.ok(iSummary < iExperience, 'main column reads top-to-bottom');
});

test('002: the sidebar block is contiguous, not bled into the main column', async () => {
  const { rawText } = await pipeline('002-canva-two-column.pdf');
  assert.match(rawText, /Brightloop Inc/);

  // The sidebar (CONTACT..LANGUAGES) must read as one uninterrupted block: no
  // main-column heading appears between its first and last heading. (Wrapped
  // skill text like "Figma, Prototyping, Design" / "Systems, User Research"
  // stays on two lines here — line merging is Phase 3.)
  const sidebar = rawText.slice(rawText.indexOf('CONTACT'), rawText.indexOf('LANGUAGES'));
  assert.match(sidebar, /Figma, Prototyping, Design/);
  assert.match(sidebar, /HTML, CSS, React/);
  for (const mainHeading of ['SUMMARY', 'EXPERIENCE', 'EDUCATION']) {
    assert.ok(!sidebar.includes(mainHeading), `sidebar must not contain ${mainHeading}`);
  }
});
