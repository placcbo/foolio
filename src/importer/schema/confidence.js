/**
 * Confidence constants and helpers, shared by every parser.
 *
 * Rule 4: every extracted field carries a confidence score. Guessing without
 * marking the guess is forbidden. These constants are the vocabulary parsers
 * use so scores mean the same thing across sections.
 */

/**
 * The Phase 6 rubric, generalized. Use the closest matching band rather than
 * inventing ad-hoc numbers.
 */
export const CONFIDENCE = {
  /** Dictionary / suffix hit, unambiguous. */
  DICTIONARY: 0.95,
  /** A single strong signal short of a dictionary hit. */
  STRONG: 0.85,
  /** Structural signal only (position + date anchor). */
  STRUCTURAL: 0.75,
  /** Ambiguous, resolved by a tiebreak heuristic. */
  TIEBREAK: 0.45,
  /** Field absent, inferred or left blank. */
  ABSENT: 0.2,
  /** Numeric date we refuse to disambiguate (US vs EU). */
  AMBIGUOUS_DATE: 0.5,
};

/** Fields below this threshold get a warning treatment in the editor (Phase 8). */
export const REVIEW_THRESHOLD = 0.7;

/**
 * Per-section weights for the overall-confidence rollup. Mirror the Phase 0
 * scoring weights so "overall confidence" and "overall score" are comparable.
 */
export const SECTION_WEIGHTS = {
  basics: 0.2,
  experience: 0.35,
  education: 0.2,
  skills: 0.15,
  other: 0.1,
};

/**
 * Build a `FieldMeta`.
 * @param {number} confidence
 * @param {string} [source]
 * @param {number} [line]
 * @returns {import('./resume.js').FieldMeta}
 */
export function fieldMeta(confidence, source, line) {
  /** @type {import('./resume.js').FieldMeta} */
  const meta = { confidence: clamp01(confidence) };
  if (source !== undefined) meta.source = source;
  if (line !== undefined) meta.line = line;
  return meta;
}

/**
 * Weighted mean of a `{key: {confidence}}` map using SECTION_WEIGHTS buckets.
 * Keys not in SECTION_WEIGHTS fall into the "other" bucket.
 * @param {Record<string, {confidence:number}>} fields
 * @returns {number}
 */
export function rollupConfidence(fields) {
  /** @type {Record<string, number[]>} */
  const buckets = { basics: [], experience: [], education: [], skills: [], other: [] };
  for (const [path, meta] of Object.entries(fields)) {
    const top = path.split('.')[0];
    const bucket = top in SECTION_WEIGHTS && top !== 'other' ? top : 'other';
    buckets[bucket].push(meta.confidence);
  }

  let weightSum = 0;
  let acc = 0;
  for (const [bucket, weight] of Object.entries(SECTION_WEIGHTS)) {
    const vals = buckets[bucket];
    if (!vals.length) continue;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    acc += mean * weight;
    weightSum += weight;
  }
  return weightSum ? acc / weightSum : 0;
}

/**
 * @param {number} n
 * @returns {number}
 */
export function clamp01(n) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
