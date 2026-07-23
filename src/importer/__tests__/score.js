/**
 * Field-level scoring for the regression harness.
 *
 * Rules (from the spec):
 * - String fields: normalized comparison (lowercase, collapse whitespace, strip
 *   trailing punctuation). Exact = 1.0, substring either way = 0.5, else 0.
 * - Arrays of items: greedy best-match pairing by highest field-overlap score,
 *   then average. Missing item = 0; extra items = precision penalty.
 * - Bullets: set similarity on normalized strings.
 * - Overall = weighted mean: basics 0.2, experience 0.35, education 0.2,
 *   skills 0.15, everything else 0.1.
 */

const OVERALL_WEIGHTS = {
  basics: 0.2,
  experience: 0.35,
  education: 0.2,
  skills: 0.15,
  other: 0.1,
};

/**
 * Normalize a string for comparison: lowercase, collapse whitespace, strip
 * trailing punctuation.
 * @param {unknown} s
 * @returns {string}
 */
export function normStr(s) {
  if (s == null) return '';
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:!?)\]}"'’”-]+$/u, '')
    .trim();
}

/**
 * Score two scalar strings. 1.0 exact, 0.5 substring either direction, else 0.
 * Two empty strings count as a match (1.0) — absence correctly predicted.
 * @param {unknown} a expected
 * @param {unknown} b actual
 * @returns {number}
 */
export function scoreString(a, b) {
  const x = normStr(a);
  const y = normStr(b);
  if (x === '' && y === '') return 1;
  if (x === '' || y === '') return 0;
  if (x === y) return 1;
  if (x.includes(y) || y.includes(x)) return 0.5;
  return 0;
}

/**
 * Set similarity (Jaccard) over normalized strings. Used for bullets and any
 * plain string array.
 * @param {string[]} expected
 * @param {string[]} actual
 * @returns {number}
 */
export function scoreStringSet(expected, actual) {
  const A = new Set((expected || []).map(normStr).filter(Boolean));
  const B = new Set((actual || []).map(normStr).filter(Boolean));
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const v of A) if (B.has(v)) inter += 1;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

/**
 * Overlap score between two item objects: mean of scoreString over a set of
 * scalar fields, plus bullet-set similarity when both declare bullets.
 * @param {Record<string, any>} exp
 * @param {Record<string, any>} act
 * @param {string[]} scalarFields
 * @returns {number}
 */
function itemOverlap(exp, act, scalarFields) {
  const parts = [];
  for (const f of scalarFields) {
    // Support "dates.rawText"-style nested keys.
    parts.push(scoreString(getPath(exp, f), getPath(act, f)));
  }
  if (Array.isArray(exp?.bullets) || Array.isArray(act?.bullets)) {
    parts.push(scoreStringSet(exp?.bullets || [], act?.bullets || []));
  }
  if (!parts.length) return 0;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

/**
 * Greedy best-match pairing of two item arrays. Missing expected items score 0;
 * extra actual items apply a precision penalty (they dilute the mean).
 * @param {any[]} expected
 * @param {any[]} actual
 * @param {string[]} scalarFields
 * @returns {number}
 */
export function scoreItemArray(expected, actual, scalarFields) {
  const exp = expected || [];
  const act = (actual || []).slice();
  if (exp.length === 0 && act.length === 0) return 1;
  if (exp.length === 0) return 0; // all actual items are spurious

  const used = new Array(act.length).fill(false);
  let sum = 0;
  for (const e of exp) {
    let bestScore = 0;
    let bestIdx = -1;
    for (let i = 0; i < act.length; i += 1) {
      if (used[i]) continue;
      const s = itemOverlap(e, act[i], scalarFields);
      if (s > bestScore) {
        bestScore = s;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) used[bestIdx] = true;
    sum += bestScore; // unmatched expected item contributes 0
  }

  const recall = sum / exp.length;
  // Precision penalty: spurious extra items beyond the expected count.
  const extras = Math.max(0, act.length - exp.length);
  const precision = act.length ? (act.length - extras) / act.length : 1;
  // Blend, weighting recall more heavily.
  return recall * 0.75 + Math.min(recall, precision) * 0.25;
}

/**
 * Score the basics object as the mean of its scalar fields.
 * @param {Record<string, any>} exp
 * @param {Record<string, any>} act
 * @returns {number}
 */
export function scoreBasics(exp = {}, act = {}) {
  const fields = ['name', 'headline', 'email', 'phone', 'location', 'linkedin', 'github', 'website'];
  const present = fields.filter((f) => normStr(exp[f]) !== '');
  const use = present.length ? present : fields;
  const total = use.reduce((acc, f) => acc + scoreString(exp[f], act[f]), 0);
  return total / use.length;
}

/**
 * Flatten skill groups to a single item set for scoring.
 * @param {{items?:string[]}[]} groups
 * @returns {string[]}
 */
function flattenSkills(groups) {
  return (groups || []).flatMap((g) => g?.items || []);
}

/**
 * Score a full resume against an expected resume. Returns per-section scores
 * plus a weighted overall.
 * @param {import('../schema/resume.js').Resume} expected
 * @param {import('../schema/resume.js').Resume} actual
 * @returns {{basics:number,experience:number,education:number,skills:number,other:number,overall:number}}
 */
export function scoreResume(expected, actual) {
  const basics = scoreBasics(expected.basics, actual.basics);

  const experience = scoreItemArray(expected.experience, actual.experience, [
    'company',
    'title',
    'location',
    'dates.rawText',
  ]);

  const education = scoreItemArray(expected.education, actual.education, [
    'institution',
    'degree',
    'field',
    'grade',
  ]);

  const skills = scoreStringSet(flattenSkills(expected.skills), flattenSkills(actual.skills));

  // "everything else": summary + projects + certifications + languages +
  // awards + interests + references, averaged over whatever the expected
  // fixture actually declares.
  const otherParts = [];
  if (normStr(expected.summary)) otherParts.push(scoreString(expected.summary, actual.summary));
  if ((expected.projects || []).length) {
    otherParts.push(scoreItemArray(expected.projects, actual.projects, ['name', 'url']));
  }
  if ((expected.certifications || []).length) {
    otherParts.push(
      scoreItemArray(expected.certifications, actual.certifications, ['name', 'issuer', 'date']),
    );
  }
  if ((expected.languages || []).length) {
    otherParts.push(scoreItemArray(expected.languages, actual.languages, ['name', 'level']));
  }
  if ((expected.awards || []).length) {
    otherParts.push(scoreItemArray(expected.awards, actual.awards, ['title', 'issuer', 'date']));
  }
  if ((expected.interests || []).length) {
    otherParts.push(scoreStringSet(expected.interests, actual.interests));
  }
  if ((expected.references || []).length) {
    otherParts.push(
      scoreItemArray(expected.references, actual.references, ['name', 'email', 'company']),
    );
  }
  const other = otherParts.length
    ? otherParts.reduce((a, b) => a + b, 0) / otherParts.length
    : 1;

  const overall =
    basics * OVERALL_WEIGHTS.basics +
    experience * OVERALL_WEIGHTS.experience +
    education * OVERALL_WEIGHTS.education +
    skills * OVERALL_WEIGHTS.skills +
    other * OVERALL_WEIGHTS.other;

  return { basics, experience, education, skills, other, overall };
}

/**
 * Read a dotted path ("dates.rawText") off an object.
 * @param {any} obj
 * @param {string} path
 * @returns {any}
 */
function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
