/**
 * Canonical importer output schema.
 *
 * This is the *importer's* resume shape — a normalized, flat model that every
 * parser fills in. It is deliberately NOT the app's live editor model
 * (`{ basics, sections[] }`); a `Resume -> app-model` adapter lives at the
 * integration seam (Phase 8). Templates never see this type directly.
 *
 * Every field is always present. `createEmptyResume()` guarantees arrays are
 * `[]` and strings are `""` — never `null`/`undefined` — so downstream code
 * never needs optional chaining for a top-level field.
 */

/**
 * @typedef {Object} FieldMeta
 * @property {number} confidence   // 0..1
 * @property {string} [source]     // short reason, e.g. "date-anchored", "font-size"
 * @property {number} [line]       // index into rawLines for editor jump-to
 */

/**
 * @typedef {Object} Basics
 * @property {string} name
 * @property {string} headline      // role line under the name, if present
 * @property {string} email
 * @property {string} phone
 * @property {string} location
 * @property {string} linkedin
 * @property {string} github
 * @property {string} website
 * @property {{label:string,url:string}[]} otherLinks
 */

/**
 * @typedef {Object} DateRange
 * @property {string|null} start    // ISO-ish "YYYY-MM" or "YYYY"
 * @property {string|null} end      // same, or null when current
 * @property {boolean} current
 * @property {string} rawText       // exactly as it appeared
 */

/**
 * @typedef {Object} ExperienceItem
 * @property {string} company
 * @property {string} title
 * @property {string} location
 * @property {DateRange} dates
 * @property {string[]} bullets
 * @property {string} description   // non-bullet prose, if any
 */

/**
 * @typedef {Object} EducationItem
 * @property {string} institution
 * @property {string} degree
 * @property {string} field
 * @property {string} location
 * @property {DateRange} dates
 * @property {string} grade          // GPA / class of degree, verbatim
 * @property {string[]} bullets
 */

/**
 * @typedef {Object} SkillGroup
 * @property {string} category       // "" when ungrouped
 * @property {string[]} items
 */

/**
 * @typedef {Object} ProjectItem
 * @property {string} name
 * @property {string} description
 * @property {string[]} technologies
 * @property {string} url
 * @property {DateRange} dates
 * @property {string[]} bullets
 */

/**
 * @typedef {Object} Certification
 * @property {string} name
 * @property {string} issuer
 * @property {string} date
 * @property {string} url
 */

/**
 * @typedef {Object} Language
 * @property {string} name
 * @property {string} level
 */

/**
 * @typedef {Object} Award
 * @property {string} title
 * @property {string} issuer
 * @property {string} date
 * @property {string} description
 */

/**
 * @typedef {Object} Reference
 * @property {string} name
 * @property {string} title
 * @property {string} company
 * @property {string} email
 * @property {string} phone
 */

/**
 * @typedef {Object} CustomSection
 * @property {string} heading
 * @property {string[]} lines
 */

/**
 * @typedef {Object} ResumeMeta
 * @property {"pdf"|"docx"} sourceFormat
 * @property {number} pageCount
 * @property {boolean} multiColumn
 * @property {Record<string, FieldMeta>} fields   // dot-path -> meta, e.g. "experience.0.company"
 * @property {string[]} warnings
 * @property {string[]} unparsed                  // lines that reached no parser
 * @property {number} overallConfidence
 */

/**
 * @typedef {Object} Resume
 * @property {Basics} basics
 * @property {string} summary
 * @property {ExperienceItem[]} experience
 * @property {EducationItem[]} education
 * @property {SkillGroup[]} skills
 * @property {ProjectItem[]} projects
 * @property {Certification[]} certifications
 * @property {Language[]} languages
 * @property {Award[]} awards
 * @property {string[]} interests
 * @property {Reference[]} references
 * @property {CustomSection[]} custom
 * @property {ResumeMeta} _meta
 */

/**
 * Build an empty `DateRange`. Exported so parsers construct dates consistently.
 * @param {string} [rawText]
 * @returns {DateRange}
 */
