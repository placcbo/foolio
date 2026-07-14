import { useReducer, useState } from 'react';
import TopBar from './components/TopBar';
import ContentPanel from './components/ContentPanel';
import ResumePreview from './components/ResumePreview';
import TemplatePicker from './components/TemplatePicker';
import { resumeReducer, initialResumeState } from './state/resumeReducer';
import './App.css';

function ComingSoon({ label }) {
  return (
    <div className="coming-soon">
      <h2>{label}</h2>
      <p>This is coming soon. Head back to the Content tab to keep building your resume.</p>
    </div>
  );
}

function App() {
  const [resume, dispatch] = useReducer(resumeReducer, initialResumeState);
  const [page, setPage] = useState('picker');
  const [activeTab, setActiveTab] = useState('content');

  function handleSelectTemplate(templateId, accentColor) {
    dispatch({ type: 'SET_TEMPLATE', templateId, accentColor });
    setPage('editor');
  }

  if (page === 'picker') {
    return <TemplatePicker onSelectTemplate={handleSelectTemplate} />;
  }

  return (
    <div className="app-shell">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} onBack={() => setPage('picker')} />

      {activeTab === 'content' ? (
        <div className="editor-body">
          <ContentPanel resume={resume} dispatch={dispatch} />
          <ResumePreview resume={resume} />
        </div>
      ) : (
        <ComingSoon
          label={
            activeTab === 'overview' ? 'Overview' : activeTab === 'customize' ? 'Customize' : 'AI Tools'
          }
        />
      )}
    </div>
  );
}

export default App;
