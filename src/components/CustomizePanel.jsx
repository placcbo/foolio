import { useState } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
  IconUndo,
  IconRedo,
  IconMinus,
  IconPlus,
  IconInfo,
} from './icons';
import { DATE_FORMATS } from '../utils/dateFormat';
import { TEMPLATES } from '../data/templates';
import { TEMPLATE_COMPONENTS } from './templates';
import {
  DEFAULT_LAYOUT,
  DEFAULT_FONT_SIZE,
  DEFAULT_SPACING,
  DEFAULT_ENTRY_LAYOUT,
} from '../state/resumeReducer';
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

const FONT_SIZE_FIELDS = [
  { field: 'base', label: 'Base Font Size', min: 8, max: 16, step: 0.5, format: (v) => `${v}pt` },
  { field: 'fullName', label: 'Full Name', min: 0, max: 20, step: 1, format: (v) => `+${v}pt` },
  { field: 'sectionHeadings', label: 'Section Headings', min: 0, max: 10, step: 1, format: (v) => `+${v}pt` },
  { field: 'entryHeader', label: 'Entry Header', min: 0, max: 6, step: 1, format: (v) => `+${v}pt` },
];

function TickSlider({ label, value, min, max, step, format, onChange }) {
  const clamp = (v) => Math.min(max, Math.max(min, +v.toFixed(2)));

  return (
    <div className="fontsize-field">
      <div className="fontsize-field-top">
        <span className="fontsize-field-label">{label}</span>
        <span className="fontsize-field-value">{format(value)}</span>
      </div>
      <div className="fontsize-slider-row">
        <div className="fontsize-slider-track">
          <div className="fontsize-slider-ticks" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <span className="fontsize-tick" key={i} />
            ))}
          </div>
          <input
            type="range"
            className="fontsize-range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(clamp(Number(e.target.value)))}
            aria-label={label}
          />
        </div>
        <button type="button" onClick={() => onChange(clamp(value - step))} aria-label={`Decrease ${label}`}>
          <IconMinus size={14} />
        </button>
        <button type="button" onClick={() => onChange(clamp(value + step))} aria-label={`Increase ${label}`}>
          <IconPlus size={14} />
        </button>
      </div>
    </div>
  );
}

function FontSizeSection({ resume, dispatch }) {
  const fontSize = resume.settings.fontSize ?? DEFAULT_FONT_SIZE;

  function updateFontSize(field, value) {
    dispatch({ type: 'UPDATE_FONT_SIZE', field, value });
  }

  return (
    <div className="customize-card">
      <h2>Font Size</h2>
      {FONT_SIZE_FIELDS.map((f) => (
        <TickSlider
          key={f.field}
          label={f.label}
          value={fontSize[f.field]}
          min={f.min}
          max={f.max}
          step={f.step}
          format={f.format}
          onChange={(v) => updateFontSize(f.field, v)}
        />
      ))}
    </div>
  );
}

const trimDecimal = (v) => Number(v.toFixed(2)).toString();

const SPACING_FIELDS = [
  { field: 'lineHeight', label: 'Line Height', min: 1, max: 2, step: 0.05, format: trimDecimal },
  {
    field: 'spaceBetween',
    label: 'Space Between Elements',
    min: 0,
    max: 10,
    step: 1,
    format: (v) => (v === 0 ? '[-]' : `+${v}mm`),
  },
  { field: 'marginLR', label: 'Left & Right Margin', min: 8, max: 40, step: 1, format: (v) => `${v}mm` },
  { field: 'marginTB', label: 'Top & Bottom Margin', min: 4, max: 30, step: 1, format: (v) => `${v}mm` },
];

function SpacingSection({ resume, dispatch }) {
  const spacing = resume.settings.spacing ?? DEFAULT_SPACING;

  function updateSpacing(field, value) {
    dispatch({ type: 'UPDATE_SPACING', field, value });
  }

  return (
    <div className="customize-card">
      <h2>Spacing</h2>
      {SPACING_FIELDS.map((f) => (
        <TickSlider
          key={f.field}
          label={f.label}
          value={spacing[f.field]}
          min={f.min}
          max={f.max}
          step={f.step}
          format={f.format}
          onChange={(v) => updateSpacing(f.field, v)}
        />
      ))}
    </div>
  );
}

function PillOption({ label, active, onClick, children }) {
  return (
    <button type="button" className={`pill-option${active ? ' active' : ''}`} onClick={onClick}>
      {children}
      {label}
    </button>
  );
}

const AA_STYLES = ['regular', 'bold', 'italic'];

function StyleAaPicker({ value, onChange, label }) {
  return (
    <div className="aa-style-row">
      {AA_STYLES.map((s) => (
        <button
          type="button"
          key={s}
          className={`aa-style-btn aa-style-${s}${value === s ? ' active' : ''}`}
          onClick={() => onChange(s)}
          aria-label={`${label}: ${s}`}
        >
          Aa
        </button>
      ))}
    </div>
  );
}

