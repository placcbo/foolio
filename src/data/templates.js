export const TEMPLATES = [
  {
    id: 'clean',
    name: 'Clean',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'professional'],
    swatches: ['#17151c', '#334155', '#0f766e', '#7c2d12'],
  },
  // more templates get added back one at a time after testing.
  // Keep the same shape when re-adding:
  // { id: 'onecolumn', name: 'Classic', layout: 'onecolumn', categories: ['one-column', 'ats'], swatches: [...] },
];

export const FILTERS = [
  { id: 'all', label: 'All Templates' },
  { id: 'simple', label: 'Simple' },
  { id: 'modern', label: 'Modern' },
  { id: 'one-column', label: 'One column' },
  { id: 'with-photo', label: 'With photo' },
  { id: 'professional', label: 'Professional' },
  { id: 'ats', label: 'ATS' },
];