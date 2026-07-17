import { getSectionMeta } from '../data/sectionTypes';
import { applyPresetToSettings } from '../utils/templatePreset';

export const DEFAULT_LAYOUT = { columns: 'one', headerPosition: 'top', columnWidth: 50 };

// Picking a template gives the layout a sensible starting point (a sidebar
// design naturally wants two columns); the user can still override it
// afterwards from the Layout panel.
export const TEMPLATE_DEFAULT_LAYOUT = {
  onecolumn: DEFAULT_LAYOUT,
  header: DEFAULT_LAYOUT,
  clean: DEFAULT_LAYOUT,
  sidebar: { columns: 'two', headerPosition: 'left', columnWidth: 32 },
  banner: { columns: 'mix', headerPosition: 'top', columnWidth: 32 },
};

// Offsets are added on top of the base size, matching how the Font Size
// panel displays them ("+11pt" etc).
export const DEFAULT_FONT_SIZE = { base: 10.5, fullName: 11, sectionHeadings: 3, entryHeader: 0 };

// spaceBetween is an extra offset (mm) added on top of the gaps between
// sections/entries, 0 = no adjustment; marginLR/marginTB are the page
// margins in mm.
export const DEFAULT_SPACING = { lineHeight: 1.1, spaceBetween: 0, marginLR: 16, marginTB: 10 };

// Governs how each entry (job, degree, etc.) inside an "entries" section
// renders. "Title & Subtitle" vs "Date & Location" are the two clusters an
// entry splits into; headerSplit/titleWidth controls their relative width
// whenever they sit side by side (structure "columns", or "full" width with
// dateLocationPosition "right").
export const DEFAULT_ENTRY_LAYOUT = {
  structure: 'full', // 'full' | 'columns'
  dateLocationPosition: 'right', // 'right' | 'below'
  headerSplit: 'manual', // 'auto' | 'manual'
  titleWidth: 55, // percent, used when headerSplit === 'manual'
  subtitlePlacement: 'belowTitle', // 'sameLine' | 'belowTitle'
  locationPlacement: 'belowDate', // 'sameLine' | 'belowDate'
  subtitleStyle: 'italic', // 'regular' | 'bold' | 'italic'
  dateStyle: 'regular',
  locationStyle: 'regular',
  indentBody: false,
  listStyle: 'bullet', // 'bullet' | 'hyphen'
  dateLocationOrder: 'date-location', // 'date-location' | 'location-date'
};

// Heading "style" controls the decoration drawn around/under the section
// title text; capitalization/icons are independent toggles layered on top.
export const DEFAULT_HEADINGS = {
  style: 'lineBelow',
  capitalization: 'uppercase', // 'capitalize' | 'uppercase'
  icons: 'none', // 'none' | 'outline' | 'filled'
};

// 'inherit' for name means "Same as body font".
export const DEFAULT_FONT = { body: 'alegreya', name: 'inherit' };

export const DEFAULT_COLORS = {
  backgroundScope: 'fullPage', // 'fullPage' | 'header' | 'border'
  fillType: 'single', // 'single' | 'multi' | 'image'
  applyTo: {
    name: true,
    jobTitle: true,
    headings: true,
    headingsLine: true,
    headerIcons: false,
    dotsBarsBubbles: false,
    dates: false,
    entrySubtitle: false,
    linkIcons: false,
  },
};

export const DEFAULT_HEADER = {
  textAlign: 'center', // 'left' | 'center'
  detailsArrangement: 'inline', // 'stacked' | 'inline'
  separatorStyle: 'icon', // 'icon' | 'bullet' | 'bar'
  iconStyle: 'plain', // one of ICON_STYLE_OPTIONS ids
};

export const DEFAULT_PHOTO = {
  show: true,
  grayscale: false,
  position: 'below', // 'below' | 'above' (relative to name & title)
  size: 'm', // 'xs' | 's' | 'm' | 'l' | 'xl'
  shape: 'circle', // 'circle' | 'roundedSquare' | 'square' | 'rectPortrait' | 'rectTall'
};

export const DEFAULT_FOOTER = { pageNumbers: false, email: false, name: false };

export const DEFAULT_LINKS = { showIcons: true, showAsText: true, underline: false };

