/**
 * Languages parser — handles "English (Fluent)", "English — Fluent",
 * "English: Native", and bare "English, Swahili".
 *
 * Pure: section lines in, { items, fields } out.
 */

import { extractProficiency, PROFICIENCY_RE } from '../patterns/dictionaries/proficiency.js';
import { CONFIDENCE, fieldMeta } from '../schema/confidence.js';

/**
 * @param {import('../layout/lines.js').Line[]} lines
 * @returns {{ items: import('../schema/resume.js').Language[], fields: Record<string, import('../schema/resume.js').FieldMeta> }}
 */
export function parseLanguages(lines) {
  /** @type {import('../schema/resume.js').Language[]} */
  const items = [];
  /** @type {Record<string, import('../schema/resume.js').FieldMeta>} */
  const fields = {};
  const seen = new Set();

  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;

    // A line may hold several "Name (Level)" entries or a bare comma list.
    const chunks = splitChunks(text);
    for (const chunk of chunks) {
      const parsed = parseOne(chunk);
      if (!parsed || !parsed.name) continue;
      const key = parsed.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const i = items.length;
      items.push(parsed);
      fields[`languages.${i}.name`] = fieldMeta(
        parsed.level ? CONFIDENCE.DICTIONARY : CONFIDENCE.STRUCTURAL,
        'language',
      );
    }
  }

  return { items, fields };
}

/**
 * Split a line into per-language chunks without breaking "English, Native".
 * @param {string} text
 * @returns {string[]}
 */
function splitChunks(text) {
  // If it has explicit level markers, split on those boundaries; else split on
  // commas/semicolons/pipes as a bare list.
  if (/[():—–]/.test(text)) {
    return text.split(/\s*[;|]\s*|\s{2,}/).map((s) => s.trim()).filter(Boolean);
  }
  return text.split(/\s*[,;|]\s*/).map((s) => s.trim()).filter(Boolean);
}

/**
 * @param {string} chunk
 * @returns {import('../schema/resume.js').Language | null}
 */
function parseOne(chunk) {
  // "English (Fluent)"
  let m = chunk.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) return { name: m[1].trim(), level: m[2].trim() };
  // "English: Native" / "English — Fluent" / "English - Native"
  m = chunk.match(/^(.+?)\s*[:—–-]\s*(.+)$/);
  if (m && PROFICIENCY_RE.test(m[2])) return { name: m[1].trim(), level: m[2].trim() };
  // bare "English", possibly with an inline level word
  const level = extractProficiency(chunk);
  if (level) {
    const name = chunk.replace(PROFICIENCY_RE, '').replace(/[()–—:-]/g, '').trim();
    return { name: name || chunk.trim(), level };
  }
  if (/^[A-Za-z][A-Za-z ]{1,30}$/.test(chunk)) return { name: chunk.trim(), level: '' };
  return null;
}
