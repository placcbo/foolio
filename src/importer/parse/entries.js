/**
 * Date-anchored entry segmentation — shared by experience / education /
 * projects. Splits a section's lines into entry blocks anchored on dates (or a
 * bold, short, non-bullet header line).
 *
 * Algorithm (from the spec):
 *  1. Mark anchors: a line with a date range, or a bold non-bullet line of <= 8
 *     words.
 *  2. An anchor starts a new entry UNLESS the current entry is still in its
 *     header (no body yet) and this anchor is within 2 lines of the last — that
 *     is one entry whose title/company/dates are spread across lines.
 *  3. Bullets always attach to the current entry.
 *  4. Lines before the first anchor: 1-2 attach to the first entry; more become
 *     section intro.
 *  5. No anchors at all: fall back to a single entry with confidence 0.4.
 *
 * Pure: Line[] in, { entries, intro } out.
 */

import { findDateRanges } from '../patterns/dates.js';

/**
 * @typedef {import('../layout/lines.js').Line} Line
 * @typedef {import('../patterns/dates.js').DateMatch} DateMatch
 */

/**
 * @typedef {Object} EntryBlock
 * @property {Line[]} lines
 * @property {number} anchorLine   // index into the section lines, -1 if none
 * @property {DateMatch|null} dates
 * @property {number} confidence
 */

const HEADER_MAX_WORDS = 8;
const HEADER_GAP = 2;

/**
 * @param {Line} line
 * @returns {DateMatch|null}
 */
export function lineDate(line) {
  const inText = findDateRanges(line.text);
  if (inText.length) return inText[0];
  for (const c of line.cells || []) {
    const inCell = findDateRanges(c);
    if (inCell.length) return inCell[0];
  }
  return null;
}

/**
 * @param {Line} line
 * @returns {boolean}
 */
function isAnchor(line) {
  if (lineDate(line)) return true;
  const words = line.text.trim() ? line.text.trim().split(/\s+/).length : 0;
  return line.bold && !line.isBullet && words > 0 && words <= HEADER_MAX_WORDS;
}

/**
 * A short, non-bullet line that is still part of an entry's header (company /
 * location / a second title line), as opposed to body prose.
 * @param {Line} line
 * @returns {boolean}
 */
function isHeaderish(line) {
  const words = line.text.trim() ? line.text.trim().split(/\s+/).length : 0;
  return !line.isBullet && words <= HEADER_MAX_WORDS;
}

/**
 * Segment a section's lines into entry blocks.
 * @param {Line[]} lines
 * @returns {{ entries: EntryBlock[], intro: Line[] }}
 */
export function segmentEntries(lines) {
  /** @type {EntryBlock[]} */
  const entries = [];
  /** @type {Line[]} */
  let intro = [];
  let current = null;
  let inHeader = false;
  let lastAnchorIdx = -Infinity;

  lines.forEach((line, i) => {
    if (isAnchor(line)) {
      if (current && inHeader && i - lastAnchorIdx <= HEADER_GAP) {
        // Same entry: a multi-line header (title / company / dates).
        current.lines.push(line);
      } else {
        // Look-back: a title line that PRECEDES a date anchor (common when bold
        // can't be detected, so the title isn't itself an anchor) gets attached
        // to the previous entry. If that entry already has body (a bullet), pull
        // its trailing short header line(s) into this new entry instead.
        const stolen = reclaimHeaderTail(current);
        current = { lines: [...stolen, line], anchorLine: i, dates: null, confidence: 0.75 };
        entries.push(current);
        inHeader = true;
      }
      lastAnchorIdx = i;
    } else if (current) {
      current.lines.push(line);
      // A bullet, or any line that isn't a short header line, ends the header.
      if (line.isBullet || !isHeaderish(line)) inHeader = false;
    } else {
      intro.push(line);
    }
  });

  for (const e of entries) e.dates = firstDate(e.lines);

  if (entries.length === 0 && lines.length) {
    // No anchors: treat the whole section as a single low-confidence entry.
    entries.push({ lines: lines.slice(), anchorLine: -1, dates: firstDate(lines), confidence: 0.4 });
    intro = [];
  } else if (entries.length && intro.length && intro.length <= 2) {
    // A short lead (1-2 lines) belongs to the first entry, not the section.
    entries[0].lines = intro.concat(entries[0].lines);
    intro = [];
  }

  return { entries, intro };
}

/**
 * Reclaim the trailing short header line(s) of the previous entry for a new one.
 * Only when that entry already has body (a bullet) — otherwise its trailing
 * lines are its own header. Stops at the first bullet; takes at most 2 lines.
 * @param {EntryBlock|null} entry
 * @returns {Line[]}
 */
function reclaimHeaderTail(entry) {
  if (!entry || !entry.lines.some((l) => l.isBullet)) return [];
  /** @type {Line[]} */
  const stolen = [];
  while (entry.lines.length > 1 && stolen.length < 2) {
    const last = entry.lines[entry.lines.length - 1];
    if (last.isBullet) break;
    const words = last.text.trim() ? last.text.trim().split(/\s+/).length : 0;
    if (words > HEADER_MAX_WORDS) break;
    stolen.unshift(entry.lines.pop());
  }
  return stolen;
}

/**
 * @param {Line[]} lines
 * @returns {DateMatch|null}
 */
function firstDate(lines) {
  for (const l of lines) {
    const d = lineDate(l);
    if (d) return d;
  }
  return null;
}
