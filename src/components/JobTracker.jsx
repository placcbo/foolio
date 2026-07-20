import { useMemo, useState } from 'react';
import { IconPlus, IconTrash, IconChevronDown, IconChevronUp, IconBriefcase, IconFileText } from './icons';
import { matchKeywords } from '../utils/keywords';

export const JOB_STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

function MatchPanel({ job, resume }) {
  const result = useMemo(() => matchKeywords(job.jdText, resume), [job.jdText, resume]);
  if (!result) return null;

  return (
    <div className="job-match">
      <div className="job-match-head">
        <span className="job-match-score">{result.score}%</span>
        <span className="job-match-label">
          keyword match · {result.matched.length} of {result.total} terms found in this resume
        </span>
      </div>

      {result.missing.length > 0 && (
        <div className="job-match-group">
          <span className="job-match-group-label">Missing from the resume</span>
          <div className="job-match-chips">
            {result.missing.map((k) => (
              <span className="job-chip job-chip-missing" key={k}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.matched.length > 0 && (
        <div className="job-match-group">
          <span className="job-match-group-label">Already covered</span>
          <div className="job-match-chips">
            {result.matched.map((k) => (
              <span className="job-chip job-chip-matched" key={k}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="job-match-note">
        Quick local scan of the job description — not an ATS simulation. Only add missing keywords where
        they're genuinely true of you.
      </p>
    </div>
  );
}

function JobCard({ job, library, loadResume, expanded, onToggle, onUpdate, onDelete, onOpenResume }) {
  const linkedEntry = library.find((r) => r.id === job.resumeId) || null;
  // Loaded from storage rather than kept in memory — fine for matching,
  // since edits autosave within half a second of typing.
  const linkedResume = useMemo(
    () => (linkedEntry ? loadResume(linkedEntry.id) : null),
    [linkedEntry, loadResume, expanded, job.jdText]
  );

  function update(field, value) {
    onUpdate(job.id, { [field]: value });
  }

  return (
    <div className={`job-card${expanded ? ' expanded' : ''}`}>
      <button type="button" className="job-card-row" onClick={onToggle}>
        <span className={`job-status-dot status-${job.status.toLowerCase()}`} aria-hidden="true" />
        <span className="job-card-title">
          {job.company || job.role ? (
            <>
              <strong>{job.company || 'Company'}</strong>
              {job.role ? ` · ${job.role}` : ''}
            </>
          ) : (
            <span className="job-card-untitled">New job</span>
          )}
        </span>
        {linkedEntry && (
          <span className="job-card-resume">
            <IconFileText size={13} />
            {linkedEntry.name}
          </span>
        )}
        <span className="job-card-status-label">{job.status}</span>
        {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="job-card-body">
          <div className="job-fields-row">
            <div className="job-field">
              <label>Company</label>
              <input
                type="text"
                placeholder="e.g. Safaricom"
                value={job.company}
                onChange={(e) => update('company', e.target.value)}
              />
            </div>
            <div className="job-field">
              <label>Role</label>
              <input
                type="text"
                placeholder="e.g. Customer Support Lead"
                value={job.role}
                onChange={(e) => update('role', e.target.value)}
              />
            </div>
          </div>

          <div className="job-fields-row">
            <div className="job-field">
              <label>Status</label>
              <select value={job.status} onChange={(e) => update('status', e.target.value)}>
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="job-field">
              <label>Resume for this application</label>
              <select value={job.resumeId || ''} onChange={(e) => update('resumeId', e.target.value || null)}>
                <option value="">— none linked —</option>
                {library.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="job-field">
            <label>Job description</label>
            <textarea
              className="job-jd-input"
              placeholder="Paste the job posting here — it powers the keyword match below (and content suggestions later)."
              value={job.jdText}
              onChange={(e) => update('jdText', e.target.value)}
            />
          </div>

          {job.jdText.trim() && linkedResume && <MatchPanel job={job} resume={linkedResume} />}
          {job.jdText.trim() && !linkedResume && (
            <p className="job-match-note">Link a resume above to see how well it matches this description.</p>
          )}

          <div className="job-card-footer">
            {linkedEntry && (
              <button type="button" className="job-open-resume-btn" onClick={() => onOpenResume(linkedEntry.id)}>
                Open {linkedEntry.name}
              </button>
            )}
            <button
              type="button"
              className="job-delete-btn"
              onClick={() => {
                if (window.confirm(`Delete the ${job.company || 'untitled'} application? This can't be undone.`)) {
                  onDelete(job.id);
                }
              }}
            >
              <IconTrash size={14} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobTracker({ jobs, library, loadResume, onAdd, onUpdate, onDelete, onOpenResume }) {
  const [expandedId, setExpandedId] = useState(null);

  function handleAdd() {
    const id = onAdd();
    setExpandedId(id);
  }

  return (
    <div className="jobs-page">
      <div className="jobs-head">
        <div>
          <h1>Job tracker</h1>
          <p>
            {jobs.length} {jobs.length === 1 ? 'application' : 'applications'} · saved on this device
          </p>
        </div>
        <button type="button" className="done-btn" onClick={handleAdd}>
          <IconPlus size={15} />
          Add job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="jobs-empty">
          <IconBriefcase size={30} />
          <h2>Track every application in one place</h2>
          <p>
            Save the jobs you're applying to, paste each job description, link the resume you tailored for
            it, and see instantly which keywords from the posting your resume covers — and which it's missing.
          </p>
          <button type="button" className="done-btn" onClick={handleAdd}>
            <IconPlus size={15} />
            Add your first job
          </button>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              library={library}
              loadResume={loadResume}
              expanded={expandedId === job.id}
              onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onOpenResume={onOpenResume}
            />
          ))}
        </div>
      )}
    </div>
  );
}