import { useEffect, useRef, useState } from 'react';
import BasicsCard from './BasicsCard';
import SectionCard from './SectionCard';
import AddContentModal from './AddContentModal';
import { IconPlus } from './icons';
import { isHtmlEmpty } from './templates/shared';

// Mirrors SectionCard's collapsed summary logic: a section counts as filled
// once it has any real content in it.
function isSectionFilled(s) {
  if (s.kind === 'entries') {
    return (s.entries || []).some((e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description)));
  }
  if (s.kind === 'tags') return (s.tags || []).length > 0;
  return !isHtmlEmpty(s.content);
}

export default function ContentPanel({ resume, dispatch }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [basicsExpanded, setBasicsExpanded] = useState(true);

  // A section/entry you just added is the one thing you're about to type
  // into — leaving it collapsed means every "Add" click is immediately
  // followed by a second click just to find and open what you made.
  // Comparing ids against the previous render (rather than trusting the
  // dispatch call site) means this also self-heals for entries added deep
  // inside a SectionCard, which ContentPanel has no direct visibility into.
  const prevSectionIdsRef = useRef(resume.sections.map((s) => s.id));
  const [justAddedSectionId, setJustAddedSectionId] = useState(null);

  useEffect(() => {
    const prevIds = prevSectionIdsRef.current;
    const added = resume.sections.find((s) => !prevIds.includes(s.id));
    if (added) setJustAddedSectionId(added.id);
    prevSectionIdsRef.current = resume.sections.map((s) => s.id);
  }, [resume.sections]);

  function handleAdd(sectionType) {
    dispatch({ type: 'ADD_SECTION', sectionType });
    setModalOpen(false);
    setBasicsExpanded(false);
  }

  function handleImport(parsed) {
    dispatch({ type: 'IMPORT_RESUME', basics: parsed.basics, sections: parsed.sections });
    setModalOpen(false);
    setBasicsExpanded(true);
  }

  const total = resume.sections.length;
  const filled = resume.sections.filter(isSectionFilled).length;

  return (
    <div className="content-panel">
      <BasicsCard
        basics={resume.basics}
        dispatch={dispatch}
        expanded={basicsExpanded}
        onExpandedChange={setBasicsExpanded}
      />

      {total > 0 && (
        <div className="content-progress">
          <span className="content-progress-label">
            {filled} of {total} sections filled in
          </span>
          <span className="content-progress-bar">
            <span style={{ width: `${Math.round((filled / total) * 100)}%` }} />
          </span>
        </div>
      )}

      <div className="outline-list">
        {resume.sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            dispatch={dispatch}
            autoOpen={section.id === justAddedSectionId}
          />
        ))}

        <button type="button" className="outline-add" onClick={() => setModalOpen(true)}>
          <span className="outline-dot outline-dot-add" aria-hidden="true">
            <IconPlus size={11} />
          </span>
          Add Content
        </button>
      </div>

      {modalOpen && (
        <AddContentModal
          existingTypes={resume.sections.map((s) => s.type)}
          onAdd={handleAdd}
          onImport={handleImport}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}