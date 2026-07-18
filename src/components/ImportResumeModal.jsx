import { useMemo, useState } from 'react';
import { IconX, IconUpload, IconCheck } from './icons';
import { parseResumeText } from '../utils/resumeParser';

const SAMPLE_HINT = `Paste your resume as plain text — copy it out of Word, Google Docs, LinkedIn's
"Save to PDF", or an old resume. Keep section headings like "Experience" or
"Education" on their own line so they're easy to spot.`;

export default function ImportResumeModal({ onImport, onClose }) {
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);

  const parsed = useMemo(() => (text.trim() ? parseResumeText(text) : null), [text]);

  function handleImport() {
    if (!parsed) return;
    onImport(parsed);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import your resume</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <IconX size={18} />
          </button>
        </div>

        <div className="import-modal-body">
          <div className="import-modal-paste-col">
            <p className="import-modal-hint">{SAMPLE_HINT}</p>
            <textarea
              className="import-modal-textarea"
              placeholder="Paste your resume text here…"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setTouched(true);
              }}
              autoFocus
            />
          </div>

          <div className="import-modal-preview-col">
            <span className="import-modal-preview-label">What we'll fill in</span>
            {!touched && (
              <div className="import-modal-preview-empty">
                <IconUpload size={22} />
                <p>Paste text on the left and we'll show a quick preview here before you commit to it.</p>
              </div>
            )}
            {touched && !parsed?.basics?.name && !parsed?.sections?.length && (
              <div className="import-modal-preview-empty">
                <p>Nothing recognizable yet — keep pasting.</p>
              </div>
            )}
            {parsed && (parsed.basics.name || parsed.sections.length > 0) && (
              <ul className="import-modal-preview-list">
                {parsed.basics.name && (
                  <li>
                    <IconCheck size={14} />
                    Name: <strong>{parsed.basics.name}</strong>
                  </li>
                )}
                {parsed.basics.email && (
                  <li>
                    <IconCheck size={14} />
                    Email: <strong>{parsed.basics.email}</strong>
                  </li>
                )}
                {parsed.basics.phone && (
                  <li>
                    <IconCheck size={14} />
                    Phone: <strong>{parsed.basics.phone}</strong>
                  </li>
                )}
                {parsed.sections.map((s) => (
                  <li key={s.id}>
                    <IconCheck size={14} />
                    {s.title}:{' '}
                    <strong>
                      {s.kind === 'entries' && `${s.entries.length} ${s.entries.length === 1 ? 'entry' : 'entries'}`}
                      {s.kind === 'tags' && `${s.tags.length} items`}
                      {s.kind === 'text' && 'found'}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
            <p className="import-modal-disclaimer">
              This is a best-effort read of your text — everything stays fully editable afterward, so don't worry
              about it being perfect.
            </p>
          </div>
        </div>

        <div className="import-modal-footer">
          <button type="button" className="import-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="done-btn"
            disabled={!parsed || (!parsed.basics.name && !parsed.sections.length)}
            onClick={handleImport}
          >
            <IconCheck size={16} />
            Use this
          </button>
        </div>
      </div>
    </div>
  );
}
