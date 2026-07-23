/**
 * Section detection — heading scorer + section splitting.
 *
 * The alias list alone is brittle (creative "Where I've Worked", localized
 * headings, styled templates), so we combine alias hits with style signals into
 * a score. Above the threshold a line is a heading; it maps to a canonical key
 * by alias, or becomes a CUSTOM section keeping its literal text (never swallowed
 * into the previous section).
 *
 * A second consistency pass demotes a would-be heading whose style doesn't match
 * the resume's other headings and had no alias hit — this kills bold job titles
 * masquerading as headings.
 *
 * Pure: Line[] in, structured sections out.
 */

import { buildAliasIndex, normalizeHeading } from './aliases.js';

/**
 * @typedef {import('../layout/lines.js').Line & { displayText?: string }} Line
 */

/**
 * @typedef {Object} Section
 * @property {string} key          // canonical key, or "custom"
 * @property {string} headingText  // literal heading (display copy)
 * @property {number} headingLine  // index into the input lines
 * @property {Line[]} lines        // body lines under the heading
 */

/**
 * @typedef {Object} DetectResult
 * @property {Line[]} preamble      // lines before the first heading (-> basics)
 * @property {Section[]} sections
 */

const THRESHOLD = 3.5;
const ALIAS = buildAliasIndex();

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const URL_RE = /(https?:\/\/|www\.)\S+|\b[\w-]+\.(com|org|net|io|dev|co|edu|gov|me|ai)\b/i;
const PHONE_RE = /(\+?\d[\d ()\-.]{6,}\d)/;
const DATE_RE =
  /\b(19|20)\d{2}\b|\b(present|current|ongoing|now|to date)\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\w*\.?\s+\d/i;
const RULE_RE = /^[_\-–—=]{4,}$/;

/**
 * Detect sections in a normalized line list.
 * @param {Line[]} lines
 * @returns {DetectResult}
 */
export function detectSections(lines) {
  const maxYByPage = new Map();
  for (const l of lines) {
    maxYByPage.set(l.page, Math.max(maxYByPage.get(l.page) || 0, l.y));
  }

  const scored = lines.map((line, i) => scoreHeading(line, lines[i + 1], maxYByPage, i));
  let accepted = scored.filter((s) => s.score >= THRESHOLD);
  accepted = applyConsistencyFilter(accepted);
  const acceptedSet = new Set(accepted.map((a) => a.index));

  /** @type {Line[]} */
  const preamble = [];
  /** @type {Section[]} */
  const sections = [];
  let current = null;

  lines.forEach((line, i) => {
    if (acceptedSet.has(i)) {
      const s = scored[i];
      current = {
        key: s.key || 'custom',
        headingText: line.displayText ?? line.text,
        headingLine: i,
        lines: [],
      };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  });

  return { preamble, sections };
}

/**
 * @typedef {Object} ScoredHeading
 * @property {number} index
 * @property {number} score
 * @property {string|null} key
 * @property {boolean} aliasHit
 * @property {string} signature
 */

/**
 * Score one line's heading-ness.
 * @param {Line} line
 * @param {Line|undefined} next
 * @param {Map<number,number>} maxYByPage
 * @param {number} index
 * @returns {ScoredHeading}
 */
function scoreHeading(line, next, maxYByPage, index) {
  const text = line.text.trim();
  const words = text ? text.split(/\s+/).length : 0;
  let score = 0;

  // --- alias
  const { key, aliasScore, aliasHit } = matchAlias(text);
  score += aliasScore;

  // --- style
  if (/heading\s*[12]|title/i.test(line.styleName || '')) score += 3.0;
  if (line.bodyRatio >= 1.15) score += 2.0;
  else if (line.bodyRatio >= 1.05) score += 1.0;
  if (line.bold) score += 1.5;
  if (line.allCaps && text.length > 2) score += 1.0;
  if (words <= 4) score += 1.0;
  if (line.spaceAbove >= 1.6) score += 1.0;
  if (next && RULE_RE.test(next.text.trim())) score += 0.8;
  if (/:$/.test(text)) score += 0.5;

  // --- penalties
  if (DATE_RE.test(text)) score -= 2.5;
  if (words > 8) score -= 2.0;
  if (/\.$/.test(text)) score -= 1.5;
  if (line.isBullet) score -= 2.0;
  if (EMAIL_RE.test(text) || PHONE_RE.test(text) || URL_RE.test(text)) score -= 1.5;
  // Name block: top 12% of page 1 (content-height proxy).
  const maxY = maxYByPage.get(line.page) || 1;
  if (line.page === 1 && line.y <= 0.12 * maxY) score -= 3.0;

  const signature = `${Math.round(line.fontSize)}|${line.bold ? 1 : 0}|${line.allCaps ? 1 : 0}`;
  return { index, score, key, aliasHit, signature };
}

/**
 * @param {string} text
 * @returns {{ key: string|null, aliasScore: number, aliasHit: boolean }}
 */
function matchAlias(text) {
  const norm = normalizeHeading(text);
  if (!norm) return { key: null, aliasScore: 0, aliasHit: false };
  if (ALIAS.exact.has(norm)) {
    return { key: ALIAS.exact.get(norm), aliasScore: 4.0, aliasHit: true };
  }
  for (const { alias, key } of ALIAS.list) {
    if (norm === alias) return { key, aliasScore: 4.0, aliasHit: true };
    if (norm.startsWith(alias + ' ') || norm.endsWith(' ' + alias)) {
      return { key, aliasScore: 2.5, aliasHit: true };
    }
  }
  return { key: null, aliasScore: 0, aliasHit: false };
}

/**
 * Demote accepted headings that don't share the resume's dominant heading style
 * AND had no alias hit — a bold job title with a one-off style is not a heading.
 * @param {ScoredHeading[]} accepted
 * @returns {ScoredHeading[]}
 */
function applyConsistencyFilter(accepted) {
  if (accepted.length < 3) return accepted;
  /** @type {Map<string,number>} */
  const counts = new Map();
  for (const a of accepted) counts.set(a.signature, (counts.get(a.signature) || 0) + 1);
  const common = new Set([...counts.entries()].filter(([, c]) => c >= 3).map(([sig]) => sig));
  if (common.size === 0) return accepted;
  return accepted.filter((a) => a.aliasHit || common.has(a.signature));
}
