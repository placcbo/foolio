/**
 * Basics parser — name, headline, and contact fields from the preamble (plus
 * any docx-header lines, which arrive flagged source "docx-header").
 *
 * Handles the icon-glyph trap: designed resumes prefix each contact value with a
 * private-use icon glyph; those are stripped before matching and never allowed
 * to make a field look empty.
 *
 * Pure: Line[] in, { basics, fields } out.
 */

import {
  extractEmail, extractPhone, extractLinkedIn, extractGitHub, extractWebsite, stripLeadingPua,
} from '../patterns/contact.js';
import { isLocation } from '../patterns/dictionaries/locations.js';
import { hasJobTitle } from '../patterns/dictionaries/jobTitles.js';
import { buildAliasIndex, normalizeHeading } from '../detect/aliases.js';
import { CONFIDENCE, fieldMeta } from '../schema/confidence.js';

const ALIAS = buildAliasIndex();

/**
 * @param {import('../layout/lines.js').Line[]} lines
 * @returns {{ basics: import('../schema/resume.js').Basics, fields: Record<string, import('../schema/resume.js').FieldMeta> }}
 */
export function parseBasics(lines) {
  const basics = {
    name: '', headline: '', email: '', phone: '', location: '',
    linkedin: '', github: '', website: '', otherLinks: [],
  };
  /** @type {Record<string, import('../schema/resume.js').FieldMeta>} */
  const fields = {};

  for (const line of lines) {
    const t = stripLeadingPua(line.text);
    if (!basics.email) basics.email = extractEmail(t);
    if (!basics.phone) basics.phone = extractPhone(t);
    if (!basics.linkedin) basics.linkedin = extractLinkedIn(t);
    if (!basics.github) basics.github = extractGitHub(t);
    if (!basics.location) basics.location = findLocation(t);
  }
  // Website last, so a social profile is preferred over a generic URL.
  for (const line of lines) {
    if (basics.website) break;
    const w = extractWebsite(stripLeadingPua(line.text));
    if (w && w !== basics.linkedin && w !== basics.github) basics.website = w;
  }

  if (basics.email) fields['basics.email'] = fieldMeta(CONFIDENCE.DICTIONARY, 'regex');
  if (basics.phone) fields['basics.phone'] = fieldMeta(CONFIDENCE.STRONG, 'regex');
  if (basics.linkedin) fields['basics.linkedin'] = fieldMeta(CONFIDENCE.DICTIONARY, 'domain');
  if (basics.github) fields['basics.github'] = fieldMeta(CONFIDENCE.DICTIONARY, 'domain');
  if (basics.location) fields['basics.location'] = fieldMeta(CONFIDENCE.STRUCTURAL, 'location');

  const { name, confidence, nameLine } = pickName(lines);
  basics.name = name;
  if (name) fields['basics.name'] = fieldMeta(confidence, 'largest-font');

  basics.headline = pickHeadline(lines, nameLine);
  if (basics.headline) fields['basics.headline'] = fieldMeta(CONFIDENCE.STRUCTURAL, 'under-name');

  return { basics, fields };
}

/**
 * @param {string} text
 * @returns {string}
 */
function findLocation(text) {
  if (isLocation(text)) return text.trim();
  for (const part of text.split(/\s*[|·•]\s*/)) {
    const p = part.trim();
    if (isLocation(p)) return p;
  }
  return '';
}

/**
 * Name heuristic: largest-font line near the top with 1–4 tokens, no digits,
 * no "@", not a section-heading alias, title-case or ALL CAPS.
 * @param {import('../layout/lines.js').Line[]} lines
 */
function pickName(lines) {
  if (!lines.length) return { name: '', confidence: 0, nameLine: -1 };
  const maxFont = Math.max(...lines.map((l) => l.fontSize || 0));

  // The name is the largest-font name-like line in the preamble (which is
  // already the top of the page); ties go to the earliest line. A Title style
  // is treated as top-tier regardless of font size.
  let best = null;
  lines.forEach((line, i) => {
    const t = stripLeadingPua(line.text).trim();
    if (!isNameLike(t)) return;
    const isTitle = /title/i.test(line.styleName || '');
    const font = isTitle ? Infinity : line.fontSize || 0;
    if (!best || font > best.font) best = { line, i, t, font };
  });

  if (!best) return { name: '', confidence: 0, nameLine: -1 };
  const isTop = best.font === Infinity || (best.line.fontSize || 0) >= maxFont;
  return { name: best.t, confidence: isTop ? 0.9 : 0.6, nameLine: best.i };
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function isNameLike(text) {
  if (!text) return false;
  if (/[@\d]/.test(text)) return false;
  const tokens = text.split(/\s+/);
  if (tokens.length < 1 || tokens.length > 4) return false;
  if (ALIAS.exact.has(normalizeHeading(text))) return false;
  const titleCase = tokens.every((w) => /^[A-Z][a-z.'’-]*$/.test(w) || /^[A-Z.'’-]+$/.test(w));
  const allCaps = text === text.toUpperCase() && /[A-Z]/.test(text);
  return titleCase || allCaps;
}

/**
 * A short non-contact line just under the name that names a role.
 * @param {import('../layout/lines.js').Line[]} lines
 * @param {number} nameLine
 * @returns {string}
 */
function pickHeadline(lines, nameLine) {
  if (nameLine < 0) return '';
  for (let i = nameLine + 1; i < Math.min(lines.length, nameLine + 3); i += 1) {
    const t = stripLeadingPua(lines[i].text).trim();
    if (!t || /[@]/.test(t)) continue;
    if (extractEmail(t) || extractPhone(t)) continue;
    if (hasJobTitle(t) && t.split(/\s+/).length <= 8) return t;
  }
  return '';
}
