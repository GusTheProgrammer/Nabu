import { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useClipboardContext } from '@/clipboard-context';
import { useKeyboardShortcut } from '@/context/keyboard-context';
import { useSetting } from '@/hooks/use-setting';
import clipboardDatabase from '@/lib/db';
import { ClipboardEntry } from '@/types/clipboard';
import useDebounce from '@/hooks/use-debounce';
import {
  DEFAULT_KEYBOARD_NAVIGATION,
  KeyboardNavigationSettings,
  SETTING_KEYS,
} from '@/types/settings';

const BATCH_SIZE = 20;
const ESTIMATE_SIZE = () => 50;
const OVERSCAN = 10;

type PageParam = { id: number; cursorValue: string | number } | undefined;

export default function useClipboardVirtualizer() {
  const { value: settings } = useSetting<KeyboardNavigationSettings>(
    SETTING_KEYS.KEYBOARD_NAVIGATION,
    DEFAULT_KEYBOARD_NAVIGATION
  );
  const { state, dispatch } = useClipboardContext();
  const {
    selectedClipboardEntry,
    showFavoritesOnly,
    searchQuery,
    searchFilters,
    sortBy,
    sortDirection,
  } = state;
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const containerRef = useRef<HTMLDivElement>(null);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [
        'clipboardEntries',
        { showFavoritesOnly, debouncedSearchQuery, searchFilters, sortBy, sortDirection },
      ],
      queryFn: async ({ pageParam }: { pageParam: PageParam }) => {
        const { id: cursorId, cursorValue } = pageParam || {};
        return await clipboardDatabase.getClipboardEntries({
          limit: BATCH_SIZE,
          filters: searchFilters || undefined,
          sortBy,
          sortDirection,
          favoritesOnly: showFavoritesOnly,
          searchQuery: debouncedSearchQuery,
          cursorId,
          cursorValue,
        });
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage: ClipboardEntry[]) => {
        if (lastPage.length < BATCH_SIZE) {
          return undefined;
        }
        const lastItem = lastPage[lastPage.length - 1];
        return lastItem ? { id: lastItem.id, cursorValue: lastItem[sortBy] } : undefined;
      },
    });

  const clipboardEntries = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? clipboardEntries.length + 1 : clipboardEntries.length,
    getScrollElement: () => containerRef.current,
    estimateSize: ESTIMATE_SIZE,
    overscan: OVERSCAN,
    onChange: (virtualizer) => {
      const [lastItem] = [...virtualizer.getVirtualItems()].reverse();
      if (!lastItem) return;

      if (lastItem.index >= clipboardEntries.length - 1 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= clipboardEntries.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    clipboardEntries.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  const getSelectedIndex = () => {
    if (!selectedClipboardEntry) return -1;
    return clipboardEntries.findIndex((entry) => entry.id === selectedClipboardEntry?.id);
  };

  const selectAndScroll = (index: number) => {
    const entry = clipboardEntries[index];
    if (!entry) return;

    dispatch({ type: 'SELECT_CLIPBOARD_ENTRY', payload: entry });
    rowVirtualizer.scrollToIndex(index, { align: 'auto', behavior: 'auto' });
  };

  const prefetchIfNeeded = (index: number) => {
    const isNearEnd = index >= clipboardEntries.length - settings.prefetchThreshold;
    if (isNearEnd && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const navigateNext = () => {
    const currentIndex = getSelectedIndex();
    const isAtEnd = currentIndex >= clipboardEntries.length - 1;

    prefetchIfNeeded(currentIndex);

    if (isAtEnd) {
      if (!hasNextPage) selectAndScroll(0);
    } else {
      selectAndScroll(currentIndex + 1);
    }
  };

  const navigatePrevious = () => {
    const currentIndex = getSelectedIndex();

    if (currentIndex <= 0) {
      selectAndScroll(clipboardEntries.length - 1);
    } else {
      selectAndScroll(currentIndex - 1);
    }
  };

  const navigatePageDown = () => {
    const currentIndex = getSelectedIndex();
    const nextIndex = Math.min(currentIndex + settings.pageSize, clipboardEntries.length - 1);

    prefetchIfNeeded(nextIndex);
    selectAndScroll(nextIndex);
  };

  const navigatePageUp = () => {
    const currentIndex = getSelectedIndex();
    const prevIndex = Math.max(currentIndex - settings.pageSize, 0);

    selectAndScroll(prevIndex);
  };

  useEffect(() => {
    if (clipboardEntries.length > 0 && !selectedClipboardEntry) {
      dispatch({ type: 'SELECT_CLIPBOARD_ENTRY', payload: clipboardEntries[0] });
    }
  }, [clipboardEntries.length]);

  const navigationEnabled = !isLoading && clipboardEntries.length > 0;

  useKeyboardShortcut(settings.shortcuts.navigateNext.key, navigateNext, {
    modifiers: settings.shortcuts.navigateNext.modifiers,
    enabled: navigationEnabled,
  });

  useKeyboardShortcut(settings.shortcuts.navigatePrevious.key, navigatePrevious, {
    modifiers: settings.shortcuts.navigatePrevious.modifiers,
    enabled: navigationEnabled,
  });

  useKeyboardShortcut(settings.shortcuts.navigatePageDown.key, navigatePageDown, {
    modifiers: settings.shortcuts.navigatePageDown.modifiers,
    enabled: navigationEnabled,
  });

  useKeyboardShortcut(settings.shortcuts.navigatePageUp.key, navigatePageUp, {
    modifiers: settings.shortcuts.navigatePageUp.modifiers,
    enabled: navigationEnabled,
  });

  return {
    containerRef,
    rowVirtualizer,
    clipboardEntries,
    selectedClipboardEntry,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    showFavoritesOnly,
    error,
  };
}
