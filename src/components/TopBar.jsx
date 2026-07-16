import {
  IconGrid,
  IconFileText,
  IconWand,
  IconSparkle,
  IconChevronDown,
  IconMoreVertical,
  IconArrowLeft,
  IconCheck,
  IconInfo,
} from './icons';
import DownloadMenu from './DownloadMenu';

const TABS = [
  { id: 'overview', label: 'Overview', icon: IconGrid },
  { id: 'content', label: 'Content', icon: IconFileText },
  { id: 'customize', label: 'Customize', icon: IconWand },
  { id: 'ai', label: 'AI Tools', icon: IconSparkle },
];

const SAVE_ERROR_MESSAGE = {
  'storage-full': "Your browser's storage is full (likely from an uploaded photo) — recent changes are NOT being saved. Try a smaller photo or free up storage.",
  unknown: 'Your changes are not being saved right now. Keep this tab open, or copy your work elsewhere as a backup.',
};

export default function TopBar({ activeTab, onTabChange, onBack, resume, savedAt, saveError, paperRef }) {
  return (
    <header className="topbar">
      {onBack && (
        <button type="button" className="back-btn" onClick={onBack}>
          <IconArrowLeft size={16} />
          Templates
        </button>
      )}
      <nav className="tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`tab${activeTab === id ? ' active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="topbar-right">
        {saveError ? (
          <span className="save-indicator save-indicator-error" title={SAVE_ERROR_MESSAGE[saveError]}>
            <IconInfo size={13} />
            Not saved
          </span>
        ) : (
          savedAt && (
            <span className="save-indicator">
              <IconCheck size={13} />
              Saved
            </span>
          )
        )}
        <button type="button" className="resume-select">
          Resume 1
          <IconChevronDown size={14} />
        </button>
        <DownloadMenu resume={resume} paperRef={paperRef} />
        <button type="button" className="icon-btn" aria-label="More options">
          <IconMoreVertical size={18} />
        </button>
      </div>
    </header>
  );
}