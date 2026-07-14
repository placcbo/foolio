import { SectionBody, splitSections, getContactItems, HeaderBlock, SplitLayout, getFontSizes } from './shared';
import { DEFAULT_LAYOUT } from '../../state/resumeReducer';

export default function BannerTemplate({ resume, accentColor }) {
  const { basics, sections, settings } = resume;
  const dateFormat = settings?.dateFormat;
  const layout = settings?.layout ?? DEFAULT_LAYOUT;
  const { basePt, nameFontSize, headingFontSize, entryHeaderFontSize } = getFontSizes(settings);
  const { sidebarSections, mainSections } = splitSections(sections);
  const contactItems = getContactItems(basics);

  if (layout.columns === 'one') {
    return (
      <div className="paper" style={{ fontSize: `${basePt}pt` }}>
        <HeaderBlock
          basics={basics}
          contactItems={contactItems}
          colored
          accentColor={accentColor}
          avatarShape="rounded"
          nameFontSize={nameFontSize}
        />
        {[...sidebarSections, ...mainSections].map((s) => (
          <section className="tpl-main-section" key={s.id}>
            <h4 className="tpl-heading" style={{ fontSize: headingFontSize }}>{s.title}</h4>
            <SectionBody section={s} dateFormat={dateFormat} entryHeaderFontSize={entryHeaderFontSize} />
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
    <div className="paper banner-paper tpl-split-paper" style={{ fontSize: `${basePt}pt` }}>
      <SplitLayout
        headerContent={
          <HeaderBlock
            basics={basics}
            contactItems={contactItems}
            colored={layout.columns === 'mix'}
            accentColor={accentColor}
            avatarShape="rounded"
            nameFontSize={nameFontSize}
          />
        }
        headerPosition={layout.headerPosition}
        columnWidth={layout.columnWidth}
        sidebarSections={sidebarSections}
        mainSections={mainSections}
        dateFormat={dateFormat}
        accentColor={accentColor}
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