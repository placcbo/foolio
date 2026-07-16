// Shared by every place that needs to show what a template preset actually
// looks like (the picker cards, the Customize > Templates thumbnails, and
// the Browse templates modal) — mirrors the merge SET_TEMPLATE performs in
// resumeReducer.js so previews match what clicking "Use this template"
// would really produce.
//
// `baseLayout` is the layout this template normally starts from (usually
// TEMPLATE_DEFAULT_LAYOUT[templateId]); `preset.layout` can override pieces
// of it, which is how templates that share a layout component (e.g.
// "onecolumn") can still default to different column arrangements.
export function applyPresetToSettings(baseSettings, preset, baseLayout) {
  const layout = preset?.layout
    ? { ...(baseLayout || baseSettings.layout), ...preset.layout }
    : baseLayout || baseSettings.layout;

  if (!preset) return { ...baseSettings, layout };

  return {
    ...baseSettings,
    layout,
    ...(preset.font && { font: { ...baseSettings.font, ...preset.font } }),
    ...(preset.headings && { headings: { ...baseSettings.headings, ...preset.headings } }),
    ...(preset.header && { header: { ...baseSettings.header, ...preset.header } }),
    ...(preset.spacing && { spacing: { ...baseSettings.spacing, ...preset.spacing } }),
    ...(preset.entryLayout && { entryLayout: { ...baseSettings.entryLayout, ...preset.entryLayout } }),
    ...(preset.photo && { photo: { ...baseSettings.photo, ...preset.photo } }),
    ...(preset.colors && {
      colors: {
        ...baseSettings.colors,
        ...preset.colors,
        applyTo: { ...baseSettings.colors.applyTo, ...preset.colors?.applyTo },
      },
    }),
  };
}
