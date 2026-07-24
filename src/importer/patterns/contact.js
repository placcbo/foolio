/**
 * Contact patterns — email, phone, and social/website URLs, plus normalizers.
 *
 * Designed resumes render contact icons as private-use glyphs immediately before
 * the value, so `stripLeadingPua` is applied before matching and must never make
 * a field look empty.
 *
 * Pure string helpers.
 */

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+\w/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/(?:in|pub|profile)\/[\w%+.-]+/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w.-]+/i;
const URL_RE = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w#%&./=?~+-]*)?/i;
// Permissive international phone; validated by digit count afterwards.
const PHONE_RE = /\+?\d[\d\s()\-.]{5,}\d/g;

// Private Use Area (contact icons live here): U+E000–U+F8FF, plus leading space.
const LEADING_PUA_RE = /^[-\s]+/;

/** Strip leading Private-Use-Area icon glyphs (and any following spaces). */
export function stripLeadingPua(text) {
  return (text || '').replace(LEADING_PUA_RE, '');
}

/** @param {string} text @returns {string} */
export function extractEmail(text) {
  const m = stripLeadingPua(text).match(EMAIL_RE);
  return m ? m[0] : '';
}

/**
 * Extract a phone number, validated to 7–15 digits.
 * @param {string} text
 * @returns {string}
 */
export function extractPhone(text) {
  const cleaned = stripLeadingPua(text);
  const candidates = cleaned.match(PHONE_RE) || [];
  for (const c of candidates) {
    const digits = c.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 15) return c.trim();
  }
  return '';
}

/** @param {string} text @returns {string} */
export function extractLinkedIn(text) {
  const m = stripLeadingPua(text).match(LINKEDIN_RE);
  return m ? normalizeUrl(m[0]) : '';
}

/** @param {string} text @returns {string} */
export function extractGitHub(text) {
  const m = stripLeadingPua(text).match(GITHUB_RE);
  return m ? normalizeUrl(m[0]) : '';
}

/**
 * Any URL that is not a known social profile (for the website field).
 * @param {string} text
 * @returns {string}
 */
export function extractWebsite(text) {
  // Remove emails first so their local part ("jane.doe") isn't read as a domain.
  const cleaned = stripLeadingPua(text).replace(new RegExp(EMAIL_RE, 'g'), ' ');
  const all = cleaned.match(new RegExp(URL_RE, 'ig')) || [];
  for (const u of all) {
    if (/linkedin\.com|github\.com|@/i.test(u)) continue;
    if (/^\d+\.\d+/.test(u)) continue; // not a version number etc.
    return normalizeUrl(u);
  }
  return '';
}

/**
 * Normalize a URL: force https, drop tracking params, drop a trailing slash.
 * @param {string} url
 * @returns {string}
 */
export function normalizeUrl(url) {
  let u = url.trim().replace(/[),.]+$/, '');
  u = u.replace(/^https?:\/\//i, '');
  u = u.replace(/[?&](utm_[^=]+|fbclid|gclid)=[^&]*/gi, '');
  u = u.replace(/[?&]$/, '').replace(/\/$/, '');
  return 'https://' + u;
}

export { EMAIL_RE, URL_RE };
