export const TEMPLATES = [
  {
    id: 'clean',
    name: 'Clean',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'professional'],
    swatches: ['#000000', '#334155', '#0f766e', '#7c2d12'],
  },
  // more templates get added back one at a time after testing.
  // Keep the same shape when re-adding:
  // { id: 'onecolumn', name: 'Classic', layout: 'onecolumn', categories: ['one-column', 'ats'], swatches: [...] },
];

export const FILTERS = [
  { id: 'all', label: 'All Templates' },
  { id: 'popular', label: 'Popular' },
  { id: 'simple', label: 'Simple' },
  { id: 'modern', label: 'Modern' },
  { id: 'creative', label: 'Creative' },
];