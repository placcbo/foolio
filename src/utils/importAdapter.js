// ---------------------------------------------------------------------------
// Adapter at the importer seam: canonical `Resume` (from src/importer) -> the
// app's live editor model ({ basics, sections[] }). The importer stays pure and
// app-agnostic; this is the one place that knows both shapes.
//
// It also carries an `_import` block (raw text for the "Original text" drawer,
// the overall confidence, and the list of low-confidence fields to review) so
// the editor can show the import banner without re-running any importer code.
// ---------------------------------------------------------------------------

import { getSectionMeta } from '../data/sectionTypes.js';

const REVIEW_THRESHOLD = 0.7;

// canonical Resume key -> app section `type`
const SECTION_TYPE = {
  experience: 'experience',
  education: 'education',
  skills: 'skills',
  projects: 'projects',
  certifications: 'certificates',
  languages: 'languages',
  awards: 'awards',
  interests: 'interests',
  references: 'references',
};

let idSeq = 0;
function makeId(prefix) {
  idSeq += 1;
  return `${prefix}-import-${Date.now()}-${idSeq}`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Bullets -> <ul>, prose -> <p>, combined into the app's HTML description. */
function toDescriptionHtml({ description = '', bullets = [] } = {}) {
  let html = '';
  if (description) html += `<p>${escapeHtml(description)}</p>`;
  if (bullets && bullets.length) {
    html += `<ul>${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`;
  }
  return html;
}

/** Split a DateRange into the app's display start/end strings. */
function toStartEnd(dates) {
  if (!dates) return { start: '', end: '' };
  const raw = (dates.rawText || '').trim();
  if (raw) {
    const parts = raw.split(/\s*(?:-|–|—|to|until|through)\s*/i).map((s) => s.trim());
    const start = parts[0] || '';
    let end = parts.length > 1 ? parts[parts.length - 1] : '';
    if (dates.current || /present|current|now|ongoing/i.test(end)) end = 'Present';
    return { start, end };
  }
  return { start: dates.start || '', end: dates.current ? 'Present' : dates.end || '' };
}

function base(type) {
  const meta = getSectionMeta(type);
  return { id: makeId(type), type, title: meta ? meta.label : type, kind: meta ? meta.kind : 'text', hidden: false };
}

function textSection(type, htmlOrText, isHtml) {
  return { ...base(type), content: isHtml ? htmlOrText : `<p>${escapeHtml(htmlOrText)}</p>` };
}
function tagsSection(type, tags) {
  return { ...base(type), tags };
}
function entriesSection(type, entries) {
  return { ...base(type), entries };
}

function entry(fields) {
  return {
    id: makeId('entry'), heading: '', subheading: '', link: '', location: '',
    start: '', end: '', description: '', hidden: false, ...fields,
  };
}

/**
 * @param {import('../importer/schema/resume.js').Resume} resume
 * @returns {{ basics: object, sections: object[], _import: object }}
 */
export function toAppResume(resume) {
  const b = resume.basics || {};
  const basics = {
    name: b.name || '', title: b.headline || '', email: b.email || '',
    phone: b.phone || '', address: b.location || '',
  };

  const sections = [];

  if (resume.summary) sections.push(textSection('summary', resume.summary));

  if (resume.experience?.length) {
    sections.push(entriesSection('experience', resume.experience.map((e) => {
      const { start, end } = toStartEnd(e.dates);
      return entry({ heading: e.title, subheading: e.company, location: e.location, start, end,
        description: toDescriptionHtml(e) });
    })));
  }

  if (resume.education?.length) {
    sections.push(entriesSection('education', resume.education.map((e) => {
      const { start, end } = toStartEnd(e.dates);
      const heading = e.field ? `${e.degree} in ${e.field}`.trim() : e.degree;
      const prose = [e.grade].filter(Boolean).join(' ');
      return entry({ heading: heading || e.degree, subheading: e.institution, location: e.location,
        start, end, description: toDescriptionHtml({ description: prose, bullets: e.bullets }) });
    })));
  }

  if (resume.skills?.length) {
    const tags = flattenSkills(resume.skills);
    if (tags.length) sections.push(tagsSection('skills', tags));
  }

  if (resume.projects?.length) {
    sections.push(entriesSection('projects', resume.projects.map((p) => {
      const { start, end } = toStartEnd(p.dates);
      const prose = [p.description, p.technologies?.length ? `Tech: ${p.technologies.join(', ')}` : '']
        .filter(Boolean).join(' ');
      return entry({ heading: p.name, link: p.url || '', start, end,
        description: toDescriptionHtml({ description: prose, bullets: p.bullets }) });
    })));
  }

  if (resume.certifications?.length) {
    sections.push(entriesSection('certificates', resume.certifications.map((c) =>
      entry({ heading: c.name, subheading: c.issuer, link: c.url || '', start: c.date || '' }))));
  }

  if (resume.languages?.length) {
    sections.push(tagsSection('languages', resume.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name))));
  }

  if (resume.awards?.length) {
    sections.push(entriesSection('awards', resume.awards.map((a) =>
      entry({ heading: a.title, subheading: a.issuer, start: a.date || '',
        description: toDescriptionHtml({ description: a.description }) }))));
  }

  if (resume.interests?.length) sections.push(tagsSection('interests', resume.interests));

  if (resume.references?.length) {
    sections.push(entriesSection('references', resume.references.map((r) => {
      const contact = [r.email, r.phone].filter(Boolean).join(' · ');
      return entry({ heading: r.name, subheading: [r.title, r.company].filter(Boolean).join(', '),
        description: contact ? `<p>${escapeHtml(contact)}</p>` : '' });
    })));
  }

  for (const c of resume.custom || []) {
    const meta = getSectionMeta('custom');
    sections.push({
      id: makeId('custom'), type: 'custom', title: c.heading || 'Additional',
      kind: meta ? meta.kind : 'text', hidden: false,
      content: (c.lines || []).map((l) => `<p>${escapeHtml(l)}</p>`).join(''),
    });
  }

  return { basics, sections: sections.filter(Boolean), _import: buildImportMeta(resume) };
}

function flattenSkills(groups) {
  const out = [];
  const seen = new Set();
  for (const g of groups) {
    for (const item of g.items || []) {
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

/** Build the `_import` review metadata from the resume's field confidences. */
function buildImportMeta(resume) {
  const meta = resume._meta || {};
  const fields = meta.fields || {};
  const flags = [];
  for (const [path, fm] of Object.entries(fields)) {
    if (fm.confidence < REVIEW_THRESHOLD) flags.push({ path, confidence: fm.confidence, label: labelFor(path) });
  }
  flags.sort((a, b) => a.confidence - b.confidence);
  return {
    rawText: '', // filled in by the caller (importResume result)
    overallConfidence: meta.overallConfidence || 0,
    warnings: meta.warnings || [],
    sourceFormat: meta.sourceFormat || 'pdf',
    pageCount: meta.pageCount || 0,
    multiColumn: !!meta.multiColumn,
    flags,
    flagCount: flags.length,
  };
}

function labelFor(path) {
  const parts = path.split('.');
  if (parts[0] === 'basics') return capitalize(parts[1]);
  if (parts.length === 3) {
    const type = SECTION_TYPE[parts[0]] || parts[0];
    const meta = getSectionMeta(type);
    return `${meta ? meta.label : capitalize(parts[0])} #${Number(parts[1]) + 1} · ${parts[2]}`;
  }
  return path;
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
