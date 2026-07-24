/**
 * Skills parser — splits on , ; | • / and newlines, recognizes grouped form
 * ("Category: a, b, c"), guards against over-splitting known slash-terms
 * (CI/CD, TCP/IP), trims proficiency suffixes, and de-duplicates case-insensitively
 * while preserving first-seen casing.
 *
 * Pure: section lines in, { groups } out.
 */

import { protectSlashTerms, restoreSlashTerms } from '../patterns/dictionaries/techTerms.js';

/**
 * @param {import('../layout/lines.js').Line[]} lines
 * @returns {{ groups: import('../schema/resume.js').SkillGroup[] }}
 */
export function parseSkills(lines) {
  /** @type {import('../schema/resume.js').SkillGroup[]} */
  const groups = [];
  /** @type {string[]} */
  let ungrouped = [];

  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;

    const grouped = matchGroup(text);
    if (grouped) {
      const items = dedupe(splitSkills(grouped.items));
      if (items.length) groups.push({ category: grouped.category, items });
    } else {
      ungrouped = ungrouped.concat(splitSkills(text));
    }
  }

  const uItems = dedupe(ungrouped);
  if (uItems.length) groups.unshift({ category: '', items: uItems });

  return { groups };
}

/**
 * "Category: a, b, c" or "Category — a, b, c" where the category is short.
 * @param {string} text
 * @returns {{ category: string, items: string } | null}
 */
function matchGroup(text) {
  const m = text.match(/^([^:—–]{1,40}?)\s*[:—–]\s*(.+)$/);
  if (!m) return null;
  const category = m[1].trim();
  // Guard: a lone "Skill (Advanced)" or a URL is not a category.
  if (category.split(/\s+/).length > 5) return null;
  if (/[@/]/.test(category) || /\d{4}/.test(category)) return null;
  if (!/[,;|/]/.test(m[2]) && m[2].split(/\s+/).length > 6) return null;
  return { category, items: m[2] };
}

/**
 * @param {string} text
 * @returns {string[]}
 */
function splitSkills(text) {
  const protectedText = protectSlashTerms(text);
  return protectedText
    .split(/\s*[,;|•·/]\s*|\s{2,}|\n/)
    .map((s) => restoreSlashTerms(s).trim())
    .map(trimProficiency)
    .filter((s) => s && s.length <= 60);
}

/**
 * Strip a trailing proficiency suffix like "(Advanced)" from a skill name.
 * @param {string} s
 * @returns {string}
 */
function trimProficiency(s) {
  return s.replace(/\s*\((?:advanced|intermediate|basic|beginner|expert|proficient|native|fluent)\)\s*$/i, '').trim();
}

/**
 * Case-insensitive de-dupe, preserving first-seen casing.
 * @param {string[]} items
 * @returns {string[]}
 */
function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = it.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}
