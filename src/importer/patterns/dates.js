/**
 * Date patterns — the highest-precision signal in the importer. Everything in
 * entry segmentation and the experience/education parsers anchors on these, so
 * they are built conservatively and tested hard.
 *
 * `findDateRanges(text)` returns every date range or single date it finds:
 *   { start, end, current, rawText, confidence, index }
 * where start/end are ISO-ish "YYYY" or "YYYY-MM" (or null), current is true for
 * open-ended ranges, and confidence drops to 0.5 for ambiguous numeric dates we
 * refuse to guess (e.g. "03/04/2019" — US vs EU).
 *
 * Pure string functions.
 */

import { monthNumber, MONTH_ALT } from './dictionaries/months.js';

/**
 * @typedef {Object} DateMatch
 * @property {string|null} start
 * @property {string|null} end
 * @property {boolean} current
 * @property {string} rawText
 * @property {number} confidence
 * @property {number} index
 * @property {boolean} [ambiguous]
 */

const SEASON = 'spring|summer|fall|autumn|winter';

// A single date "point". Ordered longest/most-specific first so e.g. an ISO
// "2019-03" is not truncated to the bare year "2019".
const POINT_SRC = [
  `(?:${SEASON})\\s+\\d{4}(?:\\s*/\\s*\\d{2,4})?`, // Fall 2019, Winter 2019/20
  `(?:${MONTH_ALT})\\.?\\s+\\d{4}`, // Jan 2019, janvier 2019
  `\\d{4}[-/](?:0?[1-9]|1[0-2])(?!\\d)`, // 2019-03 (not 2019-2021, a year range)
  `(?:0?[1-9]|1[0-2])/\\d{4}`, // 03/2019
  `\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{4}`, // 03/04/2019 (ambiguous)
  `(?:19|20)\\d{2}`, // 2019
].join('|');

// Sticky (y) regexes: matched only at an exact scan position.
const reTwoDigit = /((?:19|20)\d{2})\s*[-–—]\s*(\d{2})(?!\d)/y; // 2019–21
const rePoint = new RegExp(POINT_SRC, 'iy');
const reSep = /\s*(?:–|—|-|~|\||to\b|until\b|through\b)\s*/iy;
const rePresent = /(?:present|current|now|ongoing|to\s?date)\b/iy;

function matchAt(re, str, pos) {
  re.lastIndex = pos;
  const m = re.exec(str);
  return m && m.index === pos ? m : null;
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Parse one already-isolated date point.
 * @param {string} str
 * @returns {{ iso: string, confidence: number, ambiguous?: boolean }}
 */
function parsePoint(str) {
  const s = str.trim();
  if (new RegExp(`^(?:${SEASON})`, 'i').test(s)) {
    return { iso: s.match(/\d{4}/)[0], confidence: 0.8 };
  }
  let m = s.match(/^([A-Za-zÀ-ÿ]+)\.?\s+(\d{4})$/);
  if (m) {
    const mn = monthNumber(m[1]);
    return mn ? { iso: `${m[2]}-${pad(mn)}`, confidence: 0.95 } : { iso: m[2], confidence: 0.85 };
  }
  m = s.match(/^(\d{4})[-/](\d{1,2})$/);
  if (m) {
    const mo = Number(m[2]);
    return mo >= 1 && mo <= 12
      ? { iso: `${m[1]}-${pad(mo)}`, confidence: 0.9 }
      : { iso: m[1], confidence: 0.85 };
  }
  m = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) {
    const mo = Number(m[1]);
    return mo >= 1 && mo <= 12
      ? { iso: `${m[2]}-${pad(mo)}`, confidence: 0.9 }
      : { iso: m[2], confidence: 0.85 };
  }
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) {
    // Ambiguous US vs EU — refuse to guess the month; keep the year only.
    return { iso: m[3], confidence: 0.5, ambiguous: true };
  }
  m = s.match(/(\d{4})/);
  return { iso: m ? m[1] : s, confidence: 0.85 };
}

/**
 * Find all date ranges / single dates in a string.
 * @param {string} text
 * @returns {DateMatch[]}
 */
export function findDateRanges(text) {
  if (!text) return [];
  /** @type {DateMatch[]} */
  const out = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const two = matchAt(reTwoDigit, text, i);
    // Only a genuine two-digit-year range ("2019–21"), not an ISO year-month
    // ("2019-01"): the end must complete forward in time (21 >= 19). An ISO
    // month suffix (01 < 19) falls through to point parsing below.
    if (two && Number(two[2]) >= Number(two[1].slice(2))) {
      out.push({
        start: two[1],
        end: two[1].slice(0, 2) + two[2],
        current: false,
        rawText: two[0],
        confidence: 0.9,
        index: i,
      });
      i += two[0].length;
      continue;
    }

    const p = matchAt(rePoint, text, i);
    if (p) {
      const start = parsePoint(p[0]);
      const j = i + p[0].length;
      const sep = matchAt(reSep, text, j);
      if (sep) {
        const k = j + sep[0].length;
        const pres = matchAt(rePresent, text, k);
        if (pres) {
          out.push(range(start, null, true, text.slice(i, k + pres[0].length), i, start.confidence));
          i = k + pres[0].length;
          continue;
        }
        const p2 = matchAt(rePoint, text, k);
        if (p2) {
          const end = parsePoint(p2[0]);
          out.push(
            range(start, end, false, text.slice(i, k + p2[0].length), i, Math.min(start.confidence, end.confidence), start.ambiguous || end.ambiguous),
          );
          i = k + p2[0].length;
          continue;
        }
        // Separator but nothing parseable after it: open-ended ("2019 –").
        if (text.slice(k).trim() === '') {
          out.push(range(start, null, true, text.slice(i).trim(), i, start.confidence));
          i = n;
          continue;
        }
      }
      // A lone date (certification / award / single year).
      out.push(range(start, null, false, p[0], i, start.confidence, start.ambiguous));
      i = j;
      continue;
    }

    i += 1;
  }

  return out;
}

/**
 * @returns {DateMatch}
 */
function range(start, end, current, rawText, index, confidence, ambiguous) {
  /** @type {DateMatch} */
  const m = {
    start: start ? start.iso : null,
    end: end ? end.iso : null,
    current,
    rawText: rawText.trim(),
    confidence,
    index,
  };
  if (ambiguous) m.ambiguous = true;
  return m;
}

/**
 * True when the line is essentially nothing but a date (a date-only row, common
 * in table layouts and stacked headers).
 * @param {string} text
 * @returns {boolean}
 */
export function isDateOnly(text) {
  if (!text) return false;
  const ranges = findDateRanges(text);
  if (ranges.length === 0) return false;

  const covered = new Array(text.length).fill(false);
  for (const r of ranges) {
    for (let k = r.index; k < r.index + r.rawText.length && k < text.length; k += 1) covered[k] = true;
  }
  for (let k = 0; k < text.length; k += 1) {
    if (!covered[k] && /[A-Za-z0-9]/.test(text[k])) return false;
  }
  return true;
}

/**
 * Convenience: the schema `DateRange` for a matched range (drops confidence/
 * index, which live in `_meta.fields`).
 * @param {DateMatch|null} m
 * @returns {import('../schema/resume.js').DateRange}
 */
export function toDateRange(m) {
  return m
    ? { start: m.start, end: m.end, current: m.current, rawText: m.rawText }
    : { start: null, end: null, current: false, rawText: '' };
}
