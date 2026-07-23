import { useMemo, useRef, useState } from 'react';
import { IconX, IconUpload, IconCheck, IconFileText, IconInfo } from './icons';
import { parseResumeText } from '../utils/resumeParser';
import { extractTextFromFile } from '../utils/extractResumeFile';

const SAMPLE_HINT = `Upload a PDF or DOCX, or paste your resume as plain text. For a paste, copy it
out of Word, Google Docs, or an old resume, and keep section headings like
"Experience" or "Education" on their own line.`;

const FILE_ERROR = {
  unsupported: 'That file type isn’t supported — upload a PDF or DOCX, or paste the text.',
  empty: 'We couldn’t find any text in that file. Try pasting the resume instead.',
  failed: 'We couldn’t read that file. Try pasting the resume text instead.',
  scanned:
    'We couldn’t detect selectable text — this looks like a scanned or photographed PDF. Please copy/paste the resume or upload a DOCX.',
};

export default function ImportResumeModal({ onImport, onClose }) {
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const parsed = useMemo(() => (text.trim() ? parseResumeText(text) : null), [text]);

  async function handleFile(file) {
    if (!file) return;
    setFileError(null);
    setBusy(true);
    const result = await extractTextFromFile(file);
    setBusy(false);
    if (result.text) {
      setText(result.text);
      setTouched(true);
      return;
    }
    // scanned / unsupported / empty / failed all surface as a message, and
    // the paste path stays fully available underneath.
    setFileError(FILE_ERROR[result.scanned ? 'scanned' : result.error] || FILE_ERROR.failed);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

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

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              className={`import-modal-drop${dragging ? ' is-dragging' : ''}${busy ? ' is-busy' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              disabled={busy}
            >
              {busy ? (
                <span className="import-modal-drop-label">Reading your file…</span>
              ) : (
                <>
                  <IconFileText size={20} />
                  <span className="import-modal-drop-label">
                    <strong>Upload a PDF or DOCX</strong>
                    <span>or drag it here</span>
                  </span>
                </>
              )}
            </button>

            {fileError && (
              <p className="import-modal-file-error" role="alert">
                <IconInfo size={14} />
                {fileError}
              </p>
            )}

            <div className="import-modal-or" aria-hidden="true">
              <span>or paste text</span>
            </div>

            <textarea
              className="import-modal-textarea"
              placeholder="Paste your resume text here…"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setTouched(true);
              }}
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
