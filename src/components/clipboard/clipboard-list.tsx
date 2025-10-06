import { LucideClipboardList } from 'lucide-react';

import { scrollbarStyles } from '@/lib/utils';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import ClipboardDetail from '@/components/clipboard/clipboard-detail';
import useClipboardVirtualizer from '@/hooks/use-clipboard-virtualizer';
import ClipboardItemSkeleton from '@/components/clipboard/skeleton/ClipboardEntrySkeleton';
import useKeyboardNavigation from '@/hooks/use-keyboard-navigation';

const ClipboardList = () => {
  const {
    containerRef,
    isLoading,
    clipboardEntries,
    hasNextPage,
    rowVirtualizer,
    fetchNextPage,
    isFetchingNextPage,
  } = useClipboardVirtualizer();

  useKeyboardNavigation({
    clipboardEntries,
    rowVirtualizer,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isEnabled: !isLoading,
  });

  const items = rowVirtualizer.getVirtualItems();

  if (isLoading && clipboardEntries.length === 0) {
    return (
      <div className={`flex-1 ${scrollbarStyles} overflow-auto`}>
        {Array.from({ length: 15 }).map((_, i) => (
          <ClipboardItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!isLoading && clipboardEntries.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center p-4'>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <LucideClipboardList className='h-12 w-12' />
            </EmptyMedia>
            <EmptyTitle>No Clipboard Entries Found</EmptyTitle>
            <EmptyDescription>No items yet, or no results for your search.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex-1 ${scrollbarStyles} overflow-auto`}>
      <div className='relative w-full' style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {items.map((virtualItem) => {
          const isLoaderRow = virtualItem.index >= clipboardEntries.length;
          const entry = clipboardEntries[virtualItem.index];

          if (isLoaderRow) {
            return (
              hasNextPage && (
                <div
                  key='loader'
                  className='absolute inset-x-0'
                  style={{
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <ClipboardItemSkeleton />
                </div>
              )
            );
          }

          return (
            <div
              key={entry.id}
              className='absolute inset-x-0'
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <ClipboardDetail entry={entry} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClipboardList;
