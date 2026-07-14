import { getContactItems, splitSections, HeaderBlock, SplitLayout, getFontSizes } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';
import { DEFAULT_LAYOUT } from '../../state/resumeReducer';

function CleanHeading({ children, fontSize }) {
  return <h4 className="clean-heading" style={{ fontSize }}>{children}</h4>;
}

function CleanText({ section, headingFontSize }) {
  return (
    <section className="clean-section">
      <CleanHeading fontSize={headingFontSize}>{section.title}</CleanHeading>
      <p className={section.content ? 'clean-text' : 'clean-text placeholder'}>
        {section.content || `Add your ${section.title.toLowerCase()}...`}
      </p>
    </section>
  );
}

function CleanTagsGrid({ section, headingFontSize }) {
  return (
    <section className="clean-section">
      <CleanHeading fontSize={headingFontSize}>{section.title}</CleanHeading>
      {section.tags.length > 0 ? (
        <ul className="clean-tags-grid">
          {section.tags.map((tag, i) => (
            <li key={i}>{tag}</li>
          ))}
        </ul>
      ) : (
        <p className="clean-text placeholder">Add your {section.title.toLowerCase()}...</p>
      )}
    </section>
  );
}

function CleanEntries({ section, dateFormat, headingFontSize, entryHeaderFontSize }) {
  const entries = section.entries.filter(
    (e) => e.heading || e.subheading || e.description || e.location || e.start || e.end
  );

  return (
    <section className="clean-section">
      <CleanHeading fontSize={headingFontSize}>{section.title}</CleanHeading>
      {entries.length === 0 && (
        <p className="clean-text placeholder">Add your {section.title.toLowerCase()}...</p>
      )}
      {entries.map((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        return (
        <div className="clean-entry" key={entry.id}>
          <div className="clean-entry-top">
            <span className="clean-entry-heading" style={{ fontSize: entryHeaderFontSize }}>
              {entry.heading}
            </span>
            <span className="clean-entry-date">
              {[start, end].filter(Boolean).join(' – ')}
            </span>
          </div>
          <div className="clean-entry-sub">
            <span>{entry.subheading}</span>
            <span>{entry.location}</span>
          </div>
          {entry.description && (
            <ul className="clean-entry-bullets">
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
    </section>
  );
}

export default function CleanTemplate({ resume }) {
  const { basics, sections, settings, accentColor } = resume;
  const dateFormat = settings?.dateFormat;
  const layout = settings?.layout ?? DEFAULT_LAYOUT;
  const { basePt, nameFontSize, headingFontSize, entryHeaderFontSize } = getFontSizes(settings);
  const contactItems = getContactItems(basics);

  if (layout.columns !== 'one') {
    const { sidebarSections, mainSections } = splitSections(sections);
    return (
      <div className="paper clean-paper" style={{ fontSize: `${basePt}pt` }}>
        <SplitLayout
          headerContent={
            <HeaderBlock
              basics={basics}
              contactItems={contactItems}
              colored={layout.columns === 'mix'}
              accentColor={accentColor}
              nameFontSize={nameFontSize}
            />
          }
          headerPosition={layout.headerPosition}
          columnWidth={layout.columnWidth}
          sidebarSections={sidebarSections}
          mainSections={mainSections}
          dateFormat={dateFormat}
          headingFontSize={headingFontSize}
          entryHeaderFontSize={entryHeaderFontSize}
        />
        {sections.length === 0 && (
          <p className="preview-empty">
            Click <strong>Add Content</strong> on the left to start building your resume.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="paper clean-paper" style={{ fontSize: `${basePt}pt` }}>
      <header className="clean-header">
        <h1 className="clean-name" style={{ fontSize: nameFontSize }}>{basics.name || 'Your name'}</h1>
        {basics.title && <p className="clean-role">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="clean-contact">
            {contactItems.map(({ key, Icon, text }) => (
              <span key={key}>
                <Icon size={13} /> {text}
              </span>
            ))}
          </div>
        )}
      </header>

      {sections.map((section) => {
        if (section.kind === 'text')
          return <CleanText key={section.id} section={section} headingFontSize={headingFontSize} />;
        if (section.kind === 'tags')
          return <CleanTagsGrid key={section.id} section={section} headingFontSize={headingFontSize} />;
        if (section.kind === 'entries')
          return (
            <CleanEntries
              key={section.id}
              section={section}
              dateFormat={dateFormat}
              headingFontSize={headingFontSize}
              entryHeaderFontSize={entryHeaderFontSize}
            />
          );
        return null;
      })}

      {sections.length === 0 && (
        <p className="preview-empty">
          Click <strong>Add Content</strong> on the left to start building your resume.
        </p>
      )}
    </div>
  );
}