export const initialResumeState = {
  templateId: 'onecolumn',
  accentColor: '#000000',
  basics: { name: '', title: '', email: '', phone: '', address: '', photo: null, visibleExtra: [] },
  sections: [],
  settings: {
    language: 'English (UK)',
    dateFormat: 'DD/MM/YYYY',
    pageFormat: 'A4',
    layout: DEFAULT_LAYOUT,
    fontSize: DEFAULT_FONT_SIZE,
    spacing: DEFAULT_SPACING,
    entryLayout: DEFAULT_ENTRY_LAYOUT,
    headings: DEFAULT_HEADINGS,
    font: DEFAULT_FONT,
    colors: DEFAULT_COLORS,
    header: DEFAULT_HEADER,
    photo: DEFAULT_PHOTO,
    footer: DEFAULT_FOOTER,
    links: DEFAULT_LINKS,
  },
};

let uid = 0;
const nextId = (prefix) => `${prefix}-${Date.now()}-${uid++}`;

function makeEntry() {
  return {
    id: nextId('entry'),
    heading: '',
    subheading: '',
    link: '',
    location: '',
    start: '',
    end: '',
    description: '',
    hidden: false,
  };
}

function makeSection(type) {
  const meta = getSectionMeta(type);
  const base = { id: nextId(type), type, title: meta.label, kind: meta.kind, hidden: false };
  if (meta.kind === 'text') return { ...base, content: '' };
  if (meta.kind === 'tags') return { ...base, tags: [] };
  if (meta.kind === 'entries') return { ...base, entries: [makeEntry()] };
  return base;
}

