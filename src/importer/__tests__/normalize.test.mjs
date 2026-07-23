/**
 * Phase 3 acceptance test — normalization.
 *
 *   node --test src/importer/__tests__/normalize.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { toParseText, toDisplayText } from '../normalize/text.js';
import { canonicalizeBullet } from '../normalize/bullets.js';
import { mergeWrappedLines } from '../normalize/merge.js';
import { normalizeLines } from '../normalize/index.js';
import { runPdfPipeline } from '../index.js';
import { extractDocx } from '../extract/docx.js';

const DIR = dirname(fileURLToPath(import.meta.url));
const bytes = (n) => new Uint8Array(readFileSync(join(DIR, 'fixtures', n)));

/* ------------------------------------------------------------------ text */

test('toParseText: ligatures, dashes, quotes, odd spaces, zero-width', () => {
  assert.equal(toParseText('ofﬁce'), 'office'); // ﬁ ligature
  assert.equal(toParseText('2019–2021'), '2019-2021'); // en dash
  assert.equal(toParseText('a—b'), 'a-b'); // em dash
  assert.equal(toParseText('“quoted”'), '"quoted"');
  assert.equal(toParseText("it’s"), "it's");
  assert.equal(toParseText('a b'), 'a b'); // nbsp
  assert.equal(toParseText('a​b'), 'ab'); // zero-width
  assert.equal(toParseText('  x    y  '), 'x y');
});

test('toDisplayText keeps original dashes and curly quotes but repairs ligatures', () => {
  assert.equal(toDisplayText('2019–2021'), '2019–2021');
  assert.equal(toDisplayText('“x”'), '“x”');
  assert.equal(toDisplayText('ofﬁce'), 'office');
});

/* --------------------------------------------------------------- bullets */

test('canonicalizeBullet: glyphs (incl. Word PUA) are stripped and flagged', () => {
  assert.deepEqual(canonicalizeBullet('• Managed the team'), {
    text: 'Managed the team',
    isBullet: true,
  });
  assert.deepEqual(canonicalizeBullet(' Did the thing'), {
    text: 'Did the thing',
    isBullet: true,
  });
  assert.equal(canonicalizeBullet('* Built a system').isBullet, true);
  assert.equal(canonicalizeBullet('o Delivered results').isBullet, true);
});

test('canonicalizeBullet: leading "-" that is a date/number is NOT a bullet', () => {
  assert.equal(canonicalizeBullet('- 2019 - 2021').isBullet, false);
  assert.equal(canonicalizeBullet('-3.5 GPA').isBullet, false);
  assert.equal(canonicalizeBullet('- Led the migration').isBullet, true);
  assert.equal(canonicalizeBullet('Owner of the roadmap').isBullet, false); // uppercase O
});

/* ----------------------------------------------------------------- merge */

function L(text, over = {}) {
  return {
    text,
    cells: [],
    x: 60,
    xEnd: 300,
    y: 0,
    fontSize: 11,
    bodyRatio: 1,
    bold: false,
    allCaps: false,
    isBullet: false,
    spaceAbove: 1.2,
    page: 1,
    column: 0,
    styleName: '',
    source: '',
    ...over,
  };
}

test('mergeWrappedLines: de-hyphenation joins split words', () => {
  const out = mergeWrappedLines([L('highly qualified profes-'), L('sional developer')]);
  assert.equal(out.length, 1);
  assert.equal(out[0].text, 'highly qualified professional developer');
});

test('mergeWrappedLines: wrapped prose merges, headings/dates/paragraph-breaks do not', () => {
  // prose continuation
  let out = mergeWrappedLines([L('reduced costs and improved'), L('operational efficiency')]);
  assert.equal(out.length, 1);

  // heading not merged into prose above it
  out = mergeWrappedLines([L('did the work well'), L('EXPERIENCE', { allCaps: true, bold: true })]);
  assert.equal(out.length, 2);

  // date line not merged
  out = mergeWrappedLines([L('worked there'), L('since 2019 leading things')]);
  assert.equal(out.length, 2);

  // hard paragraph break not crossed
  out = mergeWrappedLines([L('end of a thought'), L('continues below', { spaceAbove: 2.0 })]);
  assert.equal(out.length, 2);

  // sentence-terminated previous not merged
  out = mergeWrappedLines([L('This is done.'), L('another clause here')]);
  assert.equal(out.length, 2);
});

/* ------------------------------------------------------- round-trip guard */

// Every alphanumeric character present after extraction must survive
// normalization (de-hyphenation joins runs but drops no letters/digits). We
// strip bullet markers on both sides, since a marker glyph is not content.
function contentStream(texts) {
  const stripped = texts.map((t) => canonicalizeBullet(toParseText(t)).text);
  const matched = stripped.join(' ').normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu);
  return (matched || []).join('');
}

test('round-trip: normalization drops no alphanumeric content (PDF)', async () => {
  const { lines } = await runPdfPipeline(bytes('001-ats-single-column.pdf'), pdfjs);
  const normalized = normalizeLines(lines);
  assert.equal(
    contentStream(normalized.map((l) => l.text)),
    contentStream(lines.map((l) => l.text)),
  );
});

test('round-trip: normalization drops no alphanumeric content (DOCX)', async () => {
  const { lines } = await extractDocx(bytes('003-word-table-layout.docx'));
  const normalized = normalizeLines(lines);
  assert.equal(
    contentStream(normalized.map((l) => l.text)),
    contentStream(lines.map((l) => l.text)),
  );
});
