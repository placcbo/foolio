/**
 * Location detection — "City, ST" / "City, Country", remote/hybrid markers, and
 * a small country/city list for bare mentions. Data + a helper.
 */

export const WORK_MODES = ['remote', 'hybrid', 'on-site', 'onsite'];

// A short list covers bare "Kenya"/"UK" cases the comma pattern misses.
export const COUNTRIES = new Set(
  [
    'kenya', 'uganda', 'tanzania', 'nigeria', 'ghana', 'south africa',
    'usa', 'united states', 'uk', 'united kingdom', 'canada', 'ireland',
    'germany', 'france', 'spain', 'italy', 'netherlands', 'portugal',
    'india', 'pakistan', 'china', 'japan', 'australia', 'brazil', 'mexico',
    'egypt', 'morocco', 'uae', 'united arab emirates', 'singapore',
  ].map((s) => s.toLowerCase()),
);

// A handful of major cities, so a bare "Nairobi" / "London" reads as a location.
export const MAJOR_CITIES = new Set(
  [
    'nairobi', 'mombasa', 'kisumu', 'london', 'manchester', 'birmingham',
    'new york', 'san francisco', 'boston', 'chicago', 'los angeles', 'seattle',
    'austin', 'toronto', 'berlin', 'paris', 'madrid', 'lagos', 'accra',
    'cape town', 'johannesburg', 'dubai', 'singapore', 'mumbai', 'bangalore',
  ].map((s) => s.toLowerCase()),
);

const WORK_MODE_RE = /\b(remote|hybrid|on-?site)\b/i;
// City (possibly multi-word), comma, then a state abbrev or a country word.
const CITY_REGION_RE =
  /^[A-Z][a-zA-Z.'’-]+(?:[ -][A-Z][a-zA-Z.'’-]+)*,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z.'’-]+)$/;

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isLocation(text) {
  const t = (text || '').trim();
  if (!t) return false;
  if (WORK_MODE_RE.test(t)) return true;
  if (CITY_REGION_RE.test(t)) return true;
  const lower = t.toLowerCase();
  if (COUNTRIES.has(lower)) return true;
  if (MAJOR_CITIES.has(lower)) return true;
  return false;
}
