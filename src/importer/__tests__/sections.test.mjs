/**
 * Phase 4 acceptance test — section detection.
 *
 *   node --test src/importer/__tests__/sections.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { runPdfPipeline } from '../index.js';
import { extractDocx } from '../extract/docx.js';
import { normalizeLines } from '../normalize/index.js';
import { detectSections } from '../detect/sections.js';

const DIR = dirname(fileURLToPath(import.meta.url));
const bytes = (n) => new Uint8Array(readFileSync(join(DIR, 'fixtures', n)));

async function sectionsFromPdf(name) {
  const { lines } = await runPdfPipeline(bytes(name), pdfjs);
  return detectSections(normalizeLines(lines));
}
async function sectionsFromDocx(name) {
  const { lines } = await extractDocx(bytes(name));
  return detectSections(normalizeLines(lines));
}
const keys = (r) => r.sections.map((s) => s.key);
const preambleText = (r) => r.preamble.map((l) => l.text).join(' ');

test('001 single-column: canonical sections detected, name in preamble', async () => {
  const r = await sectionsFromPdf('001-ats-single-column.pdf');
  for (const k of ['summary', 'experience', 'education', 'skills']) {
    assert.ok(keys(r).includes(k), `detected ${k}`);
  }
  assert.match(preambleText(r), /Amara Okafor/, 'name stays in preamble, not a section');

  // The experience body carries the job content (bullets not swallowed away).
  const exp = r.sections.find((s) => s.key === 'experience');
  const body = exp.lines.map((l) => l.text).join(' ');
  assert.match(body, /Kopo Pay Ltd/);
  assert.match(body, /reconciliation errors/);
});

test('002 two-column: unknown "CONTACT" becomes a custom section, not swallowed', async () => {
  const r = await sectionsFromPdf('002-canva-two-column.pdf');
  for (const k of ['summary', 'experience', 'education', 'skills', 'languages']) {
    assert.ok(keys(r).includes(k), `detected ${k}`);
  }
  const contact = r.sections.find((s) => /contact/i.test(s.headingText));
  assert.ok(contact, 'CONTACT heading was detected');
  assert.equal(contact.key, 'custom', 'unknown heading routes to custom with its text');
});

test('003 DOCX: heading styles drive detection; the name is not a heading', async () => {
  const r = await sectionsFromDocx('003-word-table-layout.docx');
  for (const k of ['summary', 'experience', 'education', 'skills', 'certifications']) {
    assert.ok(keys(r).includes(k), `detected ${k}`);
  }
  assert.match(preambleText(r), /Priya Nair/, 'the Title-styled name stays in preamble');
  assert.ok(
    !r.sections.some((s) => /priya nair/i.test(s.headingText)),
    'name is never a section heading',
  );
});

/* ------------------------------------------------------------- unit tests */

function L(text, over = {}) {
  return {
    text,
    displayText: text,
    cells: [],
    x: 60,
    xEnd: 300,
    y: 200,
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

test('a creative heading with no alias is detected via style and routed to custom', () => {
  const lines = [
    L('Jordan Rivers', { y: 40, fontSize: 20, bold: true }), // name, top of page
    L("WHERE I'VE WORKED", { y: 200, fontSize: 12, bold: true, allCaps: true, bodyRatio: 1.2 }),
    L('Did a lot of good work at various companies over the years', { y: 220 }),
  ];
  const r = detectSections(lines);
  const custom = r.sections.find((s) => /where i/i.test(s.headingText));
  assert.ok(custom, 'creative heading detected');
  assert.equal(custom.key, 'custom');
  assert.equal(custom.lines.length, 1, 'the body line is attached, not swallowed elsewhere');
});

test('consistency filter demotes a lone bold title that mimics a heading', () => {
  const headingStyle = { fontSize: 12, bold: true, allCaps: true, bodyRatio: 1.2, y: 0 };
  const lines = [
    L('SUMMARY', { ...headingStyle, y: 100 }),
    L('a short profile line', { y: 120 }),
    L('EXPERIENCE', { ...headingStyle, y: 160 }),
    // A bold job title with a one-off signature (not allCaps, different size).
    L('Senior Widget Engineer', { y: 180, fontSize: 13, bold: true, bodyRatio: 1.18 }),
    L('did widget things', { y: 200 }),
    L('EDUCATION', { ...headingStyle, y: 240 }),
    L('studied widgets', { y: 260 }),
    L('SKILLS', { ...headingStyle, y: 300 }),
    L('widgets, gadgets', { y: 320 }),
  ];
  const r = detectSections(lines);
  assert.deepEqual(keys(r), ['summary', 'experience', 'education', 'skills']);
  const exp = r.sections.find((s) => s.key === 'experience');
  assert.ok(
    exp.lines.some((l) => /Senior Widget Engineer/.test(l.text)),
    'the demoted title stays as body of its section',
  );
});
