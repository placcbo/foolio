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
  {
    id: 'classic',
    name: 'Classic',
    layout: 'classic',
    supportsPhoto: false,
    categories: ['simple'],
    swatches: ['#1f3a5f', '#000000', '#7b2d43', '#2f5d44', '#3f4b54', '#b3541e'],
  },
  {
    id: 'slate',
    name: 'Slate',
    layout: 'slate',
    supportsPhoto: false,
    categories: ['creative', 'professional'],
    swatches: ['#3aa7a3', '#e4570f', '#5a8fd6', '#c2a24b', '#c96a8a', '#8a8f98'],
  },
  {
    id: 'bloom',
    name: 'Bloom',
    layout: 'bloom',
    supportsPhoto: false,
    categories: ['creative', 'modern'],
    swatches: ['#c85a54', '#3aa7a3', '#5a8fd6', '#7b5cb8', '#2f5d44', '#1f3a5f'],
  },
  {
    id: 'portrait',
    name: 'Portrait',
    layout: 'portrait',
    supportsPhoto: true,
    categories: ['professional', 'popular'],
    swatches: ['#2b4a6f', '#1a5c50', '#7b2d43', '#3aa7a3', '#c85a54', '#000000'],
  },
  {
    id: 'meridian',
    name: 'Meridian',
    layout: 'meridian',
    supportsPhoto: false,
    categories: ['modern', 'executive'],
    swatches: ['#d43d2a', '#000000', '#5b4bb5', '#1a5c50', '#1f3a5f', '#8a6d1f'],
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