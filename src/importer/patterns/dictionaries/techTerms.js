/**
 * Tech terms that contain a "/" which must NOT be treated as a skill separator
 * ("CI/CD", "TCP/IP", "and/or"). Data + a protect/restore helper for splitting.
 */

export const SLASH_TERMS = [
  'ci/cd', 'tcp/ip', 'i/o', 'a/b', 'ui/ux', 'and/or', 'os/2', 'r/w',
  'c/c++', 'p/l',
];

const PLACEHOLDER = 'SLASH'; // stand-in for a protected "/"

/**
 * Protect known slash-terms so a subsequent split on "/" leaves them intact.
 * @param {string} text
 * @returns {string}
 */
export function protectSlashTerms(text) {
  let out = text;
  for (const term of SLASH_TERMS) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
    out = out.replace(re, (m) => m.replace(/\//g, PLACEHOLDER));
  }
  return out;
}

/** Restore protected slashes. */
export function restoreSlashTerms(text) {
  return text.split(PLACEHOLDER).join('/');
}
