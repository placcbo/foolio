import { useEffect, useRef, useState } from 'react';
import {
  IconTrash,
  IconX,
  IconPlus,
  IconBulb,
  IconEye,
  IconEyeOff,
  IconChevronDown,
  IconChevronUp,
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
  IconLink,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustify,
  IconRobot,
  IconGripVertical,
  IconCheck,
  IconEdit,
  IconCalendar,
} from './icons';
import { getSectionMeta, getItemLabel } from '../data/sectionTypes';
import { toMonthInputValue, fromMonthInputValue } from '../utils/dateFormat';
import { isHtmlEmpty } from './templates/shared';

// One-line summary shown on a collapsed section card, so the whole content
// panel is scannable without clicking every section open: entry sections
// show the first role plus a count, tag sections show an item count, text
// sections show whether they're filled — and anything empty says so, which
// doubles as a gentle "you haven't done this one yet" nudge.
function collapsedSummary(section) {
  if (section.kind === 'entries') {
    const visible = (section.entries || []).filter(
      (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description))
    );
    if (!visible.length) return 'Empty';
    const first = visible[0].heading || visible[0].subheading || '';
    const extra = visible.length - 1;
    return extra > 0 ? `${first} +${extra} more` : first;
  }
  if (section.kind === 'tags') {
    const n = (section.tags || []).length;
    return n ? `${n} ${n === 1 ? 'item' : 'items'}` : 'Empty';
  }
  return isHtmlEmpty(section.content) ? 'Empty' : 'Filled in';
}

function RichTextToolbar({ editableRef }) {
  function exec(cmd, value) {
    editableRef.current?.focus();
    document.execCommand(cmd, false, value);
  }

  function insertLink() {
    editableRef.current?.focus();
    const url = window.prompt('Link URL');
    if (url) document.execCommand('createLink', false, url);
  }

  return (
    <div className="richtext-toolbar">
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} aria-label="Bold">
        <IconBold size={15} />
      </button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')} aria-label="Italic">
        <IconItalic size={15} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => exec('underline')}
        aria-label="Underline"
      >
        <IconUnderline size={15} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => exec('insertUnorderedList')}
        aria-label="Bullet list"
      >
        <IconList size={15} />
      </button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={insertLink} aria-label="Insert link">
        <IconLink size={15} />
      </button>
      <span className="richtext-toolbar-divider" />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => exec('justifyLeft')}
        aria-label="Align left"
      >
        <IconAlignLeft size={15} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => exec('justifyCenter')}
        aria-label="Align center"
      >
        <IconAlignCenter size={15} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => exec('justifyRight')}
        aria-label="Align right"
      >
        <IconAlignRight size={15} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => exec('justifyFull')}
        aria-label="Justify"
      >
        <IconAlignJustify size={15} />
      </button>
    </div>
  );
}

