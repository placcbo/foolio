import { IconMail, IconPhone, IconPin, IconLink, IconGlobe, IconFlag, IconCalendar, IconFileText, IconCheck, IconUser } from '../icons';
import { formatEntryDateRange } from '../../utils/dateFormat';
import { DEFAULT_FONT_SIZE } from '../../state/resumeReducer';

// Full Name / Section Headings / Entry Header are each an offset added on
// top of the base size (see Font Size panel); everything else scales with
// the base via em units in App.css.
export function getFontSizes(settings) {
  const fs = settings?.fontSize ?? DEFAULT_FONT_SIZE;
  return {
    basePt: fs.base,
    nameFontSize: `${fs.base + fs.fullName}pt`,
    headingFontSize: `${fs.base + fs.sectionHeadings}pt`,
    entryHeaderFontSize: `${fs.base + fs.entryHeader}pt`,
  };
}

const EXTRA_FIELD_ICONS = {
  linkedin: IconLink,
  website: IconGlobe,
  nationality: IconFlag,
  dob: IconCalendar,
  visa: IconFileText,
  passportId: IconFileText,
  availability: IconCheck,
  drivingLicense: IconFileText,
  maritalStatus: IconUser,
  gender: IconUser,
  militaryStatus: IconFileText,
};

// Single source of truth for "what shows in the contact line" across every template.
// Anything added via the Add Details chips shows up here automatically.
export function getContactItems(basics) {
  const items = [];
  if (basics.email) items.push({ key: 'email', Icon: IconMail, text: basics.email });
  if (basics.phone) items.push({ key: 'phone', Icon: IconPhone, text: basics.phone });
  if (basics.address) items.push({ key: 'address', Icon: IconPin, text: basics.address });
  (basics.visibleExtra || []).forEach((key) => {
    const value = basics[key];
    if (!value) return;
    items.push({ key, Icon: EXTRA_FIELD_ICONS[key] || IconFileText, text: value });
  });
  return items;
}

export function Avatar({ photo, name, shape = 'circle', size = 96, className = '' }) {
  const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? '14px' : '0';
  if (photo) {
    return (
      <img
        className={`tpl-avatar ${className}`}
        src={photo}
        alt={name || 'Profile'}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }
  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
  return (
    <div
      className={`tpl-avatar tpl-avatar-placeholder ${className}`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {initials || '?'}
    </div>
  );
}

export function splitSections(sections) {
  return {
    sidebarSections: sections.filter((s) => s.kind === 'tags'),
    mainSections: sections.filter((s) => s.kind !== 'tags'),
  };
}

// Identity block (photo/name/title/contact) shared by every template's
// two-column and mix layouts, so Layout > Header Position has one thing to
// move around regardless of which design is active.
export function HeaderBlock({ basics, contactItems, colored, accentColor, avatarShape = 'circle', nameFontSize }) {
  return (
    <div
      className={`tpl-header-block${colored ? ' tpl-header-block-colored' : ''}`}
      style={colored ? { background: accentColor } : undefined}
    >
      {basics.photo && (
        <Avatar photo={basics.photo} name={basics.name} shape={avatarShape} size={72} />
      )}
      <div>
        <h1 style={{ fontSize: nameFontSize }}>{basics.name || 'Your name'}</h1>
        {basics.title && <p className="tpl-header-block-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="tpl-header-block-contact">
            {contactItems.map(({ key, Icon, text }) => (
              <span key={key}>
                <Icon size={12} /> {text}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Two-column body used whenever Layout > Columns is "Two" or "Mix". Header
// Position decides whether the identity block spans the top or sits inside
// one of the two columns; Column Width drives the split.
export function SplitLayout({
  headerContent,
  headerPosition = 'top',
  columnWidth = 50,
  sidebarSections,
  mainSections,
  dateFormat,
  asideColored,
  accentColor,
  headingFontSize,
  entryHeaderFontSize,
}) {
  const leftWidth = columnWidth;
  const rightWidth = 100 - columnWidth;

  return (
    <>
      {headerPosition === 'top' && headerContent}
      <div className="tpl-split-body" style={{ gridTemplateColumns: `${leftWidth}% ${rightWidth}%` }}>
        <aside
          className={`tpl-split-col tpl-split-aside${asideColored ? ' tpl-split-aside-colored' : ''}`}
          style={asideColored ? { background: accentColor } : undefined}
        >
          {headerPosition === 'left' && headerContent}
          {sidebarSections.map((s) => (
            <div className="tpl-sidebar-block" key={s.id}>
              <h4 className="tpl-heading" style={{ fontSize: headingFontSize }}>{s.title}</h4>
              <SectionBody section={s} dateFormat={dateFormat} entryHeaderFontSize={entryHeaderFontSize} />
            </div>
          ))}
        </aside>
        <div className="tpl-split-col tpl-split-main">
          {headerPosition === 'right' && headerContent}
          {mainSections.map((s) => (
            <section className="tpl-main-section" key={s.id}>
              <h4 className="tpl-heading" style={{ fontSize: headingFontSize }}>{s.title}</h4>
              <SectionBody section={s} dateFormat={dateFormat} entryHeaderFontSize={entryHeaderFontSize} />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

export function SectionBody({ section, dateFormat, entryHeaderFontSize }) {
  if (section.kind === 'text') {
    return section.content ? <p className="tpl-text">{section.content}</p> : null;
  }

  if (section.kind === 'tags') {
    if (!section.tags.length) return null;
    return (
      <ul className="tpl-taglist">
        {section.tags.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    );
  }

  if (section.kind === 'entries') {
    const entries = section.entries.filter(
      (e) => e.heading || e.subheading || e.description || e.location || e.start || e.end
    );
    if (!entries.length) return null;
    return (
      <>
        {entries.map((entry) => {
          const { start, end } = formatEntryDateRange(entry, dateFormat);
          return (
          <div className="tpl-entry" key={entry.id}>
            <div className="tpl-entry-heading" style={{ fontSize: entryHeaderFontSize }}>
              {[entry.heading, entry.subheading, entry.location].filter(Boolean).join(', ')}
            </div>
            {(start || end) && (
              <div className="tpl-entry-date">
                {[start, end].filter(Boolean).join(' — ')}
              </div>
            )}
            {entry.description && (
              <ul className="tpl-entry-bullets">
                {entry.description
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
              </ul>
            )}
          </div>
          );
        })}
      </>
    );
  }

  return null;
}