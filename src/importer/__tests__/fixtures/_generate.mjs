/**
 * Fixture generator (dev tooling).
 *
 * Produces REAL, parseable fixture files whose contents match the sibling
 * `*.expected.json` targets:
 *   - 001-ats-single-column.pdf   single-column, full-width, ATS-style (jsPDF)
 *   - 002-canva-two-column.pdf    full-width header + left sidebar / right main (jsPDF)
 *   - 003-word-table-layout.docx  section headings + 2-col dates/content tables (docx)
 *
 * These are synthetic (fictional people, example.com). Regenerate with:
 *   node src/importer/__tests__/fixtures/_generate.mjs
 *
 * jsPDF resolves from the repo-root node_modules; docx from the app's.
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync } from 'node:fs';

import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';

const DIR = dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------ helpers */

const PAGE_W = 612; // US Letter, points
const MARGIN = 60;

/** A tiny cursor-based text placer over a jsPDF doc. */
function makePlacer(doc) {
  return {
    line(text, x, y, { size = 10, bold = false, caps = false } = {}) {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.text(caps ? text.toUpperCase() : text, x, y);
    },
    wrapped(text, x, y, width, lineH, { size = 10 } = {}) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, width);
      lines.forEach((ln, i) => doc.text(ln, x, y + i * lineH));
      return y + lines.length * lineH;
    },
  };
}

/* ------------------------------------------------- 001 single-column (PDF) */

function buildSingleColumn() {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const p = makePlacer(doc);
  const x = MARGIN;
  let y = 80;

  p.line('Amara Okafor', x, y, { size: 22, bold: true });
  y += 22;
  p.line('Senior Backend Engineer', x, y, { size: 13 });
  y += 20;
  p.line('amara.okafor@example.com | +254 712 345 678 | Nairobi, Kenya', x, y, { size: 10 });
  y += 15;
  p.line('linkedin.com/in/amaraokafor | github.com/amaraokafor', x, y, { size: 10 });
  y += 32;

  p.line('SUMMARY', x, y, { size: 12, bold: true });
  y += 16;
  y = p.wrapped(
    'Backend engineer with 7 years building payment and data platforms in fintech. ' +
      'Focused on reliability, clean APIs, and mentoring.',
    x,
    y,
    PAGE_W - 2 * MARGIN,
    13,
  );
  y += 20;

  p.line('EXPERIENCE', x, y, { size: 12, bold: true });
  y += 18;

  // Title on the left, date right-aligned on the SAME line — a big horizontal
  // gap that line assembly must read as a cell split (row), not a column.
  const dateX = 430;
  p.line('Senior Backend Engineer', x, y, { size: 11, bold: true });
  p.line('Jan 2021 - Present', dateX, y, { size: 10 });
  y += 14;
  p.line('Kopo Pay Ltd | Nairobi, Kenya', x, y, { size: 10 });
  y += 15;
  for (const b of [
    'Led migration of the payments ledger to an event-sourced design, cutting reconciliation errors by 90%.',
    'Owned the public REST API used by 40+ partner integrations.',
  ]) {
    y = p.wrapped('• ' + b, x + 10, y, PAGE_W - 2 * MARGIN - 10, 13);
  }
  y += 12;

  p.line('Backend Engineer', x, y, { size: 11, bold: true });
  p.line('Aug 2017 - Dec 2020', dateX, y, { size: 10 });
  y += 14;
  p.line('DataForge Solutions | Nairobi, Kenya', x, y, { size: 10 });
  y += 15;
  for (const b of [
    'Built ETL pipelines processing 2M events/day on a small team.',
    'Reduced p99 API latency from 800ms to 120ms.',
  ]) {
    y = p.wrapped('• ' + b, x + 10, y, PAGE_W - 2 * MARGIN - 10, 13);
  }
  y += 20;

  p.line('EDUCATION', x, y, { size: 12, bold: true });
  y += 18;
  p.line('BSc in Computer Science', x, y, { size: 11, bold: true });
  y += 14;
  p.line('University of Nairobi | Nairobi, Kenya | 2013 - 2017', x, y, { size: 10 });
  y += 14;
  p.line('First Class Honours', x, y, { size: 10 });
  y += 26;

  p.line('SKILLS', x, y, { size: 12, bold: true });
  y += 16;
  p.line('Python, Go, PostgreSQL, Kafka, Docker, Kubernetes, REST APIs', x, y, { size: 10 });

  writeFileSync(join(DIR, '001-ats-single-column.pdf'), Buffer.from(doc.output('arraybuffer')));
  console.log('wrote 001-ats-single-column.pdf');
}

/* ---------------------------------------------------- 002 two-column (PDF) */

