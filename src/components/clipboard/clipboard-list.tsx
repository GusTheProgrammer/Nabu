import React from 'react';
import {File, FileText, Link, Mail, Star} from 'lucide-react';

import {cn, scrollbarStyles} from '@/lib/utils';
import {ClipboardEntry} from '@/types/clipboard';
import ClipboardDetail from '@/components/clipboard/clipboard-detail';
import {useClipboardActions} from '@/hooks/use-clipboard-actions.ts';

const ClipboardList: React.FC = () => {
    const {
        containerRef,
        isLoading,
        items,
        hasMore,
        selectedClipboardEntry,
        rowVirtualizer,

        handleCopy,
        handleDelete,
        handleEntryClick,
        handleToggleFavorite
    } = useClipboardActions();

    const getEntryIcon = (entry: ClipboardEntry) => {
        const iconClass = 'h-4 w-4';

        switch (entry.contentType) {
            case 'text':
            case 'html':
            case 'rtf':
                return <FileText className={`${iconClass} text-muted-foreground`}/>;
            case 'image':
                return (
                    <img
                        src={`data:image/png;base64,${entry.content}`}
                        alt="clipboard preview"
                        className="h-6 w-6 rounded object-cover"
                    />
                );
            case 'file':
                return <File className={`${iconClass} text-green-400`}/>;
            case 'link':
                return <Link className={`${iconClass} text-blue-400`}/>;
            case 'email':
                return <Mail className={`${iconClass} text-red-400`}/>;
            case 'color':
                return <div className="h-4 w-4 rounded-full border border-border" style={{backgroundColor: entry.preview}}/>;
            default:
                return <FileText className={`${iconClass} text-muted-foreground`}/>;
        }
    };

    return (
        <>
            <div ref={containerRef} className={`flex-1 ${scrollbarStyles} overflow-auto`}>
                {items.length === 0 && !isLoading ? (
                    <div
                        className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                        <FileText className="h-12 w-12 mb-2 opacity-30"/>
                        <p>No clipboard items found</p>
                    </div>
                ) : (
                    <div
                        className="relative w-full"
                        style={{height: `${rowVirtualizer.getTotalSize()}px`}}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                            const isLoaderRow = virtualItem.index >= items.length;

                            if (isLoaderRow) {
                                return (
                                    <div key="loader"
                                         className="absolute inset-x-0 flex items-center justify-center"
                                         style={{
                                             height: `${virtualItem.size}px`,
                                             transform: `translateY(${virtualItem.start}px)`,
                                         }}
                                    >
                                        {hasMore && <div className="text-muted-foreground">Loading more items...</div>}
                                    </div>
                                );
                            }

                            const entry = items[virtualItem.index];
                            const isSelected = selectedClipboardEntry?.id === entry.id;

                            return (
                                <div key={entry.id}
                                     className="absolute inset-x-0"
                                     style={{
                                         height: `${virtualItem.size}px`,
                                         transform: `translateY(${virtualItem.start}px)`,
                                     }}
                                >
                                    <ClipboardDetail entry={entry} onCopy={handleCopy}
                                                     onToggleFavorite={handleToggleFavorite} onDelete={handleDelete}>
                                        <div data-entry-id={entry.id}
                                             className={cn(
                                                 'flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-border hover:bg-accent transition-colors h-full',
                                                 isSelected && 'bg-accent'
                                             )}
                                             onClick={() => handleEntryClick(entry)}
                                             title={isSelected ? 'Click again to copy' : 'Click to preview'}
                                        >
                                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">{getEntryIcon(entry)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm truncate">{entry.preview}</div>
                                            </div>
                                            {entry.isFavorite && (
                                                <div className="flex-shrink-0">
                                                    <Star
                                                        className="h-4 w-4 text-yellow-400 fill-yellow-400"
                                                        onClick={(e) => handleToggleFavorite(entry.id, e)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </ClipboardDetail>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default ClipboardList;