import { useState } from 'react';
import TemplateCard from './TemplateCard';
import { TEMPLATES, FILTERS } from '../data/templates';

export default function TemplatePicker({ onSelectTemplate }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const visible = TEMPLATES.filter(
    (t) => activeFilter === 'all' || t.categories.includes(activeFilter)
  );

  return (
    <div className="picker-page">
      <div className="picker-header">
        <h1>Start building your resume</h1>
        <p>Choose a design you like. You can customize or switch it later.</p>
      </div>

      <nav className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-tab${activeFilter === f.id ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {visible.length > 0 ? (
        <div className="template-grid">
          {visible.map((t) => (
            <TemplateCard key={t.id} template={t} onSelect={onSelectTemplate} />
          ))}
        </div>
      ) : (
        <div className="template-grid-empty">
          <p>No templates in this category yet.</p>
          <button
            type="button"
            className="skip-templates-btn"
            onClick={() => onSelectTemplate('onecolumn', '#000000')}
          >
            Skip for now — go to editor
          </button>
        </div>
      )}
    </div>
  );
}