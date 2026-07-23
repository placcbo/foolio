/**
 * Job-title tokens and seniority modifiers — the "this segment is a role"
 * signals. Data only.
 */

export const JOB_TITLE_TOKENS = [
  'Engineer', 'Developer', 'Manager', 'Analyst', 'Intern', 'Consultant',
  'Designer', 'Architect', 'Administrator', 'Specialist', 'Coordinator',
  'Assistant', 'Associate', 'Director', 'Officer', 'Lead', 'Head', 'Scientist',
  'Technician', 'Accountant', 'Chef', 'Supervisor', 'Executive',
  'Representative', 'Agent', 'Trainee', 'Attaché', 'Attache', 'Programmer',
  'Strategist', 'Researcher', 'Editor', 'Writer', 'Marketer', 'Recruiter',
  'Nurse', 'Teacher', 'Lecturer', 'Advisor', 'Auditor', 'Planner', 'Clerk',
];

export const SENIORITY_TOKENS = [
  'Senior', 'Junior', 'Jr', 'Sr', 'Principal', 'Staff', 'Lead', 'Chief',
  'Graduate', 'Entry-level', 'Head of', 'Mid-level', 'Intermediate',
];

function toRe(list) {
  const escaped = list.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'i');
}

export const JOB_TITLE_RE = toRe(JOB_TITLE_TOKENS);
export const SENIORITY_RE = toRe(SENIORITY_TOKENS);

/** @param {string} text @returns {boolean} */
export function hasJobTitle(text) {
  return JOB_TITLE_RE.test(text || '');
}

/** @param {string} text @returns {boolean} */
export function hasSeniority(text) {
  return SENIORITY_RE.test(text || '');
}
