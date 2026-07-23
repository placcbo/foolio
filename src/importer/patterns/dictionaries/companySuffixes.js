/**
 * Company legal/name suffixes — a strong "this segment is an employer" signal.
 * Data only.
 */

export const COMPANY_SUFFIXES = [
  'Inc', 'LLC', 'Ltd', 'Limited', 'Pty', 'GmbH', 'PLC', 'Corp', 'Corporation',
  'Co', 'S.A', 'B.V', 'AB', 'AG', 'LLP', 'Group', 'Holdings', 'Technologies',
  'Solutions', 'Systems', 'Labs', 'Studio', 'Agency', 'Ventures', 'Partners',
  'Consulting', 'Bank', 'University', 'Foundation', 'NGO', 'Trust', 'Sacco',
  'SACCO', 'EPZ', 'Enterprises', 'Industries', 'Services', 'Media', 'Digital',
];

// Match a suffix as a whole word, optionally followed by a period.
const escaped = COMPANY_SUFFIXES.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
export const COMPANY_SUFFIX_RE = new RegExp(`(?:^|\\s)(?:${escaped.join('|')})\\.?(?=\\s|$|,)`, 'i');

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasCompanySuffix(text) {
  return COMPANY_SUFFIX_RE.test(text || '');
}
