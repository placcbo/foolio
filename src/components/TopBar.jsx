import {
  IconGrid,
  IconFileText,
  IconWand,
  IconSparkle,
  IconChevronDown,
  IconDownload,
  IconMoreVertical,
} from './icons';

const TABS = [
  { id: 'overview', label: 'Overview', icon: IconGrid },
  { id: 'content', label: 'Content', icon: IconFileText },
  { id: 'customize', label: 'Customize', icon: IconWand },
  { id: 'ai', label: 'AI Tools', icon: IconSparkle },
];

export default function TopBar({ activeTab, onTabChange }) {
  return (
    <header className="topbar">
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
        <button type="button" className="resume-select">
          Resume 1
          <IconChevronDown size={14} />
        </button>
        <button type="button" className="btn-download">
          Download
          <IconDownload size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="More options">
          <IconMoreVertical size={18} />
        </button>
      </div>
    </header>
  );
}
