import { getContactItems, splitSections, HeaderBlock, SplitLayout, getFontSizes, getSpacing, ContactItem, EntryBlock } from './shared';
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

function CleanEntries({ section, dateFormat, headingFontSize, entryHeaderFontSize, entryLayout }) {
  const entries = section.entries.filter(
    (e) => e.heading || e.subheading || e.description || e.location || e.start || e.end
  );

  return (
    <section className="clean-section">
      <CleanHeading fontSize={headingFontSize}>{section.title}</CleanHeading>
      {entries.length === 0 && (
        <p className="clean-text placeholder">Add your {section.title.toLowerCase()}...</p>
      )}
      {entries.map((entry) => (
        <EntryBlock
          key={entry.id}
          entry={entry}
          dateFormat={dateFormat}
          entryLayout={entryLayout}
          entryHeaderFontSize={entryHeaderFontSize}
          variant="clean"
        />
      ))}
    </section>
  );
}

export default function CleanTemplate({ resume }) {
  const { basics, sections, settings, accentColor } = resume;
  const dateFormat = settings?.dateFormat;
  const layout = settings?.layout ?? DEFAULT_LAYOUT;
  const { basePt, nameFontSize, headingFontSize, entryHeaderFontSize } = getFontSizes(settings);
  const { lineHeight, spaceOffsetPx, marginLRpx, marginTBpx } = getSpacing(settings);
  const entryLayout = settings?.entryLayout;
  const contactItems = getContactItems(basics);
  const paperVars = { fontSize: `${basePt}pt`, lineHeight, '--space-offset': `${spaceOffsetPx}px` };

  if (layout.columns !== 'one') {
    const { sidebarSections, mainSections } = splitSections(sections);
    return (
      <div className="paper clean-paper tpl-split-paper" style={paperVars}>
        <SplitLayout
          headerContent={
            <HeaderBlock
              basics={basics}
              contactItems={contactItems}
              colored={layout.columns === 'mix'}
              accentColor={accentColor}
              nameFontSize={nameFontSize}
              marginLRpx={marginLRpx}
              marginTBpx={marginTBpx}
            />
          }
          headerPosition={layout.headerPosition}
          columnWidth={layout.columnWidth}
          sidebarSections={sidebarSections}
          mainSections={mainSections}
          dateFormat={dateFormat}
          headingFontSize={headingFontSize}
          entryHeaderFontSize={entryHeaderFontSize}
          entryLayout={entryLayout}
          marginLRpx={marginLRpx}
          marginTBpx={marginTBpx}
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
    <div className="paper clean-paper" style={{ ...paperVars, padding: `${marginTBpx}px ${marginLRpx}px` }}>
      <header className="clean-header">
        <h1 className="clean-name" style={{ fontSize: nameFontSize }}>{basics.name || 'Your name'}</h1>
        {basics.title && <p className="clean-role">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="clean-contact">
            {contactItems.map((item) => (
              <ContactItem key={item.key} item={item} iconSize={13} />
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
              entryLayout={entryLayout}
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