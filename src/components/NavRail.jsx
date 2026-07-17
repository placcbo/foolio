import { IconGrid, IconFileText, IconWand, IconSparkle } from './icons';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: IconGrid },
  { id: 'content', label: 'Content', icon: IconFileText },
  { id: 'customize', label: 'Customize', icon: IconWand },
  { id: 'ai', label: 'AI Tools', icon: IconSparkle },
];

export default function NavRail({ activeTab, onTabChange }) {
  return (
    <nav className="nav-rail">
      <div className="nav-rail-mark" aria-hidden="true">
        C
      </div>

      <div className="nav-rail-items">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-rail-item${activeTab === id ? ' active' : ''}`}
            onClick={() => onTabChange(id)}
            title={label}
            aria-label={label}
          >
            <Icon size={19} />
            <span className="nav-rail-item-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
