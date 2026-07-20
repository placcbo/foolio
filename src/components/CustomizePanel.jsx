import { useState, useRef, useEffect } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
  IconUndo,
  IconRedo,
  IconMinus,
  IconPlus,
  IconInfo,
  IconCheck,
  IconLink,
} from './icons';
import { DATE_FORMATS } from '../utils/dateFormat';
import { TEMPLATES } from '../data/templates';
import { TEMPLATE_COMPONENTS } from './templates';
import { FONT_OPTIONS } from '../data/fonts';
import { PRESET_COLORS } from '../data/colors';
import { applyPresetToSettings } from '../utils/templatePreset';
import {
  DEFAULT_LAYOUT,
  DEFAULT_FONT_SIZE,
  DEFAULT_SPACING,
  DEFAULT_ENTRY_LAYOUT,
  DEFAULT_HEADINGS,
  DEFAULT_FONT,
  DEFAULT_COLORS,
  DEFAULT_HEADER,
  DEFAULT_PHOTO,
  DEFAULT_FOOTER,
  DEFAULT_LINKS,
  TEMPLATE_DEFAULT_LAYOUT,
} from '../state/resumeReducer';
import ApplyTemplateModal from './ApplyTemplateModal';

// Grouped so the sidebar reads as three clear questions — "what look",
// "how is it arranged", "what shows in the header/footer" — instead of one
// flat list of 14 same-weight items the eye has to scan one at a time.
const NAV_GROUPS = [
  {
    label: 'Design',
    items: [
      { id: 'document', label: 'Document' },
      { id: 'templates', label: 'Templates' },
      { id: 'colors', label: 'Colors' },
      { id: 'font', label: 'Font' },
      { id: 'headings', label: 'Headings' },
    ],
  },
  {
    label: 'Layout',
    items: [
      { id: 'layout', label: 'Layout' },
      { id: 'fontSize', label: 'Font Size' },
      { id: 'spacing', label: 'Spacing' },
      { id: 'entries', label: 'Entries' },
      { id: 'sections', label: 'Sections' },
    ],
  },
  {
    label: 'Header & footer',
    items: [
      { id: 'header', label: 'Header' },
      { id: 'photo', label: 'Photo' },
      { id: 'links', label: 'Links' },
      { id: 'footer', label: 'Footer' },
    ],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// Templates that own their entire look (see SimpleTemplate.jsx) don't read
// resume.settings for layout/typography at all — showing the full settings
// sidebar for them means ten panels that silently do nothing, which reads
// as the app being broken. These layouts get a reduced nav with only the
// controls that genuinely apply: document settings (date/page format feed
// the exporter), switching templates, and the accent color.
const SELF_CONTAINED_LAYOUTS = new Set(['simple', 'classic', 'slate', 'bloom']);

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

// The strip is a quick-pick row, not the full catalog — with 20+ templates
// registered, cramming all of them into one non-wrapping flex row would
// squeeze each thumbnail down to an unusable sliver. "Browse templates"
// opens the full gallery for everything beyond these.
const STRIP_TEMPLATE_COUNT = 5;

function DesignTemplates({ resume, dispatch }) {
  const [browseOpen, setBrowseOpen] = useState(false);
  const stripTemplates = TEMPLATES.slice(0, STRIP_TEMPLATE_COUNT);

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
        {stripTemplates.map((t) => {
          const Template = TEMPLATE_COMPONENTS[t.layout];
          const active = resume.templateId === t.layout;
          const thumbResume = {
            ...resume,
            templateId: t.layout,
            accentColor: t.swatches[0],
            settings: applyPresetToSettings(resume.settings, t.preset, TEMPLATE_DEFAULT_LAYOUT[t.layout]),
          };
          return (
            <button
              type="button"
              key={t.id}
              className={`design-template-thumb${active ? ' active' : ''}`}
              onClick={() =>
                dispatch({ type: 'SET_TEMPLATE', templateId: t.layout, accentColor: t.swatches[0], preset: t.preset })
              }
              aria-label={`Use ${t.name} template`}
            >
              <div className="design-template-thumb-scale" style={{ transform: `scale(${THUMB_SCALE})` }}>
                <Template resume={thumbResume} accentColor={t.swatches[0]} />
              </div>
            </button>
          );
        })}
      </div>

      <button type="button" className="design-templates-browse-btn" onClick={() => setBrowseOpen(true)}>
        Browse all {TEMPLATES.length} templates
      </button>

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

const HEADING_STYLE_OPTIONS = [
  'accentBar',
  'boxed',
  'plain',
  'lineBelow',
  'compact',
  'boldOnly',
  'underlineShort',
  'underlineDotted',
  'shadedBar',
];

function HeadingStylePreview({ variant }) {
  return (
    <span className={`heading-style-preview heading-style-preview-${variant}`}>
      <span className="heading-style-preview-bar" />
    </span>
  );
}

function HeadingsSection({ resume, dispatch }) {
  const headings = resume.settings.headings ?? DEFAULT_HEADINGS;

  function update(field, value) {
    dispatch({ type: 'UPDATE_HEADINGS', field, value });
  }

  return (
    <div className="customize-card">
      <h2>Section Headings</h2>

      <div className="customize-field">
        <label>Style</label>
        <div className="heading-style-grid">
          {HEADING_STYLE_OPTIONS.map((variant) => (
            <LayoutOption key={variant} active={headings.style === variant} onClick={() => update('style', variant)}>
              <HeadingStylePreview variant={variant} />
            </LayoutOption>
          ))}
        </div>
      </div>

      <div className="customize-field">
        <label>Capitalization</label>
        <div className="pill-option-row">
          <PillOption
            label="Capitalize"
            active={headings.capitalization === 'capitalize'}
            onClick={() => update('capitalization', 'capitalize')}
          />
          <PillOption
            label="Uppercase"
            active={headings.capitalization === 'uppercase'}
            onClick={() => update('capitalization', 'uppercase')}
          />
        </div>
      </div>

      <div className="customize-field">
        <label>Icons</label>
        <div className="pill-option-row">
          <PillOption label="None" active={headings.icons === 'none'} onClick={() => update('icons', 'none')} />
          <PillOption label="Outline" active={headings.icons === 'outline'} onClick={() => update('icons', 'outline')} />
          <PillOption label="Filled" active={headings.icons === 'filled'} onClick={() => update('icons', 'filled')} />
        </div>
      </div>
    </div>
  );
}

function FontSelect({ value, options, onChange, onPreview, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        onPreview?.(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onPreview]);

  const selected = options.find((o) => o.id === value);

  return (
    <div className="font-select" ref={ref}>
      <button type="button" className="font-select-trigger" onClick={() => setOpen((v) => !v)}>
        <span style={selected?.family ? { fontFamily: selected.family } : undefined}>
          {selected?.label ?? placeholder}
        </span>
        <IconChevronDown size={16} />
      </button>
      {open && (
        <div className="font-select-menu">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.id}
              className={`font-select-option${value === opt.id ? ' active' : ''}`}
              style={opt.family ? { fontFamily: opt.family } : undefined}
              onMouseEnter={() => onPreview?.(opt.id)}
              onMouseLeave={() => onPreview?.(null)}
              onClick={() => {
                onChange(opt.id);
                onPreview?.(null);
                setOpen(false);
              }}
            >
              {opt.label}
              {value === opt.id && <IconCheck size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const NAME_FONT_OPTIONS = [{ id: 'inherit', label: 'Same as body font', family: undefined }, ...FONT_OPTIONS];

function FontSection({ resume, dispatch, onFontPreview }) {
  const font = resume.settings.font ?? DEFAULT_FONT;

  function update(field, value) {
    dispatch({ type: 'UPDATE_FONT', field, value });
  }

  return (
    <div className="customize-card">
      <h2>Font</h2>

      <div className="customize-field">
        <label>Body Font</label>
        <FontSelect
          value={font.body}
          options={FONT_OPTIONS}
          onChange={(v) => update('body', v)}
          onPreview={(id) => onFontPreview?.('body', id)}
        />
      </div>

      <div className="customize-field">
        <label>Name Font</label>
        <FontSelect
          value={font.name}
          options={NAME_FONT_OPTIONS}
          onChange={(v) => update('name', v)}
          onPreview={(id) => onFontPreview?.('name', id)}
        />
      </div>
    </div>
  );
}

const SCOPE_OPTIONS = [
  { id: 'fullPage', label: 'Full Page' },
  { id: 'header', label: 'Header' },
  { id: 'border', label: 'Border' },
];
const FILL_OPTIONS = [
  { id: 'single', label: 'Single' },
  { id: 'multi', label: 'Multi' },
  { id: 'image', label: 'Image' },
];

function ScopePreview({ variant }) {
  return <span className={`scope-preview scope-preview-${variant}`} />;
}
function FillPreview({ variant }) {
  return <span className={`fill-preview fill-preview-${variant}`} />;
}

const APPLY_TO_LEFT = [
  { field: 'name', label: 'Name' },
  { field: 'jobTitle', label: 'Job Title' },
  { field: 'headings', label: 'Headings' },
  { field: 'headingsLine', label: 'Headings Line' },
  { field: 'headerIcons', label: 'Header Icons' },
];
const APPLY_TO_RIGHT = [
  { field: 'dotsBarsBubbles', label: 'Dots, Bars & Bubbles' },
  { field: 'dates', label: 'Dates' },
  { field: 'entrySubtitle', label: 'Entry Subtitle' },
  { field: 'linkIcons', label: 'Link Icons' },
];

function ApplyToCheckbox({ label, checked, onChange }) {
  return (
    <label className="apply-to-checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`apply-to-box${checked ? ' checked' : ''}`}>{checked && <IconCheck size={12} />}</span>
      {label}
    </label>
  );
}

function ColorsSection({ resume, dispatch, accentOnly = false }) {
  const colors = resume.settings.colors ?? DEFAULT_COLORS;

  function update(field, value) {
    dispatch({ type: 'UPDATE_COLORS', field, value });
  }
  function updateApplyTo(field, value) {
    dispatch({ type: 'UPDATE_COLORS_APPLY_TO', field, value });
  }
  function setAccent(hex) {
    dispatch({ type: 'SET_ACCENT_COLOR', accentColor: hex });
  }

  const isCustom = !PRESET_COLORS.includes(resume.accentColor);

  return (
    <div className="customize-card">
      <h2>{accentOnly ? 'Accent Color' : 'Colors'}</h2>

      {!accentOnly && (
      <>
      <div className="customize-field">
        <label>Background Scope</label>
        <div className="layout-option-row">
          {SCOPE_OPTIONS.map((opt) => (
            <LayoutOption
              key={opt.id}
              label={opt.label}
              active={colors.backgroundScope === opt.id}
              onClick={() => update('backgroundScope', opt.id)}
            >
              <ScopePreview variant={opt.id} />
            </LayoutOption>
          ))}
        </div>
      </div>

      <div className="customize-field">
        <label>Fill Type</label>
        <div className="layout-option-row">
          {FILL_OPTIONS.map((opt) => (
            <LayoutOption
              key={opt.id}
              label={opt.label}
              active={colors.fillType === opt.id}
              onClick={() => update('fillType', opt.id)}
            >
              <FillPreview variant={opt.id} />
            </LayoutOption>
          ))}
        </div>
      </div>
      </>
      )}

      <div className="customize-field">
        <label>Accent Color</label>
        <div className="swatch-grid">
          {PRESET_COLORS.map((hex) => (
            <button
              type="button"
              key={hex}
              className={`accent-swatch${resume.accentColor === hex ? ' active' : ''}`}
              style={{ background: hex }}
              onClick={() => setAccent(hex)}
              aria-label={`Use ${hex}`}
            />
          ))}
          <label
            className={`accent-swatch custom${isCustom ? ' active' : ''}`}
            style={isCustom ? { background: resume.accentColor } : undefined}
          >
            <input type="color" value={resume.accentColor} onChange={(e) => setAccent(e.target.value)} />
          </label>
        </div>
      </div>

      {!accentOnly && (
      <div className="apply-accent-section">
        <label>Apply Accent Color to</label>
        <div className="apply-to-grid">
          <div className="apply-to-col">
            {APPLY_TO_LEFT.map((f) => (
              <ApplyToCheckbox
                key={f.field}
                label={f.label}
                checked={colors.applyTo[f.field]}
                onChange={(v) => updateApplyTo(f.field, v)}
              />
            ))}
          </div>
          <div className="apply-to-col">
            {APPLY_TO_RIGHT.map((f) => (
              <ApplyToCheckbox
                key={f.field}
                label={f.label}
                checked={colors.applyTo[f.field]}
                onChange={(v) => updateApplyTo(f.field, v)}
              />
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function TextAlignPreview({ variant }) {
  return (
    <span className={`text-align-preview text-align-preview-${variant}`}>
      <span />
      <span />
    </span>
  );
}

function ArrangementPreview({ variant }) {
  return (
    <span className={`arrangement-preview arrangement-preview-${variant}`}>
      <span />
      <span />
      <span />
    </span>
  );
}

const ICON_STYLE_OPTIONS = ['filled', 'muted', 'square', 'outlineSquare', 'outline', 'outlineSquareAlt', 'plain'];

function HeaderSection({ resume, dispatch }) {
  const header = resume.settings.header ?? DEFAULT_HEADER;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function update(field, value) {
    dispatch({ type: 'UPDATE_HEADER', field, value });
  }

  return (
    <div className="customize-card">
      <h2>Header</h2>

      <div className="customize-field">
        <label>Text Alignment</label>
        <div className="layout-option-row">
          <LayoutOption label="Left" active={header.textAlign === 'left'} onClick={() => update('textAlign', 'left')}>
            <TextAlignPreview variant="left" />
          </LayoutOption>
          <LayoutOption
            label="Center"
            active={header.textAlign === 'center'}
            onClick={() => update('textAlign', 'center')}
          >
            <TextAlignPreview variant="center" />
          </LayoutOption>
        </div>
      </div>

      <div className="customize-field">
        <label>Details Arrangement</label>
        <div className="layout-option-row">
          <LayoutOption
            active={header.detailsArrangement === 'stacked'}
            onClick={() => update('detailsArrangement', 'stacked')}
          >
            <ArrangementPreview variant="stacked" />
          </LayoutOption>
          <LayoutOption
            active={header.detailsArrangement === 'inline'}
            onClick={() => update('detailsArrangement', 'inline')}
          >
            <ArrangementPreview variant="inline" />
          </LayoutOption>
        </div>

        <div className="pill-option-row">
          <PillOption
            label="Icon"
            active={header.separatorStyle === 'icon'}
            onClick={() => update('separatorStyle', 'icon')}
          />
          <PillOption
            label="Bullet"
            active={header.separatorStyle === 'bullet'}
            onClick={() => update('separatorStyle', 'bullet')}
          />
          <PillOption
            label="Bar"
            active={header.separatorStyle === 'bar'}
            onClick={() => update('separatorStyle', 'bar')}
          />
        </div>
      </div>

      {header.separatorStyle === 'icon' && (
        <div className="customize-field">
          <label>Icon Style</label>
          <div className="icon-style-row">
            {ICON_STYLE_OPTIONS.map((variant) => (
              <button
                key={variant}
                type="button"
                className={`icon-style-btn${header.iconStyle === variant ? ' active' : ''}`}
                onClick={() => update('iconStyle', variant)}
                aria-label={`Icon style: ${variant}`}
              >
                <span className={`contact-icon-wrap ${variant}`}>
                  <IconLink size={13} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button type="button" className="advanced-settings-toggle" onClick={() => setAdvancedOpen((v) => !v)}>
        Advanced Settings
        {advancedOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </button>
      {advancedOpen && (
        <div className="advanced-settings-body">
          <p className="customize-card-sub">More header settings are coming soon.</p>
        </div>
      )}
    </div>
  );
}

const PHOTO_SIZE_OPTIONS = ['xs', 's', 'm', 'l', 'xl'];
const PHOTO_SHAPE_OPTIONS = ['circle', 'roundedSquare', 'square', 'rectPortrait', 'rectTall'];

function PhotoShapeSwatch({ variant }) {
  return <span className={`photo-shape-swatch photo-shape-${variant}`} />;
}

function PhotoSection({ resume, dispatch }) {
  const photo = resume.settings.photo ?? DEFAULT_PHOTO;
  const hasPhoto = Boolean(resume.basics.photo);

  function update(field, value) {
    dispatch({ type: 'UPDATE_PHOTO', field, value });
  }

  if (!hasPhoto) {
    return (
      <div className="customize-card customize-card-empty">
        <h2>Photo</h2>
        <p className="customize-card-sub">Photo design options will appear here once you add a photo 📷</p>
      </div>
    );
  }

  return (
    <div className="customize-card">
      <h2>Photo</h2>

      <label className="checkbox-row">
        <input type="checkbox" checked={photo.show} onChange={(e) => update('show', e.target.checked)} />
        Show
      </label>
      <label className="checkbox-row">
        <input type="checkbox" checked={photo.grayscale} onChange={(e) => update('grayscale', e.target.checked)} />
        Grayscale
      </label>

      <div className="customize-field">
        <label>Photo Position</label>
        <div className="layout-option-row">
          <LayoutOption
            label="Below name & title"
            active={photo.position === 'below'}
            onClick={() => update('position', 'below')}
          >
            <span className="photo-position-preview">
              <span className="bar" />
              <span className="dot" />
            </span>
          </LayoutOption>
          <LayoutOption
            label="Above name & title"
            active={photo.position === 'above'}
            onClick={() => update('position', 'above')}
          >
            <span className="photo-position-preview">
              <span className="dot" />
              <span className="bar" />
            </span>
          </LayoutOption>
        </div>
      </div>

      <div className="customize-field">
        <label>Size</label>
        <div className="pill-option-row">
          {PHOTO_SIZE_OPTIONS.map((s) => (
            <PillOption key={s} label={s.toUpperCase()} active={photo.size === s} onClick={() => update('size', s)} />
          ))}
        </div>
      </div>

      <div className="customize-field">
        <label>Shape</label>
        <div className="photo-shape-row">
          {PHOTO_SHAPE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`photo-shape-btn${photo.shape === s ? ' active' : ''}`}
              onClick={() => update('shape', s)}
              aria-label={`Shape: ${s}`}
            >
              <PhotoShapeSwatch variant={s} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LinksSection({ resume, dispatch }) {
  const links = resume.settings.links ?? DEFAULT_LINKS;

  function update(field, value) {
    dispatch({ type: 'UPDATE_LINKS', field, value });
  }

  return (
    <div className="customize-card">
      <h2>Links</h2>
      <p className="customize-card-sub">Controls how LinkedIn, website, and other links appear in your header.</p>

      <label className="checkbox-row">
        <input type="checkbox" checked={links.showIcons} onChange={(e) => update('showIcons', e.target.checked)} />
        Show icons
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={links.showAsText}
          onChange={(e) => update('showAsText', e.target.checked)}
        />
        Show link text
      </label>
      <label className="checkbox-row">
        <input type="checkbox" checked={links.underline} onChange={(e) => update('underline', e.target.checked)} />
        Underline links
      </label>
    </div>
  );
}

function FooterSection({ resume, dispatch }) {
  const footer = resume.settings.footer ?? DEFAULT_FOOTER;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function update(field, value) {
    dispatch({ type: 'UPDATE_FOOTER', field, value });
  }

  return (
    <div className="customize-card">
      <h2>Footer</h2>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={footer.pageNumbers}
          onChange={(e) => update('pageNumbers', e.target.checked)}
        />
        Page numbers
      </label>
      <label className="checkbox-row">
        <input type="checkbox" checked={footer.email} onChange={(e) => update('email', e.target.checked)} />
        Email
      </label>
      <label className="checkbox-row">
        <input type="checkbox" checked={footer.name} onChange={(e) => update('name', e.target.checked)} />
        Name
      </label>

      <button type="button" className="advanced-settings-toggle" onClick={() => setAdvancedOpen((v) => !v)}>
        Advanced Settings
        {advancedOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </button>
      {advancedOpen && (
        <div className="advanced-settings-body">
          <p className="customize-card-sub">More footer settings are coming soon.</p>
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

export default function CustomizePanel({ resume, dispatch, onFontPreview }) {
  const [activeSection, setActiveSection] = useState('document');
  const isFixedDesign = SELF_CONTAINED_LAYOUTS.has(resume.templateId);

  // Fixed-design templates have only three working controls, and a sidebar
  // with three lonely items reads as the app being gutted. So they skip the
  // sidebar entirely: everything lives on one scrollable page — template
  // gallery, accent color, document settings — all visible at once.
  if (isFixedDesign) {
    return (
      <div className="customize-panel customize-panel-simple">
        <div className="customize-main">
          <div className="fixed-design-note">
            This template's fonts, spacing, and layout are hand-tuned and always export exactly as
            previewed. Pick its accent color below, adjust document settings, or switch designs.
          </div>
          <DesignTemplates resume={resume} dispatch={dispatch} />
          <ColorsSection resume={resume} dispatch={dispatch} accentOnly />
          <DocumentSection resume={resume} dispatch={dispatch} />
          <CustomizeUndoPill />
        </div>
      </div>
    );
  }

  const groups = NAV_GROUPS;
  const validIds = groups.flatMap((g) => g.items).map((i) => i.id);
  const currentSection = validIds.includes(activeSection) ? activeSection : 'document';
  const activeLabel = NAV_ITEMS.find((n) => n.id === currentSection)?.label ?? '';

  return (
    <div className="customize-panel">
      <nav className="customize-sidebar">
        {groups.map((group) => (
          <div className="customize-sidebar-group" key={group.label}>
            <span className="customize-sidebar-group-label">{group.label}</span>
            {group.items.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`customize-sidebar-item${currentSection === item.id ? ' active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="customize-main">
        {currentSection === 'document' ? (
          <DocumentSection resume={resume} dispatch={dispatch} />
        ) : currentSection === 'templates' ? (
          <DesignTemplates resume={resume} dispatch={dispatch} />
        ) : currentSection === 'layout' ? (
          <LayoutSection resume={resume} dispatch={dispatch} />
        ) : currentSection === 'fontSize' ? (
          <FontSizeSection resume={resume} dispatch={dispatch} />
        ) : currentSection === 'spacing' ? (
          <SpacingSection resume={resume} dispatch={dispatch} />
        ) : currentSection === 'entries' ? (
          <EntriesSection resume={resume} dispatch={dispatch} onNavigate={() => setActiveSection('layout')} />
        ) : currentSection === 'headings' ? (
          <HeadingsSection resume={resume} dispatch={dispatch} />
        ) : currentSection === 'font' ? (
          <FontSection resume={resume} dispatch={dispatch} onFontPreview={onFontPreview} />
        ) : currentSection === 'colors' ? (
          <ColorsSection resume={resume} dispatch={dispatch} accentOnly={isFixedDesign} />
        ) : currentSection === 'header' ? (
          <HeaderSection resume={resume} dispatch={dispatch} />
        ) : currentSection === 'photo' ? (
          <PhotoSection resume={resume} dispatch={dispatch} />
        ) : currentSection === 'links' ? (
          <LinksSection resume={resume} dispatch={dispatch} />
        ) : currentSection === 'footer' ? (
          <FooterSection resume={resume} dispatch={dispatch} />
        ) : (
          <ComingSoonCard label={activeLabel} />
        )}

        <CustomizeUndoPill />
      </div>
    </div>
  );
}