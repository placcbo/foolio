/**
 * Bullet glyph canonicalization.
 *
 * Strips a leading bullet marker and reports whether the line is a bullet. The
 * marker set includes the usual typographic glyphs AND the Word private-use
 * bullets `  ` (Symbol/Wingdings exported into the PDF PUA),
 * which are extremely common and easy to miss.
 *
 * Guards against false positives:
 *   - a leading "-" is NOT a bullet when the line looks like a date range
 *     ("- 2019", "-Present") or a negative number ("-3.5");
 *   - a leading "o" is only a bullet when it's a lone "o" followed by a space
 *     (English body lines don't begin with a solitary "o " — but real words do
 *     begin with "O", so uppercase is left alone to protect names).
 *
 * Pure string transform.
 */

// Unambiguous bullet glyphs, including the Word PUA bullets.
const GLYPH_BULLETS =
  '•‣▪▫◦●○·⁃∙➤➔→✓✔★◆»›';

const GLYPH_RE = new RegExp(`^[${GLYPH_BULLETS}]+\\s*`);
// Leading "*" or "·"-style ASCII markers.
const STAR_RE = /^\*\s+/;
// Leading lowercase "o " sub-bullet (see guard note above).
const O_BULLET_RE = /^o\s+(?=\S)/;
// A leading "-" / "–" that begins actual list content, not a date/number.
const DASH_BULLET_RE = /^[-–—]\s+(?=\S)/;

const DATEISH_AFTER_DASH = /^[-–—]\s*((19|20)\d{2}|present|current|now|ongoing)\b/i;
const NEGATIVE_NUMBER = /^[-–—]\s*\d/;

/**
 * @typedef {Object} BulletResult
 * @property {string} text     // text with the marker removed
 * @property {boolean} isBullet
 */

/**
 * Canonicalize a single line's bullet marker.
 * @param {string} text
 * @returns {BulletResult}
 */
export function canonicalizeBullet(text) {
  const t = text.replace(/^\s+/, '');

  if (GLYPH_RE.test(t)) {
    return { text: t.replace(GLYPH_RE, '').trim(), isBullet: true };
  }
  if (STAR_RE.test(t)) {
    return { text: t.replace(STAR_RE, '').trim(), isBullet: true };
  }
  if (O_BULLET_RE.test(t)) {
    return { text: t.replace(O_BULLET_RE, '').trim(), isBullet: true };
  }
  if (DASH_BULLET_RE.test(t) && !DATEISH_AFTER_DASH.test(t) && !NEGATIVE_NUMBER.test(t)) {
    return { text: t.replace(DASH_BULLET_RE, '').trim(), isBullet: true };
  }

  return { text, isBullet: false };
}