export function resumeReducer(state, action) {
  switch (action.type) {
    case 'SET_TEMPLATE': {
      // Picking a template (from the picker, the Customize thumbnails, or
      // Browse templates) is a deliberate "give me this whole look" action —
      // each template is a curated bundle of color + font + heading style,
      // not just a layout. `preset` carries the non-layout parts; anything
      // it doesn't mention is left as the user already had it.
      const baseLayout = TEMPLATE_DEFAULT_LAYOUT[action.templateId] || state.settings.layout;
      return {
        ...state,
        templateId: action.templateId,
        accentColor: action.accentColor ?? state.accentColor,
        settings: applyPresetToSettings(state.settings, action.preset, baseLayout),
      };
    }

    case 'SET_ACCENT_COLOR':
      return { ...state, accentColor: action.accentColor };

    case 'UPDATE_BASICS':
      return { ...state, basics: { ...state.basics, [action.field]: action.value } };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, [action.field]: action.value } };

    case 'UPDATE_LAYOUT':
      return {
        ...state,
        settings: { ...state.settings, layout: { ...state.settings.layout, [action.field]: action.value } },
      };

    case 'UPDATE_FONT_SIZE':
      return {
        ...state,
        settings: {
          ...state.settings,
          fontSize: { ...state.settings.fontSize, [action.field]: action.value },
        },
      };

    case 'UPDATE_SPACING':
      return {
        ...state,
        settings: {
          ...state.settings,
          spacing: { ...state.settings.spacing, [action.field]: action.value },
        },
      };

    case 'UPDATE_ENTRY_LAYOUT':
      return {
        ...state,
        settings: {
          ...state.settings,
          entryLayout: { ...state.settings.entryLayout, [action.field]: action.value },
        },
      };

    case 'UPDATE_HEADINGS':
      return {
        ...state,
        settings: { ...state.settings, headings: { ...state.settings.headings, [action.field]: action.value } },
      };

    case 'UPDATE_FONT':
      return {
        ...state,
        settings: { ...state.settings, font: { ...state.settings.font, [action.field]: action.value } },
      };

    case 'UPDATE_COLORS':
      return {
        ...state,
        settings: { ...state.settings, colors: { ...state.settings.colors, [action.field]: action.value } },
      };

    case 'UPDATE_COLORS_APPLY_TO':
      return {
        ...state,
        settings: {
          ...state.settings,
          colors: {
            ...state.settings.colors,
            applyTo: { ...state.settings.colors.applyTo, [action.field]: action.value },
          },
        },
      };

    case 'UPDATE_HEADER':
      return {
        ...state,
        settings: { ...state.settings, header: { ...state.settings.header, [action.field]: action.value } },
      };

    case 'UPDATE_PHOTO':
      return {
        ...state,
        settings: { ...state.settings, photo: { ...state.settings.photo, [action.field]: action.value } },
      };

    case 'UPDATE_FOOTER':
      return {
        ...state,
        settings: { ...state.settings, footer: { ...state.settings.footer, [action.field]: action.value } },
      };

    case 'UPDATE_LINKS':
      return {
        ...state,
        settings: { ...state.settings, links: { ...state.settings.links, [action.field]: action.value } },
      };

    case 'MOVE_SECTION': {
      const index = state.sections.findIndex((s) => s.id === action.id);
      const swapWith = action.direction === 'up' ? index - 1 : index + 1;
      if (index === -1 || swapWith < 0 || swapWith >= state.sections.length) return state;
      const sections = [...state.sections];
      [sections[index], sections[swapWith]] = [sections[swapWith], sections[index]];
      return { ...state, sections };
    }

    case 'ADD_EXTRA_FIELD':
      if (state.basics.visibleExtra.includes(action.field)) return state;
      return {
        ...state,
        basics: {
          ...state.basics,
          visibleExtra: [...state.basics.visibleExtra, action.field],
          [action.field]: state.basics[action.field] ?? '',
        },
      };

    case 'REMOVE_EXTRA_FIELD':
      return {
        ...state,
        basics: {
          ...state.basics,
          visibleExtra: state.basics.visibleExtra.filter((f) => f !== action.field),
        },
      };

    case 'SET_PHOTO':
      return { ...state, basics: { ...state.basics, photo: action.dataUrl } };

    case 'ADD_SECTION':
      return { ...state, sections: [...state.sections, makeSection(action.sectionType)] };

    case 'REMOVE_SECTION':
      return { ...state, sections: state.sections.filter((s) => s.id !== action.id) };

    case 'TOGGLE_SECTION_HIDDEN':
      return {
        ...state,
        sections: state.sections.map((s) => (s.id === action.id ? { ...s, hidden: !s.hidden } : s)),
      };

    case 'UPDATE_SECTION_TITLE':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.id ? { ...s, title: action.title } : s
        ),
      };

    case 'UPDATE_SECTION_TEXT':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.id ? { ...s, content: action.value } : s
        ),
      };

    case 'ADD_TAG':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.id ? { ...s, tags: [...s.tags, action.value] } : s
        ),
      };

    case 'REMOVE_TAG':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.id
            ? { ...s, tags: s.tags.filter((_, i) => i !== action.index) }
            : s
        ),
      };

    case 'ADD_ENTRY':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.id ? { ...s, entries: [...s.entries, makeEntry()] } : s
        ),
      };

    case 'UPDATE_ENTRY':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.id
            ? {
                ...s,
                entries: s.entries.map((e) =>
                  e.id === action.entryId ? { ...e, [action.field]: action.value } : e
                ),
              }
            : s
        ),
      };

    case 'REMOVE_ENTRY':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.id
            ? { ...s, entries: s.entries.filter((e) => e.id !== action.entryId) }
            : s
        ),
      };

    case 'TOGGLE_ENTRY_HIDDEN':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.id
            ? {
                ...s,
                entries: s.entries.map((e) => (e.id === action.entryId ? { ...e, hidden: !e.hidden } : e)),
              }
            : s
        ),
      };

    case 'REORDER_ENTRY': {
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.id) return s;
          const entries = [...s.entries];
          const fromIndex = entries.findIndex((e) => e.id === action.entryId);
          if (fromIndex === -1 || fromIndex === action.toIndex) return s;
          const [moved] = entries.splice(fromIndex, 1);
          entries.splice(action.toIndex, 0, moved);
          return { ...s, entries };
        }),
      };
    }

    case 'LOAD_RESUME':
      // Wholesale state swap for switching between resumes in the library —
      // everything (basics, sections, settings, template) comes from
      // whatever was loaded from storage for that resume's id.
      return action.resume;

    case 'IMPORT_RESUME':
      // Wholesale replace of the content (name, contact info, sections) from
      // a parsed paste-in — but keep whatever template/settings are already
      // chosen, since importing text says nothing about how it should look.
      return {
        ...state,
        basics: { ...state.basics, ...action.basics },
        sections: action.sections,
      };

    default:
      return state;
  }
}