import {
  SectionBody,
  SectionHeading,
  ResumeFooter,
  splitSections,
  getContactItems,
  HeaderBlock,
  SplitLayout,
  getFontSizes,
  getSpacing,
  getFontFamilies,
} from './shared';
import { getColorDecoration } from '../../utils/colorUtils';
import { DEFAULT_LAYOUT } from '../../state/resumeReducer';

export default function SidebarTemplate({ resume }) {
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
  const visibleSections = sections.filter((s) => !s.hidden);
  const { sidebarSections, mainSections } = splitSections(visibleSections);
  const contactItems = getContactItems(basics);
  const { paperStyle, headerColored, headerFill } = getColorDecoration(colors, accentColor);
  const paperVars = {
    fontSize: `${basePt}pt`,
    lineHeight,
    fontFamily: bodyFontFamily,
    '--space-offset': `${spaceOffsetPx}px`,
    ...paperStyle,
  };
  // The aside is a narrow (~30%) column — the user's configured name size
  // (tuned for a full-width header) easily overflows it and forces an ugly
  // mid-word wrap, so cap it down when the header actually lands there.
  const asideNameFontSize =
    layout.headerPosition === 'left' ? `${Math.min(parseFloat(nameFontSize), 14)}pt` : nameFontSize;

  if (layout.columns === 'one') {
    return (
      <div
        className={`paper${headerColored ? ' tpl-flat-header-colored' : ''}`}
        style={{ ...paperVars, padding: `${marginTBpx}px ${marginLRpx}px` }}
      >
        <HeaderBlock
          basics={basics}
          contactItems={contactItems}
          colored={headerColored}
          accentColor={accentColor}
          nameFontSize={nameFontSize}
          nameFontFamily={nameFontFamily}
          header={header}
          photo={photo}
          colors={colors}
          links={links}
          headerFill={headerFill}
        />
        {[...sidebarSections, ...mainSections].map((s) => (
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
              colors={colors}
              accentColor={accentColor}
            />
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

  return (
    <div className="paper sidebar-paper tpl-split-paper" style={paperVars}>
      <SplitLayout
        headerContent={
          <HeaderBlock
            basics={basics}
            contactItems={contactItems}
            // The aside is always accent-filled here (`asideColored` below is
            // unconditional, unlike OneColumnTemplate's split branch), so the
            // header needs light/contrast-aware text whenever it actually
            // lands in that aside — i.e. headerPosition 'left'. 'right' puts
            // it in the plain white main column instead, and 'top' renders
            // it outside the split entirely, so neither should be colored.
            colored={layout.headerPosition === 'left' || headerColored}
            accentColor={accentColor}
            nameFontSize={asideNameFontSize}
            nameFontFamily={nameFontFamily}
            header={header}
            photo={photo}
            colors={colors}
            links={links}
            headerFill={headerFill}
            marginLRpx={layout.headerPosition === 'top' ? marginLRpx : undefined}
            marginTBpx={layout.headerPosition === 'top' ? marginTBpx : undefined}
          />
        }
        headerPosition={layout.headerPosition}
        columnWidth={layout.columnWidth}
        sidebarSections={sidebarSections}
        mainSections={mainSections}
        dateFormat={dateFormat}
        asideColored
        accentColor={accentColor}
        headingFontSize={headingFontSize}
        entryHeaderFontSize={entryHeaderFontSize}
        entryLayout={entryLayout}
        headings={headings}
        colors={colors}
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
