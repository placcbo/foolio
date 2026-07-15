// Lightens (positive percent) or darkens (negative) a #rrggbb color.
export function shadeHex(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const amount = Math.round(2.55 * percent);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Builds the CSS `background` value for a given fill type: a flat color, a
// two-tone gradient, or a diagonal stripe "pattern" tint — all derived from
// the single accent color so there's nothing extra to upload or manage.
export function getColorFill(fillType, accentColor) {
  const light = shadeHex(accentColor, 35);
  if (fillType === 'multi') return `linear-gradient(135deg, ${accentColor}, ${light})`;
  if (fillType === 'image') {
    return `repeating-linear-gradient(45deg, ${accentColor} 0px, ${accentColor} 2px, transparent 2px, transparent 9px), ${light}`;
  }
  return accentColor;
}

// Resolves the Colors panel's Background Scope + Fill Type into concrete
// styles: a style object for the page/border, and a fill value + colored
// flag for the header (consumed by HeaderBlock / each template's own header).
export function getColorDecoration(colors, accentColor) {
  const scope = colors?.backgroundScope ?? 'fullPage';
  const fillType = colors?.fillType ?? 'single';
  const fill = getColorFill(fillType, accentColor);

  const paperStyle = {};
  let headerColored = false;
  let headerFill = null;

  if (scope === 'fullPage') {
    // Single fill on the full page means "no wash" — the page stays pure
    // white, matching the reference design's default. Multi/Image are
    // visibly decorative fills, so those still paint the page.
    if (fillType !== 'single') paperStyle.background = fill;
  } else if (scope === 'border') {
    if (fillType === 'single') {
      paperStyle.border = `6px solid ${accentColor}`;
    } else {
      paperStyle.border = '6px solid transparent';
      paperStyle.borderImage = `${fill} 1`;
    }
  } else if (scope === 'header') {
    headerColored = true;
    headerFill = fill;
  }

  return { paperStyle, headerColored, headerFill };
}