export function createEmptyDateRange(rawText = '') {
  return { start: null, end: null, current: false, rawText };
}

/**
 * Build a fully-populated empty `Resume`. Every array is `[]`, every string is
 * `""`. Passing the result to `validateResume` returns no problems.
 * @returns {Resume}
 */
export function createEmptyResume() {
  return {
    basics: {
      name: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
      otherLinks: [],
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    interests: [],
    references: [],
    custom: [],
    _meta: {
      sourceFormat: 'pdf',
      pageCount: 0,
      multiColumn: false,
      fields: {},
      warnings: [],
      unparsed: [],
      overallConfidence: 0,
    },
  };
}

const STRING_KEYS = /** @type {const} */ ([
  'name',
  'headline',
  'email',
  'phone',
  'location',
  'linkedin',
  'github',
  'website',
]);

const TOP_ARRAY_KEYS = /** @type {const} */ ([
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'awards',
  'interests',
  'references',
  'custom',
]);

/**
 * Structural validator used by the test harness. Returns a list of
 * human-readable problems; an empty list means the resume is structurally
 * sound. It checks *shape*, not extraction quality.
 * @param {Resume} resume
 * @returns {string[]}
 */
export function validateResume(resume) {
  /** @type {string[]} */
  const problems = [];

  if (!resume || typeof resume !== 'object') {
    return ['resume is not an object'];
  }

  const b = resume.basics;
  if (!b || typeof b !== 'object') {
    problems.push('basics is missing or not an object');
  } else {
    for (const k of STRING_KEYS) {
      if (typeof b[k] !== 'string') {
        problems.push(`basics.${k} must be a string (got ${typeof b[k]})`);
      }
    }
    if (!Array.isArray(b.otherLinks)) {
      problems.push('basics.otherLinks must be an array');
    }
  }

  if (typeof resume.summary !== 'string') {
    problems.push('summary must be a string');
  }

  for (const k of TOP_ARRAY_KEYS) {
    if (!Array.isArray(resume[k])) {
      problems.push(`${k} must be an array (got ${typeof resume[k]})`);
    }
  }

  // Spot-check nested date shapes where present.
  if (Array.isArray(resume.experience)) {
    resume.experience.forEach((item, i) => {
      if (!isValidDateRange(item?.dates)) {
        problems.push(`experience.${i}.dates is not a valid DateRange`);
      }
      if (!Array.isArray(item?.bullets)) {
        problems.push(`experience.${i}.bullets must be an array`);
      }
    });
  }
  if (Array.isArray(resume.education)) {
    resume.education.forEach((item, i) => {
      if (!isValidDateRange(item?.dates)) {
        problems.push(`education.${i}.dates is not a valid DateRange`);
      }
    });
  }

  const m = resume._meta;
  if (!m || typeof m !== 'object') {
    problems.push('_meta is missing or not an object');
  } else {
    if (m.sourceFormat !== 'pdf' && m.sourceFormat !== 'docx') {
      problems.push('_meta.sourceFormat must be "pdf" or "docx"');
    }
    if (typeof m.pageCount !== 'number') problems.push('_meta.pageCount must be a number');
    if (typeof m.multiColumn !== 'boolean') problems.push('_meta.multiColumn must be a boolean');
    if (!m.fields || typeof m.fields !== 'object') problems.push('_meta.fields must be an object');
    if (!Array.isArray(m.warnings)) problems.push('_meta.warnings must be an array');
    if (!Array.isArray(m.unparsed)) problems.push('_meta.unparsed must be an array');
    if (typeof m.overallConfidence !== 'number') {
      problems.push('_meta.overallConfidence must be a number');
    }
  }

  return problems;
}

/**
 * @param {unknown} d
 * @returns {boolean}
 */
function isValidDateRange(d) {
  if (!d || typeof d !== 'object') return false;
  const dr = /** @type {DateRange} */ (d);
  const startOk = dr.start === null || typeof dr.start === 'string';
  const endOk = dr.end === null || typeof dr.end === 'string';
  return startOk && endOk && typeof dr.current === 'boolean' && typeof dr.rawText === 'string';
}
