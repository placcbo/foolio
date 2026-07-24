/**
 * Phase 7 acceptance test — remaining parsers + assembly.
 *
 *   node --test src/importer/__tests__/parsers.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { parseBasics } from '../parse/basics.js';
import { parseEducation } from '../parse/education.js';
import { parseSkills } from '../parse/skills.js';
import { parseProjects } from '../parse/projects.js';
import { parseCertifications } from '../parse/certifications.js';
import { parseLanguages } from '../parse/languages.js';
import { parseAwards } from '../parse/awards.js';
import { parseInterests } from '../parse/interests.js';
import { parseReferences } from '../parse/references.js';
import { assembleResume } from '../parse/assemble.js';
import { validateResume } from '../schema/resume.js';
import { runPdfPipeline } from '../index.js';
import { extractDocx } from '../extract/docx.js';
import { normalizeLines } from '../normalize/index.js';
import { detectSections } from '../detect/sections.js';

const DIR = dirname(fileURLToPath(import.meta.url));
const bytes = (n) => new Uint8Array(readFileSync(join(DIR, 'fixtures', n)));

function L(text, over = {}) {
  return {
    text, displayText: text, cells: [], x: 60, xEnd: 300, y: 100, fontSize: 11,
    bodyRatio: 1, bold: false, allCaps: false, isBullet: false, spaceAbove: 1.2,
    page: 1, column: 0, styleName: '', source: '', ...over,
  };
}

/* ---------------------------------------------------------------- basics */

test('basics: plain contact block', () => {
  const { basics } = parseBasics([
    L('Jane Doe', { fontSize: 20, y: 40 }),
    L('jane.doe@example.com | +1 415 555 0134 | Boston, MA', { y: 60 }),
    L('linkedin.com/in/janedoe', { y: 72 }),
  ]);
  assert.equal(basics.name, 'Jane Doe');
  assert.equal(basics.email, 'jane.doe@example.com');
  assert.match(basics.phone, /555 0134/);
  assert.equal(basics.location, 'Boston, MA');
  assert.equal(basics.linkedin, 'https://linkedin.com/in/janedoe');
});

test('basics: icon-glyph trap does not hide the email', () => {
  const { basics } = parseBasics([
    L('Jane Doe', { fontSize: 20, y: 40 }),
    L(' jane.doe@example.com', { y: 60 }),
    L(' +254 712 345 678', { y: 72 }),
  ]);
  assert.equal(basics.email, 'jane.doe@example.com');
  assert.match(basics.phone, /712 345 678/);
});

test('basics: Title-styled name + role headline (docx-like)', () => {
  const { basics } = parseBasics([
    L('Priya Nair', { styleName: 'Title', fontSize: 11, y: 20 }),
    L('Project Manager', { y: 35 }),
  ]);
  assert.equal(basics.name, 'Priya Nair');
  assert.equal(basics.headline, 'Project Manager');
});

/* ------------------------------------------------------------- education */

test('education: three variants classify degree/field/grade', () => {
  const a = parseEducation([
    L('BSc in Computer Science', { bold: true }),
    L('University of Nairobi | Nairobi, Kenya | 2013 - 2017'),
    L('First Class Honours'),
  ]).items[0];
  assert.match(a.degree, /BSc/);
  assert.equal(a.field, 'Computer Science');
  assert.match(a.institution, /University of Nairobi/);
  assert.equal(a.grade, 'First Class Honours');

  const b = parseEducation([
    L('Bachelor of Arts, Economics', { bold: true }),
    L('Boston University | 2014 - 2018'),
    L('GPA 3.8/4.0'),
  ]).items[0];
  assert.match(b.degree, /Bachelor of Arts/);
  assert.equal(b.field, 'Economics');
  assert.match(b.grade, /3\.8\/4\.0/);

  const c = parseEducation([
    L('Master of Science in Data Science — Stanford University — 2019-2021', { bold: true }),
  ]).items[0];
  assert.match(c.degree, /Master of Science/);
  assert.equal(c.field, 'Data Science');
  assert.match(c.institution, /Stanford University/);
});

/* ---------------------------------------------------------------- skills */

test('skills: ungrouped, grouped, and slash-term guarded', () => {
  const u = parseSkills([L('Python, Go, PostgreSQL, Kafka')]).groups;
  assert.deepEqual(u[0].items, ['Python', 'Go', 'PostgreSQL', 'Kafka']);

  const g = parseSkills([L('Design: Figma, Prototyping'), L('Frontend: HTML, CSS, React')]).groups;
  assert.equal(g.length, 2);
  assert.equal(g[0].category, 'Design');
  assert.deepEqual(g[1].items, ['HTML', 'CSS', 'React']);

  const t = parseSkills([L('CI/CD, TCP/IP, Docker/Kubernetes, Python (Advanced)')]).groups[0].items;
  assert.ok(t.includes('CI/CD'), 'CI/CD not split');
  assert.ok(t.includes('TCP/IP'), 'TCP/IP not split');
  assert.ok(t.includes('Docker') && t.includes('Kubernetes'), 'genuine / split');
  assert.ok(t.includes('Python') && !t.some((s) => /advanced/i.test(s)), 'proficiency trimmed');
});

