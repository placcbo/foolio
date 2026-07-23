/**
 * Phase 6 acceptance test — experience parser.
 *
 *   node --test src/importer/__tests__/experience.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { parseExperience } from '../parse/experience.js';
import { runPdfPipeline } from '../index.js';
import { extractDocx } from '../extract/docx.js';
import { normalizeLines } from '../normalize/index.js';
import { detectSections } from '../detect/sections.js';

const DIR = dirname(fileURLToPath(import.meta.url));
const bytes = (n) => new Uint8Array(readFileSync(join(DIR, 'fixtures', n)));

function L(text, over = {}) {
  return {
    text, displayText: text, cells: [], x: 60, xEnd: 300, y: 0, fontSize: 11,
    bodyRatio: 1, bold: false, allCaps: false, isBullet: false, spaceAbove: 1.2,
    page: 1, column: 0, styleName: '', source: '', ...over,
  };
}

/* ------------------------------------------------------- the five layouts */

test('layout A: title over "Company | Location | Dates"', () => {
  const { items } = parseExperience([
    L('Senior Developer', { bold: true }),
    L('Acme Inc | Nairobi, Kenya | Jan 2020 – Present'),
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].company, 'Acme Inc');
  assert.equal(items[0].title, 'Senior Developer');
  assert.equal(items[0].location, 'Nairobi, Kenya');
  assert.equal(items[0].dates.current, true);
});

test('layout B: "Company — Location" / title / dates on separate lines', () => {
  const { items } = parseExperience([
    L('Acme Inc — Nairobi, Kenya'),
    L('Senior Developer', { bold: true }),
    L('Jan 2020 – Present'),
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].company, 'Acme Inc');
  assert.equal(items[0].title, 'Senior Developer');
  assert.equal(items[0].location, 'Nairobi, Kenya');
});

test('layout C: "Title, Company" with a right-aligned date cell', () => {
  const { items } = parseExperience([
    L('Senior Developer, Acme Inc Jan 2020 – Present', {
      bold: true,
      cells: ['Senior Developer, Acme Inc', 'Jan 2020 – Present'],
    }),
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].company, 'Acme Inc');
  assert.equal(items[0].title, 'Senior Developer');
});

test('layout D: one company, multiple roles -> multiple entries, same company', () => {
  const { items } = parseExperience([
    L('Acme Inc Jan 2018 – Present', { bold: true, cells: ['Acme Inc', 'Jan 2018 – Present'] }),
    L('Senior Developer Jan 2020 – Present', { cells: ['Senior Developer', 'Jan 2020 – Present'] }),
    L('Junior Developer Jan 2018 – Dec 2019', { cells: ['Junior Developer', 'Jan 2018 – Dec 2019'] }),
  ]);
  assert.equal(items.length, 2, 'two roles -> two entries');
  assert.equal(items[0].company, 'Acme Inc');
  assert.equal(items[1].company, 'Acme Inc');
  assert.equal(items[0].title, 'Senior Developer');
  assert.equal(items[1].title, 'Junior Developer');
  assert.equal(items[0].dates.current, true);
  assert.equal(items[1].dates.current, false);
});

test('layout E: ALL-CAPS company then "Title | City | Dates"', () => {
  const { items } = parseExperience([
    L('ACME INC', { bold: true, allCaps: true }),
    L('Senior Developer | Nairobi | 2020-Present'),
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].company, 'ACME INC');
  assert.equal(items[0].title, 'Senior Developer');
  assert.equal(items[0].location, 'Nairobi');
});

/* ----------------------------------------------------------- on fixtures */

async function experienceItems(name, kind) {
  const { lines } =
    kind === 'pdf' ? await runPdfPipeline(bytes(name), pdfjs) : await extractDocx(bytes(name));
  const r = detectSections(normalizeLines(lines));
  const exp = r.sections.find((s) => s.key === 'experience');
  return parseExperience(exp.lines);
}

test('001 fixture: two jobs classified with company/title/bullets', async () => {
  const { items, fields } = await experienceItems('001-ats-single-column.pdf', 'pdf');
  assert.equal(items.length, 2);
  assert.match(items[0].company, /Kopo Pay Ltd/);
  assert.match(items[0].title, /Senior Backend Engineer/);
  assert.ok(items[0].bullets.length >= 1, 'bullets captured');
  assert.match(items[1].company, /DataForge Solutions/);

  // Every company/title has a confidence entry in _meta.fields.
  for (let i = 0; i < items.length; i += 1) {
    assert.ok(fields[`experience.${i}.company`], `fields experience.${i}.company`);
    assert.ok(fields[`experience.${i}.title`], `fields experience.${i}.title`);
    assert.equal(typeof fields[`experience.${i}.company`].confidence, 'number');
  }
});

test('002 fixture: suffix-less company recovered by pairing (lower confidence)', async () => {
  const { items, fields } = await experienceItems('002-canva-two-column.pdf', 'pdf');
  assert.equal(items.length, 2);
  assert.equal(items[0].company, 'Brightloop Inc');
  assert.equal(items[1].company, 'Novaquest'); // no suffix -> pairing
  assert.equal(items[1].title, 'Product Designer');
  assert.ok(fields['experience.1.company'].confidence <= 0.5, 'pairing tiebreak confidence');
});

test('003 fixture: table-layout experience classified', async () => {
  const { items } = await experienceItems('003-word-table-layout.docx', 'docx');
  assert.equal(items.length, 2);
  assert.match(items[0].company, /Meridian Consulting/);
  assert.match(items[0].title, /Senior Project Manager/);
  assert.match(items[1].company, /Acme Corp/);
});

test('no entry has empty bullets AND empty description when the block had body', async () => {
  for (const [name, kind] of [
    ['001-ats-single-column.pdf', 'pdf'],
    ['002-canva-two-column.pdf', 'pdf'],
    ['003-word-table-layout.docx', 'docx'],
  ]) {
    const { items } = await experienceItems(name, kind);
    for (const it of items) {
      assert.ok(it.bullets.length > 0 || it.description, `${name}: content not dropped`);
    }
  }
});
