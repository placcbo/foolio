/**
 * Section alias tables — DATA ONLY, no logic.
 *
 * The scorer in sections.js combines these with style signals; the alias list
 * alone is brittle against creative or localized headings, so it is never the
 * sole signal.
 */

export const SECTION_ALIASES = {
  summary: [
    'summary', 'professional summary', 'profile', 'professional profile',
    'about', 'about me', 'objective', 'career objective', 'personal statement',
    'overview', 'career summary', 'executive summary', 'introduction',
  ],
  experience: [
    'experience', 'work experience', 'professional experience', 'employment',
    'employment history', 'work history', 'career history', 'professional background',
    'relevant experience', 'industry experience', 'positions held', 'career experience',
  ],
  education: [
    'education', 'academic background', 'academic qualifications', 'education and training',
    'educational background', 'qualifications', 'academics', 'schooling',
  ],
  skills: [
    'skills', 'technical skills', 'core competencies', 'competencies', 'key skills',
    'areas of expertise', 'expertise', 'proficiencies', 'technologies', 'tech stack',
    'tools', 'skills and abilities', 'hard skills', 'soft skills',
  ],
  projects: [
    'projects', 'personal projects', 'side projects', 'selected projects',
    'key projects', 'portfolio', 'notable projects', 'academic projects',
  ],
  certifications: [
    'certifications', 'certificates', 'licenses', 'licences',
    'certifications and licenses', 'professional certifications', 'credentials',
    'courses', 'training', 'professional development',
  ],
  languages: ['languages', 'language skills', 'language proficiency', 'spoken languages'],
  awards: [
    'awards', 'honors', 'honours', 'achievements', 'accomplishments',
    'awards and honors', 'recognition', 'key achievements',
  ],
  interests: [
    'interests', 'hobbies', 'hobbies and interests', 'activities',
    'extracurricular activities', 'personal interests',
  ],
  references: ['references', 'referees', 'referrals', 'references available'],
  volunteer: [
    'volunteer', 'volunteering', 'volunteer experience', 'community involvement',
    'community service',
  ],
  publications: ['publications', 'papers', 'research', 'published work'],
};

/**
 * Canonical form for alias comparison: lowercase, NFKC, drop punctuation, drop
 * standalone "and"/"&" (so "Education & Training" ≡ "education and training"),
 * collapse whitespace.
 * @param {string} s
 * @returns {string}
 */
export function normalizeHeading(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && w !== 'and')
    .join(' ')
    .trim();
}

/**
 * Build a normalized-alias -> canonical-key map plus a flat list for
 * prefix/suffix matching.
 * @returns {{ exact: Map<string,string>, list: {alias:string, key:string}[] }}
 */
export function buildAliasIndex() {
  /** @type {Map<string,string>} */
  const exact = new Map();
  /** @type {{alias:string, key:string}[]} */
  const list = [];
  for (const [key, aliases] of Object.entries(SECTION_ALIASES)) {
    for (const a of aliases) {
      const norm = normalizeHeading(a);
      if (!exact.has(norm)) exact.set(norm, key);
      list.push({ alias: norm, key });
    }
  }
  // Longer aliases first so "professional experience" beats "experience" on a
  // prefix/suffix tie.
  list.sort((a, b) => b.alias.length - a.alias.length);
  return { exact, list };
}
