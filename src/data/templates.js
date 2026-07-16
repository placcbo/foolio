// Each template is a curated "look" — layout + accent color + font +
// heading style + header arrangement — not just a layout choice. Several
// templates can (and do) share the same layout component with a completely
// different preset on top; `layout` must always be a key in
// TEMPLATE_COMPONENTS (components/templates/index.js), while `id` only needs
// to be unique within this list.
export const TEMPLATES = [
  {
    id: 'clean',
    name: 'Clean',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'professional', 'popular'],
    swatches: ['#000000', '#334155', '#0f766e', '#7c2d12'],
    preset: {
      font: { body: 'lora' },
      headings: { style: 'lineBelow', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'inline', iconStyle: 'plain' },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats'],
    swatches: ['#000000', '#3f4b54', '#2a8fbd', '#5c2340'],
    preset: {
      font: { body: 'alegreya' },
      headings: { style: 'lineBelow', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'inline', iconStyle: 'plain' },
    },
  },
  {
    id: 'classic',
    name: 'Classic',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'professional'],
    swatches: ['#1c4966', '#000000', '#3d2a6b', '#5c2340'],
    preset: {
      font: { body: 'lora' },
      headings: { style: 'accentBar', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'stacked', iconStyle: 'filled' },
    },
  },
  {
    id: 'executive',
    name: 'Executive',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats', 'professional', 'popular'],
    swatches: ['#000000', '#1c4966', '#3f4b54', '#5c2340'],
    preset: {
      font: { body: 'merriweather' },
      headings: { style: 'underlineShort', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'left', detailsArrangement: 'inline', iconStyle: 'muted' },
    },
  },
  {
    id: 'scholar',
    name: 'Scholar',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'professional'],
    swatches: ['#3d2a6b', '#000000', '#5c2340', '#1c4966'],
    preset: {
      font: { body: 'playfair' },
      headings: { style: 'boxed', capitalization: 'capitalize', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'stacked', iconStyle: 'plain' },
    },
  },
  {
    id: 'clarity',
    name: 'Clarity',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats', 'modern'],
    swatches: ['#2a8fbd', '#000000', '#3f6f6b', '#4fa3e0'],
    preset: {
      font: { body: 'inter' },
      headings: { style: 'plain', capitalization: 'capitalize', icons: 'none' },
      header: { textAlign: 'left', detailsArrangement: 'inline', iconStyle: 'outline' },
    },
  },
  {
    id: 'precision',
    name: 'Precision',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'modern'],
    swatches: ['#000000', '#3f4b54', '#2f6fb0', '#1c4966'],
    preset: {
      font: { body: 'roboto' },
      headings: { style: 'compact', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'left', detailsArrangement: 'inline', iconStyle: 'square' },
    },
  },
  {
    id: 'foundation',
    name: 'Foundation',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats'],
    swatches: ['#3f6f6b', '#000000', '#2a8fbd', '#5c2340'],
    preset: {
      font: { body: 'opensans' },
      headings: { style: 'lineBelow', capitalization: 'capitalize', icons: 'none' },
      header: { textAlign: 'left', detailsArrangement: 'stacked', iconStyle: 'plain' },
    },
  },
  {
    id: 'horizon',
    name: 'Horizon',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'modern'],
    swatches: ['#4fa3e0', '#000000', '#2f6fb0', '#93b0bb'],
    preset: {
      font: { body: 'montserrat' },
      headings: { style: 'accentBar', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'inline', iconStyle: 'outlineSquare' },
    },
  },
  {
    id: 'meridian',
    name: 'Meridian',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats', 'professional'],
    swatches: ['#1c4966', '#3d2a6b', '#000000', '#c23b83'],
    preset: {
      font: { body: 'lora' },
      headings: { style: 'underlineDotted', capitalization: 'capitalize', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'inline', iconStyle: 'plain' },
    },
  },
  {
    id: 'ledger',
    name: 'Ledger',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats'],
    swatches: ['#000000', '#3f4b54', '#5c2340', '#7fa5c9'],
    preset: {
      font: { body: 'alegreya' },
      headings: { style: 'boldOnly', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'left', detailsArrangement: 'inline', iconStyle: 'muted' },
    },
  },
  {
    id: 'compass',
    name: 'Compass',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats', 'professional'],
    swatches: ['#2f6fb0', '#000000', '#1c4966', '#3f6f6b'],
    preset: {
      font: { body: 'merriweather' },
      headings: { style: 'boxed', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'stacked', iconStyle: 'outline' },
    },
  },
  {
    id: 'summit',
    name: 'Summit',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'professional'],
    swatches: ['#000000', '#5c2340', '#3d2a6b', '#b97a8b'],
    preset: {
      font: { body: 'playfair' },
      headings: { style: 'lineBelow', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'inline', iconStyle: 'plain' },
    },
  },
  {
    id: 'anchor',
    name: 'Anchor',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats'],
    swatches: ['#1c4966', '#000000', '#3f4b54', '#2a8fbd'],
    preset: {
      font: { body: 'roboto' },
      headings: { style: 'plain', capitalization: 'capitalize', icons: 'none' },
      header: { textAlign: 'left', detailsArrangement: 'inline', iconStyle: 'square' },
    },
  },
  {
    id: 'bloom',
    name: 'Bloom',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'modern'],
    swatches: ['#c23b83', '#000000', '#b97a8b', '#e8615f'],
    preset: {
      font: { body: 'opensans' },
      headings: { style: 'underlineShort', capitalization: 'capitalize', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'inline', iconStyle: 'outlineSquareAlt' },
    },
  },
  {
    id: 'nordic',
    name: 'Nordic',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats', 'modern'],
    swatches: ['#93b0bb', '#000000', '#3f4b54', '#2a8fbd'],
    preset: {
      font: { body: 'inter' },
      headings: { style: 'compact', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'left', detailsArrangement: 'stacked', iconStyle: 'plain' },
    },
  },
  {
    id: 'aster',
    name: 'Aster',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats'],
    swatches: ['#3d2a6b', '#000000', '#c23b83', '#5c2340'],
    preset: {
      font: { body: 'montserrat' },
      headings: { style: 'boxed', capitalization: 'capitalize', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'inline', iconStyle: 'muted' },
    },
  },
  {
    id: 'birch',
    name: 'Birch',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats', 'professional'],
    swatches: ['#3f6f6b', '#000000', '#1c4966', '#93b0bb'],
    preset: {
      font: { body: 'lora' },
      headings: { style: 'accentBar', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'left', detailsArrangement: 'inline', iconStyle: 'plain' },
    },
  },
  {
    id: 'cedar',
    name: 'Cedar',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'professional'],
    swatches: ['#000000', '#3f4b54', '#5c2340', '#1c4966'],
    preset: {
      font: { body: 'merriweather' },
      headings: { style: 'lineBelow', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'left', detailsArrangement: 'stacked', iconStyle: 'outline' },
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    layout: 'onecolumn',
    categories: ['simple', 'one-column', 'ats'],
    swatches: ['#3f4b54', '#000000', '#2f6fb0', '#7fa5c9'],
    preset: {
      font: { body: 'alegreya' },
      headings: { style: 'underlineDotted', capitalization: 'uppercase', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'inline', iconStyle: 'square' },
    },
  },
  {
    id: 'ivy',
    name: 'Ivy',
    layout: 'clean',
    categories: ['simple', 'one-column', 'ats', 'modern'],
    swatches: ['#3f6f6b', '#000000', '#2a8fbd', '#3d2a6b'],
    preset: {
      font: { body: 'roboto' },
      headings: { style: 'boldOnly', capitalization: 'capitalize', icons: 'none' },
      header: { textAlign: 'center', detailsArrangement: 'stacked', iconStyle: 'plain' },
    },
  },
];

export const FILTERS = [
  { id: 'all', label: 'All Templates' },
  { id: 'popular', label: 'Popular' },
  { id: 'simple', label: 'Simple' },
  { id: 'modern', label: 'Modern' },
  { id: 'creative', label: 'Creative' },
];
