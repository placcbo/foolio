import {
  IconGrid,
  IconFileText,
  IconWand,
  IconSparkle,
  IconChevronDown,
  IconMoreVertical,
  IconArrowLeft,
  IconCheck,
} from './icons';
import DownloadMenu from './DownloadMenu';

const TABS = [
  { id: 'overview', label: 'Overview', icon: IconGrid },
  { id: 'content', label: 'Content', icon: IconFileText },
  { id: 'customize', label: 'Customize', icon: IconWand },
  { id: 'ai', label: 'AI Tools', icon: IconSparkle },
];

export default function TopBar({ activeTab, onTabChange, onBack, resume, savedAt, paperRef }) {
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
        {savedAt && (
          <span className="save-indicator">
            <IconCheck size={13} />
            Saved
          </span>
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