function RichTextEditor({ value, onChange, placeholder, startAsList }) {
  const editableRef = useRef(null);
  const [empty, setEmpty] = useState(isHtmlEmpty(value));

  // Set the initial content imperatively, once, and never again via React.
  // Rendering with `dangerouslySetInnerHTML` re-applies on every re-render
  // in some React versions even when the value is unchanged, which wipes
  // out whatever the user just typed and the caret with it — the classic
  // contentEditable-in-React trap. Keeping the JSX free of that prop
  // entirely means React never touches this node's children after mount;
  // the DOM itself is the source of truth while editing.
  useEffect(() => {
    if (!editableRef.current) return;
    // Starting inside an (empty) bullet means pressing Enter keeps adding
    // bullets naturally, matching how job-history descriptions are usually
    // written — without forcing every rich-text field into list mode.
    editableRef.current.innerHTML = value || (startAsList ? '<ul><li><br></li></ul>' : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleInput(e) {
    const html = e.currentTarget.innerHTML;
    setEmpty(isHtmlEmpty(html));
    onChange(html);
  }

  return (
    <div className="richtext-editor-wrap">
      <RichTextToolbar editableRef={editableRef} />
      <div
        ref={editableRef}
        className={`richtext-editable${empty ? ' is-empty' : ''}`}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
      />
    </div>
  );
}

function AiHelperRow({ suggestContent }) {
  return (
    <div className="ai-helper-row">
      <span className="ai-helper-icon" aria-hidden="true">
        <IconRobot size={18} />
      </span>
      <button type="button" className="ai-helper-pill" disabled title="Coming soon">
        Improve Writing
      </button>
      {suggestContent && (
        <button type="button" className="ai-helper-pill" disabled title="Coming soon">
          Suggest Content
        </button>
      )}
      <button type="button" className="ai-helper-pill" disabled title="Coming soon">
        Grammar Check
      </button>
      <button type="button" className="ai-helper-pill" disabled title="Coming soon">
        Shorter
      </button>
    </div>
  );
}

function VisibilityToggle({ hidden, onToggle, label }) {
  return (
    <button
      type="button"
      className="section-icon-btn"
      onClick={onToggle}
      aria-label={hidden ? `Show ${label}` : `Hide ${label}`}
      title={hidden ? 'Hidden — click to show' : 'Visible — click to hide'}
    >
      {hidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
    </button>
  );
}

function SectionCustomizationsToggle() {
  const [open, setOpen] = useState(false);
  return (
    <div className="section-customizations">
      <button type="button" className="section-customizations-toggle" onClick={() => setOpen((v) => !v)}>
        Show customizations for this section
        {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </button>
      {open && <p className="customize-card-sub section-customizations-body">Per-section customization is coming soon.</p>}
    </div>
  );
}

// Example-driven placeholders per tag section — a concrete example teaches
// the expected format better than a generic instruction.
const TAG_PLACEHOLDERS = {
  skills: 'e.g. Zendesk — press Enter to add',
  languages: 'e.g. English (fluent) — press Enter to add',
  interests: 'e.g. Chess — press Enter to add',
};

function TagGroupRow({ group, canRemove, placeholder, onChange, onRemove }) {
  const [draft, setDraft] = useState('');

  function commit() {
    const value = draft.trim();
    if (!value) return;
    onChange({ ...group, tags: [...group.tags, value] });
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    }
  }

  return (
    <div className="tag-group">
      <div className="tag-group-head">
        <input
          type="text"
          className="tag-group-label-input"
          placeholder={'Group name (optional) \u2014 e.g. \u201cSupport Tools\u201d'}
          value={group.label}
          onChange={(e) => onChange({ ...group, label: e.target.value })}
        />
        {canRemove && (
          <button type="button" className="section-icon-btn" aria-label="Remove group" onClick={onRemove}>
            <IconTrash size={14} />
          </button>
        )}
      </div>
      <div className="tag-list">
        {group.tags.map((tag, i) => (
          <span className="tag-pill" key={`${tag}-${i}`}>
            {tag}
            <button
              type="button"
              onClick={() => onChange({ ...group, tags: group.tags.filter((_, j) => j !== i) })}
              aria-label={`Remove ${tag}`}
            >
              <IconX size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="tag-input"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
      />
    </div>
  );
}

// Groups are an OPTIONAL layer over plain tags. Someone who never types a
// group name gets exactly the flat list they always had — one unnamed group
// renders inline on the resume. Naming groups ("Support Tools", "Payments &
// Fraud"...) switches the template to labelled rows. `tags` is always kept
// as the flattened copy so every consumer that predates groups (DOCX
// export, older templates, section summaries) keeps working untouched.
function TagsEditor({ section, dispatch }) {
  const groups = section.groups?.length
    ? section.groups
    : [{ id: `${section.id}-g1`, label: '', tags: section.tags || [] }];

  function commitGroups(next) {
    dispatch({ type: 'UPDATE_TAG_GROUPS', id: section.id, groups: next });
  }

  return (
    <div className="tags-editor">
      {groups.map((g, i) => (
        <TagGroupRow
          key={g.id}
          group={g}
          canRemove={groups.length > 1}
          placeholder={TAG_PLACEHOLDERS[section.type] || 'Type and press Enter to add'}
          onChange={(updated) => commitGroups(groups.map((x, j) => (j === i ? updated : x)))}
          onRemove={() => commitGroups(groups.filter((_, j) => j !== i))}
        />
      ))}
      <button
        type="button"
        className="entry-add"
        onClick={() => commitGroups([...groups, { id: `${section.id}-g${Date.now()}`, label: '', tags: [] }])}
      >
        <IconPlus size={14} />
        Add group
      </button>
    </div>
  );
}

function entryLabel(entry, sectionType) {
  if (entry.heading && entry.subheading) return `${entry.heading} · ${entry.subheading}`;
  return entry.heading || entry.subheading || `New ${getItemLabel(sectionType)}`;
}

const ENTRY_FIELD_META = {
  education: { heading: 'Degree', subheading: 'School', headingPlaceholder: 'e.g. Bachelor of Commerce', subheadingPlaceholder: 'e.g. Harvard University' },
  experience: { heading: 'Job Title', subheading: 'Company', headingPlaceholder: 'e.g. Software Engineer', subheadingPlaceholder: 'e.g. Acme Corp' },
  certificates: { heading: 'Certificate', subheading: 'Issuer', headingPlaceholder: 'e.g. AWS Certified Developer', subheadingPlaceholder: 'e.g. Amazon Web Services' },
  projects: { heading: 'Project Name', subheading: 'Role', headingPlaceholder: 'e.g. Portfolio Website', subheadingPlaceholder: 'e.g. Lead Developer' },
  courses: { heading: 'Course', subheading: 'Provider', headingPlaceholder: 'e.g. Machine Learning', subheadingPlaceholder: 'e.g. Coursera' },
  awards: { heading: 'Award', subheading: 'Issuer', headingPlaceholder: 'e.g. Employee of the Year', subheadingPlaceholder: 'e.g. Acme Corp' },
  organisations: { heading: 'Role', subheading: 'Organisation', headingPlaceholder: 'e.g. Volunteer', subheadingPlaceholder: 'e.g. Red Cross' },
  publications: { heading: 'Title', subheading: 'Publisher', headingPlaceholder: 'e.g. Scaling Distributed Systems', subheadingPlaceholder: 'e.g. IEEE' },
  references: { heading: 'Name', subheading: 'Company & Role', headingPlaceholder: 'e.g. Jane Smith', subheadingPlaceholder: 'e.g. Acme Corp — Engineering Manager', noDates: true },
};
const DEFAULT_ENTRY_FIELD_META = { heading: 'Title', subheading: 'Organization', headingPlaceholder: 'Title', subheadingPlaceholder: 'Organization' };

function getEntryFieldMeta(type) {
  return ENTRY_FIELD_META[type] || DEFAULT_ENTRY_FIELD_META;
}

// Job history reads naturally as bullet points; degrees, certificates, and
// the rest read better as a plain sentence or two, so only default
// Experience into list mode.
const BULLETED_ENTRY_TYPES = new Set(['experience']);

// Free-text date field with a native month picker alongside. The text input
// stays authoritative — "2015", "Jan 2022", and "Present" all still work and
// nothing already typed is disturbed — while the calendar button opens the
// browser's own month picker (via a visually hidden <input type="month">)
// for people who'd rather click than type. End dates get a Present toggle.
function DateField({ label, value, onChange, allowPresent }) {
  const monthRef = useRef(null);

  function openPicker() {
    const el = monthRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker();
        return;
      } catch {
        // fall through — showPicker can throw if not user-activated
      }
    }
    el.focus();
    el.click();
  }

  return (
    <div className="entry-field">
      <label className="date-label-row">
        {label}
        {allowPresent && (
          <button
            type="button"
            className={`date-present-btn${value === 'Present' ? ' active' : ''}`}
            onClick={() => onChange(value === 'Present' ? '' : 'Present')}
          >
            Present
          </button>
        )}
      </label>
      <div className="date-input-wrap">
        <input
          type="text"
          placeholder="MM/YYYY"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="date-cal-btn" onClick={openPicker} aria-label={`Pick ${label.toLowerCase()}`}>
          <IconCalendar size={15} />
        </button>
        <input
          ref={monthRef}
          type="month"
          className="date-month-hidden"
          tabIndex={-1}
          aria-hidden="true"
          value={toMonthInputValue(value)}
          onChange={(e) => onChange(fromMonthInputValue(e.target.value))}
        />
      </div>
    </div>
  );
}

function EntryRow({ section, entry, index, dispatch, handleDragProps, dropTargetProps, autoOpen }) {
  const [open, setOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(Boolean(entry.link));
  const meta = getEntryFieldMeta(section.type);
  const rowRef = useRef(null);

  // A freshly-added entry should already be open — expanding on mount alone
  // isn't enough because "just added" is only known a render after the
  // entry appears (see EntriesEditor), so this reacts to the prop flipping
  // true rather than only reading it once at construction time.
  useEffect(() => {
    if (!autoOpen) return;
    setOpen(true);
    rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [autoOpen]);

  function updateEntry(field, value) {
    dispatch({ type: 'UPDATE_ENTRY', id: section.id, entryId: entry.id, field, value });
  }

  return (
    <div className={`entry-row-card${entry.hidden ? ' is-hidden' : ''}`} ref={rowRef} {...dropTargetProps}>
      <div className="entry-row-header">
        <span className="entry-drag-handle" aria-hidden="true" {...handleDragProps}>
          <IconGripVertical size={16} />
        </span>
        <button type="button" className="entry-row-title" onClick={() => setOpen((v) => !v)}>
          {entryLabel(entry, section.type)}
        </button>
        <VisibilityToggle
          hidden={entry.hidden}
          onToggle={() => dispatch({ type: 'TOGGLE_ENTRY_HIDDEN', id: section.id, entryId: entry.id })}
          label="entry"
        />
        <button
          type="button"
          className="section-icon-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Collapse entry' : 'Expand entry'}
        >
          {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </button>
        {section.entries.length > 1 && (
          <button
            type="button"
            className="section-icon-btn"
            onClick={() => dispatch({ type: 'REMOVE_ENTRY', id: section.id, entryId: entry.id })}
            aria-label="Remove entry"
          >
            <IconTrash size={16} />
          </button>
        )}
      </div>

      {open && (
        <div className="entry-row-body">
          <div className="entry-field">
            <label>{meta.heading}</label>
            <input
              type="text"
              placeholder={meta.headingPlaceholder}
              value={entry.heading}
              onChange={(e) => updateEntry('heading', e.target.value)}
            />
          </div>

          <div className="entry-field">
            <label>{meta.subheading}</label>
            <div className="entry-field-with-action">
              <input
                type="text"
                placeholder={meta.subheadingPlaceholder}
                value={entry.subheading}
                onChange={(e) => updateEntry('subheading', e.target.value)}
              />
              <button
                type="button"
                className={`entry-link-toggle${entry.link ? ' active' : ''}`}
                onClick={() => setLinkOpen((v) => !v)}
              >
                <IconLink size={13} />
                Link
              </button>
            </div>
            {linkOpen && (
              <input
                type="text"
                className="entry-link-input"
                type="url"
                placeholder="https://..."
                value={entry.link}
                onChange={(e) => updateEntry('link', e.target.value)}
              />
            )}
          </div>

          {meta.noDates ? (
            <div className="entry-field">
              <label>Contact / Location</label>
              <input
                type="text"
                placeholder="e.g. jane@acme.com · +254 700 000000"
                value={entry.location}
                onChange={(e) => updateEntry('location', e.target.value)}
              />
            </div>
          ) : (
            <div className="entry-3col">
              <DateField label="Start Date" value={entry.start} onChange={(v) => updateEntry('start', v)} />
              <DateField label="End Date" value={entry.end} onChange={(v) => updateEntry('end', v)} allowPresent />
              <div className="entry-field">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={entry.location}
                  onChange={(e) => updateEntry('location', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="entry-field">
            <label>Description</label>
            <RichTextEditor
              value={entry.description}
              onChange={(html) => updateEntry('description', html)}
              placeholder={`Describe this ${getItemLabel(section.type)}…`}
              startAsList={BULLETED_ENTRY_TYPES.has(section.type)}
            />
            <AiHelperRow suggestContent />
          </div>
        </div>
      )}
    </div>
  );
}

function EntriesEditor({ section, dispatch }) {
  const [draggedId, setDraggedId] = useState(null);
  const prevEntryIdsRef = useRef(section.entries.map((e) => e.id));
  // A section with exactly one entry opens it immediately on entering the
  // editor — showing a single collapsed "New Entry" row that must be
  // clicked again before any field is visible is a pointless extra step.
  // With several entries the collapsed list stays, since scanning matters.
  const [justAddedEntryId, setJustAddedEntryId] = useState(() =>
    section.entries.length === 1 ? section.entries[0].id : null
  );

  useEffect(() => {
    const prevIds = prevEntryIdsRef.current;
    const added = section.entries.find((e) => !prevIds.includes(e.id));
    if (added) setJustAddedEntryId(added.id);
    prevEntryIdsRef.current = section.entries.map((e) => e.id);
  }, [section.entries]);

  function handleDrop(targetIndex) {
    if (draggedId == null) return;
    dispatch({ type: 'REORDER_ENTRY', id: section.id, entryId: draggedId, toIndex: targetIndex });
    setDraggedId(null);
  }

  return (
    <div className="entries-editor">
      {section.entries.map((entry, index) => (
        <EntryRow
          key={entry.id}
          section={section}
          entry={entry}
          index={index}
          dispatch={dispatch}
          autoOpen={entry.id === justAddedEntryId}
          // Split deliberately: only the grip handle is `draggable`, so
          // click-dragging inside an input or the rich-text editor to select
          // text isn't hijacked as "start reordering the entry". The drop
          // target still needs to be the whole card so you can drop anywhere
          // on it, not just the exact handle pixel.
          handleDragProps={{
            draggable: true,
            onDragStart: (e) => {
              e.stopPropagation();
              setDraggedId(entry.id);
            },
            onDragEnd: () => setDraggedId(null),
          }}
          dropTargetProps={{
            onDragOver: (e) => e.preventDefault(),
            onDrop: (e) => {
              e.preventDefault();
              handleDrop(index);
            },
          }}
        />
      ))}
      <button type="button" className="entry-add" onClick={() => dispatch({ type: 'ADD_ENTRY', id: section.id })}>
        <IconPlus size={14} />
        Add {section.entries.filter((e) => !e.hidden).length ? 'another ' : ''}{getItemLabel(section.type)}
      </button>
    </div>
  );
}

// Expansion is controlled by ContentPanel (not local state) so that opening
// a section can switch the whole panel into focus mode — only the open
// section's editor is rendered, full-width, with everything else hidden
// behind a back button.
export default function SectionCard({ section, dispatch, expanded, onExpandedChange }) {
  const [renaming, setRenaming] = useState(false);
  const meta = getSectionMeta(section.type);
  const cardRef = useRef(null);

  function updateTitle(title) {
    dispatch({ type: 'UPDATE_SECTION_TITLE', id: section.id, title });
  }

  if (!expanded) {
    const summary = collapsedSummary(section);
    const filledCls = summary !== 'Empty' ? ' outline-row-filled' : '';
    return (
      <div className={`outline-row${filledCls}${section.hidden ? ' is-hidden' : ''}`} ref={cardRef}>
        <span className="outline-dot" aria-hidden="true" />
        <button type="button" className="outline-row-main" onClick={() => onExpandedChange(true)}>
          <span className="outline-row-icon" aria-hidden="true">
            {meta?.icon}
          </span>
          <span className="outline-row-text">
            {renaming ? (
              <input
                className="section-title-input"
                type="text"
                autoFocus
                value={section.title}
                onChange={(e) => updateTitle(e.target.value)}
                onBlur={() => setRenaming(false)}
                onKeyDown={(e) => e.key === 'Enter' && setRenaming(false)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="outline-row-title">{section.title}</span>
            )}
            <span className="outline-row-meta">{summary}</span>
          </span>
        </button>
        <div className="outline-row-actions">
          <button
            type="button"
            className="section-icon-btn"
            title="Rename section"
            aria-label="Rename section"
            // Without this, clicking the button while the rename input is
            // focused blurs it first (closing it), then this onClick's toggle
            // reads that just-queued `false` and flips it straight back to
            // `true` — so the first click to close it visually does nothing.
            // Suppressing the mousedown-driven focus change means the input
            // never blurs from this click, so the toggle only ever sees one
            // state change per click.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setRenaming((v) => !v)}
          >
            <IconEdit size={15} />
          </button>
          <button
            type="button"
            className="section-icon-btn"
            onClick={() => onExpandedChange(!expanded)}
            aria-label="Expand section"
          >
            <IconChevronDown size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card section-card-expanded outline-expanded" ref={cardRef}>
      <div className="section-edit-header">
        <span className="section-icon" aria-hidden="true">
          {meta?.icon}
        </span>
        <h3 className="section-edit-header-title">Edit Section</h3>
        <div className="section-edit-header-actions">
          {section.kind === 'text' && (
            <button type="button" className="get-tips-btn">
              <IconBulb size={16} />
              Get Tips
            </button>
          )}
          <VisibilityToggle
            hidden={section.hidden}
            onToggle={() => dispatch({ type: 'TOGGLE_SECTION_HIDDEN', id: section.id })}
            label={section.title}
          />
          <button
            type="button"
            className="section-icon-btn"
            onClick={() => {
              // Deleting a section is the most destructive click in the app
              // and there is no undo — confirm first, naming what's about
              // to be lost.
              if (window.confirm(`Delete the "${section.title}" section and everything in it? This can't be undone.`)) {
                dispatch({ type: 'REMOVE_SECTION', id: section.id });
              }
            }}
            aria-label={`Remove ${section.title}`}
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      {renaming ? (
        <input
          className="section-title-label-input"
          type="text"
          autoFocus
          value={section.title}
          onChange={(e) => updateTitle(e.target.value)}
          onBlur={() => setRenaming(false)}
          onKeyDown={(e) => e.key === 'Enter' && setRenaming(false)}
        />
      ) : (
        <button type="button" className="section-title-label" onClick={() => setRenaming(true)}>
          {section.title}
        </button>
      )}

      {section.kind === 'text' && (
        <>
          <RichTextEditor
            value={section.content}
            onChange={(html) => dispatch({ type: 'UPDATE_SECTION_TEXT', id: section.id, value: html })}
            placeholder={`Write your ${section.title.toLowerCase()}...`}
          />
          <AiHelperRow />
        </>
      )}

      {section.kind === 'tags' && <TagsEditor section={section} dispatch={dispatch} />}

      {section.kind === 'entries' && <EntriesEditor section={section} dispatch={dispatch} />}

      <div className="section-card-footer">
        <button type="button" className="done-btn" onClick={() => onExpandedChange(false)}>
          <IconCheck size={18} />
          Done
        </button>
      </div>

      <SectionCustomizationsToggle />
    </div>
  );
}