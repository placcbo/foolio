/**
 * Language-proficiency levels. Data + helper.
 */

export const PROFICIENCY_LEVELS = [
  'Native', 'Mother tongue', 'Native speaker', 'Fluent', 'Proficient',
  'Full professional', 'Professional working', 'Business proficiency',
  'Advanced', 'Upper-intermediate', 'Intermediate', 'Conversational',
  'Elementary', 'Basic', 'Beginner', 'Limited working',
  'A1', 'A2', 'B1', 'B2', 'C1', 'C2',
];

const escaped = PROFICIENCY_LEVELS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
escaped.sort((a, b) => b.length - a.length);
export const PROFICIENCY_RE = new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'i');

/** @param {string} text @returns {string} the level verbatim, or "" */
export function extractProficiency(text) {
  const m = (text || '').match(PROFICIENCY_RE);
  return m ? m[0] : '';
}
