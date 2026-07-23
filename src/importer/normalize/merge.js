/**
 * Wrapped-line merging + de-hyphenation.
 *
 * PDF and DOCX both split a single sentence across visual lines. We stitch those
 * back together — but conservatively, because a wrongly-merged heading destroys
 * a whole section, while a wrongly-split bullet is only a cosmetic annoyance.
 *
 * A line merges into the previous one only when ALL hold:
 *   - previous does not end with . ! ? : ;
 *   - current starts lowercase, or with a conjunction/preposition
 *   - current is not a bullet
 *   - current is not a heading candidate (conservative local check; the real
 *     Phase 4 scorer supersedes this once it exists)
 *   - current contains no date range (conservative local check; Phase 5's
 *     patterns/dates.js supersedes it)
 *   - both lines are in the same column and their left indent differs < 6pt
 *   - current.spaceAbove < 1.3 line-heights
 * De-hyphenation ("encour-" + "aged" -> "encouraged") is a strong enough signal
 * to merge on its own.
 *
 * A hard paragraph boundary (spaceAbove > 1.6) can never be crossed.
 *
 * Pure: Line[] in, Line[] out (new objects; inputs not mutated).
 */

/**
 * @typedef {import('../layout/lines.js').Line} Line
 */

import { findDateRanges } from '../patterns/dates.js';

const HARD_BREAK = 1.6;
// Single-spaced wrapped text sits around 1.15–1.35 line-heights; the hard
// paragraph break is 1.6, so we merge up to 1.45 and leave a gap between.
const SOFT_LIMIT = 1.45;
const INDENT_TOLERANCE = 6; // pt

const CONNECTORS = new Set([
  'and', 'or', 'but', 'nor', 'for', 'so', 'yet', 'to', 'of', 'in', 'on', 'at',
  'by', 'with', 'from', 'as', 'the', 'a', 'an', 'that', 'which', 'who', 'into',
  'over', 'under', 'per', 'via', 'using', 'including',
]);

const DEHYPHEN_PREV = /[a-z]-$/;
const DEHYPHEN_CUR = /^[a-z]/;

/**
 * Merge wrapped lines across a `Line[]`.
 * @param {Line[]} lines
 * @returns {Line[]}
 */
export function mergeWrappedLines(lines) {
  /** @type {Line[]} */
  const out = [];
  for (const line of lines) {
    const prev = out[out.length - 1];
    if (prev && shouldMerge(prev, line)) {
      out[out.length - 1] = joinLines(prev, line);
    } else {
      out.push({ ...line });
    }
  }
  return out;
}

/**
 * @param {Line} prev
 * @param {Line} cur
 * @returns {boolean}
 */
function shouldMerge(prev, cur) {
  if (cur.spaceAbove > HARD_BREAK) return false; // never cross a paragraph break
  if (prev.page !== cur.page || prev.column !== cur.column) return false;

  // De-hyphenation is a strong standalone trigger.
  if (DEHYPHEN_PREV.test(prev.text) && DEHYPHEN_CUR.test(cur.text)) return true;

  if (/[.!?:;]$/.test(prev.text.trim())) return false;
  if (cur.isBullet) return false;
  if (!startsLowerOrConnector(cur.text)) return false;
  if (isHeadingish(cur)) return false;
  if (hasDateRange(cur.text)) return false;
  if (Math.abs(prev.x - cur.x) >= INDENT_TOLERANCE) return false;
  if (cur.spaceAbove >= SOFT_LIMIT) return false;
  return true;
}

/**
 * @param {Line} prev
 * @param {Line} cur
 * @returns {Line}
 */
function joinLines(prev, cur) {
  const dehyphen = DEHYPHEN_PREV.test(prev.text) && DEHYPHEN_CUR.test(cur.text);
  const join = (a, b) => (dehyphen ? a.replace(/-$/, '') + b : `${a} ${b}`);
  const text = join(prev.text, cur.text);
  const displayText =
    prev.displayText !== undefined || cur.displayText !== undefined
      ? join(prev.displayText ?? prev.text, cur.displayText ?? cur.text)
      : undefined;
  const merged = {
    ...prev,
    text,
    xEnd: Math.max(prev.xEnd, cur.xEnd),
    allCaps: prev.allCaps && cur.allCaps,
  };
  if (displayText !== undefined) merged.displayText = displayText;
  return merged;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function startsLowerOrConnector(text) {
  const first = text.trim().split(/\s+/)[0] || '';
  if (/^[a-z]/.test(first)) return true;
  return CONNECTORS.has(first.toLowerCase().replace(/[^a-z]/g, ''));
}

/**
 * Conservative heading guard — a stand-in for the Phase 4 scorer at ~threshold
 * minus one. Kept deliberately loose so genuine headings are never merged.
 * @param {Line} line
 * @returns {boolean}
 */
function isHeadingish(line) {
  if (/heading|title/i.test(line.styleName || '')) return true;
  const words = line.text.trim().split(/\s+/).length;
  if (line.bodyRatio >= 1.15) return true;
  if (line.allCaps && line.text.trim().length > 2) return true;
  if (line.bold && words <= 4) return true;
  if (/:$/.test(line.text.trim())) return true;
  return false;
}

/**
 * A line carries a date — never merge a date line into prose above it. Uses the
 * Phase 5 matcher (this replaces the earlier conservative stand-in).
 * @param {string} text
 * @returns {boolean}
 */
function hasDateRange(text) {
  return findDateRanges(text).length > 0;
}
