import React, { createContext, ReactNode, useContext, useMemo, useReducer } from 'react';

import { ClipboardContentType, ClipboardEntry, SortBy, SortDirection } from '@/types/clipboard';
import { DEFAULT_LAUNCH_SHORTCUT, ShortcutConfig } from '@/types/shortcuts';

interface ClipboardState {
  searchQuery: string;
  searchFilters: ClipboardContentType[];
  sortBy: SortBy;
  sortDirection: SortDirection;
  showFavoritesOnly: boolean;
  selectedClipboardEntry: ClipboardEntry | null;
  currentShortcut: ShortcutConfig;
}

type ClipboardAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_SEARCH_FILTER'; payload: ClipboardContentType }
  | { type: 'RESET_SEARCH_FILTERS' }
  | { type: 'SET_SEARCH_SORT'; payload: { sortBy: SortBy; sortDirection: SortDirection } }
  | { type: 'TOGGLE_FAVORITES_ONLY' }
  | { type: 'SELECT_CLIPBOARD_ENTRY'; payload: ClipboardEntry | null }
  | { type: 'SET_SHORTCUT'; payload: ShortcutConfig };

const initialState: ClipboardState = {
  searchQuery: '',
  searchFilters: [],
  sortBy: 'lastCopiedAt',
  sortDirection: 'DESC',
  showFavoritesOnly: false,
  selectedClipboardEntry: null,
  currentShortcut: DEFAULT_LAUNCH_SHORTCUT,
};

function clipboardReducer(state: ClipboardState, action: ClipboardAction): ClipboardState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'TOGGLE_SEARCH_FILTER': {
      const currentTypes = state.searchFilters;
      const toggledType = action.payload;
      const newTypes = currentTypes.includes(toggledType)
        ? currentTypes.filter((t) => t !== toggledType)
        : [...currentTypes, toggledType];
      return { ...state, searchFilters: newTypes };
    }
    case 'RESET_SEARCH_FILTERS':
      return { ...state, searchFilters: [] };
    case 'SET_SEARCH_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortDirection: action.payload.sortDirection,
      };
    case 'TOGGLE_FAVORITES_ONLY':
      return { ...state, showFavoritesOnly: !state.showFavoritesOnly };
    case 'SELECT_CLIPBOARD_ENTRY':
      return { ...state, selectedClipboardEntry: action.payload };
    case 'SET_SHORTCUT':
      return { ...state, currentShortcut: action.payload };
    default:
      return state;
  }
}

type ClipboardContextType = {
  state: ClipboardState;
  dispatch: React.Dispatch<ClipboardAction>;
};

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(clipboardReducer, initialState);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  return <ClipboardContext.Provider value={contextValue}>{children}</ClipboardContext.Provider>;
}

export function useClipboardContext() {
  const context = useContext(ClipboardContext);
  if (context === undefined) {
    throw new Error('useClipboardContext must be used within a ClipboardProvider');
  }
  return context;
}
