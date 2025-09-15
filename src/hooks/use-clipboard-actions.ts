import React, {useCallback, useEffect, useRef} from 'react';
import {useVirtualizer} from '@tanstack/react-virtual';

import {useClipboard} from '@/clipboard-context.tsx';
import {ClipboardEntry} from '@/types/clipboard.ts';
import clipboardService from '@/lib/clipboard-service.ts';
import clipboardDatabase from '@/lib/db.ts';

const BATCH_SIZE = 20;

export const useClipboardActions = () => {
    const {state, dispatch, refreshItems} = useClipboard();
    const {items, selectedClipboardEntry, showFavoritesOnly, searchQuery} = state;

    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);

    /*          Actions          */
    const handleCopy = useCallback(async (item: ClipboardEntry) => {
        await clipboardService.copyToClipboard(item);
        await refreshItems();
    }, [refreshItems]);

    const handleEntryClick = useCallback((entry: ClipboardEntry) => {
        if (selectedClipboardEntry?.id === entry.id) {
            handleCopy(entry);
        } else {
            dispatch({type: 'SELECT_CLIPBOARD_ENTRY', payload: entry});
        }
    }, [selectedClipboardEntry, dispatch, handleCopy]);

    const handleToggleFavorite = useCallback(async (id: number, event: React.MouseEvent) => {
        event.stopPropagation();
        await clipboardDatabase.toggleFavorite(id);
        await refreshItems();
    }, [refreshItems]);

    const handleDelete = useCallback(async (id: number, event?: React.MouseEvent) => {
        event?.stopPropagation();
        await clipboardDatabase.deleteClipboardEntry(id);
        await refreshItems();
    }, [refreshItems]);

    const handleClearHistory = useCallback(async () => {
        // TODO: Replace with a proper dialog lmao
        if (confirm('Clear clipboard history? Favorites will be kept.')) {
            await clipboardDatabase.clearAllEntries(true);
            await refreshItems();
        }
    }, [refreshItems]);

    const handleToggleFavoritesFilter = useCallback(() => {
        dispatch({type: 'TOGGLE_FAVORITES_ONLY'});
    }, [dispatch]);


    /*        Scroll Handler       */
    const rowVirtualizer = useVirtualizer({
        count: hasMore ? items.length + 1 : items.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 56,
        overscan: 5,
    });

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);

        try {
            const lastItem = items.at(-1);
            const moreItems = await clipboardDatabase.getClipboardEntries({
                limit: BATCH_SIZE,
                favoritesOnly: showFavoritesOnly,
                searchQuery,
                cursorId: lastItem?.id,
                cursorTimestamp: lastItem?.lastCopiedAt
            });

            if (moreItems.length < BATCH_SIZE) {
                setHasMore(false);
            }
            dispatch({type: 'SET_CLIPBOARD_ITEMS', payload: [...items, ...moreItems]});
        } catch (error) {
            console.error('Failed to load more items:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, items, showFavoritesOnly, searchQuery, dispatch]);

    useEffect(() => {
        const loadInitial = async () => {
            setIsLoading(true);
            setHasMore(true);
            try {
                const initialItems = await clipboardDatabase.getClipboardEntries({
                    limit: BATCH_SIZE,
                    favoritesOnly: showFavoritesOnly,
                    searchQuery
                });
                dispatch({type: 'SET_CLIPBOARD_ITEMS', payload: initialItems});
                if (initialItems.length > 0) {
                    dispatch({type: 'SELECT_CLIPBOARD_ENTRY', payload: initialItems[0]});
                }
                if (initialItems.length < BATCH_SIZE) {
                    setHasMore(false);
                }
            } catch (error) {
                console.error('Failed to load initial items:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitial();
    }, [showFavoritesOnly, searchQuery, dispatch]);

    useEffect(() => {
        const lastItem = rowVirtualizer.getVirtualItems().at(-1);
        if (lastItem && lastItem.index >= items.length - 1 && hasMore && !isLoading) {
            loadMore();
        }
    }, [rowVirtualizer.getVirtualItems(), hasMore, isLoading, items.length, loadMore]);

    useEffect(() => {
        if (!selectedClipboardEntry) return;
        const index = items.findIndex(item => item.id === selectedClipboardEntry.id);
        if (index !== -1) {
            rowVirtualizer.scrollToIndex(index, {align: 'auto'});
        }
    }, [selectedClipboardEntry]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!items.length) return;
            if (e.key === 'Enter' && selectedClipboardEntry) {
                e.preventDefault();
                handleCopy(selectedClipboardEntry);
                return;
            }

            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            e.preventDefault();

            const currentIndex = selectedClipboardEntry ? items.findIndex(item => item.id === selectedClipboardEntry.id) : -1;
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            const nextIndex = (currentIndex + delta + items.length) % items.length;
            dispatch({type: 'SELECT_CLIPBOARD_ENTRY', payload: items[nextIndex]});
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [items, selectedClipboardEntry, dispatch, handleCopy]);

    return {
        handleCopy,
        handleToggleFavorite,
        handleEntryClick,
        handleDelete,
        handleClearHistory,
        handleToggleFavoritesFilter,

        containerRef,
        rowVirtualizer,
        items,
        selectedClipboardEntry,
        isLoading,
        hasMore,
        showFavoritesOnly,
    };
}