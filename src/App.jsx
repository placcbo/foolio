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

// Bump this whenever a default value or settings shape changes in a way that
// should NOT be silently inherited from an old save — otherwise stale
// localStorage from before the change keeps overriding the new default
// forever (merge-over-fallback can't tell "old save" from "user's choice").
const RESUME_SCHEMA_VERSION = 3;

function loadInitialResume(fallback) {
  try {
    const raw = localStorage.getItem(RESUME_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // A schema mismatch means the SETTINGS shape/defaults changed underneath
    // an old save, so those get reset to the fresh defaults below. It must
    // NOT throw away the user's actual resume — name, sections, every entry
    // they've written — that content merges in unconditionally either way.
    const settingsMatch = parsed.__schemaVersion === RESUME_SCHEMA_VERSION;
    delete parsed.__schemaVersion;

    // Merge over the current default shape so older saves missing newer
    // fields (like visibleExtra) don't crash the app after an update.
    return {
      ...fallback,
      ...parsed,
      basics: { ...fallback.basics, ...parsed.basics },
      settings: settingsMatch
        ? {
            ...fallback.settings,
            ...parsed.settings,
            layout: { ...fallback.settings.layout, ...parsed.settings?.layout },
            fontSize: { ...fallback.settings.fontSize, ...parsed.settings?.fontSize },
            spacing: { ...fallback.settings.spacing, ...parsed.settings?.spacing },
            entryLayout: { ...fallback.settings.entryLayout, ...parsed.settings?.entryLayout },
            headings: { ...fallback.settings.headings, ...parsed.settings?.headings },
            font: { ...fallback.settings.font, ...parsed.settings?.font },
            colors: {
              ...fallback.settings.colors,
              ...parsed.settings?.colors,
              applyTo: { ...fallback.settings.colors.applyTo, ...parsed.settings?.colors?.applyTo },
            },
            header: { ...fallback.settings.header, ...parsed.settings?.header },
            photo: { ...fallback.settings.photo, ...parsed.settings?.photo },
            footer: { ...fallback.settings.footer, ...parsed.settings?.footer },
            links: { ...fallback.settings.links, ...parsed.settings?.links },
          }
        : fallback.settings,
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
  const [saveError, setSaveError] = useState(null);
  const paperRef = useRef(null);
  // Hovering a Font dropdown option should live-preview it on the resume
  // without touching saved state — only the Customize tab's preview reads this.
  const [fontPreview, setFontPreview] = useState(null); // { field: 'body' | 'name', id } | null

  function handleFontPreview(field, id) {
    setFontPreview(id ? { field, id } : null);
  }

  const previewResume = fontPreview
    ? {
        ...resume,
        settings: {
          ...resume.settings,
          font: { ...resume.settings.font, [fontPreview.field]: fontPreview.id },
        },
      }
    : resume;

  // Debounced autosave — waits for a pause in typing so we're not hitting
  // localStorage on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          RESUME_STORAGE_KEY,
          JSON.stringify({ ...resume, __schemaVersion: RESUME_SCHEMA_VERSION })
        );
        setSavedAt(Date.now());
        setSaveError(null);
      } catch (e) {
        console.warn('Could not save resume.', e);
        // Surface this instead of failing silently — without it, the "Saved"
        // indicator keeps showing its last successful timestamp forever,
        // even while every edit since (e.g. after a large photo upload blew
        // the localStorage quota) is silently not being persisted.
        setSaveError(e.name === 'QuotaExceededError' ? 'storage-full' : 'unknown');
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

  function handleSelectTemplate(templateId, accentColor, preset) {
    dispatch({ type: 'SET_TEMPLATE', templateId, accentColor, preset });
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
        saveError={saveError}
        paperRef={paperRef}
      />

      {activeTab === 'content' ? (
        <div className="editor-body">
          <ContentPanel resume={resume} dispatch={dispatch} />
          <ResumePreview resume={resume} paperRef={paperRef} />
        </div>
      ) : activeTab === 'customize' ? (
        <div className="editor-body">
          <CustomizePanel resume={resume} dispatch={dispatch} onFontPreview={handleFontPreview} />
          <ResumePreview resume={previewResume} paperRef={paperRef} />
        </div>
      ) : (
        <ComingSoon label={activeTab === 'overview' ? 'Overview' : 'AI Tools'} />
      )}
    </div>
  );
}

export default App;