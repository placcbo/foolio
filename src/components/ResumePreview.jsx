import { TEMPLATE_COMPONENTS } from './templates';

export default function ResumePreview({ resume }) {
  const Template = TEMPLATE_COMPONENTS[resume.templateId] || TEMPLATE_COMPONENTS.onecolumn;

  return (
    <div className="preview-panel">
      <Template resume={resume} accentColor={resume.accentColor} />
    </div>
  );
}
