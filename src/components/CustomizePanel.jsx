import { useState } from 'react';
import { IconChevronDown, IconChevronUp, IconRefresh, IconUndo, IconRedo } from './icons';
import { DATE_FORMATS } from '../utils/dateFormat';
import { TEMPLATES } from '../data/templates';
import { TEMPLATE_COMPONENTS } from './templates';
import { DEFAULT_LAYOUT } from '../state/resumeReducer';
import ApplyTemplateModal from './ApplyTemplateModal';

const NAV_ITEMS = [
  { id: 'document', label: 'Document' },
  { id: 'templates', label: 'Templates' },
  { id: 'layout', label: 'Layout' },
  { id: 'fontSize', label: 'Font Size' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'entries', label: 'Entries' },
  { id: 'headings', label: 'Headings' },
  { id: 'font', label: 'Font' },
  { id: 'colors', label: 'Colors' },
  { id: 'header', label: 'Header' },
  { id: 'photo', label: 'Photo' },
  { id: 'links', label: 'Links' },
  { id: 'footer', label: 'Footer' },
  { id: 'sections', label: 'Sections' },
];

const LANGUAGES = ['English (UK)', 'English (US)', 'Spanish', 'French', 'German', 'Portuguese'];
const PAGE_FORMATS = ['A4', 'US Letter'];

const THUMB_SCALE = 0.16;

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="customize-field">
      <label>{label}</label>
      <div className="customize-select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt.id ?? opt} value={opt.id ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <IconChevronDown size={16} className="customize-select-chevron" />
      </div>
    </div>
  );
}

