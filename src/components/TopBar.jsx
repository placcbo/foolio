import { useEffect, useRef, useState } from 'react';
import {
  IconChevronDown,
  IconMoreVertical,
  IconArrowLeft,
  IconCheck,
  IconInfo,
  IconEdit,
  IconPlus,
} from './icons';
import DownloadMenu from './DownloadMenu';

const SAVE_ERROR_MESSAGE = {
  'storage-full': "Your browser's storage is full (likely from an uploaded photo) — recent changes are NOT being saved. Try a smaller photo or free up storage.",
  unknown: 'Your changes are not being saved right now. Keep this tab open, or copy your work elsewhere as a backup.',
};

function ResumeSwitcher({ library, activeResumeId, onSwitch, onCreate, onRename }) {
  const [open, setOpen] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [draft, setDraft] = useState('');
  const ref = useRef(null);
  const active = library.find((r) => r.id === activeResumeId);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setRenamingId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function commitRename(id) {
    onRename(id, draft);
    setRenamingId(null);
  }

  return (
    <div className="resume-switcher" ref={ref}>
      <button type="button" className="resume-select" onClick={() => setOpen((v) => !v)}>
        {active?.name || 'Resume'}
        <IconChevronDown size={14} />
      </button>

      {open && (
        <div className="resume-switcher-dropdown">
          {library.map((r) => (
            <div key={r.id} className={`resume-switcher-item${r.id === activeResumeId ? ' active' : ''}`}>
              {renamingId === r.id ? (
                <input
                  type="text"
                  className="resume-switcher-rename-input"
                  value={draft}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commitRename(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(r.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                />
              ) : (
                <>
                  <button
                    type="button"
                    className="resume-switcher-item-label"
                    onClick={() => {
                      onSwitch(r.id);
                      setOpen(false);
                    }}
                  >
                    {r.id === activeResumeId && <IconCheck size={13} />}
                    {r.name}
                  </button>
                  <button
                    type="button"
                    className="resume-switcher-item-edit"
                    aria-label="Rename"
                    onClick={() => {
                      setDraft(r.name);
                      setRenamingId(r.id);
                    }}
                  >
                    <IconEdit size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
          <button
            type="button"
            className="resume-switcher-new"
            onClick={() => {
              setOpen(false);
              onCreate();
            }}
          >
            <IconPlus size={14} />
            New Resume
          </button>
        </div>
      )}
    </div>
  );
}

export default function TopBar({
  onBack,
  resume,
  savedAt,
  saveError,
  paperRef,
  library,
  activeResumeId,
  onSwitchResume,
  onCreateResume,
  onRenameResume,
}) {
  return (
    <header className="topbar">
      {onBack && (
        <button type="button" className="back-btn" onClick={onBack}>
          <IconArrowLeft size={16} />
          Templates
        </button>
      )}

      <div className="topbar-right">
        {saveError ? (
          <span className="save-indicator save-indicator-error" title={SAVE_ERROR_MESSAGE[saveError]}>
            <IconInfo size={13} />
            Not saved
          </span>
        ) : (
          savedAt && (
            <span className="save-indicator">
              <IconCheck size={13} />
              Saved
            </span>
          )
        )}
        {library && (
          <ResumeSwitcher
            library={library}
            activeResumeId={activeResumeId}
            onSwitch={onSwitchResume}
            onCreate={onCreateResume}
            onRename={onRenameResume}
          />
        )}
        <DownloadMenu resume={resume} paperRef={paperRef} />
        <button type="button" className="icon-btn" aria-label="More options">
          <IconMoreVertical size={18} />
        </button>
      </div>
    </header>
  );
}
