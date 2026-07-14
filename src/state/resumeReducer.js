import { getSectionMeta } from '../data/sectionTypes';

export const initialResumeState = {
  templateId: 'onecolumn',
  accentColor: '#17151c',
  basics: { name: '', title: '', email: '', phone: '', address: '', photo: null, visibleExtra: [] },
  sections: [],
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
      return { ...state, templateId: action.templateId, accentColor: action.accentColor };

    case 'UPDATE_BASICS':
      return { ...state, basics: { ...state.basics, [action.field]: action.value } };

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