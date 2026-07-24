/**
 * Institution keywords for the education parser. Data + helper.
 */

export const INSTITUTION_KEYWORDS = [
  'University', 'College', 'Institute', 'Institution', 'School', 'Polytechnic',
  'Academy', 'TVET', 'Campus', 'Seminary', 'Conservatory',
];

const escaped = INSTITUTION_KEYWORDS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
export const INSTITUTION_RE = new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'i');

/** @param {string} text @returns {boolean} */
export function hasInstitution(text) {
  return INSTITUTION_RE.test(text || '');
}
