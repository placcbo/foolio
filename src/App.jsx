import { useReducer, useState, useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import ContentPanel from './components/ContentPanel';
import CustomizePanel from './components/CustomizePanel';
import ResumePreview from './components/ResumePreview';
import TemplatePicker from './components/TemplatePicker';
import { resumeReducer, initialResumeState } from './state/resumeReducer';
import './App.css';

const RESUME_STORAGE_KEY = 'candidly:resume';
const PAGE_STORAGE_KEY = 'candidly:page';

function loadInitialResume(fallback) {
  try {
    const raw = localStorage.getItem(RESUME_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Merge over the current default shape so older saves missing newer
    // fields (like visibleExtra) don't crash the app after an update.
    return {
      ...fallback,
      ...parsed,
      basics: { ...fallback.basics, ...parsed.basics },
      settings: {
        ...fallback.settings,
        ...parsed.settings,
        layout: { ...fallback.settings.layout, ...parsed.settings?.layout },
        fontSize: { ...fallback.settings.fontSize, ...parsed.settings?.fontSize },
        spacing: { ...fallback.settings.spacing, ...parsed.settings?.spacing },
        entryLayout: { ...fallback.settings.entryLayout, ...parsed.settings?.entryLayout },
      },
    };
  } catch (e) {
    console.warn('Could not load saved resume, starting fresh.', e);
    return fallback;
  }
}

function loadInitialPage() {
  try {
    return localStorage.getItem(PAGE_STORAGE_KEY) === 'editor' ? 'editor' : 'picker';
  } catch {
    return 'picker';
  }
}

function ComingSoon({ label }) {
  return (
    <div className="coming-soon">
      <h2>{label}</h2>
      <p>This is coming soon. Head back to the Content tab to keep building your resume.</p>
    </div>
  );
}

function App() {
  const [resume, dispatch] = useReducer(resumeReducer, initialResumeState, loadInitialResume);
  const [page, setPage] = useState(loadInitialPage);
  const [activeTab, setActiveTab] = useState('content');
  const [savedAt, setSavedAt] = useState(null);
  const paperRef = useRef(null);

  // Debounced autosave — waits for a pause in typing so we're not hitting
  // localStorage on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resume));
        setSavedAt(Date.now());
      } catch (e) {
        console.warn('Could not save resume.', e);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [resume]);

  useEffect(() => {
    try {
      localStorage.setItem(PAGE_STORAGE_KEY, page);
    } catch {
      // ignore — worst case, refresh drops you back on the picker
    }
  }, [page]);

  function handleSelectTemplate(templateId, accentColor) {
    dispatch({ type: 'SET_TEMPLATE', templateId, accentColor });
    setPage('editor');
  }

  if (page === 'picker') {
    return <TemplatePicker onSelectTemplate={handleSelectTemplate} />;
  }

  return (
    <div className="app-shell">
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => setPage('picker')}
        resume={resume}
        savedAt={savedAt}
        paperRef={paperRef}
      />

      {activeTab === 'content' ? (
        <div className="editor-body">
          <ContentPanel resume={resume} dispatch={dispatch} />
          <ResumePreview resume={resume} paperRef={paperRef} />
        </div>
      ) : activeTab === 'customize' ? (
        <div className="editor-body">
          <CustomizePanel resume={resume} dispatch={dispatch} />
          <ResumePreview resume={resume} paperRef={paperRef} />
        </div>
      ) : (
        <ComingSoon label={activeTab === 'overview' ? 'Overview' : 'AI Tools'} />
      )}
    </div>
  );
}

export default App;