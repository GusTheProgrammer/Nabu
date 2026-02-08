export interface ShortcutDefinition {
  modifiers: string[];
  key: string;
  label: string;
}

export const DEFAULT_SHORTCUTS = {
  launch: {
    modifiers: ['ctrl', 'shift'],
    key: 'Space',
    label: 'Launch Nabu',
  },
  navigateNext: {
    modifiers: [],
    key: 'ArrowDown',
    label: 'Navigate Down',
  },
  navigatePrevious: {
    modifiers: [],
    key: 'ArrowUp',
    label: 'Navigate Up',
  },
  navigatePageDown: {
    modifiers: [],
    key: 'ArrowRight',
    label: 'Page Down',
  },
  navigatePageUp: {
    modifiers: [],
    key: 'ArrowLeft',
    label: 'Page Up',
  },
  pasteEntry: {
    modifiers: [],
    key: 'Enter',
    label: 'Paste Entry',
  },
  copyEntry: {
    modifiers: [],
    key: 'KeyC',
    label: 'Copy Entry',
  },
  deleteEntry: {
    modifiers: [],
    key: 'Delete',
    label: 'Delete Entry',
  },
  toggleFavorite: {
    modifiers: [],
    key: 'KeyF',
    label: 'Toggle Favorite',
  },
  focusSearch: {
    modifiers: [],
    key: 'Slash',
    label: 'Focus Search',
  },
  toggleFilter: {
    modifiers: [],
    key: 'KeyT',
    label: 'Toggle Filter',
  },
};

export type ShortcutKey = keyof typeof DEFAULT_SHORTCUTS;
