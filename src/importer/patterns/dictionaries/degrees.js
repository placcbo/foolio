/**
 * Degree tokens + grade patterns for the education parser. Data + helpers.
 */

export const DEGREE_TOKENS = [
  'Bachelor of', 'Master of', 'Doctor of', 'Higher Diploma', 'B.Sc', 'BSc',
  'B.A', 'BA', 'BEng', 'BCom', 'BBA', 'M.Sc', 'MSc', 'MBA', 'M.A', 'MA', 'PhD',
  'Ph.D', 'Diploma', 'Certificate', 'Associate', 'KCSE', 'KCPE', 'HND', 'BFA',
  'MFA', 'LLB', 'LLM', 'MD', 'B.Tech', 'M.Tech', 'BEd', 'MEng',
];

const escaped = DEGREE_TOKENS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
// Longest first so "Bachelor of" wins over a stray "BA".
escaped.sort((a, b) => b.length - a.length);
export const DEGREE_RE = new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'i');

/** Grade / class-of-degree — captured verbatim, never reformatted. */
export const GRADE_RE =
  /\b(?:first class(?:\s+hono?urs)?|second class(?:\s+(?:upper|lower))?|upper second|lower second|third class|distinction|merit|credit|cum laude|summa cum laude|magna cum laude|honou?rs|gpa\s*[:=]?\s*[\d.]+(?:\s*\/\s*[\d.]+)?|\d\.\d{1,2}\s*\/\s*\d(?:\.\d)?|\b[123]:[12]\b|grade\s*[:=]?\s*[A-F][+-]?)\b/i;

/** @param {string} text @returns {boolean} */
export function hasDegree(text) {
  return DEGREE_RE.test(text || '');
}

/** @param {string} text @returns {string} the grade verbatim, or "" */
export function extractGrade(text) {
  const m = (text || '').match(GRADE_RE);
  return m ? m[0].trim() : '';
}
