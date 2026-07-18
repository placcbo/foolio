import { useState } from 'react';
import TemplateCard from './TemplateCard';
import { TEMPLATES, FILTERS } from '../data/templates';
import { IconChevronDown, IconX, IconGrid, IconStar, IconBox, IconHexagon, IconPalette, IconUser, IconFlag } from './icons';

// Roughly two rows at the grid's typical column count — exact row count
// varies with viewport width since the grid is responsive, but this keeps
// the initial view short with "See more" revealing the rest.
const INITIAL_VISIBLE_COUNT = 10;

const FILTER_ICONS = {
  all: IconGrid,
  popular: IconStar,
  simple: IconBox,
  modern: IconHexagon,
  creative: IconPalette,
  professional: IconUser,
  executive: IconFlag,
};

export default function TemplatePicker({ onSelectTemplate, onCancel, hasExistingResumes }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = TEMPLATES.filter(
    (t) =>
      (activeFilter === 'all' || t.categories.includes(activeFilter)) &&
      (!q || t.name.toLowerCase().includes(q) || t.categories.some((cat) => cat.includes(q)))
  );
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = !showAll && filtered.length > INITIAL_VISIBLE_COUNT;

  function handleFilterChange(id) {
    setActiveFilter(id);
    setShowAll(false);
  }

  return (
    <div className="picker-page">
      {onCancel && (
        <button type="button" className="picker-cancel-btn" onClick={onCancel} aria-label="Cancel">
          <IconX size={18} />
        </button>
      )}

      <div className="picker-header">
        <h1>{hasExistingResumes ? 'Pick a design for your new resume' : 'Start building your resume'}</h1>
        <p>Choose a design you like. You can customize or switch it later.</p>
      </div>

      <div className="picker-toolbar">
        <nav className="filter-tabs">
          {FILTERS.map((f) => {
            const Icon = FILTER_ICONS[f.id];
            return (
              <button
                key={f.id}
                type="button"
                className={`filter-tab${activeFilter === f.id ? ' active' : ''}`}
                onClick={() => handleFilterChange(f.id)}
              >
                {Icon && <Icon size={14} />}
                {f.label}
              </button>
            );
          })}
        </nav>
        <input
          type="search"
          className="picker-search"
          placeholder="Search templates…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowAll(false);
          }}
        />
      </div>

      {filtered.length > 0 ? (
        <>
          <p className="picker-count">
            {filtered.length} {filtered.length === 1 ? 'template' : 'templates'}
          </p>
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
      ) : q ? (
        <div className="template-grid-empty">
          <p>No templates match “{query}”.</p>
          <button type="button" className="skip-templates-btn" onClick={() => setQuery('')}>
            Clear search
          </button>
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
