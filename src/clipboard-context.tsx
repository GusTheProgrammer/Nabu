import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer} from 'react';
import {invoke} from '@tauri-apps/api/core';

import {ClipboardEntry} from '@/types/clipboard';
import clipboardDatabase from '@/lib/db';
import clipboardService from '@/lib/clipboard-service';
import {DEFAULT_SHORTCUT, SETTING_KEYS, ShortcutConfig} from '@/types/settings';
import Logger from '@/util/logger';

interface ClipboardState {
    items: ClipboardEntry[];
    isInitialized: boolean;
    searchQuery: string;
    showFavoritesOnly: boolean;
    selectedEntry: ClipboardEntry | null;
    currentShortcut: ShortcutConfig;
}

type ClipboardAction =
    | { type: 'INITIALIZE' }
    | { type: 'SET_CLIPBOARD_ITEMS', payload: ClipboardEntry[] }
    | { type: 'SET_SEARCH_QUERY', payload: string }
    | { type: 'TOGGLE_FAVORITES_ONLY' }
    | { type: 'SELECT_ENTRY', payload: ClipboardEntry | null }
    | { type: 'SET_SHORTCUT', payload: ShortcutConfig };

const initialState: ClipboardState = {
    items: [],
    isInitialized: false,
    searchQuery: '',
    showFavoritesOnly: false,
    selectedEntry: null,
    currentShortcut: DEFAULT_SHORTCUT,
};

function clipboardReducer(state: ClipboardState, action: ClipboardAction): ClipboardState {
    switch (action.type) {
        case 'INITIALIZE':
            return {...state, isInitialized: true};
        case 'SET_CLIPBOARD_ITEMS':
            return {...state, items: action.payload};
        case 'SET_SEARCH_QUERY':
            return {...state, searchQuery: action.payload};
        case 'TOGGLE_FAVORITES_ONLY':
            return {...state, showFavoritesOnly: !state.showFavoritesOnly};
        case 'SELECT_ENTRY':
            return {...state, selectedEntry: action.payload};
        case 'SET_SHORTCUT':
            return {...state, currentShortcut: action.payload};
        default:
            return state;
    }
}

type ClipboardContextType = {
    state: ClipboardState;
    dispatch: React.Dispatch<ClipboardAction>;
    refreshItems: () => Promise<void>;
    currentShortcut: ShortcutConfig;
    updateShortcut: (shortcut: ShortcutConfig) => Promise<void>;
};

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export function ClipboardProvider({children}: { children: ReactNode }) {
    const [state, dispatch] = useReducer(clipboardReducer, initialState);

    const refreshItems = useCallback(async () => {
        const clipboardItems = await clipboardDatabase.getClipboardEntries({
            favoritesOnly: state.showFavoritesOnly,
            searchQuery: state.searchQuery
        });
        dispatch({type: 'SET_CLIPBOARD_ITEMS', payload: clipboardItems});
    }, [state.showFavoritesOnly, state.searchQuery]);

    const handleClipboardUpdate = useCallback(() => {
        refreshItems();
    }, [refreshItems]);

    const updateShortcut = useCallback(async (shortcut: ShortcutConfig) => {
        try {
            await invoke('change_shortcut', {
                modifiers: shortcut.modifiers,
                key: shortcut.key
            });
            await clipboardDatabase.setSetting(SETTING_KEYS.TOGGLE_SHORTCUT, shortcut);
            dispatch({type: 'SET_SHORTCUT', payload: shortcut});
        } catch (err) {
            Logger.error('Failed to update shortcut:', err);
            throw err;
        }
    }, []);

    const initializeShortcut = useCallback(async () => {
        try {
            const savedShortcut = await clipboardDatabase.getSetting<ShortcutConfig>(
                SETTING_KEYS.TOGGLE_SHORTCUT,
                DEFAULT_SHORTCUT
            );

            await invoke('change_shortcut', {
                modifiers: savedShortcut.modifiers,
                key: savedShortcut.key
            });

            dispatch({type: 'SET_SHORTCUT', payload: savedShortcut});
        } catch (err) {
            Logger.error('Failed to initialize shortcut:', err);
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            await initializeShortcut();
            await clipboardService.startMonitoring();
            await refreshItems();
            dispatch({type: 'INITIALIZE'});
        };

        initialize();
        clipboardService.addEventListener('update', handleClipboardUpdate);

        return () => {
            clipboardService.removeEventListener('update', handleClipboardUpdate);
            clipboardService.stopMonitoring();
            clipboardDatabase.close();
        };
    }, [refreshItems, handleClipboardUpdate, initializeShortcut]);

    useEffect(() => {
        if (state.isInitialized) {
            refreshItems();
        }
    }, [state.showFavoritesOnly, state.searchQuery, state.isInitialized, refreshItems]);

    const contextValue = useMemo(() => {
        return {
            state,
            dispatch,
            refreshItems,
            currentShortcut: state.currentShortcut,
            updateShortcut
        };
    }, [state, refreshItems, updateShortcut]);

    return (
        <ClipboardContext.Provider value={contextValue}>
            {children}
        </ClipboardContext.Provider>
    );
}

export function useClipboard() {
    const context = useContext(ClipboardContext);
    if (context === undefined) {
        throw new Error('useClipboard must be used within a ClipboardProvider');
    }
    return context;
}