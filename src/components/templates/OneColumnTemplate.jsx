import { getContactItems, splitSections, HeaderBlock, SplitLayout, getFontSizes, getSpacing, ContactItem, EntryBlock } from './shared';
import { DEFAULT_LAYOUT } from '../../state/resumeReducer';

function PreviewText({ section, headingFontSize }) {
  return (
    <section className="preview-section">
      <h3 style={{ fontSize: headingFontSize }}>{section.title}</h3>
      <p className={section.content ? '' : 'placeholder'}>
        {section.content || `Add your ${section.title.toLowerCase()}...`}
      </p>
    </section>
  );
}

function PreviewTags({ section, headingFontSize }) {
  return (
    <section className="preview-section">
      <h3 style={{ fontSize: headingFontSize }}>{section.title}</h3>
      {section.tags.length > 0 ? (
        <p className="preview-tags">{section.tags.join('  •  ')}</p>
      ) : (
        <p className="placeholder">Add your {section.title.toLowerCase()}...</p>
      )}
    </section>
  );
}

function PreviewEntries({ section, dateFormat, headingFontSize, entryHeaderFontSize, entryLayout }) {
  const entries = section.entries.filter(
    (e) => e.heading || e.subheading || e.description || e.location || e.start || e.end
  );

  return (
    <section className="preview-section">
      <h3 style={{ fontSize: headingFontSize }}>{section.title}</h3>
      {entries.length === 0 && (
        <p className="placeholder">Add your {section.title.toLowerCase()}...</p>
      )}
      {entries.map((entry) => (
        <EntryBlock
          key={entry.id}
          entry={entry}
          dateFormat={dateFormat}
          entryLayout={entryLayout}
          entryHeaderFontSize={entryHeaderFontSize}
          variant="preview"
        />
      ))}
    </section>
  );
}

export default function OneColumnTemplate({ resume }) {
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
      <div className="paper onecolumn-paper tpl-split-paper" style={paperVars}>
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
    <div
      className="paper onecolumn-paper"
      style={{ ...paperVars, padding: `${marginTBpx}px ${marginLRpx}px` }}
    >
      <header className="preview-header">
        {basics.photo && (
          <img className="preview-photo" src={basics.photo} alt={basics.name || 'Profile'} />
        )}
        <h1 style={{ fontSize: nameFontSize }}>{basics.name || 'Your name'}</h1>
        {basics.title && <p className="preview-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="preview-contact">
            {contactItems.map((item) => (
              <ContactItem key={item.key} item={item} iconSize={13} />
            ))}
          </div>
        )}
      </header>

      {sections.map((section) => {
        if (section.kind === 'text')
          return <PreviewText key={section.id} section={section} headingFontSize={headingFontSize} />;
        if (section.kind === 'tags')
          return <PreviewTags key={section.id} section={section} headingFontSize={headingFontSize} />;
        if (section.kind === 'entries')
          return (
            <PreviewEntries
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