import { useEffect, useRef, useState } from 'react';
import BasicsCard from './BasicsCard';
import SectionCard from './SectionCard';
import AddContentModal from './AddContentModal';
import { IconPlus } from './icons';

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

  return (
    <div className="content-panel">
      <BasicsCard
        basics={resume.basics}
        dispatch={dispatch}
        expanded={basicsExpanded}
        onExpandedChange={setBasicsExpanded}
      />

      {resume.sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          dispatch={dispatch}
          autoOpen={section.id === justAddedSectionId}
        />
      ))}

      <button type="button" className="add-content-btn" onClick={() => setModalOpen(true)}>
        <IconPlus size={18} />
        Add Content
      </button>

      {modalOpen && (
        <AddContentModal
          existingTypes={resume.sections.map((s) => s.type)}
          onAdd={handleAdd}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}