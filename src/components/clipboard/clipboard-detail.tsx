import React from 'react';
import { Copy, Star, Trash } from 'lucide-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ClipboardEntry } from '@/types/clipboard';
import { cn } from '@/lib/utils';
import { useClipboardActions } from '@/hooks/use-clipboard-actions';
import { useClipboardContext } from '@/clipboard-context';
import { ClipboardEntryIcon } from '@/util/clipboard-content-icons';

interface ClipboardDetailProps {
  entry: ClipboardEntry;
}

const ClipboardDetail: React.FC<ClipboardDetailProps> = ({ entry }) => {
  const { copyEntry, deleteEntry, selectOrCopyEntry, toggleEntryFavorite } = useClipboardActions();
  const { state } = useClipboardContext();
  const isSelected = state.selectedClipboardEntry?.id === entry.id;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-entry-id={entry.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-border hover:bg-accent transition-colors h-full',
            isSelected && 'bg-accent'
          )}
          onClick={() => selectOrCopyEntry(entry)}
          title={isSelected ? 'Click again to copy' : 'Click to preview'}
        >
          <div className='flex-shrink-0 w-6 h-6 flex items-center justify-center'>
            <ClipboardEntryIcon entry={entry} />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm truncate'>{entry.preview}</p>
          </div>
          {entry.isFavorite && (
            <div className='flex-shrink-0'>
              <Star
                className='h-4 w-4 text-yellow-400 fill-yellow-400'
                onClick={(e) => toggleEntryFavorite(entry.id, e)}
              />
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem className='flex items-center' onClick={() => copyEntry(entry)}>
          <Copy className='h-4 w-4 mr-2' /> Copy to Clipboard
        </ContextMenuItem>
        <ContextMenuItem
          className='flex items-center'
          onClick={(e) => toggleEntryFavorite(entry.id, e)}
        >
          <Star
            className={cn('h-4 w-4 mr-2', entry.isFavorite && 'fill-yellow-400 text-yellow-400')}
          />
          {entry.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </ContextMenuItem>
        <ContextMenuItem
          className='flex items-center text-destructive focus:bg-destructive focus:text-destructive-foreground'
          onClick={(e) => deleteEntry(entry.id, e)}
        >
          <Trash className='h-4 w-4 mr-2' /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ClipboardDetail;
