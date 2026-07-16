import { useEffect, useState } from 'react';
import { IconX, IconStar, IconBox, IconHexagon, IconPalette } from './icons';
import { TEMPLATES, FILTERS } from '../data/templates';
import { TEMPLATE_COMPONENTS } from './templates';
import { applyPresetToSettings } from '../utils/templatePreset';
import { TEMPLATE_DEFAULT_LAYOUT } from '../state/resumeReducer';

const FILTER_ICONS = {
  popular: IconStar,
  simple: IconBox,
  modern: IconHexagon,
  creative: IconPalette,
};

const SCALE = 0.208;

export default function ApplyTemplateModal({ resume, dispatch, onClose }) {
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const visible = TEMPLATES.filter(
    (t) => activeFilter === 'all' || t.categories.includes(activeFilter)
  );

  function applyTemplate(template) {
    dispatch({
      type: 'SET_TEMPLATE',
      templateId: template.layout,
      accentColor: template.swatches[0],
      preset: template.preset,
    });
    onClose();
  }

  return (
    <div className="apply-template-overlay" onClick={onClose}>
      <div className="apply-template-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="apply-template-close" onClick={onClose} aria-label="Close">
          <IconX size={18} />
        </button>

        <h1>Apply a design template</h1>

        <nav className="apply-template-filters">
          {FILTERS.map((f) => {
            const Icon = FILTER_ICONS[f.id];
            return (
              <button
                type="button"
                key={f.id}
                className={`apply-template-filter${activeFilter === f.id ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {Icon && <Icon size={14} />}
                {f.label}
              </button>
            );
          })}
        </nav>

        {visible.length > 0 ? (
          <div className="apply-template-grid">
            {visible.map((t) => {
              const Template = TEMPLATE_COMPONENTS[t.layout];
              const active = resume.templateId === t.layout;
              const previewResume = {
                ...resume,
                templateId: t.layout,
                accentColor: t.swatches[0],
                settings: applyPresetToSettings(resume.settings, t.preset, TEMPLATE_DEFAULT_LAYOUT[t.layout]),
              };
              return (
                <button
                  type="button"
                  key={t.id}
                  className={`apply-template-card${active ? ' active' : ''}`}
                  onClick={() => applyTemplate(t)}
                >
                  <span className="apply-template-card-preview">
                    <span className="apply-template-card-scale" style={{ transform: `scale(${SCALE})` }}>
                      <Template resume={previewResume} accentColor={t.swatches[0]} />
                    </span>
                  </span>
                  <span className="apply-template-card-label">{t.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="apply-template-empty">No templates in this category yet.</p>
        )}
      </div>
    </div>
  );
}
