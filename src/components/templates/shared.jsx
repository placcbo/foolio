import { IconMail, IconPhone, IconPin, IconLink, IconGlobe, IconFlag, IconCalendar, IconFileText, IconCheck, IconUser } from '../icons';
import { formatEntryDateRange } from '../../utils/dateFormat';
import { DEFAULT_FONT_SIZE, DEFAULT_SPACING, DEFAULT_ENTRY_LAYOUT } from '../../state/resumeReducer';

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

const MM_TO_PX = 96 / 25.4;

// lineHeight cascades naturally (unitless, so it inherits as a ratio, not a
// fixed px value); spaceOffsetPx drives the `--space-offset` custom property
// that the gap/margin rules in App.css add on top of their base value.
export function getSpacing(settings) {
  const sp = settings?.spacing ?? DEFAULT_SPACING;
  return {
    lineHeight: sp.lineHeight,
    spaceOffsetPx: sp.spaceBetween * MM_TO_PX,
    marginLRpx: sp.marginLR * MM_TO_PX,
    marginTBpx: sp.marginTB * MM_TO_PX,
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

function websiteHref(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

// Single source of truth for "what shows in the contact line" across every template.
// Anything added via the Add Details chips shows up here automatically.
// Email/phone/links get a real href so they're clickable and keyboard-focusable,
// not just styled text.
export function getContactItems(basics) {
  const items = [];
  if (basics.email) items.push({ key: 'email', Icon: IconMail, text: basics.email, href: `mailto:${basics.email.trim()}` });
  if (basics.phone) {
    items.push({
      key: 'phone',
      Icon: IconPhone,
      text: basics.phone,
      href: `tel:${basics.phone.replace(/[^\d+]/g, '')}`,
    });
  }
  if (basics.address) items.push({ key: 'address', Icon: IconPin, text: basics.address });
  (basics.visibleExtra || []).forEach((key) => {
    const value = basics[key];
    if (!value) return;
    const href = key === 'linkedin' || key === 'website' ? websiteHref(value.trim()) : undefined;
    items.push({ key, Icon: EXTRA_FIELD_ICONS[key] || IconFileText, text: value, href });
  });
  return items;
}

// Renders a contact line item as a real link when it has a target (email,
// phone, linkedin, website) and as plain text otherwise (address, DOB, etc.
// aren't meaningfully "clickable").
export function ContactItem({ item, iconSize = 13 }) {
  const { Icon, text, href } = item;
  const content = (
    <>
      <Icon size={iconSize} /> {text}
    </>
  );
  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return <span>{content}</span>;
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
export function HeaderBlock({
  basics,
  contactItems,
  colored,
  accentColor,
  avatarShape = 'circle',
  nameFontSize,
  marginLRpx,
  marginTBpx,
}) {
  const style = { ...(colored ? { background: accentColor } : null) };
  if (marginLRpx != null) style.paddingLeft = style.paddingRight = marginLRpx;
  if (marginTBpx != null) style.paddingTop = style.paddingBottom = marginTBpx;

  return (
    <div className={`tpl-header-block${colored ? ' tpl-header-block-colored' : ''}`} style={style}>
      {basics.photo && (
        <Avatar photo={basics.photo} name={basics.name} shape={avatarShape} size={72} />
      )}
      <div>
        <h1 style={{ fontSize: nameFontSize }}>{basics.name || 'Your name'}</h1>
        {basics.title && <p className="tpl-header-block-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="tpl-header-block-contact">
            {contactItems.map((item) => (
              <ContactItem key={item.key} item={item} iconSize={12} />
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
  entryLayout,
  marginLRpx,
  marginTBpx,
}) {
  const leftWidth = columnWidth;
  const rightWidth = 100 - columnWidth;
  const asideStyle = { paddingTop: marginTBpx, paddingBottom: marginTBpx, paddingLeft: marginLRpx };
  const mainStyle = { paddingTop: marginTBpx, paddingBottom: marginTBpx, paddingRight: marginLRpx };
  if (asideColored) asideStyle.background = accentColor;
  // Entries only ever land in the main column (splitSections keeps them out
  // of the tags-only aside); below 60% width, Date & Location move below the
  // title regardless of the Entries panel setting, so they stay readable.
  const narrowColumn = rightWidth < 60;

  return (
    <>
      {headerPosition === 'top' && headerContent}
      <div className="tpl-split-body" style={{ gridTemplateColumns: `${leftWidth}% ${rightWidth}%` }}>
        <aside
          className={`tpl-split-col tpl-split-aside${asideColored ? ' tpl-split-aside-colored' : ''}`}
          style={asideStyle}
        >
          {headerPosition === 'left' && headerContent}
          {sidebarSections.map((s) => (
            <div className="tpl-sidebar-block" key={s.id}>
              <h4 className="tpl-heading" style={{ fontSize: headingFontSize }}>{s.title}</h4>
              <SectionBody
                section={s}
                dateFormat={dateFormat}
                entryHeaderFontSize={entryHeaderFontSize}
                entryLayout={entryLayout}
              />
            </div>
          ))}
        </aside>
        <div className="tpl-split-col tpl-split-main" style={mainStyle}>
          {headerPosition === 'right' && headerContent}
          {mainSections.map((s) => (
            <section className="tpl-main-section" key={s.id}>
              <h4 className="tpl-heading" style={{ fontSize: headingFontSize }}>{s.title}</h4>
              <SectionBody
                section={s}
                dateFormat={dateFormat}
                entryHeaderFontSize={entryHeaderFontSize}
                entryLayout={entryLayout}
                narrowColumn={narrowColumn}
              />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

const ENTRY_TEXT_STYLE = {
  regular: undefined,
  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
};

// One entry (job, degree, etc.) inside an "entries" section, driven by the
// Entries panel's settings. `variant` picks which template's className
// prefix to use for heading/date/bullets so each design keeps its own
// color/font treatment; the structural bits (row split, subtitle, location)
// are shared across every template via generic classNames.
export function EntryBlock({ entry, dateFormat, entryLayout, entryHeaderFontSize, variant = 'tpl', narrowColumn }) {
  const el = entryLayout ?? DEFAULT_ENTRY_LAYOUT;
  const { start, end } = formatEntryDateRange(entry, dateFormat);
  const dateStr = [start, end].filter(Boolean).join(' – ');
  const locStr = entry.location || '';

  const first = el.dateLocationOrder === 'location-date' ? locStr : dateStr;
  const second = el.dateLocationOrder === 'location-date' ? dateStr : locStr;
  const sameLine = el.locationPlacement === 'sameLine';
  const dlTop = sameLine ? [first, second].filter(Boolean).join(' · ') : first;
  const dlBottom = sameLine ? null : second;

  const effectivePosition = narrowColumn ? 'below' : el.dateLocationPosition;
  const sideBySide = el.structure === 'columns' ? !narrowColumn : effectivePosition === 'right';
  const hasDateLocation = Boolean(dlTop || dlBottom);

  let titleStyle;
  let dateColStyle;
  if (sideBySide) {
    if (el.headerSplit === 'manual') {
      titleStyle = { flex: `0 0 ${el.titleWidth}%`, maxWidth: `${el.titleWidth}%` };
      dateColStyle = { flex: `0 0 ${100 - el.titleWidth}%`, maxWidth: `${100 - el.titleWidth}%` };
    } else {
      titleStyle = { flex: '1 1 auto', minWidth: 0 };
      dateColStyle = { flex: '0 0 auto', marginLeft: 'auto' };
    }
  }

  const bulletsClassName = [
    `${variant}-entry-bullets`,
    el.listStyle === 'hyphen' && 'entry-bullets-hyphen',
    el.indentBody && 'entry-bullets-indent',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${variant}-entry`}>
      <div className={`entry-row${sideBySide ? ' entry-row-split' : ' entry-row-stack'}`}>
        <div className="entry-title-col" style={titleStyle}>
          <div className={`${variant}-entry-heading`} style={{ fontSize: entryHeaderFontSize }}>
            {entry.heading}
            {el.subtitlePlacement === 'sameLine' && entry.subheading && (
              <span className={`${variant}-entry-subtitle-inline`} style={ENTRY_TEXT_STYLE[el.subtitleStyle]}>
                {`, ${entry.subheading}`}
              </span>
            )}
          </div>
          {el.subtitlePlacement === 'belowTitle' && entry.subheading && (
            <div className={`${variant}-entry-subtitle`} style={ENTRY_TEXT_STYLE[el.subtitleStyle]}>
              {entry.subheading}
            </div>
          )}
        </div>
        {hasDateLocation && (
          <div className="entry-date-col" style={dateColStyle}>
            {dlTop && (
              <div className={`${variant}-entry-date`} style={ENTRY_TEXT_STYLE[el.dateStyle]}>
                {dlTop}
              </div>
            )}
            {dlBottom && (
              <div className={`${variant}-entry-location`} style={ENTRY_TEXT_STYLE[el.locationStyle]}>
                {dlBottom}
              </div>
            )}
          </div>
        )}
      </div>
      {entry.description && (
        <ul className={bulletsClassName}>
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
}

export function SectionBody({ section, dateFormat, entryHeaderFontSize, entryLayout, variant = 'tpl', narrowColumn }) {
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
        {entries.map((entry) => (
          <EntryBlock
            key={entry.id}
            entry={entry}
            dateFormat={dateFormat}
            entryLayout={entryLayout}
            entryHeaderFontSize={entryHeaderFontSize}
            variant={variant}
            narrowColumn={narrowColumn}
          />
        ))}
      </>
    );
  }

  return null;
}