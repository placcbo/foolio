import { useEffect, useRef, useState } from 'react';
import { IconX, IconCheck } from './icons';

const TEMPLATE_FEATURES = [
  'A4 / US-Letter size',
  'Editable text',
  'Fully customizable',
  'Print ready format',
];

const PAPER_WIDTH = 794;

export default function PreviewModal({ mode, Template, resume, name, onClose, onUseTemplate }) {
  const columnRef = useRef(null);
  // The paper is a fixed 794px box, but this column's available width
  // depends on the modal layout (narrower in "template" mode, which shares
  // space with the info sidebar). Rendering the paper at native size inside
  // a narrower column just overflows it — scaling never happened here, so
  // it silently cropped instead. `zoom` (not `transform`) so the box model
  // actually shrinks too, meaning no separate height math is needed to stop
  // the column leaving a tall empty gap below a scaled-down page.
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth - 48; // breathing room inside the column
      setScale(Math.min(1, Math.max(0.3, available / PAPER_WIDTH)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

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
      {mode === 'template' && (
        <button
          type="button"
          className="preview-modal-close preview-modal-close-floating"
          onClick={onClose}
          aria-label="Close preview"
        >
          <IconX size={20} />
        </button>
      )}

      <div
        className={`preview-modal ${mode === 'template' ? 'preview-modal-template' : 'preview-modal-live'}`}
        style={mode === 'template' ? { '--modal-accent': resume.accentColor } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {mode !== 'template' && (
          <button type="button" className="preview-modal-close" onClick={onClose} aria-label="Close preview">
            <IconX size={20} />
          </button>
        )}

        <div className="preview-modal-paper-col" ref={columnRef}>
          <div style={{ zoom: scale }}>
            <Template resume={resume} accentColor={resume.accentColor} />
          </div>
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