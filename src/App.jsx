import { useReducer, useState, useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import NavRail from './components/NavRail';
import ContentPanel from './components/ContentPanel';
import CustomizePanel from './components/CustomizePanel';
import ResumeLibrary from './components/ResumeLibrary';
import JobTracker from './components/JobTracker';
import ResumePreview from './components/ResumePreview';
import TemplatePicker from './components/TemplatePicker';
import Home from './components/Home';
import { resumeReducer, initialResumeState } from './state/resumeReducer';
import './App.css';
import './components/Home.css';

const LIBRARY_KEY = 'draftly:library';
const ACTIVE_RESUME_KEY = 'draftly:activeResumeId';
const PAGE_STORAGE_KEY = 'draftly:page';
const JOBS_KEY = 'draftly:jobs';
// Pre-multi-resume save location — only ever read once, to migrate an
// existing single resume into the new library on someone's first load
// after this update. Never written to again after that.
const LEGACY_RESUME_KEY = 'draftly:resume';

// Bump this whenever a default value or settings shape changes in a way that
// should NOT be silently inherited from an old save — otherwise stale
// localStorage from before the change keeps overriding the new default
// forever (merge-over-fallback can't tell "old save" from "user's choice").
const RESUME_SCHEMA_VERSION = 3;

function resumeKey(id) {
  return `draftly:resume:${id}`;
}

function nextId() {
  return `resume-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

// The Candidly → Draftly rename changed the storage key prefix. Anyone who
// already had a resume/job data saved under the old "candidly:*" keys would
// otherwise find an apparently-empty app on their next load — this copies
// every old-prefixed key across once, non-destructively (old keys are left
// in place, matching the same one-time-copy pattern LEGACY_RESUME_KEY below
// already uses), so nothing existing is lost.
function migrateLegacyNamespace() {
  try {
    if (localStorage.getItem(LIBRARY_KEY) != null) return; // already on draftly:*, or fresh install
    const oldKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('candidly:')) oldKeys.push(key);
    }
    oldKeys.forEach((oldKey) => {
      const newKey = `draftly:${oldKey.slice('candidly:'.length)}`;
      if (localStorage.getItem(newKey) == null) {
        localStorage.setItem(newKey, localStorage.getItem(oldKey));
      }
    });
  } catch {
    // best effort — worst case the legacy-resume migration below still runs
  }
}
migrateLegacyNamespace();

// Shared by initial boot and by switching/duplicating resumes later — a
// schema mismatch means the SETTINGS shape/defaults changed underneath an
// old save, so those reset to fresh defaults, but the user's actual content
// (name, sections, every entry they've written) always merges in as-is.
function mergeWithSchema(parsed, fallback = initialResumeState) {
  const settingsMatch = parsed.__schemaVersion === RESUME_SCHEMA_VERSION;
  const clean = { ...parsed };
  delete clean.__schemaVersion;

  return {
    ...fallback,
    ...clean,
    basics: { ...fallback.basics, ...clean.basics },
    settings: settingsMatch
      ? {
          ...fallback.settings,
          ...clean.settings,
          layout: { ...fallback.settings.layout, ...clean.settings?.layout },
          fontSize: { ...fallback.settings.fontSize, ...clean.settings?.fontSize },
          spacing: { ...fallback.settings.spacing, ...clean.settings?.spacing },
          entryLayout: { ...fallback.settings.entryLayout, ...clean.settings?.entryLayout },
          headings: { ...fallback.settings.headings, ...clean.settings?.headings },
          font: { ...fallback.settings.font, ...clean.settings?.font },
          colors: {
            ...fallback.settings.colors,
            ...clean.settings?.colors,
            applyTo: { ...fallback.settings.colors.applyTo, ...clean.settings?.colors?.applyTo },
          },
          header: { ...fallback.settings.header, ...clean.settings?.header },
          photo: { ...fallback.settings.photo, ...clean.settings?.photo },
          footer: { ...fallback.settings.footer, ...clean.settings?.footer },
          links: { ...fallback.settings.links, ...clean.settings?.links },
        }
      : fallback.settings,
  };
}

function loadResumeById(id) {
  try {
    const raw = localStorage.getItem(resumeKey(id));
    if (!raw) return initialResumeState;
    return mergeWithSchema(JSON.parse(raw));
  } catch (e) {
    console.warn('Could not load resume, starting fresh.', e);
    return initialResumeState;
  }
}

function saveResumeById(id, resume) {
  localStorage.setItem(resumeKey(id), JSON.stringify({ ...resume, __schemaVersion: RESUME_SCHEMA_VERSION }));
}

// Reads the library index, migrating the old single-resume save into it the
// first time this runs after the update. Never returns an empty array once
// there's any resume data at all — callers can treat "no library" and "no
// resumes yet" as the same thing (show the picker).
function loadLibrary() {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fall through to migration/empty
  }

  try {
    const legacy = localStorage.getItem(LEGACY_RESUME_KEY);
    if (legacy) {
      const id = 'resume-1';
      localStorage.setItem(resumeKey(id), legacy);
      let name = 'Resume 1';
      let templateId = 'onecolumn';
      let accentColor = '#000000';
      try {
        const parsedLegacy = JSON.parse(legacy);
        if (parsedLegacy.basics?.name) name = parsedLegacy.basics.name;
        templateId = parsedLegacy.templateId || templateId;
        accentColor = parsedLegacy.accentColor || accentColor;
      } catch {
        // legacy save was unreadable — still register the id so it isn't lost
      }
      const library = [{ id, name, updatedAt: Date.now(), templateId, accentColor, nameManuallySet: false }];
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
      return library;
    }
  } catch {
    // ignore — worst case, they see an empty library and start fresh
  }

  return [];
}

function loadInitialPage(library) {
  if (!library.length) return 'home';
  try {
    return localStorage.getItem(PAGE_STORAGE_KEY) === 'editor' ? 'editor' : 'picker';
  } catch {
    return 'picker';
  }
}

function loadInitialActiveId(library) {
  if (!library.length) return null;
  try {
    const saved = localStorage.getItem(ACTIVE_RESUME_KEY);
    if (saved && library.some((r) => r.id === saved)) return saved;
  } catch {
    // fall through
  }
  return library[0].id;
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
  const [library, setLibrary] = useState(loadLibrary);
  const [jobs, setJobs] = useState(() => {
    try {
      const raw = localStorage.getItem(JOBS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [activeResumeId, setActiveResumeId] = useState(() => loadInitialActiveId(library));
  const [resume, dispatch] = useReducer(
    resumeReducer,
    initialResumeState,
    () => (activeResumeId ? loadResumeById(activeResumeId) : initialResumeState)
  );
  const [page, setPage] = useState(() => loadInitialPage(library));
  // Distinguishes "picking a template to change the current resume's look"
  // (the pre-existing Templates back-button flow) from "picking a template
  // to start a brand-new resume" (Overview / resume-switcher's + New) —
  // both land on the same TemplatePicker, this just decides what happens
  // when a template is actually chosen.
  const [creatingNew, setCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  // Mobile-only: the content/customize tabs normally show the edit form and
  // the live A4 preview side by side, which doesn't fit on a phone screen.
  // Below the mobile breakpoint this decides which of the two is visible;
  // above it, both panels show at once and this is never read.
  const [mobileView, setMobileView] = useState('edit');
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
  // localStorage on every keystroke. Also keeps this resume's library card
  // (name/thumbnail info) in sync, unless the person has manually renamed
  // it — an explicit rename shouldn't keep getting silently overwritten by
  // whatever they later type into the name field.
  useEffect(() => {
    if (!activeResumeId) return;
    const id = setTimeout(() => {
      try {
        saveResumeById(activeResumeId, resume);
        setSavedAt(Date.now());
        setSaveError(null);
        setLibrary((lib) =>
          lib.map((r) =>
            r.id === activeResumeId
              ? {
                  ...r,
                  updatedAt: Date.now(),
                  templateId: resume.templateId,
                  accentColor: resume.accentColor,
                  name: r.nameManuallySet ? r.name : resume.basics.name || r.name,
                }
              : r
          )
        );
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
  }, [resume, activeResumeId]);

  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    } catch {
      // non-critical — worst case the dashboard is stale until next save
    }
  }, [library]);

  useEffect(() => {
    try {
      localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    } catch {
      // non-critical — the tracker is stale until the next successful save
    }
  }, [jobs]);

  useEffect(() => {
    try {
      if (activeResumeId) localStorage.setItem(ACTIVE_RESUME_KEY, activeResumeId);
    } catch {
      // ignore
    }
  }, [activeResumeId]);

  useEffect(() => {
    try {
      localStorage.setItem(PAGE_STORAGE_KEY, page);
    } catch {
      // ignore — worst case, refresh drops you back on the picker
    }
  }, [page]);

  function handleSelectTemplate(templateId, accentColor, preset) {
    // No active resume means there's nothing for a plain SET_TEMPLATE to
    // attach to — most commonly a first-time visitor picking their very
    // first template, where `creatingNew` was never set true. Treat that
    // the same as explicitly creating new, otherwise the resume being
    // edited is never saved to the library at all.
    if (creatingNew || !activeResumeId) {
      const id = nextId();
      const entry = {
        id,
        name: `Resume ${library.length + 1}`,
        updatedAt: Date.now(),
        templateId,
        accentColor: accentColor ?? '#000000',
        nameManuallySet: false,
      };
      setLibrary((lib) => [...lib, entry]);
      setActiveResumeId(id);
      dispatch({ type: 'LOAD_RESUME', resume: initialResumeState });
      dispatch({ type: 'SET_TEMPLATE', templateId, accentColor, preset });
      setCreatingNew(false);
    } else {
      dispatch({ type: 'SET_TEMPLATE', templateId, accentColor, preset });
    }
    setActiveTab('content');
    setPage('editor');
  }

  function handleStartNewResume() {
    setCreatingNew(true);
    setPage('picker');
  }

  function handleSwitchResume(id) {
    if (id === activeResumeId) {
      setActiveTab('content');
      setPage('editor');
      return;
    }
    dispatch({ type: 'LOAD_RESUME', resume: loadResumeById(id) });
    setActiveResumeId(id);
    setActiveTab('content');
    setPage('editor');
  }

  function handleDuplicateResume(id) {
    const original = loadResumeById(id);
    const source = library.find((r) => r.id === id);
    const newId = nextId();
    saveResumeById(newId, original);
    setLibrary((lib) => [
      ...lib,
      {
        id: newId,
        name: `${source?.name || 'Resume'} (copy)`,
        updatedAt: Date.now(),
        templateId: original.templateId,
        accentColor: original.accentColor,
        nameManuallySet: true,
      },
    ]);
  }

  function handleDeleteResume(id) {
    const entry = library.find((r) => r.id === id);
    const ok = window.confirm(`Delete "${entry?.name || 'this resume'}"? This can't be undone.`);
    if (!ok) return;
    localStorage.removeItem(resumeKey(id));
    const remaining = library.filter((r) => r.id !== id);
    setLibrary(remaining);
    if (id === activeResumeId) {
      if (remaining.length) {
        handleSwitchResume(remaining[0].id);
      } else {
        setActiveResumeId(null);
        dispatch({ type: 'LOAD_RESUME', resume: initialResumeState });
        setPage('picker');
      }
    }
  }

  function handleRenameResume(id, name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLibrary((lib) => lib.map((r) => (r.id === id ? { ...r, name: trimmed, nameManuallySet: true } : r)));
  }

  function handleAddJob() {
    const id = `job-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    setJobs((js) => [
      {
        id,
        company: '',
        role: '',
        status: 'Saved',
        jdText: '',
        // Default the link to whatever resume is open — usually the one
        // being tailored for this application; changeable in the card.
        resumeId: activeResumeId || null,
        createdAt: Date.now(),
      },
      ...js,
    ]);
    return id;
  }

  function handleUpdateJob(id, patch) {
    setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: Date.now() } : j)));
  }

  function handleDeleteJob(id) {
    setJobs((js) => js.filter((j) => j.id !== id));
  }

  if (page === 'home') {
    return (
      <Home
        onStart={() => {
          setCreatingNew(true);
          setPage('picker');
        }}
        onSelectTemplate={handleSelectTemplate}
        isAuthenticated={false}
        // Auth isn't wired yet — sign in/up handlers omitted on purpose so
        // those buttons don't render. Add them when the auth layer lands.
      />
    );
  }

  if (page === 'picker') {
    return (
      <TemplatePicker
        onSelectTemplate={handleSelectTemplate}
        hasExistingResumes={library.length > 0}
        onCancel={
          library.length
            ? () => {
                setCreatingNew(false);
                setPage('editor');
              }
            : undefined
        }
      />
    );
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setMobileView('edit');
  }

  return (
    <div className="app-shell">
      <NavRail activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="app-main">
        <TopBar
          onBack={() => {
            setCreatingNew(false);
            setPage('picker');
          }}
          resume={resume}
          savedAt={savedAt}
          saveError={saveError}
          paperRef={paperRef}
          library={library}
          activeResumeId={activeResumeId}
          onSwitchResume={handleSwitchResume}
          onCreateResume={handleStartNewResume}
          onRenameResume={handleRenameResume}
        />

        {activeTab === 'content' ? (
          <>
            <div className="mobile-view-toggle">
              <button
                type="button"
                className={`mobile-view-toggle-btn${mobileView === 'edit' ? ' active' : ''}`}
                onClick={() => setMobileView('edit')}
              >
                Edit
              </button>
              <button
                type="button"
                className={`mobile-view-toggle-btn${mobileView === 'preview' ? ' active' : ''}`}
                onClick={() => setMobileView('preview')}
              >
                Preview
              </button>
            </div>
            <div className={`editor-body mobile-view-${mobileView}`}>
              <ContentPanel resume={resume} dispatch={dispatch} />
              <ResumePreview resume={resume} paperRef={paperRef} />
            </div>
          </>
        ) : activeTab === 'customize' ? (
          <>
            <div className="mobile-view-toggle">
              <button
                type="button"
                className={`mobile-view-toggle-btn${mobileView === 'edit' ? ' active' : ''}`}
                onClick={() => setMobileView('edit')}
              >
                Edit
              </button>
              <button
                type="button"
                className={`mobile-view-toggle-btn${mobileView === 'preview' ? ' active' : ''}`}
                onClick={() => setMobileView('preview')}
              >
                Preview
              </button>
            </div>
            <div className={`editor-body editor-body-customize mobile-view-${mobileView}`}>
              <CustomizePanel resume={resume} dispatch={dispatch} onFontPreview={handleFontPreview} />
              <ResumePreview resume={previewResume} paperRef={paperRef} />
            </div>
          </>
        ) : activeTab === 'overview' ? (
          <ResumeLibrary
            library={library}
            jobs={jobs}
            activeResumeId={activeResumeId}
            onSwitch={handleSwitchResume}
            onCreate={handleStartNewResume}
            onDuplicate={handleDuplicateResume}
            onDelete={handleDeleteResume}
            onRename={handleRenameResume}
          />
        ) : (
          <JobTracker
            jobs={jobs}
            library={library}
            loadResume={loadResumeById}
            onAdd={handleAddJob}
            onUpdate={handleUpdateJob}
            onDelete={handleDeleteJob}
            onOpenResume={handleSwitchResume}
          />
        )}
      </div>
    </div>
  );
}

export default App;