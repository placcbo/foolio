import { IconMail, IconPhone, IconPin, IconLink, IconGlobe, IconFlag, IconCalendar, IconFileText, IconCheck, IconUser } from '../icons';
import { formatEntryDateRange } from '../../utils/dateFormat';
import { getFontFamily } from '../../data/fonts';
import { getSectionMeta } from '../../data/sectionTypes';
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_SPACING,
  DEFAULT_ENTRY_LAYOUT,
  DEFAULT_FONT,
  DEFAULT_HEADINGS,
  DEFAULT_HEADER,
  DEFAULT_PHOTO,
  DEFAULT_COLORS,
  DEFAULT_LINKS,
  DEFAULT_FOOTER,
} from '../../state/resumeReducer';

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

// contentEditable produces markup like "<p><br></p>" for an empty rich-text
// field, so a plain truthiness check on the HTML string isn't enough.
export function isHtmlEmpty(html) {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, '').trim().length === 0;
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

// Resolves the Font panel's body/name selection into concrete CSS
// font-family values. "Name Font" defaults to 'inherit', meaning it just
// follows the body font.
export function getFontFamilies(settings) {
  const font = settings?.font ?? DEFAULT_FONT;
  const bodyFontFamily = getFontFamily(font.body);
  const nameFontFamily = font.name === 'inherit' ? bodyFontFamily : getFontFamily(font.name);
  return { bodyFontFamily, nameFontFamily };
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

const LINK_FIELDS = new Set(['linkedin', 'website']);

function websiteHref(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

// Single source of truth for "what shows in the contact line" across every template.
// Anything added via the Add Details chips shows up here automatically.
// Email/phone/links get a real href so they're clickable and keyboard-focusable,
// not just styled text.
export function getContactItems(basics) {
  const items = [];
  if (basics.email) items.push({ key: 'email', Icon: IconMail, text: basics.email, href: `mailto:${basics.email.trim()}`, isLink: false });
  if (basics.phone) {
    items.push({
      key: 'phone',
      Icon: IconPhone,
      text: basics.phone,
      href: `tel:${basics.phone.replace(/[^\d+]/g, '')}`,
      isLink: false,
    });
  }
  if (basics.address) items.push({ key: 'address', Icon: IconPin, text: basics.address, isLink: false });
  (basics.visibleExtra || []).forEach((key) => {
    const value = basics[key];
    if (!value) return;
    const isLink = LINK_FIELDS.has(key);
    const href = isLink ? websiteHref(value.trim()) : undefined;
    items.push({ key, Icon: EXTRA_FIELD_ICONS[key] || IconFileText, text: value, href, isLink });
  });
  return items;
}

const ICON_WRAP_CLASS = {
  filled: 'contact-icon-wrap filled',
  muted: 'contact-icon-wrap muted',
  square: 'contact-icon-wrap square',
  outlineSquare: 'contact-icon-wrap outlineSquare',
  outline: 'contact-icon-wrap outline',
  outlineSquareAlt: 'contact-icon-wrap outlineSquareAlt',
  plain: 'contact-icon-wrap plain',
};

// Renders a contact line item as a real link when it has a target (email,
// phone, linkedin, website) and as plain text otherwise (address, DOB, etc.
// aren't meaningfully "clickable"). `showIcon`/`iconStyle` come from the
// Header panel; `showText`/`underline` come from the Links panel (only
// meaningful for actual link-type items).
export function ContactItem({ item, iconSize = 13, showIcon = true, iconStyle = 'filled', iconTint, showText = true, underline = false }) {
  const { Icon, text, href, isLink } = item;
  const hideText = isLink && !showText;
  const iconNode = showIcon ? (
    <span className={ICON_WRAP_CLASS[iconStyle] || ICON_WRAP_CLASS.filled} style={iconTint ? { '--icon-tint': iconTint } : undefined}>
      <Icon size={iconSize} />
    </span>
  ) : null;
  const content = (
    <>
      {iconNode}
      {!hideText && <span>{text}</span>}
    </>
  );
  const linkStyle = isLink && underline ? { textDecoration: 'underline' } : undefined;
  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={linkStyle}>
        {content}
      </a>
    );
  }
  return <span>{content}</span>;
}

