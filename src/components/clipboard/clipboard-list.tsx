import { FileText } from 'lucide-react';

import { scrollbarStyles } from '@/lib/utils';
import ClipboardDetail from '@/components/clipboard/clipboard-detail';
import useClipboardVirtualizer from '@/hooks/use-clipboard-virtualizer';
import ClipboardItemSkeleton from '@/components/clipboard/skeleton/ClipboardEntrySkeleton.tsx';

const ClipboardList = () => {
  const { containerRef, isLoading, clipboardEntries, hasNextPage, rowVirtualizer } =
    useClipboardVirtualizer();

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
      <div className='flex flex-1 flex-col items-center justify-center text-muted-foreground p-4 text-center'>
        <FileText className='h-12 w-12 mb-2 opacity-30' />
        <p>No clipboard items found</p>
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
