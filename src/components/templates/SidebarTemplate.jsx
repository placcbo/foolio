import { SectionBody, splitSections, getContactItems, HeaderBlock, SplitLayout, getFontSizes, getSpacing } from './shared';
import { DEFAULT_LAYOUT } from '../../state/resumeReducer';

export default function SidebarTemplate({ resume, accentColor }) {
  const { basics, sections, settings } = resume;
  const dateFormat = settings?.dateFormat;
  const layout = settings?.layout ?? DEFAULT_LAYOUT;
  const { basePt, nameFontSize, headingFontSize, entryHeaderFontSize } = getFontSizes(settings);
  const { lineHeight, spaceOffsetPx, marginLRpx, marginTBpx } = getSpacing(settings);
  const entryLayout = settings?.entryLayout;
  const { sidebarSections, mainSections } = splitSections(sections);
  const contactItems = getContactItems(basics);
  const paperVars = { fontSize: `${basePt}pt`, lineHeight, '--space-offset': `${spaceOffsetPx}px` };

  if (layout.columns === 'one') {
    return (
      <div className="paper" style={{ ...paperVars, padding: `${marginTBpx}px ${marginLRpx}px` }}>
        <HeaderBlock
          basics={basics}
          contactItems={contactItems}
          colored={false}
          accentColor={accentColor}
          avatarShape="square"
          nameFontSize={nameFontSize}
        />
        {[...sidebarSections, ...mainSections].map((s) => (
          <section className="tpl-main-section" key={s.id}>
            <h4 className="tpl-heading" style={{ fontSize: headingFontSize }}>{s.title}</h4>
            <SectionBody
              section={s}
              dateFormat={dateFormat}
              entryHeaderFontSize={entryHeaderFontSize}
              entryLayout={entryLayout}
            />
          </section>
        ))}
        {sections.length === 0 && (
          <p className="preview-empty">
            Click <strong>Add Content</strong> on the left to start building your resume.
          </p>
        )}
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
            colored={layout.columns === 'mix'}
            accentColor={accentColor}
            avatarShape="square"
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
        asideColored
        accentColor={accentColor}
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