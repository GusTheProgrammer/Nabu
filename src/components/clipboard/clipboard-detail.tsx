import React from 'react';
import {Copy, Star, Trash} from 'lucide-react';

import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,} from '@/components/ui/context-menu';
import {ClipboardEntry} from '@/types/clipboard';
import {cn} from '@/lib/utils';

interface ClipboardDetailProps {
    children: React.ReactNode;
    entry: ClipboardEntry;
    onCopy: (entry: ClipboardEntry) => Promise<void>;
    onToggleFavorite: (id: number, event: React.MouseEvent) => Promise<void>;
    onDelete: (id: number, event?: React.MouseEvent) => Promise<void>;
}

const ClipboardDetail: React.FC<ClipboardDetailProps> = ({
                                                             children,
                                                             entry,
                                                             onCopy,
                                                             onToggleFavorite,
                                                             onDelete,
                                                         }) => {
    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem
                    className="flex items-center cursor-pointer"
                    onClick={() => onCopy(entry)}
                >
                    <Copy className="h-4 w-4 mr-2"/> Copy to Clipboard
                </ContextMenuItem>
                <ContextMenuItem
                    className="flex items-center cursor-pointer "
                    onClick={(e) => onToggleFavorite(entry.id, e)}
                >
                    <Star className={cn(
                        'h-4 w-4 mr-2',
                        entry.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''
                    )}/>
                    {entry.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </ContextMenuItem>
                <ContextMenuItem
                    className="flex items-center cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    onClick={(e) => onDelete(entry.id, e)}
                >
                    <Trash className="h-4 w-4 mr-2"/> Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default ClipboardDetail;