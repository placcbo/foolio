import {
  getContactItems,
  splitSections,
  HeaderBlock,
  SplitLayout,
  SectionBody,
  SectionHeading,
  ResumeFooter,
  isHtmlEmpty,
  getFontSizes,
  getSpacing,
  getFontFamilies,
} from './shared';
import { getColorDecoration } from '../../utils/colorUtils';
import { DEFAULT_LAYOUT } from '../../state/resumeReducer';

export default function OneColumnTemplate({ resume }) {
  const { basics, sections, settings, accentColor } = resume;
  const dateFormat = settings?.dateFormat;
  const layout = settings?.layout ?? DEFAULT_LAYOUT;
  const { basePt, nameFontSize, headingFontSize, entryHeaderFontSize } = getFontSizes(settings);
  const { lineHeight, spaceOffsetPx, marginLRpx, marginTBpx } = getSpacing(settings);
  const { bodyFontFamily, nameFontFamily } = getFontFamilies(settings);
  const entryLayout = settings?.entryLayout;
  const headings = settings?.headings;
  const header = settings?.header;
  const photo = settings?.photo;
  const colors = settings?.colors;
  const links = settings?.links;
  const contactItems = getContactItems(basics);
  const visibleSections = sections.filter((s) => !s.hidden);
  const { paperStyle, headerColored, headerFill } = getColorDecoration(colors, accentColor);
  const paperVars = {
    fontSize: `${basePt}pt`,
    lineHeight,
    fontFamily: bodyFontFamily,
    '--space-offset': `${spaceOffsetPx}px`,
    ...paperStyle,
  };

  const headerBlock = (
    <HeaderBlock
      basics={basics}
      contactItems={contactItems}
      colored={layout.columns === 'mix' || headerColored}
      accentColor={accentColor}
      nameFontSize={nameFontSize}
      nameFontFamily={nameFontFamily}
      header={header}
      photo={photo}
      colors={colors}
      links={links}
      headerFill={headerFill}
      marginLRpx={layout.columns !== 'one' ? marginLRpx : undefined}
      marginTBpx={layout.columns !== 'one' ? marginTBpx : undefined}
    />
  );

  if (layout.columns !== 'one') {
    const { sidebarSections, mainSections } = splitSections(visibleSections);
    return (
      <div className="paper onecolumn-paper tpl-split-paper" style={paperVars}>
        <SplitLayout
          headerContent={headerBlock}
          headerPosition={layout.headerPosition}
          columnWidth={layout.columnWidth}
          sidebarSections={sidebarSections}
          mainSections={mainSections}
          dateFormat={dateFormat}
          headingFontSize={headingFontSize}
          entryHeaderFontSize={entryHeaderFontSize}
          entryLayout={entryLayout}
          headings={headings}
          colors={colors}
          accentColor={accentColor}
          marginLRpx={marginLRpx}
          marginTBpx={marginTBpx}
        />
        {sections.length === 0 && (
          <p className="preview-empty">
            Click <strong>Add Content</strong> on the left to start building your resume.
          </p>
        )}
        <ResumeFooter footer={settings?.footer} basics={basics} />
      </div>
    );
  }

  return (
    <div
      className={`paper onecolumn-paper${headerColored ? ' tpl-flat-header-colored' : ''}`}
      style={{ ...paperVars, padding: `${marginTBpx}px ${marginLRpx}px` }}
    >
      {headerBlock}

      {visibleSections.map((section) => (
        <section className="tpl-main-section" key={section.id}>
          <SectionHeading
            title={section.title}
            sectionType={section.type}
            fontSize={headingFontSize}
            headings={headings}
            colors={colors}
            accentColor={accentColor}
          />
          <SectionBody
            section={section}
            dateFormat={dateFormat}
            entryHeaderFontSize={entryHeaderFontSize}
            entryLayout={entryLayout}
            colors={colors}
            accentColor={accentColor}
          />
          {section.kind === 'text' && isHtmlEmpty(section.content) && (
            <p className="placeholder">Add your {section.title.toLowerCase()}...</p>
          )}
          {section.kind === 'tags' && section.tags.length === 0 && (
            <p className="placeholder">Add your {section.title.toLowerCase()}...</p>
          )}
          {section.kind === 'entries' &&
            section.entries.filter(
              (e) => !e.hidden && (e.heading || e.subheading || e.description || e.location || e.start || e.end)
            ).length === 0 && <p className="placeholder">Add your {section.title.toLowerCase()}...</p>}
        </section>
      ))}

      {sections.length === 0 && (
        <p className="preview-empty">
          Click <strong>Add Content</strong> on the left to start building your resume.
        </p>
      )}
      <ResumeFooter footer={settings?.footer} basics={basics} />
    </div>
  );
}