function DesignTemplates({ resume, dispatch }) {
  const [browseOpen, setBrowseOpen] = useState(false);

  return (
    <div className="customize-card">
      <h2>Design Templates</h2>
      <p className="customize-card-sub">
        Update your entire resume design with one click
        <span className="design-templates-sync-icon" aria-hidden="true">
          <IconRefresh size={12} />
        </span>
      </p>

      <div className="design-templates-strip">
        {TEMPLATES.map((t) => {
          const Template = TEMPLATE_COMPONENTS[t.layout];
          const active = resume.templateId === t.layout;
          const thumbResume = { ...resume, templateId: t.layout, accentColor: t.swatches[0] };
          return (
            <button
              type="button"
              key={t.id}
              className={`design-template-thumb${active ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TEMPLATE', templateId: t.layout, accentColor: t.swatches[0] })}
              aria-label={`Use ${t.name} template`}
            >
              <div className="design-template-thumb-scale" style={{ transform: `scale(${THUMB_SCALE})` }}>
                <Template resume={thumbResume} accentColor={t.swatches[0]} />
              </div>
            </button>
          );
        })}

        <div className="design-templates-overlay">
          <button type="button" className="design-templates-browse-btn" onClick={() => setBrowseOpen(true)}>
            Browse templates
          </button>
        </div>
      </div>

      {browseOpen && (
        <ApplyTemplateModal resume={resume} dispatch={dispatch} onClose={() => setBrowseOpen(false)} />
      )}
    </div>
  );
}

function DocumentSection({ resume, dispatch }) {
  const settings = resume.settings;

  function updateSetting(field, value) {
    dispatch({ type: 'UPDATE_SETTINGS', field, value });
  }

  return (
    <>
      <div className="customize-card">
        <h2>Document Settings</h2>

        <SelectField
          label="Language"
          value={settings.language}
          onChange={(v) => updateSetting('language', v)}
          options={LANGUAGES}
        />
        <SelectField
          label="Date Format"
          value={settings.dateFormat}
          onChange={(v) => updateSetting('dateFormat', v)}
          options={DATE_FORMATS}
        />
        <SelectField
          label="Page Format"
          value={settings.pageFormat}
          onChange={(v) => updateSetting('pageFormat', v)}
          options={PAGE_FORMATS}
        />
      </div>

      <DesignTemplates resume={resume} dispatch={dispatch} />
    </>
  );
}

function ColumnsPreview({ variant }) {
  if (variant === 'one') {
    return (
      <span className="layout-preview layout-preview-one">
        <span className="layout-bar" />
        <span className="layout-bar" />
        <span className="layout-bar" />
      </span>
    );
  }
  if (variant === 'two') {
    return (
      <span className="layout-preview layout-preview-two">
        <span className="layout-col">
          <span className="layout-bar layout-bar-sm" />
          <span className="layout-bar layout-bar-sm" />
        </span>
        <span className="layout-col">
          <span className="layout-bar layout-bar-sm" />
          <span className="layout-bar layout-bar-sm" />
        </span>
      </span>
    );
  }
  return (
    <span className="layout-preview layout-preview-mix">
      <span className="layout-col">
        <span className="layout-bar layout-bar-sm" />
        <span className="layout-bar layout-bar-sm" />
        <span className="layout-bar layout-bar-sm" />
      </span>
      <span className="layout-col">
        <span className="layout-bar layout-bar-sm" />
        <span className="layout-bar layout-bar-sm" />
      </span>
    </span>
  );
}

function HeaderPositionPreview({ variant }) {
  return <span className={`layout-header-preview layout-header-preview-${variant}`} />;
}

function LayoutOption({ label, active, onClick, children }) {
  return (
    <button type="button" className={`layout-option${active ? ' active' : ''}`} onClick={onClick}>
      {children}
      <span className="layout-option-label">{label}</span>
    </button>
  );
}

function SectionOrderList({ resume, dispatch }) {
  const { sections } = resume;

  return (
    <div className="customize-field">
      <label>Change Section Layout</label>
      {sections.length === 0 ? (
        <p className="layout-empty-hint">You don't have any sections to rearrange yet 📃</p>
      ) : (
        <ul className="section-order-list">
          {sections.map((s, i) => (
            <li className="section-order-item" key={s.id}>
              <span className="section-order-title">{s.title}</span>
              <span className="section-order-controls">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => dispatch({ type: 'MOVE_SECTION', id: s.id, direction: 'up' })}
                  aria-label={`Move ${s.title} up`}
                >
                  <IconChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={i === sections.length - 1}
                  onClick={() => dispatch({ type: 'MOVE_SECTION', id: s.id, direction: 'down' })}
                  aria-label={`Move ${s.title} down`}
                >
                  <IconChevronDown size={14} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LayoutSection({ resume, dispatch }) {
  const layout = resume.settings.layout ?? DEFAULT_LAYOUT;

  function updateLayout(field, value) {
    dispatch({ type: 'UPDATE_LAYOUT', field, value });
  }

  return (
    <div className="customize-card">
      <h2>Layout</h2>

      <div className="customize-field">
        <label>Columns</label>
        <div className="layout-option-row">
          <LayoutOption label="One" active={layout.columns === 'one'} onClick={() => updateLayout('columns', 'one')}>
            <ColumnsPreview variant="one" />
          </LayoutOption>
          <LayoutOption label="Two" active={layout.columns === 'two'} onClick={() => updateLayout('columns', 'two')}>
            <ColumnsPreview variant="two" />
          </LayoutOption>
          <LayoutOption label="Mix" active={layout.columns === 'mix'} onClick={() => updateLayout('columns', 'mix')}>
            <ColumnsPreview variant="mix" />
          </LayoutOption>
        </div>
      </div>

      {layout.columns !== 'one' && (
        <div className="customize-field">
          <label>Header Position</label>
          <div className="layout-option-row">
            {['top', 'left', 'right'].map((pos) => (
              <LayoutOption
                key={pos}
                label={pos[0].toUpperCase() + pos.slice(1)}
                active={layout.headerPosition === pos}
                onClick={() => updateLayout('headerPosition', pos)}
              >
                <HeaderPositionPreview variant={pos} />
              </LayoutOption>
            ))}
          </div>
        </div>
      )}

      <SectionOrderList resume={resume} dispatch={dispatch} />

      {layout.columns !== 'one' && (
        <div className="customize-field">
          <label>Column Width</label>
          <div className="column-width-row">
            <div className="column-width-box">
              <span className="column-width-label">Left {layout.columnWidth}%</span>
              <input
                type="range"
                min="20"
                max="80"
                value={layout.columnWidth}
                onChange={(e) => updateLayout('columnWidth', Number(e.target.value))}
              />
            </div>
            <div className="column-width-box">
              <span className="column-width-label">Right {100 - layout.columnWidth}%</span>
              <input
                type="range"
                min="20"
                max="80"
                value={100 - layout.columnWidth}
                onChange={(e) => updateLayout('columnWidth', 100 - Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomizeUndoPill() {
  return (
    <div className="customize-undo-pill-wrap">
      <div className="customize-undo-pill">
        <button type="button" className="customize-undo-btn" disabled aria-label="Undo (coming soon)">
          <IconUndo size={15} />
        </button>
        <span className="customize-undo-divider" />
        <button type="button" className="customize-undo-btn" disabled aria-label="Redo (coming soon)">
          <IconRedo size={15} />
        </button>
      </div>
    </div>
  );
}

function ComingSoonCard({ label }) {
  return (
    <div className="customize-card customize-card-empty">
      <h2>{label}</h2>
      <p className="customize-card-sub">This is coming soon.</p>
    </div>
  );
}

export default function CustomizePanel({ resume, dispatch }) {
  const [activeSection, setActiveSection] = useState('document');
  const activeLabel = NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? '';

  return (
    <div className="customize-panel">
      <nav className="customize-sidebar">
        {NAV_ITEMS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`customize-sidebar-item${activeSection === item.id ? ' active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="customize-main">
        {activeSection === 'document' ? (
          <DocumentSection resume={resume} dispatch={dispatch} />
        ) : activeSection === 'templates' ? (
          <DesignTemplates resume={resume} dispatch={dispatch} />
        ) : activeSection === 'layout' ? (
          <LayoutSection resume={resume} dispatch={dispatch} />
        ) : (
          <ComingSoonCard label={activeLabel} />
        )}

        <CustomizeUndoPill />
      </div>
    </div>
  );
}
