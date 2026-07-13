import { useState } from 'react';
import { IconTrash, IconX, IconPlus } from './icons';

function TextEditor({ section, dispatch }) {
  return (
    <textarea
      className="section-textarea"
      rows={4}
      placeholder="Write here..."
      value={section.content}
      onChange={(e) =>
        dispatch({ type: 'UPDATE_SECTION_TEXT', id: section.id, value: e.target.value })
      }
    />
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

function EntryEditor({ section, entry, dispatch }) {
  function updateEntry(field, value) {
    dispatch({ type: 'UPDATE_ENTRY', id: section.id, entryId: entry.id, field, value });
  }

  return (
    <div className="entry-card">
      {section.entries.length > 1 && (
        <button
          type="button"
          className="entry-remove"
          onClick={() => dispatch({ type: 'REMOVE_ENTRY', id: section.id, entryId: entry.id })}
          aria-label="Remove entry"
        >
          <IconTrash size={14} />
        </button>
      )}
      <div className="entry-grid">
        <input
          type="text"
          placeholder="Title"
          value={entry.heading}
          onChange={(e) => updateEntry('heading', e.target.value)}
        />
        <input
          type="text"
          placeholder="Organization"
          value={entry.subheading}
          onChange={(e) => updateEntry('subheading', e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={entry.location}
          onChange={(e) => updateEntry('location', e.target.value)}
        />
        <div className="entry-dates">
          <input
            type="text"
            placeholder="Start"
            value={entry.start}
            onChange={(e) => updateEntry('start', e.target.value)}
          />
          <span>&ndash;</span>
          <input
            type="text"
            placeholder="End"
            value={entry.end}
            onChange={(e) => updateEntry('end', e.target.value)}
          />
        </div>
      </div>
      <textarea
        rows={3}
        placeholder="Description (one point per line)"
        value={entry.description}
        onChange={(e) => updateEntry('description', e.target.value)}
      />
    </div>
  );
}

function EntriesEditor({ section, dispatch }) {
  return (
    <div className="entries-editor">
      {section.entries.map((entry) => (
        <EntryEditor key={entry.id} section={section} entry={entry} dispatch={dispatch} />
      ))}
      <button
        type="button"
        className="entry-add"
        onClick={() => dispatch({ type: 'ADD_ENTRY', id: section.id })}
      >
        <IconPlus size={14} />
        Add
      </button>
    </div>
  );
}

export default function SectionCard({ section, dispatch }) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <input
          className="section-title-input"
          type="text"
          value={section.title}
          onChange={(e) =>
            dispatch({ type: 'UPDATE_SECTION_TITLE', id: section.id, title: e.target.value })
          }
        />
        <button
          type="button"
          className="section-remove"
          onClick={() => dispatch({ type: 'REMOVE_SECTION', id: section.id })}
          aria-label={`Remove ${section.title}`}
        >
          <IconTrash size={16} />
        </button>
      </div>

      {section.kind === 'text' && <TextEditor section={section} dispatch={dispatch} />}
      {section.kind === 'tags' && <TagsEditor section={section} dispatch={dispatch} />}
      {section.kind === 'entries' && <EntriesEditor section={section} dispatch={dispatch} />}
    </div>
  );
}
