import React from 'react';
import { Clipboard, FileText, FileText as FileIcon, Image, Star, StarOff, Trash2, ExternalLink } from 'lucide-react';

import { ClipboardEntry } from '@/types/clipboard';
import { Button } from "@/components/ui/button";

interface ClipboardItemProps {
    item: ClipboardEntry;
    onCopy: (item: ClipboardEntry) => void;
    onToggleFavorite: (id: number, event: React.MouseEvent) => Promise<void>;
    onDelete: (id: number, event: React.MouseEvent) => Promise<void>;
}

export const ClipboardItem: React.FC<ClipboardItemProps> = ({ item, onCopy, onToggleFavorite, onDelete }) => {
    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderIcon = () => {
        switch (item.contentType) {
            case 'image':
                return <Image className="h-4 w-4" />;
            case 'html':
            case 'rtf':
                return <FileText className="h-4 w-4" />;
            case 'file':
                return <FileIcon className="h-4 w-4" />;
            default:
                return <Clipboard className="h-4 w-4" />;
        }
    };

    const renderContent = () => {
        if (item.contentType === 'image') {
            return (
                <div className="flex items-center">
                    <div className="ml-2 h-16 w-16 overflow-hidden rounded">
                        <img
                            src={`data:image/png;base64,${item.content}`}
                            alt="Clipboard image"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <span className="ml-2 text-gray-500 text-sm">{item.preview}</span>
                </div>
            );
        }

        return <span className="ml-2 truncate">{item.preview || item.content}</span>;
    };

    return (
        <div
            className="flex flex-col items-start cursor-pointer px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            onClick={() => onCopy(item)}
        >
            <div className="flex items-start justify-between w-full">
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center">
                        {renderIcon()}
                        {renderContent()}
                    </div>

                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="mr-2">
                            Copied {item.copy_count} {item.copy_count === 1 ? 'time' : 'times'}
                        </span>
                        <span>Last: {formatDate(item.last_copied_at)}</span>
                    </div>
                    {item.metadata && (
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{item.metadata}</span>
                        </div>
                    )}
                    {item.source_url && (
                        <div className="flex items-center mt-1">
                            <ExternalLink className="h-3 w-3 mr-1 text-blue-500" />
                            <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline truncate max-w-xs"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {item.source_url}
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex items-center ml-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => onToggleFavorite(item.id, e)}
                        className="h-8 w-8"
                    >
                        {item.is_favorite ?
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> :
                            <StarOff className="h-4 w-4" />
                        }
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => onDelete(item.id, e)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};