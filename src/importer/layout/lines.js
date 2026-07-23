/**
 * Line assembly — PositionedItem[] -> Line[].
 *
 * Runs AFTER `assignColumns` has tagged each item with a reading-order group
 * ('A' header / 'L' left / 'R' right / 'B' footer). We assemble lines within
 * each (page, group) so same-y items in different columns never fuse, then emit
 * groups in reading order A, L, R, B per page.
 *
 * pdf.js gives positioned glyph runs, not lines. Within a group we cluster
 * items by vertical position (tolerance scaled to font size, never a fixed
 * pixel value) and, per line, join runs left-to-right with two decisions:
 *   - insert a space when the gap exceeds ~0.9 char widths (else "developer"
 *     would fuse from "de"+"vel"+"oper", and "SeniorDeveloper" would never get
 *     its space);
 *   - record a CELL boundary when the gap exceeds ~3 char widths (right-aligned
 *     dates on a title line are a row split, not a column).
 *
 * Pure: input items + page metadata, output lines. No React, no DOM.
 */

import { READING_GROUPS } from './columns.js';

/**
 * @typedef {import('./columns.js').TaggedItem} PositionedItem
 * @typedef {import('../extract/pdf.js').PageMeta} PageMeta
 */

/**
 * @typedef {Object} Line
 * @property {string} text
 * @property {string[]} cells      // segments split at large horizontal gaps
 * @property {number} x            // left edge
 * @property {number} xEnd
 * @property {number} y
 * @property {number} fontSize     // max in line
 * @property {number} bodyRatio    // fontSize / page median font size
 * @property {boolean} bold
 * @property {boolean} allCaps
 * @property {boolean} isBullet    // set in Phase 3 normalization; false here
 * @property {number} spaceAbove   // gap to previous line, in line-heights
 * @property {number} page
 * @property {number} column       // filled by columns.js; 0 here
 */

const SPACE_GAP = 0.9; // char widths
const CELL_GAP = 3.0; // char widths

/**
 * Assemble lines for all pages, emitting each page's reading-order groups
 * (A header, L left, R right, B footer) in order. Items must already be tagged
 * by `assignColumns`.
 * @param {PositionedItem[]} items
 * @param {PageMeta[]} pages
 * @returns {Line[]}
 */
export function assembleLines(items, pages) {
  /** @type {Line[]} */
  const out = [];
  for (const page of pages) {
    for (const group of READING_GROUPS) {
      const groupItems = items.filter((i) => i.page === page.page && (i.group || 'A') === group);
      if (!groupItems.length) continue;
      const column = group === 'R' ? 1 : 0;
      const lines = assemblePageLines(groupItems, page);
      for (const l of lines) {
        l.column = column;
        out.push(l);
      }
    }
  }
  return out;
}

/**
 * @param {PositionedItem[]} pageItems
 * @param {PageMeta} page
 * @returns {Line[]}
 */
function assemblePageLines(pageItems, page) {
  const tol = 0.4 * page.medianFontSize;

  // Cluster into rows by y. Sort by y, group while within tolerance of the
  // running cluster mean.
  const byY = pageItems.slice().sort((a, b) => a.y - b.y);
  /** @type {PositionedItem[][]} */
  const clusters = [];
  let current = null;
  let refY = 0;
  for (const it of byY) {
    if (current && Math.abs(it.y - refY) <= tol) {
      current.push(it);
      refY = (refY * (current.length - 1) + it.y) / current.length;
    } else {
      current = [it];
      clusters.push(current);
      refY = it.y;
    }
  }

  /** @type {Line[]} */
  const lines = clusters.map((cluster) => buildLine(cluster, page));
  lines.sort((a, b) => a.y - b.y);

  // spaceAbove: baseline-to-baseline gap in line-heights (≈ font size). The
  // first line on a page has no predecessor.
  for (let i = 0; i < lines.length; i += 1) {
    if (i === 0) {
      lines[i].spaceAbove = 99;
    } else {
      const gap = lines[i].y - lines[i - 1].y;
      lines[i].spaceAbove = gap / Math.max(page.medianFontSize, 1);
    }
  }

  return lines.filter((l) => l.text.trim() !== '');
}

/**
 * @param {PositionedItem[]} cluster
 * @param {PageMeta} page
 * @returns {Line}
 */
function buildLine(cluster, page) {
  // Drop whitespace-only runs: pdf.js often emits a single " " item whose width
  // spans a whole gap (e.g. between a title and a right-aligned date). Keeping
  // it would bridge the gap (hiding the cell boundary) and, being 1 char wide
  // by hundreds of px, wreck the avgChar heuristic. The real x-coordinates of
  // the surrounding runs already encode the gap, so we rely on those.
  const runs = cluster.filter((r) => r.str.trim() !== '').sort((a, b) => a.x - b.x);
  if (!runs.length) {
    return emptyLine(page);
  }

  let text = '';
  /** @type {string[]} */
  const cells = [];
  let cellBuf = '';
  let prevEnd = null;
  let prev = null;

  for (const r of runs) {
    if (prev !== null && prevEnd !== null) {
      const gap = r.x - prevEnd;
      const avgChar = prev.width / Math.max(prev.str.length, 1) || prev.fontSize * 0.5;
      const needsSpace = gap > SPACE_GAP * avgChar;
      const cellBoundary = gap > CELL_GAP * avgChar;
      if (cellBoundary) {
        cells.push(cellBuf.trim());
        cellBuf = '';
      }
      if (needsSpace && !text.endsWith(' ') && !r.str.startsWith(' ')) {
        text += ' ';
        if (!cellBoundary) cellBuf += ' ';
      }
    }
    text += r.str;
    cellBuf += r.str;
    prev = r;
    prevEnd = r.x + r.width;
  }
  if (cellBuf.trim() !== '') cells.push(cellBuf.trim());

  text = text.replace(/\s+/g, ' ').trim();

  const fontSize = Math.max(...runs.map((r) => r.fontSize));
  const x = Math.min(...runs.map((r) => r.x));
  const xEnd = Math.max(...runs.map((r) => r.x + r.width));

  // Bold when the majority of characters are in a bold run.
  let boldChars = 0;
  let totalChars = 0;
  for (const r of runs) {
    const n = r.str.trim().length;
    totalChars += n;
    if (r.bold) boldChars += n;
  }
  const bold = totalChars > 0 && boldChars * 2 >= totalChars;

  const letters = text.replace(/[^a-z]/gi, '');
  const allCaps = letters.length >= 2 && text === text.toUpperCase() && /[A-Z]/.test(text);

  return {
    text,
    cells: cells.filter((c) => c !== ''),
    x,
    xEnd,
    y: runs.reduce((a, r) => a + r.y, 0) / runs.length,
    fontSize,
    bodyRatio: fontSize / Math.max(page.medianFontSize, 1),
    bold,
    allCaps,
    isBullet: false,
    spaceAbove: 99,
    page: page.page,
    column: 0,
  };
}

/**
 * A blank line (all runs were whitespace) — filtered out downstream.
 * @param {PageMeta} page
 * @returns {Line}
 */
function emptyLine(page) {
  return {
    text: '',
    cells: [],
    x: 0,
    xEnd: 0,
    y: 0,
    fontSize: page.medianFontSize,
    bodyRatio: 1,
    bold: false,
    allCaps: false,
    isBullet: false,
    spaceAbove: 99,
    page: page.page,
    column: 0,
  };
}