// Arranges the contact items per the Header panel's Details Arrangement
// (stacked rows vs a single inline row) and Separator Style (icon / bullet /
// bar between items).
export function ContactRow({ items, header, colors, accentColor, onColoredBg, links, className = '', iconSize = 13 }) {
  if (!items.length) return null;
  const h = header ?? DEFAULT_HEADER;
  const c = colors ?? DEFAULT_COLORS;
  const lk = links ?? DEFAULT_LINKS;
  const arrangement = h.detailsArrangement ?? 'stacked';
  const separator = h.separatorStyle ?? 'icon';
  const showIcon = separator === 'icon' && lk.showIcons;

  function iconTintFor(item) {
    if (onColoredBg) return undefined;
    if (c.applyTo?.headerIcons) return accentColor;
    if (item.isLink && c.applyTo?.linkIcons) return accentColor;
    return undefined;
  }

  return (
    <div className={`contact-row contact-row-${arrangement} ${className}`}>
      {items.map((item, i) => (
        <span className="contact-row-item" key={item.key}>
          {i > 0 && arrangement === 'inline' && separator === 'bullet' && (
            <span className="contact-row-sep contact-row-sep-bullet" aria-hidden="true" />
          )}
          {i > 0 && arrangement === 'inline' && separator === 'bar' && (
            <span className="contact-row-sep contact-row-sep-bar" aria-hidden="true" />
          )}
          <ContactItem
            item={item}
            iconSize={iconSize}
            showIcon={showIcon}
            iconStyle={h.iconStyle}
            iconTint={iconTintFor(item)}
            showText={lk.showAsText}
            underline={lk.underline}
          />
        </span>
      ))}
    </div>
  );
}

const PHOTO_SIZE_PX = { xs: 56, s: 76, m: 96, l: 120, xl: 148 };

const PHOTO_SHAPE = {
  circle: { radius: '50%', aspect: 1 },
  roundedSquare: { radius: '18px', aspect: 1 },
  square: { radius: '0px', aspect: 1 },
  rectPortrait: { radius: '12px', aspect: 1.25 },
  rectTall: { radius: '8px', aspect: 1.6 },
};

