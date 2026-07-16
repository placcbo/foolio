import { useState } from 'react';
import TemplateCard from './TemplateCard';
import { TEMPLATES, FILTERS } from '../data/templates';
import { IconChevronDown } from './icons';

// Roughly two rows at the grid's typical column count — exact row count
// varies with viewport width since the grid is responsive, but this keeps
// the initial view short with "See more" revealing the rest.
const INITIAL_VISIBLE_COUNT = 10;

export default function TemplatePicker({ onSelectTemplate }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const filtered = TEMPLATES.filter(
    (t) => activeFilter === 'all' || t.categories.includes(activeFilter)
  );
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = !showAll && filtered.length > INITIAL_VISIBLE_COUNT;

  function handleFilterChange(id) {
    setActiveFilter(id);
    setShowAll(false);
  }

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
            onClick={() => handleFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {filtered.length > 0 ? (
        <>
          <div className="template-grid">
            {visible.map((t) => (
              <TemplateCard key={t.id} template={t} onSelect={onSelectTemplate} />
            ))}
          </div>
          {hasMore && (
            <button type="button" className="see-more-templates-btn" onClick={() => setShowAll(true)}>
              See more templates
              <IconChevronDown size={16} />
            </button>
          )}
        </>
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
