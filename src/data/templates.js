// Each template is a curated "look" — layout + accent color + font +
// heading style + header arrangement — not just a layout choice. Several
// templates can (and do) share the same layout component with a completely
// different preset on top; `layout` must always be a key in
// TEMPLATE_COMPONENTS (components/templates/index.js), while `id` only needs
// to be unique within this list.
export const TEMPLATES = [
  {
    id: 'simple',
    name: 'Simple',
    layout: 'simple',
    supportsPhoto: false,
    categories: ['simple', 'popular'],
    swatches: ['#e4570f', '#d9622b', '#000000', '#3f4b54', '#2a8fbd', '#c23b83'],
  },
];

export const FILTERS = [
  { id: 'all', label: 'All Templates' },
  { id: 'popular', label: 'Popular' },
  { id: 'simple', label: 'Simple' },
  { id: 'modern', label: 'Modern' },
  { id: 'creative', label: 'Creative' },
  { id: 'professional', label: 'Professional' },
  { id: 'executive', label: 'Executive' },
];

// Whether the given template has anywhere to show a profile photo. Templates
// not in the registry (the older layouts) all render photos, so they default
// to true. Used to hide the photo-upload control when it would be a dead
// end — collecting a photo the active design can never display.
export function templateSupportsPhoto(templateId) {
  const t = TEMPLATES.find((tpl) => tpl.id === templateId);
  return t ? t.supportsPhoto !== false : true;
}