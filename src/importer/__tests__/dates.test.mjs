/**
 * Phase 5 acceptance test — date patterns + entry segmentation.
 *
 *   node --test src/importer/__tests__/dates.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { findDateRanges, isDateOnly } from '../patterns/dates.js';
import { segmentEntries } from '../parse/entries.js';
import { runPdfPipeline } from '../index.js';
import { extractDocx } from '../extract/docx.js';
import { normalizeLines } from '../normalize/index.js';
import { detectSections } from '../detect/sections.js';

const DIR = dirname(fileURLToPath(import.meta.url));
const bytes = (n) => new Uint8Array(readFileSync(join(DIR, 'fixtures', n)));

// [input, { start, end, current }] — end omitted means null; current defaults false.
const CASES = [
  ['Jan 2019 – Mar 2021', { start: '2019-01', end: '2021-03' }],
  ['January 2019 to March 2021', { start: '2019-01', end: '2021-03' }],
  ['Sep 2020 - Present', { start: '2020-09', end: null, current: true }],
  ['September 2020 until now', { start: '2020-09', end: null, current: true }],
  ['01/2019 - 03/2021', { start: '2019-01', end: '2021-03' }],
  ['2019-01 – 2021-03', { start: '2019-01', end: '2021-03' }],
  ['2019 – 2021', { start: '2019', end: '2021' }],
  ['2019 - Present', { start: '2019', end: null, current: true }],
  ['2019–21', { start: '2019', end: '2021' }],
  ['Fall 2019', { start: '2019', end: null }],
  ['Summer 2020 - Fall 2021', { start: '2020', end: '2021' }],
  ['Winter 2019/20', { start: '2019', end: null }],
  ['Issued Mar 2022', { start: '2022-03', end: null }],
  ['2022', { start: '2022', end: null }],
  ['2018 to 2020', { start: '2018', end: '2020' }],
  ['2018 until 2020', { start: '2018', end: '2020' }],
  ['2018 through 2020', { start: '2018', end: '2020' }],
  ['Mar 2019 | May 2020', { start: '2019-03', end: '2020-05' }],
  ['janvier 2019 – mars 2021', { start: '2019-01', end: '2021-03' }],
  ['enero 2019 - diciembre 2020', { start: '2019-01', end: '2020-12' }],
  ['Januar 2018 – Dezember 2019', { start: '2018-01', end: '2019-12' }],
  ['janeiro 2020 - março 2021', { start: '2020-01', end: '2021-03' }],
  ['2019 - Current', { start: '2019', end: null, current: true }],
  ['2019 - Ongoing', { start: '2019', end: null, current: true }],
  ['May 2019 – present', { start: '2019-05', end: null, current: true }],
  ['Aug 2017 - Dec 2020', { start: '2017-08', end: '2020-12' }],
  ['Feb 2015 – Feb 2019', { start: '2015-02', end: '2019-02' }],
  ['Oct. 2018 – Jan. 2020', { start: '2018-10', end: '2020-01' }],
  ['Nov 2021 to Present', { start: '2021-11', end: null, current: true }],
  ['06/2018 – 09/2020', { start: '2018-06', end: '2020-09' }],
  ['2016-06 to 2019-09', { start: '2016-06', end: '2019-09' }],
  ['1999 - 2003', { start: '1999', end: '2003' }],
  ['2005–2009', { start: '2005', end: '2009' }],
  ['Spring 2018 - Summer 2019', { start: '2018', end: '2019' }],
  ['Sept 2019 - Present', { start: '2019-09', end: null, current: true }],
  ['July 2020 – August 2020', { start: '2020-07', end: '2020-08' }],
  ['Jan 2019-Mar 2019', { start: '2019-01', end: '2019-03' }],
  ['2010 to present', { start: '2010', end: null, current: true }],
  ['March 2022', { start: '2022-03', end: null }],
  ['12/2019', { start: '2019-12', end: null }],
];

test('date ranges: 40+ formats parse correctly', () => {
  assert.ok(CASES.length >= 40, `have ${CASES.length} cases`);
  for (const [input, exp] of CASES) {
    const found = findDateRanges(input);
    assert.ok(found.length >= 1, `no date found in: ${input}`);
    const m = found[0];
    assert.equal(m.start, exp.start, `start of "${input}"`);
    assert.equal(m.end, exp.end ?? null, `end of "${input}"`);
    assert.equal(m.current, Boolean(exp.current), `current of "${input}"`);
  }
});

test('ambiguous numeric date keeps year only at confidence 0.5', () => {
  const [m] = findDateRanges('03/04/2019');
  assert.equal(m.start, '2019');
  assert.equal(m.confidence, 0.5);
  assert.equal(m.ambiguous, true);
});

test('isDateOnly distinguishes a date row from a line with other content', () => {
  assert.equal(isDateOnly('Jan 2019 – Mar 2021'), true);
  assert.equal(isDateOnly('2019 - Present'), true);
  assert.equal(isDateOnly('Kopo Pay Ltd | Nairobi, Kenya | Jan 2021'), false);
  assert.equal(isDateOnly('Senior Engineer'), false);
});

/* -------------------------------------------------- entry segmentation */

function L(text, over = {}) {
  return {
    text, displayText: text, cells: [], x: 60, xEnd: 300, y: 0, fontSize: 11,
    bodyRatio: 1, bold: false, allCaps: false, isBullet: false, spaceAbove: 1.2,
    page: 1, column: 0, styleName: '', source: '', ...over,
  };
}

async function experienceLines(name, kind) {
  const { lines } =
    kind === 'pdf' ? await runPdfPipeline(bytes(name), pdfjs) : await extractDocx(bytes(name));
  const r = detectSections(normalizeLines(lines));
  return r.sections.find((s) => s.key === 'experience')?.lines || [];
}

test('fixtures: experience sections split into one block per job', async () => {
  for (const [name, kind, expected] of [
    ['001-ats-single-column.pdf', 'pdf', 2],
    ['002-canva-two-column.pdf', 'pdf', 2],
    ['003-word-table-layout.docx', 'docx', 2],
  ]) {
    const { entries } = segmentEntries(await experienceLines(name, kind));
    assert.equal(entries.length, expected, `${name}: ${expected} jobs`);
  }
});

test('a synthetic 4-job section yields exactly 4 blocks', () => {
  const lines = [];
  for (let j = 1; j <= 4; j += 1) {
    lines.push(L(`Engineer ${j}`, { bold: true }));
    lines.push(L(`Company ${j} | City | 20${10 + j} - 20${12 + j}`));
    lines.push(L(`Did important thing number ${j} with measurable impact.`, { isBullet: true }));
    lines.push(L(`Did another thing for job ${j} that mattered.`, { isBullet: true }));
  }
  const { entries } = segmentEntries(lines);
  assert.equal(entries.length, 4);
});

test('a 3-line header (title / company / dates) is one entry, not three', () => {
  const lines = [
    L('Senior Developer', { bold: true }),
    L('Acme Inc'),
    L('Jan 2020 - Present'),
    L('Built things.', { isBullet: true }),
  ];
  const { entries } = segmentEntries(lines);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].dates.current, true);
});
