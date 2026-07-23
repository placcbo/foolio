/**
 * Phase 2 acceptance test — DOCX extraction (table-aware, header-aware).
 *
 *   node --test src/importer/__tests__/docx.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { extractDocx } from '../extract/docx.js';
import { runPdfPipeline } from '../index.js';

const DIR = dirname(fileURLToPath(import.meta.url));
const bytes = (n) => new Uint8Array(readFileSync(join(DIR, 'fixtures', n)));

async function docx() {
  return extractDocx(bytes('003-word-table-layout.docx'));
}

test('003: XML walk succeeds (not the mammoth fallback)', async () => {
  const { lines, warnings } = await docx();
  assert.ok(lines.length >= 5, 'produced real lines');
  assert.ok(
    !warnings.some((w) => /fell back/.test(w)),
    `should not fall back; warnings: ${warnings.join(' | ')}`,
  );
  assert.ok(!lines.some((l) => l.source === 'docx-mammoth'), 'no mammoth-sourced lines');
});

test('003: w:pStyle heading signals survive on styleName', async () => {
  const { lines } = await docx();
  assert.ok(
    lines.some((l) => /title/i.test(l.styleName)),
    'the name paragraph carries a Title style',
  );
  assert.ok(
    lines.some((l) => /heading/i.test(l.styleName)),
    'section headings carry a Heading style',
  );
});

test('003: table rows preserve the dates|content pairing in cells', async () => {
  const { lines } = await docx();
  const row = lines.find((l) => l.cells.length >= 2 && /2019\s*-\s*Present/.test(l.cells[0]));
  assert.ok(row, 'found the first experience row with a paired cell');
  assert.match(row.cells[1], /Senior Project Manager/);
  assert.match(row.cells[1], /Meridian Consulting/);
});

test('003: bullets inside table cells are preserved as bullet lines', async () => {
  const { lines } = await docx();
  const bullet = lines.find((l) => l.isBullet && /Managed a 3M/.test(l.text));
  assert.ok(bullet, 'a numbered/bulleted paragraph in the content cell stays a bullet line');
});

test('003: contact info in the document header is not lost', async () => {
  const { lines } = await docx();
  const header = lines.find((l) => l.source === 'docx-header');
  assert.ok(header, 'header content was extracted');
  const email = lines.find((l) => l.text.includes('priya.nair@example.com'));
  assert.ok(email, 'the header email survived');
  assert.equal(email.source, 'docx-header', 'and is flagged as header-sourced');
});

test('PDF and DOCX produce the same Line shape', async () => {
  const { lines: dl } = await docx();
  const { lines: pl } = await runPdfPipeline(bytes('001-ats-single-column.pdf'), pdfjs);
  const keys = (o) => Object.keys(o).sort();
  assert.deepEqual(keys(dl[0]), keys(pl[0]), 'identical Line keys across formats');
});
