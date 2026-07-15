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
} from './icons';
import { getSectionMeta } from '../data/sectionTypes';
import { isHtmlEmpty } from './templates/shared';

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

function RichTextEditor({ value, onChange, placeholder }) {
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
    if (editableRef.current) editableRef.current.innerHTML = value || '';
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

function TagsEditor({ section, dispatch }) {
  const [draft, setDraft] = useState('');

  function commit() {
    const value = draft.trim();
    if (!value) return;
    dispatch({ type: 'ADD_TAG', id: section.id, value });
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    }
  }

  return (
    <div className="tags-editor">
      <div className="tag-list">
        {section.tags.map((tag, i) => (
          <span className="tag-pill" key={`${tag}-${i}`}>
            {tag}
            <button
              type="button"
              onClick={() => dispatch({ type: 'REMOVE_TAG', id: section.id, index: i })}
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
        placeholder="Type and press Enter to add"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
      />
    </div>
  );
}

function entryLabel(entry) {
  if (entry.heading && entry.subheading) return `${entry.heading} · ${entry.subheading}`;
  return entry.heading || entry.subheading || 'New Entry';
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
  references: { heading: 'Name', subheading: 'Company', headingPlaceholder: 'e.g. Jane Smith', subheadingPlaceholder: 'e.g. Acme Corp' },
};
const DEFAULT_ENTRY_FIELD_META = { heading: 'Title', subheading: 'Organization', headingPlaceholder: 'Title', subheadingPlaceholder: 'Organization' };

function getEntryFieldMeta(type) {
  return ENTRY_FIELD_META[type] || DEFAULT_ENTRY_FIELD_META;
}

function EntryRow({ section, entry, index, dispatch, dragProps }) {
  const [open, setOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(Boolean(entry.link));
  const meta = getEntryFieldMeta(section.type);

  function updateEntry(field, value) {
    dispatch({ type: 'UPDATE_ENTRY', id: section.id, entryId: entry.id, field, value });
  }

  return (
    <div className={`entry-row-card${entry.hidden ? ' is-hidden' : ''}`} {...dragProps}>
      <div className="entry-row-header">
        <span className="entry-drag-handle" aria-hidden="true">
          <IconGripVertical size={16} />
        </span>
        <button type="button" className="entry-row-title" onClick={() => setOpen((v) => !v)}>
          {entryLabel(entry)}
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
                placeholder="https://..."
                value={entry.link}
                onChange={(e) => updateEntry('link', e.target.value)}
              />
            )}
          </div>

          <div className="entry-3col">
            <div className="entry-field">
              <label>Start Date</label>
              <input
                type="text"
                placeholder="MM/YYYY"
                value={entry.start}
                onChange={(e) => updateEntry('start', e.target.value)}
              />
            </div>
            <div className="entry-field">
              <label>End Date</label>
              <input
                type="text"
                placeholder="MM/YYYY"
                value={entry.end}
                onChange={(e) => updateEntry('end', e.target.value)}
              />
            </div>
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

          <div className="entry-field">
            <label>Description</label>
            <RichTextEditor
              value={entry.description}
              onChange={(html) => updateEntry('description', html)}
              placeholder={`Add a description of your ${section.title.toLowerCase()} entry...`}
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
          dragProps={{
            draggable: true,
            onDragStart: () => setDraggedId(entry.id),
            onDragOver: (e) => e.preventDefault(),
            onDrop: (e) => {
              e.preventDefault();
              handleDrop(index);
            },
            onDragEnd: () => setDraggedId(null),
          }}
        />
      ))}
      <button type="button" className="entry-add" onClick={() => dispatch({ type: 'ADD_ENTRY', id: section.id })}>
        <IconPlus size={14} />
        Add Entry
      </button>
    </div>
  );
}

export default function SectionCard({ section, dispatch }) {
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const meta = getSectionMeta(section.type);

  function updateTitle(title) {
    dispatch({ type: 'UPDATE_SECTION_TITLE', id: section.id, title });
  }

  if (!expanded) {
    return (
      <div className={`section-card section-card-collapsed${section.hidden ? ' is-hidden' : ''}`}>
        <span className="section-icon" aria-hidden="true">
          {meta?.icon}
        </span>
        {renaming ? (
          <input
            className="section-title-input"
            type="text"
            autoFocus
            value={section.title}
            onChange={(e) => updateTitle(e.target.value)}
            onBlur={() => setRenaming(false)}
            onKeyDown={(e) => e.key === 'Enter' && setRenaming(false)}
          />
        ) : (
          <button type="button" className="section-collapsed-title-btn" onClick={() => setExpanded(true)}>
            {section.title}
          </button>
        )}
        <button type="button" className="edit-heading-btn" onClick={() => setRenaming((v) => !v)}>
          <IconEdit size={13} />
          Edit Heading
        </button>
        <button
          type="button"
          className="section-icon-btn"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse section' : 'Expand section'}
        >
          <IconChevronDown size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="section-card section-card-expanded">
      <div className="section-edit-header">
        <span className="section-icon" aria-hidden="true">
          {meta?.icon}
        </span>
        <h3 className="section-edit-header-title">Edit Entry</h3>
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
            onClick={() => dispatch({ type: 'REMOVE_SECTION', id: section.id })}
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
        <button type="button" className="done-btn" onClick={() => setExpanded(false)}>
          <IconCheck size={18} />
          Done
        </button>
      </div>

      <SectionCustomizationsToggle />
    </div>
  );
}
