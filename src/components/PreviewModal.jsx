import { useEffect, useRef } from 'react';
import { IconX, IconCheck } from './icons';

const TEMPLATE_FEATURES = [
  'A4 / US-Letter size',
  'Editable text',
  'Fully customizable',
  'Print ready format',
];

export default function PreviewModal({ mode, Template, resume, name, onClose, onUseTemplate }) {
  const modalPaperRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('has-open-preview-modal');
    return () => document.body.classList.remove('has-open-preview-modal');
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div
        className={`preview-modal ${mode === 'template' ? 'preview-modal-template' : 'preview-modal-live'}`}
        style={mode === 'template' ? { '--modal-accent': resume.accentColor } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === 'template' && (
          <button type="button" className="preview-modal-close" onClick={onClose} aria-label="Close preview">
            <IconX size={20} />
          </button>
        )}

        <div className="preview-modal-paper-col" ref={modalPaperRef}>
          <Template resume={resume} accentColor={resume.accentColor} />
        </div>

        {mode === 'template' && (
          <div className="preview-modal-info">
            <span className="preview-modal-eyebrow">Template preview</span>
            <h2>{name}</h2>
            <p>
              Each template has been crafted with care to make designing your resume an absolute
              breeze for you.
            </p>
            <ul className="preview-modal-features">
              {TEMPLATE_FEATURES.map((f) => (
                <li key={f}>
                  <span className="preview-modal-feature-icon">
                    <IconCheck size={12} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button type="button" className="preview-modal-use-btn" onClick={onUseTemplate}>
              Use this template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}