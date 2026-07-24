import { useState } from 'react';
import TemplateCard from './TemplateCard';
import ImportResumeModal from './ImportResumeModal';
import { TEMPLATES, FILTERS } from '../data/templates';
import { IconChevronDown, IconX, IconGrid, IconStar, IconBox, IconHexagon, IconPalette, IconUser, IconFlag, IconCheck, IconUpload } from './icons';

// The grid's container caps at 1280px, which fits exactly three 300px
// cards per row (a fourth would need 1296px) — so this must stay a
// multiple of 3, or the row right before "See more" ends with a single
// orphaned card instead of a full row.
const INITIAL_VISIBLE_COUNT = 9;

const FILTER_ICONS = {
  all: IconGrid,
  popular: IconStar,
  simple: IconBox,
  modern: IconHexagon,
  creative: IconPalette,
  professional: IconUser,
  executive: IconFlag,
};

// Quick scannable trust signals — deliberately things that are true today
// without needing real usage numbers, unlike "trusted by X users" claims
// this app can't back up yet.
const PROOF_ITEMS = ['ATS-friendly', 'PDF & DOCX export', 'Free to start'];

const HOW_IT_WORKS = [
  { num: '01', label: 'Pick a template' },
  { num: '02', label: 'Fill in your details' },
  { num: '03', label: 'Export to PDF or DOCX' },
];

export default function TemplatePicker({
  onSelectTemplate,
  onImportResume,
  pendingImportName,
  onCancelImport,
  onCancel,
  onHome,
  hasExistingResumes,
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  // A filter pill for an empty category is a promise the page can't keep —
  // only show categories that actually contain templates. The row grows on
  // its own as templates are added.
  const visibleFilters = FILTERS.filter(
    (f) => f.id === 'all' || TEMPLATES.some((t) => t.categories.includes(f.id))
  );
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
      {onHome ? (
        <button type="button" className="picker-brand picker-brand-btn" onClick={onHome} aria-label="Go to home page">
          <span className="picker-brand-mark">C</span>
          draftly
        </button>
      ) : (
        <div className="picker-brand" aria-hidden="true">
          <span className="picker-brand-mark">C</span>
          draftly
        </div>
      )}

      {onCancel && (
        <button type="button" className="picker-cancel-btn" onClick={onCancel} aria-label="Cancel">
          <IconX size={18} />
        </button>
      )}

      <div className="picker-header">
        {pendingImportName != null ? (
          <>
            <h1>Now pick a design</h1>
            <p>
              {pendingImportName
                ? `${pendingImportName}'s resume is imported.`
                : 'Your resume is imported.'}{' '}
              Choose a design for it — you can switch or customize later.
            </p>
          </>
        ) : (
          <>
            <h1>{hasExistingResumes ? 'Pick a design for your new resume' : 'Start building your resume'}</h1>
            <p>Choose a design you like. You can customize or switch it later.</p>
            <div className="picker-proof-row">
              {PROOF_ITEMS.map((item) => (
                <span className="picker-proof-item" key={item}>
                  <IconCheck size={13} />
                  {item}
                </span>
              ))}
            </div>
            {onImportResume && (
              <p className="picker-import-line">
                Already have a resume?{' '}
                <button type="button" className="picker-import-link" onClick={() => setImportOpen(true)}>
                  <IconUpload size={14} />
                  Import it instead
                </button>
              </p>
            )}
          </>
        )}
      </div>

      {pendingImportName != null ? (
        <div className="picker-import-banner">
          <span className="picker-import-banner-check">
            <IconCheck size={14} />
          </span>
          <span className="picker-import-banner-text">
            Resume imported — your content is ready. Pick any template below to continue.
          </span>
          {onCancelImport && (
            <button type="button" className="picker-import-banner-cancel" onClick={onCancelImport}>
              Discard import
            </button>
          )}
        </div>
      ) : (
        <div className="picker-how-it-works">
          {HOW_IT_WORKS.map((step, i) => (
            <div className="picker-how-step" key={step.num}>
              {i > 0 && <span className="picker-how-sep" aria-hidden="true" />}
              <span className="picker-how-step-num">{step.num}</span>
              <span className="picker-how-step-label">{step.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="picker-toolbar">
        <nav className="filter-tabs">
          {visibleFilters.map((f) => {
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
            onClick={() => onSelectTemplate('simple', '#e4570f')}
          >
            Skip for now — go to editor
          </button>
        </div>
      )}

      {importOpen && onImportResume && (
        <ImportResumeModal
          onClose={() => setImportOpen(false)}
          onImport={(parsed) => {
            setImportOpen(false);
            onImportResume(parsed);
          }}
        />
      )}
    </div>
  );
}