import { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useClipboardContext } from '@/clipboard-context';
import clipboardDatabase from '@/lib/db';
import { ClipboardEntry } from '@/types/clipboard';
import useDebounce from '@/hooks/use-debounce.ts';

const BATCH_SIZE = 20;
const ESTIMATE_SIZE = () => 50;
const OVERSCAN = 5;

type PageParam = { id: number; cursorValue: string | number } | undefined;

export default function useClipboardVirtualizer() {
  const { state } = useClipboardContext();
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

  return {
    containerRef,
    rowVirtualizer,
    clipboardEntries,
    selectedClipboardEntry,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    showFavoritesOnly,
    error,
  };
}
