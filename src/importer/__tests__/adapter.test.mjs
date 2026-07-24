/**
 * Phase 8 test — the Resume -> app-model adapter.
 *
 *   node --test src/importer/__tests__/adapter.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { importResume } from '../index.js';
import { toAppResume } from '../../utils/importAdapter.js';

const DIR = dirname(fileURLToPath(import.meta.url));
function fileLike(name) {
  const buf = readFileSync(join(DIR, 'fixtures', name));
  return { name, arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
}

test('adapter maps a fixture into the app model shape', async () => {
  const { resume } = await importResume(fileLike('001-ats-single-column.pdf'), { pdfjs });
  const app = toAppResume(resume);

  // basics keys the editor expects
  assert.deepEqual(Object.keys(app.basics).sort(), ['address', 'email', 'name', 'phone', 'title']);
  assert.equal(app.basics.name, 'Amara Okafor');
  assert.equal(app.basics.email, 'amara.okafor@example.com');

  // sections carry the required base fields + kind-specific payloads
  const exp = app.sections.find((s) => s.type === 'experience');
  assert.ok(exp, 'experience section present');
  assert.equal(exp.kind, 'entries');
  assert.ok(exp.entries.length >= 2);
  for (const e of exp.entries) {
    for (const k of ['id', 'heading', 'subheading', 'start', 'end', 'description', 'hidden']) {
      assert.ok(k in e, `entry has ${k}`);
    }
    assert.match(e.description, /<li>/, 'bullets became <li>');
  }

  const skills = app.sections.find((s) => s.type === 'skills');
  assert.equal(skills.kind, 'tags');
  assert.ok(Array.isArray(skills.tags) && skills.tags.includes('Python'));
});

test('adapter attaches _import with rawText-less meta and review flags', async () => {
  const { resume } = await importResume(fileLike('002-canva-two-column.pdf'), { pdfjs });
  const app = toAppResume(resume);
  assert.ok(app._import, '_import present');
  assert.equal(typeof app._import.overallConfidence, 'number');
  assert.ok(Array.isArray(app._import.flags));
  assert.equal(app._import.flagCount, app._import.flags.length);
  // Novaquest's company was recovered by tiebreak (< 0.7) -> should be flagged.
  assert.ok(
    app._import.flags.some((f) => /company/i.test(f.label)),
    'a low-confidence company field is flagged for review',
  );
  for (const f of app._import.flags) assert.ok(f.confidence < 0.7);
});

test('a corrupt/undecodable PDF never throws — returns an empty resume + warning', async () => {
  const garbage = {
    name: 'broken.pdf',
    arrayBuffer: async () => new TextEncoder().encode('%PDF-1.4 not really a pdf').buffer,
  };
  const { resume, rawText } = await importResume(garbage, { pdfjs });
  assert.ok(resume && resume.basics, 'still returns a resume');
  assert.ok(resume._meta.warnings.length > 0, 'explains what broke');
  // The adapter tolerates it too (empty, valid app model).
  const app = toAppResume(resume);
  assert.equal(typeof app.basics.name, 'string');
  assert.equal(typeof rawText, 'string');
});

test('custom sections survive into the app model as editable text blocks', async () => {
  const { resume } = await importResume(fileLike('002-canva-two-column.pdf'), { pdfjs });
  const app = toAppResume(resume);
  const custom = app.sections.filter((s) => s.type === 'custom');
  assert.ok(custom.length >= 1, 'CONTACT custom section carried over');
  assert.ok(custom.every((c) => c.kind === 'text' && typeof c.content === 'string'));
});
