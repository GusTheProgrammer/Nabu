import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer} from 'react';

import {ClipboardEntry} from '@/types/clipboard';
import clipboardDatabase from '@/lib/db';
import clipboardService from '@/lib/clipboard-service';

interface ClipboardState {
    items: ClipboardEntry[];
    isInitialized: boolean;
    searchQuery: string;
    showFavoritesOnly: boolean;
    selectedEntry: ClipboardEntry | null;
    isRightPanelCollapsed: boolean;
}

type ClipboardAction =
    | { type: 'INITIALIZE' }
    | { type: 'SET_CLIPBOARD_ITEMS', payload: ClipboardEntry[] }
    | { type: 'SET_SEARCH_QUERY', payload: string }
    | { type: 'TOGGLE_FAVORITES_ONLY' }
    | { type: 'SELECT_ENTRY', payload: ClipboardEntry | null }
    | { type: 'TOGGLE_RIGHT_PANEL' }
    | { type: 'SET_RIGHT_PANEL_COLLAPSED', payload: boolean };

const initialState: ClipboardState = {
    items: [],
    isInitialized: false,
    searchQuery: '',
    showFavoritesOnly: false,
    selectedEntry: null,
    isRightPanelCollapsed: false,
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
        case 'TOGGLE_RIGHT_PANEL':
            return {...state, isRightPanelCollapsed: !state.isRightPanelCollapsed};
        case 'SET_RIGHT_PANEL_COLLAPSED':
            return {...state, isRightPanelCollapsed: action.payload};
        default:
            return state;
    }
}

type ClipboardContextType = {
    state: ClipboardState;
    dispatch: React.Dispatch<ClipboardAction>;
    refreshItems: () => Promise<void>;
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

    useEffect(() => {
        const initialize = async () => {
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
    }, [refreshItems, handleClipboardUpdate]);

    useEffect(() => {
        if (state.isInitialized) {
            refreshItems();
        }
    }, [state.showFavoritesOnly, state.searchQuery, state.isInitialized, refreshItems]);

    const contextValue = useMemo(() => {
        return {state, dispatch, refreshItems};
    }, [state, refreshItems]);

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