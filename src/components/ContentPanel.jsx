import { useState } from 'react';
import BasicsCard from './BasicsCard';
import SectionCard from './SectionCard';
import AddContentModal from './AddContentModal';
import { IconPlus } from './icons';

export default function ContentPanel({ resume, dispatch }) {
  const [modalOpen, setModalOpen] = useState(false);

  function handleAdd(sectionType) {
    dispatch({ type: 'ADD_SECTION', sectionType });
    setModalOpen(false);
  }

  return (
    <div className="content-panel">
      <BasicsCard basics={resume.basics} dispatch={dispatch} />

      {resume.sections.map((section) => (
        <SectionCard key={section.id} section={section} dispatch={dispatch} />
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
