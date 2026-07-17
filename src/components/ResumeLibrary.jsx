import { useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconCheck, IconFileText, IconArrowLeft } from './icons';

function timeAgo(ts) {
  if (!ts) return 'Not saved yet';
  const diff = Date.now() - ts;
  const min = 60000;
  const hr = 3600000;
  const day = 86400000;
  if (diff < min) return 'Just now';
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`;
  return new Date(ts).toLocaleDateString();
}

function RenameField({ entry, onRename, onDone, className }) {
  const [draft, setDraft] = useState(entry.name);
  function commit() {
    onRename(entry.id, draft);
    onDone();
  }
  return (
    <input
      type="text"
      className={className}
      value={draft}
      autoFocus
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') onDone();
      }}
    />
  );
}

function CardActions({ entry, onDuplicate, onDelete, onRename: startRename }) {
  return (
    <div className="resume-card-actions">
      <button type="button" className="resume-card-action-btn" onClick={startRename} aria-label="Rename">
        <IconEdit size={14} />
      </button>
      <button
        type="button"
        className="resume-card-action-btn"
        onClick={() => onDuplicate(entry.id)}
        aria-label="Duplicate"
      >
        <IconPlus size={14} />
      </button>
      <button
        type="button"
        className="resume-card-action-btn resume-card-action-danger"
        onClick={() => onDelete(entry.id)}
        aria-label="Delete"
      >
        <IconTrash size={14} />
      </button>
    </div>
  );
}

function FeaturedCard({ entry, isActive, onSwitch, onDuplicate, onDelete, onRename }) {
  const [renaming, setRenaming] = useState(false);

  return (
    <div className="resume-featured-card">
      <button
        type="button"
        className="resume-featured-swatch"
        style={{ background: entry.accentColor || '#000' }}
        onClick={() => onSwitch(entry.id)}
        aria-label={`Open ${entry.name}`}
      >
        <IconFileText size={48} />
        {isActive && <span className="resume-card-active-badge">Currently editing</span>}
      </button>

      <div className="resume-featured-body">
        <span className="resume-featured-eyebrow">Continue where you left off</span>
        {renaming ? (
          <RenameField
            entry={entry}
            onRename={onRename}
            onDone={() => setRenaming(false)}
            className="resume-featured-rename-input"
          />
        ) : (
          <h2 className="resume-featured-title">{entry.name}</h2>
        )}
        <p className="resume-featured-meta">Edited {timeAgo(entry.updatedAt)}</p>

        <div className="resume-featured-footer">
          <button type="button" className="done-btn" onClick={() => onSwitch(entry.id)}>
            Continue editing
            <IconArrowLeft size={15} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <CardActions entry={entry} onDuplicate={onDuplicate} onDelete={onDelete} onRename={() => setRenaming(true)} />
        </div>
      </div>
    </div>
  );
}

function ResumeCard({ entry, isActive, onSwitch, onDuplicate, onDelete, onRename }) {
  const [renaming, setRenaming] = useState(false);

  return (
    <div className={`resume-card${isActive ? ' active' : ''}`}>
      <button
        type="button"
        className="resume-card-swatch"
        style={{ background: entry.accentColor || '#000' }}
        onClick={() => onSwitch(entry.id)}
        aria-label={`Open ${entry.name}`}
      >
        <IconFileText size={22} />
        {isActive && <span className="resume-card-active-badge">Currently editing</span>}
      </button>

      <div className="resume-card-body">
        {renaming ? (
          <RenameField
            entry={entry}
            onRename={onRename}
            onDone={() => setRenaming(false)}
            className="resume-card-rename-input"
          />
        ) : (
          <button type="button" className="resume-card-title" onClick={() => onSwitch(entry.id)}>
            {entry.name}
          </button>
        )}
        <span className="resume-card-meta">Edited {timeAgo(entry.updatedAt)}</span>
        <CardActions entry={entry} onDuplicate={onDuplicate} onDelete={onDelete} onRename={() => setRenaming(true)} />
      </div>
    </div>
  );
}

export default function ResumeLibrary({ library, activeResumeId, onSwitch, onCreate, onDuplicate, onDelete, onRename }) {
  const sorted = [...library].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const [featured, ...rest] = sorted;

  return (
    <div className="resume-library">
      <div className="resume-library-header">
        <h1>Your resumes</h1>
        <p>
          {library.length} {library.length === 1 ? 'resume' : 'resumes'} saved on this device
        </p>
      </div>

      {featured && (
        <FeaturedCard
          entry={featured}
          isActive={featured.id === activeResumeId}
          onSwitch={onSwitch}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onRename={onRename}
        />
      )}

      <div className="resume-library-grid">
        <button type="button" className="resume-card resume-card-new" onClick={onCreate}>
          <span className="resume-card-new-icon">
            <IconPlus size={20} />
          </span>
          New resume
        </button>

        {rest.map((entry) => (
          <ResumeCard
            key={entry.id}
            entry={entry}
            isActive={entry.id === activeResumeId}
            onSwitch={onSwitch}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onRename={onRename}
          />
        ))}
      </div>

      {library.length <= 1 && (
        <p className="resume-library-hint">
          <span className="resume-library-hint-icon">
            <IconCheck size={13} />
          </span>
          Tip: keep a separate copy for each job you apply to — duplicate a resume and tailor it instead of
          overwriting your main one.
        </p>
      )}
    </div>
  );
}