function EntriesSection({ resume, dispatch, onNavigate }) {
  const el = resume.settings.entryLayout ?? DEFAULT_ENTRY_LAYOUT;
  const [advancedOpen, setAdvancedOpen] = useState(true);

  function update(field, value) {
    dispatch({ type: 'UPDATE_ENTRY_LAYOUT', field, value });
  }

  const showSplitWidths =
    el.headerSplit === 'manual' && (el.structure === 'columns' || el.dateLocationPosition === 'right');

  return (
    <div className="customize-card">
      <h2>Entry Layout</h2>

      <div className="customize-field">
        <label>Structure</label>
        <div className="layout-option-row">
          <LayoutOption label="Full Width" active={el.structure === 'full'} onClick={() => update('structure', 'full')}>
            <ColumnsPreview variant="one" />
          </LayoutOption>
          <LayoutOption label="Columns" active={el.structure === 'columns'} onClick={() => update('structure', 'columns')}>
            <ColumnsPreview variant="two" />
          </LayoutOption>
        </div>
      </div>

      {el.structure === 'full' && (
        <div className="customize-field">
          <label>Date & Location Position</label>
          <div className="pill-option-row">
            <PillOption
              label="Right"
              active={el.dateLocationPosition === 'right'}
              onClick={() => update('dateLocationPosition', 'right')}
            />
            <PillOption
              label="Below Title"
              active={el.dateLocationPosition === 'below'}
              onClick={() => update('dateLocationPosition', 'below')}
            />
          </div>
        </div>
      )}

      <div className="entries-hint-box">
        <IconInfo size={16} />
        <p>
          In narrow columns, Date &amp; Location move below the title to keep entries readable. Set{' '}
          <button type="button" className="entries-hint-link" onClick={onNavigate}>
            column width
          </button>{' '}
          to at least 60% to keep them on the right.
        </p>
      </div>

      <div className="customize-field">
        <label>Entry Header Split</label>
        <div className="pill-option-row">
          <PillOption label="Auto" active={el.headerSplit === 'auto'} onClick={() => update('headerSplit', 'auto')} />
          <PillOption
            label="Manual"
            active={el.headerSplit === 'manual'}
            onClick={() => update('headerSplit', 'manual')}
          />
        </div>
      </div>

      {showSplitWidths && (
        <div className="customize-field">
          <div className="column-width-row">
            <div className="column-width-box">
              <span className="column-width-label">Title & Subtitle {el.titleWidth}%</span>
              <input
                type="range"
                min="30"
                max="80"
                value={el.titleWidth}
                onChange={(e) => update('titleWidth', Number(e.target.value))}
              />
            </div>
            <div className="column-width-box">
              <span className="column-width-label">Date & Location {100 - el.titleWidth}%</span>
              <input
                type="range"
                min="20"
                max="70"
                value={100 - el.titleWidth}
                onChange={(e) => update('titleWidth', 100 - Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      <div className="customize-field">
        <label>Subtitle Placement</label>
        <div className="pill-option-row">
          <PillOption
            label="Try Same Line"
            active={el.subtitlePlacement === 'sameLine'}
            onClick={() => update('subtitlePlacement', 'sameLine')}
          />
          <PillOption
            label="Below Title"
            active={el.subtitlePlacement === 'belowTitle'}
            onClick={() => update('subtitlePlacement', 'belowTitle')}
          />
        </div>
      </div>

      <div className="customize-field">
        <label className="customize-field-label-icon">
          Location Placement
          <IconInfo size={13} />
        </label>
        <div className="pill-option-row">
          <PillOption
            label="Try Same Line"
            active={el.locationPlacement === 'sameLine'}
            onClick={() => update('locationPlacement', 'sameLine')}
          />
          <PillOption
            label="Below Date"
            active={el.locationPlacement === 'belowDate'}
            onClick={() => update('locationPlacement', 'belowDate')}
          />
        </div>
      </div>

      <button type="button" className="advanced-settings-toggle" onClick={() => setAdvancedOpen((v) => !v)}>
        Advanced settings
        {advancedOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </button>

      {advancedOpen && (
        <div className="advanced-settings-body">
          <div className="customize-field">
            <label>Subtitle</label>
            <StyleAaPicker label="Subtitle" value={el.subtitleStyle} onChange={(v) => update('subtitleStyle', v)} />
          </div>
          <div className="customize-field">
            <label>Date</label>
            <StyleAaPicker label="Date" value={el.dateStyle} onChange={(v) => update('dateStyle', v)} />
          </div>
          <div className="customize-field">
            <label>Location</label>
            <StyleAaPicker label="Location" value={el.locationStyle} onChange={(v) => update('locationStyle', v)} />
          </div>

          <div className="customize-field">
            <label>Description Indentation</label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={el.indentBody}
                onChange={(e) => update('indentBody', e.target.checked)}
              />
              Indent body
            </label>
          </div>

          <div className="customize-field">
            <label>List Style</label>
            <div className="pill-option-row">
              <PillOption label="Bullet" active={el.listStyle === 'bullet'} onClick={() => update('listStyle', 'bullet')}>
                <span className="pill-bullet-dot" />
              </PillOption>
              <PillOption label="Hyphen" active={el.listStyle === 'hyphen'} onClick={() => update('listStyle', 'hyphen')}>
                <IconMinus size={12} />
              </PillOption>
            </div>
          </div>

          <div className="customize-field">
            <label>Date & Location Order</label>
            <div className="pill-option-row">
              <PillOption
                label="Date - Location"
                active={el.dateLocationOrder === 'date-location'}
                onClick={() => update('dateLocationOrder', 'date-location')}
              />
              <PillOption
                label="Location - Date"
                active={el.dateLocationOrder === 'location-date'}
                onClick={() => update('dateLocationOrder', 'location-date')}
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
        ) : activeSection === 'fontSize' ? (
          <FontSizeSection resume={resume} dispatch={dispatch} />
        ) : activeSection === 'spacing' ? (
          <SpacingSection resume={resume} dispatch={dispatch} />
        ) : activeSection === 'entries' ? (
          <EntriesSection resume={resume} dispatch={dispatch} onNavigate={() => setActiveSection('layout')} />
        ) : (
          <ComingSoonCard label={activeLabel} />
        )}

        <CustomizeUndoPill />
      </div>
    </div>
  );
}
