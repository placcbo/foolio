import { getSectionMeta } from '../data/sectionTypes';

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
  locationPlacement: 'sameLine', // 'sameLine' | 'belowDate'
  subtitleStyle: 'italic', // 'regular' | 'bold' | 'italic'
  dateStyle: 'regular',
  locationStyle: 'regular',
  indentBody: false,
  listStyle: 'bullet', // 'bullet' | 'hyphen'
  dateLocationOrder: 'date-location', // 'date-location' | 'location-date'
};

export const initialResumeState = {
  templateId: 'onecolumn',
  accentColor: '#17151c',
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
  },
};

let uid = 0;
const nextId = (prefix) => `${prefix}-${Date.now()}-${uid++}`;

function makeEntry() {
  return {
    id: nextId('entry'),
    heading: '',
    subheading: '',
    location: '',
    start: '',
    end: '',
    description: '',
  };
}

function makeSection(type) {
  const meta = getSectionMeta(type);
  const base = { id: nextId(type), type, title: meta.label, kind: meta.kind };
  if (meta.kind === 'text') return { ...base, content: '' };
  if (meta.kind === 'tags') return { ...base, tags: [] };
  if (meta.kind === 'entries') return { ...base, entries: [makeEntry()] };
  return base;
}

export function resumeReducer(state, action) {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return {
        ...state,
        templateId: action.templateId,
        accentColor: action.accentColor,
        settings: {
          ...state.settings,
          layout: TEMPLATE_DEFAULT_LAYOUT[action.templateId] || state.settings.layout,
        },
      };

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

    default:
      return state;
  }
}