/* -------------------------------------------------------------- projects */

test('projects: name / technologies / url across variants', () => {
  const a = parseProjects([
    L('Payment API — a resilient ledger', { bold: true }),
    L('Cut reconciliation errors by 90%.', { isBullet: true }),
    L('Tech: Go, PostgreSQL'),
  ]).items[0];
  assert.equal(a.name, 'Payment API');
  assert.deepEqual(a.technologies, ['Go', 'PostgreSQL']);
  assert.equal(a.bullets.length, 1);

  const b = parseProjects([L('Chatbot (Python, Flask)', { bold: true })]).items[0];
  assert.equal(b.name, 'Chatbot');
  assert.deepEqual(b.technologies, ['Python', 'Flask']);

  const c = parseProjects([L('Portfolio | mysite.com', { bold: true })]).items[0];
  assert.equal(c.name, 'Portfolio');
  assert.match(c.url, /mysite\.com/);
});

/* --------------------------------------------------------- certifications */

test('certifications: name / issuer / date across variants', () => {
  const a = parseCertifications([L('PMP – PMI – 2018')]).items[0];
  assert.equal(a.name, 'PMP');
  assert.equal(a.issuer, 'PMI');
  assert.equal(a.date, '2018');

  const b = parseCertifications([
    L('AWS Certified Solutions Architect | Amazon | Issued Mar 2022'),
  ]).items[0];
  assert.match(b.name, /AWS Certified Solutions Architect/);
  assert.equal(b.issuer, 'Amazon');
  assert.match(b.date, /Mar 2022/);

  const c = parseCertifications([L('Scrum Master by Scrum Alliance')]).items[0];
  assert.equal(c.name, 'Scrum Master');
  assert.equal(c.issuer, 'Scrum Alliance');
});

/* -------------------------------------------------------------- languages */

test('languages: parenthesized, delimited, and bare variants', () => {
  assert.deepEqual(parseLanguages([L('English (Fluent)')]).items[0], { name: 'English', level: 'Fluent' });

  const two = parseLanguages([L('English: Native'), L('French — Conversational')]).items;
  assert.equal(two.length, 2);
  assert.equal(two[0].level, 'Native');
  assert.equal(two[1].name, 'French');

  const bare = parseLanguages([L('English, Swahili')]).items;
  assert.deepEqual(bare.map((l) => l.name), ['English', 'Swahili']);
});

/* --------------------------------------------------------- awards/interests */

test('awards + interests parse into their shapes', () => {
  const aw = parseAwards([L('Employee of the Year – Acme Corp – 2021')]).items[0];
  assert.equal(aw.title, 'Employee of the Year');
  assert.equal(aw.issuer, 'Acme Corp');
  assert.equal(aw.date, '2021');

  const int = parseInterests([L('Hiking, Photography, Chess')]).items;
  assert.deepEqual(int, ['Hiking', 'Photography', 'Chess']);
});

/* ------------------------------------------------------------- references */

test('references: available-on-request is flagged, not a fake person', () => {
  const r = parseReferences([L('References available upon request')]);
  assert.equal(r.availableOnRequest, true);
  assert.equal(r.items.length, 0);
});

test('references: a real referee parses name/title/company/email', () => {
  const r = parseReferences([
    L('John Smith'),
    L('Engineering Manager, Acme Inc'),
    L('john.smith@example.com'),
  ]);
  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].name, 'John Smith');
  assert.equal(r.items[0].title, 'Engineering Manager');
  assert.equal(r.items[0].company, 'Acme Inc');
  assert.equal(r.items[0].email, 'john.smith@example.com');
});

/* --------------------------------------------------- assembly on fixtures */

async function assembleFixture(name, kind) {
  const { lines } =
    kind === 'pdf' ? await runPdfPipeline(bytes(name), pdfjs) : await extractDocx(bytes(name));
  return assembleResume(detectSections(normalizeLines(lines))).resume;
}

test('assembly: fixtures produce a valid resume; nothing lands in unparsed', async () => {
  for (const [name, kind, expectName] of [
    ['001-ats-single-column.pdf', 'pdf', 'Amara Okafor'],
    ['002-canva-two-column.pdf', 'pdf', 'Liam Chen'],
    ['003-word-table-layout.docx', 'docx', 'Priya Nair'],
  ]) {
    const resume = await assembleFixture(name, kind);
    assert.deepEqual(validateResume(resume), [], `${name} is structurally valid`);
    assert.equal(resume.basics.name, expectName, `${name} name`);
    assert.ok(resume.basics.email, `${name} email`);
    assert.equal(resume.experience.length, 2, `${name} experience count`);
    assert.ok(resume.skills.length > 0, `${name} skills`);
    assert.deepEqual(resume._meta.unparsed, [], `${name} nothing unparsed`);
  }
});

test('assembly: an unknown heading is preserved in resume.custom', async () => {
  const resume = await assembleFixture('002-canva-two-column.pdf', 'pdf');
  assert.ok(
    resume.custom.some((c) => /contact/i.test(c.heading)),
    'the CONTACT section is kept as custom',
  );
});
