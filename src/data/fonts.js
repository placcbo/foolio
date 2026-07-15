// Curated set of resume-friendly fonts, loaded via the Google Fonts <link>
// in index.html. Keep this list in sync with that link's `family=` params.
export const FONT_OPTIONS = [
  { id: 'alegreya', label: 'Alegreya', family: "'Alegreya', Georgia, serif" },
  { id: 'lora', label: 'Lora', family: "'Lora', Georgia, serif" },
  { id: 'merriweather', label: 'Merriweather', family: "'Merriweather', Georgia, serif" },
  { id: 'playfair', label: 'Playfair Display', family: "'Playfair Display', Georgia, serif" },
  { id: 'roboto', label: 'Roboto', family: "'Roboto', system-ui, sans-serif" },
  { id: 'inter', label: 'Inter', family: "'Inter', system-ui, sans-serif" },
  { id: 'opensans', label: 'Open Sans', family: "'Open Sans', system-ui, sans-serif" },
  { id: 'montserrat', label: 'Montserrat', family: "'Montserrat', system-ui, sans-serif" },
];

export function getFontFamily(id) {
  return FONT_OPTIONS.find((f) => f.id === id)?.family ?? FONT_OPTIONS[0].family;
}