export function Avatar({ photo, name, shape = 'circle', size = 96, grayscale = false, className = '' }) {
  const shapeDef = PHOTO_SHAPE[shape] || PHOTO_SHAPE.circle;
  const width = size;
  const height = Math.round(size * shapeDef.aspect);
  const style = { width, height, borderRadius: shapeDef.radius, filter: grayscale ? 'grayscale(1)' : undefined };
  if (photo) {
    return <img className={`tpl-avatar ${className}`} src={photo} alt={name || 'Profile'} style={style} />;
  }
  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
  return (
    <div className={`tpl-avatar tpl-avatar-placeholder ${className}`} style={style}>
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

// Identity block (photo/name/title/contact) shared by every template's flat
// and two-column/mix layouts, driven entirely by the Header, Photo, and
// Colors panels so behavior is identical everywhere the header appears.
export function HeaderBlock({
  basics,
  contactItems,
  colored,
  accentColor,
  nameFontSize,
  nameFontFamily,
  marginLRpx,
  marginTBpx,
  header,
  photo,
  colors,
  links,
  headerFill,
}) {
  const h = header ?? DEFAULT_HEADER;
  const ph = photo ?? DEFAULT_PHOTO;
  const c = colors ?? DEFAULT_COLORS;
  const onColoredBg = colored;

  const style = {};
  if (colored) style.background = headerFill || accentColor;
  if (marginLRpx != null) {
    style.paddingLeft = marginLRpx;
    style.paddingRight = marginLRpx;
  }
  if (marginTBpx != null) {
    style.paddingTop = marginTBpx;
    style.paddingBottom = marginTBpx;
  }

  const nameColor = c.applyTo?.name && !onColoredBg ? accentColor : undefined;
  const titleColor = c.applyTo?.jobTitle && !onColoredBg ? accentColor : undefined;

  const showPhoto = ph.show && Boolean(basics.photo);
  const sizePx = PHOTO_SIZE_PX[ph.size] ?? PHOTO_SIZE_PX.m;

  const photoEl = showPhoto ? (
    <Avatar photo={basics.photo} name={basics.name} shape={ph.shape} size={sizePx} grayscale={ph.grayscale} />
  ) : null;

  const textBlock = (
    <div className="tpl-header-block-text">
      <h1 style={{ fontSize: nameFontSize, fontFamily: nameFontFamily, color: nameColor }}>
        {basics.name || 'Your name'}
      </h1>
      {basics.title && (
        <p className="tpl-header-block-title" style={{ color: titleColor }}>
          {basics.title}
        </p>
      )}
    </div>
  );

  const identity =
    ph.position === 'below' ? (
      <>
        {textBlock}
        {photoEl}
      </>
    ) : (
      <>
        {photoEl}
        {textBlock}
      </>
    );

  return (
    <div
      className={`tpl-header-block tpl-header-align-${h.textAlign}${colored ? ' tpl-header-block-colored' : ''}`}
      style={style}
    >
      <div className="tpl-header-block-identity">{identity}</div>
      {contactItems.length > 0 && (
        <ContactRow
          items={contactItems}
          header={h}
          colors={c}
          accentColor={accentColor}
          onColoredBg={onColoredBg}
          links={links}
        />
      )}
    </div>
  );
}

const HEADING_ICON_STYLE = { outline: 'heading-icon-outline', filled: 'heading-icon-filled' };

// Section title, shared by every template. Style/Capitalization/Icons come
// from the Headings panel; color comes from the Colors panel's "Headings" +
// "Headings underline" toggles.
export function SectionHeading({ title, sectionType, fontSize, headings, colors, accentColor, onColoredBg }) {
  const hs = headings ?? DEFAULT_HEADINGS;
  const c = colors ?? DEFAULT_COLORS;
  const textColor = c.applyTo?.headings && !onColoredBg ? accentColor : undefined;
  const lineColor = c.applyTo?.headingsLine && !onColoredBg ? accentColor : undefined;
  const capClass = hs.capitalization === 'uppercase' ? 'heading-cap-upper' : 'heading-cap-capitalize';
  const meta = sectionType ? getSectionMeta(sectionType) : null;

  const style = { fontSize };
  if (textColor) style.color = textColor;
  if (lineColor) style['--heading-line-color'] = lineColor;

  return (
    <h4 className={`tpl-section-heading heading-style-${hs.style} ${capClass}`} style={style}>
      {hs.icons !== 'none' && meta && (
        <span className={HEADING_ICON_STYLE[hs.icons] || HEADING_ICON_STYLE.outline} aria-hidden="true">
          {meta.icon}
        </span>
      )}
      <span className="tpl-section-heading-text">{title}</span>
    </h4>
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
  headings,
  colors,
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
              <SectionHeading
                title={s.title}
                sectionType={s.type}
                fontSize={headingFontSize}
                headings={headings}
                colors={colors}
                accentColor={accentColor}
                onColoredBg={asideColored}
              />
              <SectionBody
                section={s}
                dateFormat={dateFormat}
                entryHeaderFontSize={entryHeaderFontSize}
                entryLayout={entryLayout}
                colors={colors}
                accentColor={accentColor}
                onColoredBg={asideColored}
              />
            </div>
          ))}
        </aside>
        <div className="tpl-split-col tpl-split-main" style={mainStyle}>
          {headerPosition === 'right' && headerContent}
          {mainSections.map((s) => (
            <section className="tpl-main-section" key={s.id}>
              <SectionHeading
                title={s.title}
                sectionType={s.type}
                fontSize={headingFontSize}
                headings={headings}
                colors={colors}
                accentColor={accentColor}
              />
              <SectionBody
                section={s}
                dateFormat={dateFormat}
                entryHeaderFontSize={entryHeaderFontSize}
                entryLayout={entryLayout}
                narrowColumn={narrowColumn}
                colors={colors}
                accentColor={accentColor}
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
export function EntryBlock({
  entry,
  dateFormat,
  entryLayout,
  entryHeaderFontSize,
  variant = 'tpl',
  narrowColumn,
  colors,
  accentColor,
  onColoredBg,
}) {
  const el = entryLayout ?? DEFAULT_ENTRY_LAYOUT;
  const c = colors ?? DEFAULT_COLORS;
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

  const dateColor = c.applyTo?.dates && !onColoredBg ? accentColor : undefined;
  const subtitleColor = c.applyTo?.entrySubtitle && !onColoredBg ? accentColor : undefined;

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
    c.applyTo?.dotsBarsBubbles && !onColoredBg && 'entry-bullets-accent-marker',
    el.indentBody && 'entry-bullets-indent',
  ]
    .filter(Boolean)
    .join(' ');

  const markerStyle = c.applyTo?.dotsBarsBubbles && !onColoredBg ? { '--marker-accent': accentColor } : undefined;

  return (
    <div className={`${variant}-entry`}>
      <div className={`entry-row${sideBySide ? ' entry-row-split' : ' entry-row-stack'}`}>
        <div className="entry-title-col" style={titleStyle}>
          <div className={`${variant}-entry-heading`} style={{ fontSize: entryHeaderFontSize }}>
            {entry.heading}
            {el.subtitlePlacement === 'sameLine' && entry.subheading && (
              <span
                className={`${variant}-entry-subtitle-inline`}
                style={{ ...ENTRY_TEXT_STYLE[el.subtitleStyle], color: subtitleColor }}
              >
                {`, ${entry.subheading}`}
              </span>
            )}
          </div>
          {el.subtitlePlacement === 'belowTitle' && entry.subheading && (
            <div
              className={`${variant}-entry-subtitle`}
              style={{ ...ENTRY_TEXT_STYLE[el.subtitleStyle], color: subtitleColor }}
            >
              {entry.link ? (
                <a href={/^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`} target="_blank" rel="noopener noreferrer">
                  {entry.subheading}
                </a>
              ) : (
                entry.subheading
              )}
            </div>
          )}
        </div>
        {hasDateLocation && (
          <div className="entry-date-col" style={dateColStyle}>
            {dlTop && (
              <div className={`${variant}-entry-date`} style={{ ...ENTRY_TEXT_STYLE[el.dateStyle], color: dateColor }}>
                {dlTop}
              </div>
            )}
            {dlBottom && (
              <div className={`${variant}-entry-location`} style={{ ...ENTRY_TEXT_STYLE[el.locationStyle], color: dateColor }}>
                {dlBottom}
              </div>
            )}
          </div>
        )}
      </div>
      {!isHtmlEmpty(entry.description) && (
        <div className={bulletsClassName} style={markerStyle} dangerouslySetInnerHTML={{ __html: entry.description }} />
      )}
    </div>
  );
}

export function SectionBody({
  section,
  dateFormat,
  entryHeaderFontSize,
  entryLayout,
  variant = 'tpl',
  narrowColumn,
  colors,
  accentColor,
  onColoredBg,
}) {
  const c = colors ?? DEFAULT_COLORS;
  const markerStyle = c.applyTo?.dotsBarsBubbles && !onColoredBg ? { '--dot-accent': accentColor } : undefined;

  if (section.kind === 'text') {
    return isHtmlEmpty(section.content) ? null : (
      <div className="tpl-text" dangerouslySetInnerHTML={{ __html: section.content }} />
    );
  }

  if (section.kind === 'tags') {
    if (!section.tags.length) return null;
    const dotted = c.applyTo?.dotsBarsBubbles && !onColoredBg;
    return (
      <ul className={`tpl-taglist${dotted ? ' tpl-taglist-dotted' : ''}`} style={markerStyle}>
        {section.tags.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    );
  }

  if (section.kind === 'entries') {
    const entries = section.entries.filter(
      (e) =>
        !e.hidden &&
        (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
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
            colors={colors}
            accentColor={accentColor}
            onColoredBg={onColoredBg}
          />
        ))}
      </>
    );
  }

  return null;
}

// The live preview isn't paginated, so this renders once at the bottom of
// the paper as a stand-in for what would repeat on every printed page.
export function ResumeFooter({ footer, basics }) {
  const f = footer ?? DEFAULT_FOOTER;
  if (!f.pageNumbers && !f.email && !f.name) return null;
  const parts = [];
  if (f.name && basics.name) parts.push(basics.name);
  if (f.email && basics.email) parts.push(basics.email);

  return (
    <div className="tpl-footer">
      <span>{parts.join('  •  ')}</span>
      {f.pageNumbers && <span className="tpl-footer-page">1</span>}
    </div>
  );
}

export { DEFAULT_LINKS };
