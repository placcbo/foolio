/**
 * Assembly router — turns detected sections into a canonical Resume.
 *
 * Preamble -> basics. Each known section key -> its parser. Unknown / custom /
 * volunteer / publications sections are preserved in `resume.custom[]` with
 * their original heading text (never dropped). Nothing well-formed should land
 * in `_meta.unparsed[]`.
 *
 * Confidence rollup and the editor wiring are Phase 8; this establishes the
 * seam and populates `_meta.fields`.
 *
 * Pure: detect result in, { resume } out.
 */

import { createEmptyResume } from '../schema/resume.js';
import { rollupConfidence } from '../schema/confidence.js';
import { parseBasics } from './basics.js';
import { parseExperience } from './experience.js';
import { parseEducation } from './education.js';
import { parseSkills } from './skills.js';
import { parseProjects } from './projects.js';
import { parseCertifications } from './certifications.js';
import { parseLanguages } from './languages.js';
import { parseAwards } from './awards.js';
import { parseInterests } from './interests.js';
import { parseReferences } from './references.js';

/**
 * @param {import('../detect/sections.js').DetectResult} detected
 * @returns {{ resume: import('../schema/resume.js').Resume }}
 */
export function assembleResume(detected) {
  const resume = createEmptyResume();
  /** @type {Record<string, import('../schema/resume.js').FieldMeta>} */
  const fields = {};

  // Preamble -> basics.
  const { basics, fields: basicsFields } = parseBasics(detected.preamble || []);
  resume.basics = basics;
  Object.assign(fields, basicsFields);

  for (const section of detected.sections || []) {
    routeSection(resume, fields, section);
  }

  resume._meta.fields = fields;
  resume._meta.overallConfidence = rollupConfidence(fields);
  return { resume };
}

/**
 * @param {import('../schema/resume.js').Resume} resume
 * @param {Record<string, import('../schema/resume.js').FieldMeta>} fields
 * @param {import('../detect/sections.js').Section} section
 */
function routeSection(resume, fields, section) {
  const lines = section.lines || [];
  switch (section.key) {
    case 'summary':
      resume.summary = [resume.summary, textOf(lines)].filter(Boolean).join(' ').trim();
      break;
    case 'experience': {
      const { items, fields: f } = parseExperience(lines);
      merge(resume.experience, items, fields, f, 'experience');
      break;
    }
    case 'education': {
      const { items, fields: f } = parseEducation(lines);
      merge(resume.education, items, fields, f, 'education');
      break;
    }
    case 'skills': {
      const { groups } = parseSkills(lines);
      resume.skills = resume.skills.concat(groups);
      break;
    }
    case 'projects': {
      const { items, fields: f } = parseProjects(lines);
      merge(resume.projects, items, fields, f, 'projects');
      break;
    }
    case 'certifications': {
      const { items, fields: f } = parseCertifications(lines);
      merge(resume.certifications, items, fields, f, 'certifications');
      break;
    }
    case 'languages': {
      const { items, fields: f } = parseLanguages(lines);
      merge(resume.languages, items, fields, f, 'languages');
      break;
    }
    case 'awards': {
      const { items, fields: f } = parseAwards(lines);
      merge(resume.awards, items, fields, f, 'awards');
      break;
    }
    case 'interests': {
      const { items } = parseInterests(lines);
      resume.interests = resume.interests.concat(items);
      break;
    }
    case 'references': {
      const { items, availableOnRequest, fields: f } = parseReferences(lines);
      merge(resume.references, items, fields, f, 'references');
      if (availableOnRequest) resume._meta.warnings.push('references: available upon request');
      break;
    }
    default:
      // custom / volunteer / publications / anything unrecognized — preserved.
      resume.custom.push({ heading: section.headingText || '', lines: lines.map((l) => l.text) });
  }
}

/**
 * Append parsed items, remapping their field indices by the current offset so
 * multiple sections of the same kind don't collide.
 */
function merge(targetArr, items, fields, itemFields, key) {
  const offset = targetArr.length;
  for (const it of items) targetArr.push(it);
  const re = new RegExp(`^${key}\\.(\\d+)\\.`);
  for (const [path, meta] of Object.entries(itemFields)) {
    const m = path.match(re);
    if (m) fields[`${key}.${Number(m[1]) + offset}.${path.slice(m[0].length)}`] = meta;
    else fields[path] = meta;
  }
}

/**
 * @param {import('../layout/lines.js').Line[]} lines
 * @returns {string}
 */
function textOf(lines) {
  return lines.map((l) => l.text.trim()).filter(Boolean).join(' ').trim();
}