function buildTwoColumn() {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const p = makePlacer(doc);

  // Full-width header.
  p.line('Liam Chen', MARGIN, 80, { size: 22, bold: true });
  p.line('Product Designer', MARGIN, 102, { size: 13 });
  p.line('liam.chen@example.com | +1 415 555 0134 | San Francisco, CA', MARGIN, 120, { size: 10 });

  // Two columns below a clear gutter (left ends ~205, right starts ~320).
  const LX = MARGIN; // left sidebar x
  const LW = 150;
  const RX = 320; // right main x
  const RW = PAGE_W - MARGIN - RX;

  // ---- left sidebar
  let ly = 160;
  p.line('CONTACT', LX, ly, { size: 12, bold: true });
  ly += 16;
  for (const t of [
    'liam.chen@example.com',
    '+1 415 555 0134',
    'San Francisco, CA',
    'liamchen.design',
    'linkedin.com/in/liamchen',
  ]) {
    ly = p.wrapped(t, LX, ly, LW, 13);
  }
  ly += 12;
  p.line('SKILLS', LX, ly, { size: 12, bold: true });
  ly += 16;
  p.line('Design', LX, ly, { size: 10, bold: true });
  ly += 13;
  ly = p.wrapped('Figma, Prototyping, Design Systems, User Research', LX, ly, LW, 13);
  ly += 6;
  p.line('Frontend', LX, ly, { size: 10, bold: true });
  ly += 13;
  ly = p.wrapped('HTML, CSS, React', LX, ly, LW, 13);
  ly += 12;
  p.line('LANGUAGES', LX, ly, { size: 12, bold: true });
  ly += 16;
  p.line('English (Native)', LX, ly, { size: 10 });
  ly += 13;
  p.line('Mandarin (Fluent)', LX, ly, { size: 10 });

  // ---- right main
  let ry = 160;
  p.line('SUMMARY', RX, ry, { size: 12, bold: true });
  ry += 16;
  ry = p.wrapped(
    'Product designer blending research and visual craft to ship consumer apps used by millions.',
    RX,
    ry,
    RW,
    13,
  );
  ry += 16;

  p.line('EXPERIENCE', RX, ry, { size: 12, bold: true });
  ry += 18;
  p.line('Senior Product Designer', RX, ry, { size: 11, bold: true });
  ry += 14;
  p.line('Brightloop Inc | San Francisco, CA | 2020 - Present', RX, ry, { size: 9 });
  ry += 15;
  for (const b of [
    'Redesigned onboarding, lifting activation 22%.',
    'Built and maintained the design system across web and mobile.',
  ]) {
    ry = p.wrapped('• ' + b, RX + 8, ry, RW - 8, 13);
  }
  ry += 12;
  p.line('Product Designer', RX, ry, { size: 11, bold: true });
  ry += 14;
  p.line('Novaquest | Remote | 2018 - 2020', RX, ry, { size: 9 });
  ry += 15;
  ry = p.wrapped('• Shipped 3 major features from research to launch.', RX + 8, ry, RW - 8, 13);
  ry += 16;

  p.line('EDUCATION', RX, ry, { size: 12, bold: true });
  ry += 18;
  p.line('BFA in Graphic Design', RX, ry, { size: 11, bold: true });
  ry += 14;
  p.line('Rhode Island School of Design | Providence, RI | 2014 - 2018', RX, ry, { size: 9 });

  writeFileSync(join(DIR, '002-canva-two-column.pdf'), Buffer.from(doc.output('arraybuffer')));
  console.log('wrote 002-canva-two-column.pdf');
}

/* --------------------------------------------------- 003 table DOCX (docx) */

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

function cell(children, widthPct) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    children,
  });
}

function para(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, bold: !!opts.bold })], ...opts.paraOpts });
}

function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 } });
}

/** A dates|content two-column row — the table-layout trap Phase 2 must survive. */
function entryTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: rows.map(
      ([dates, contentChildren]) =>
        new TableRow({
          children: [
            cell([para(dates)], 25),
            cell(contentChildren, 75),
          ],
        }),
    ),
  });
}

async function buildTableDocx() {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('Priya Nair')] }),
          para('Project Manager'),
          para('priya.nair@example.com | +44 20 7946 0958 | London, UK'),
          para('linkedin.com/in/priyanair'),

          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Summary')] }),
          para(
            'PMP-certified project manager delivering enterprise software programs on time and under budget.',
          ),

          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Experience')] }),
          entryTable([
            [
              '2019 - Present',
              [
                para('Senior Project Manager', { bold: true }),
                para('Meridian Consulting — London, UK'),
                bullet('Managed a 3M GBP digital transformation across 5 teams.'),
                bullet('Introduced agile ceremonies that cut cycle time 30%.'),
              ],
            ],
            [
              '2016 - 2019',
              [
                para('Project Coordinator', { bold: true }),
                para('Acme Corp — Manchester, UK'),
                bullet('Coordinated vendor deliverables across 12 concurrent projects.'),
              ],
            ],
          ]),

          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Education')] }),
          entryTable([
            [
              '2012 - 2016',
              [
                para('BA in Business Management', { bold: true }),
                para('University of Manchester — Manchester, UK'),
                para('Grade: 2:1'),
              ],
            ],
          ]),

          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Skills')] }),
          para('Agile, Scrum, Stakeholder Management, Budgeting, JIRA, Risk Management'),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun('Certifications')],
          }),
          para('PMP — PMI — 2018'),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  writeFileSync(join(DIR, '003-word-table-layout.docx'), buf);
  console.log('wrote 003-word-table-layout.docx');
}

/* ------------------------------------------------------------------- main */

buildSingleColumn();
buildTwoColumn();
await buildTableDocx();
console.log('done');
