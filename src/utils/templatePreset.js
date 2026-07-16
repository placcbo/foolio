// Shared by every place that needs to show what a template preset actually
// looks like (the picker cards, the Customize > Templates thumbnails, and
// the Browse templates modal) — mirrors the merge SET_TEMPLATE performs in
// resumeReducer.js so previews match what clicking "Use this template"
// would really produce.
export function applyPresetToSettings(baseSettings, preset) {
  if (!preset) return baseSettings;
  return {
    ...baseSettings,
    ...(preset.font && { font: { ...baseSettings.font, ...preset.font } }),
    ...(preset.headings && { headings: { ...baseSettings.headings, ...preset.headings } }),
    ...(preset.header && { header: { ...baseSettings.header, ...preset.header } }),
    ...(preset.spacing && { spacing: { ...baseSettings.spacing, ...preset.spacing } }),
    ...(preset.entryLayout && { entryLayout: { ...baseSettings.entryLayout, ...preset.entryLayout } }),
    ...(preset.colors && {
      colors: {
        ...baseSettings.colors,
        ...preset.colors,
        applyTo: { ...baseSettings.colors.applyTo, ...preset.colors?.applyTo },
      },
    }),
  };
}
