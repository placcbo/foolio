import { SECTION_TYPES } from '../data/sectionTypes';
import { IconX, IconUpload } from './icons';

export default function AddContentModal({ existingTypes, onAdd, onClose }) {
  const available = SECTION_TYPES.filter(
    (s) => s.repeatable || !existingTypes.includes(s.type)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add content</h2>
          <div className="modal-header-right">
            <span className="quick-start-label">Quick start:</span>
            <button type="button" className="import-btn">
              <IconUpload size={16} />
              Import Resume
            </button>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <IconX size={18} />
          </button>
        </div>

        <div className="modal-grid">
          {available.map((s) => (
            <button
              key={s.type}
              type="button"
              className="section-type-card"
              onClick={() => onAdd(s.type)}
            >
              <div className="section-type-title">
                <span className="section-type-icon">{s.icon}</span>
                {s.label}
              </div>
              <p>{s.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
