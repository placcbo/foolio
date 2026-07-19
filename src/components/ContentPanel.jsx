import { useEffect, useRef, useState } from 'react';
import BasicsCard from './BasicsCard';
import SectionCard from './SectionCard';
import AddContentModal from './AddContentModal';
import { IconPlus, IconArrowLeft } from './icons';
import { isHtmlEmpty } from './templates/shared';
import { templateSupportsPhoto } from '../data/templates';

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
  const [openSectionId, setOpenSectionId] = useState(null);

  useEffect(() => {
    const prevIds = prevSectionIdsRef.current;
    const added = resume.sections.filter((s) => !prevIds.includes(s.id));
    // Exactly one new section -> jump straight into editing it. Several at
    // once (an import) -> stay on the outline so everything that came in
    // is visible.
    if (added.length === 1) setOpenSectionId(added[0].id);
    prevSectionIdsRef.current = resume.sections.map((s) => s.id);
  }, [resume.sections]);

  // Derive rather than trust the id — the open section may have just been
  // deleted from inside its own editor.
  const openSection = resume.sections.find((s) => s.id === openSectionId) || null;

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

  if (openSection) {
    return (
      <div className="content-panel content-panel-focus">
        <button type="button" className="focus-back-btn" onClick={() => setOpenSectionId(null)}>
          <IconArrowLeft size={16} />
          All sections
        </button>
        <SectionCard
          key={openSection.id}
          section={openSection}
          dispatch={dispatch}
          expanded
          onExpandedChange={(v) => {
            if (!v) setOpenSectionId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="content-panel">
      <BasicsCard
        basics={resume.basics}
        dispatch={dispatch}
        expanded={basicsExpanded}
        onExpandedChange={setBasicsExpanded}
        supportsPhoto={templateSupportsPhoto(resume.templateId)}
      />

      <div className="content-head">
        <div className="content-head-row">
          <h2 className="content-head-title">Resume content</h2>
          {total > 0 && (
            <span className="content-progress-label">
              {filled} of {total} filled in
            </span>
          )}
        </div>
        {total > 0 && (
          <span className="content-progress-bar">
            <span style={{ width: `${Math.round((filled / total) * 100)}%` }} />
          </span>
        )}
      </div>

      <div className="outline-list">
        {resume.sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            dispatch={dispatch}
            expanded={false}
            onExpandedChange={(v) => {
              if (v) setOpenSectionId(section.id);
            }}
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