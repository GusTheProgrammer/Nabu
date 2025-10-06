export interface ShortcutConfig {
  modifiers: string[];
  key: string;
}

export interface KeyboardShortcut {
  modifiers: string[];
  key: string;
  label: string;
}

export const DEFAULT_LAUNCH_SHORTCUT: ShortcutConfig = {
  modifiers: ['ctrl', 'shift'],
  key: 'Space',
};

export const KEYBOARD_SHORTCUTS: Record<string, KeyboardShortcut> = {
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
};
