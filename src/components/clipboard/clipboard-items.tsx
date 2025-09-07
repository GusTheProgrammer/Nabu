import React from 'react';
import {Braces, Code2, Copy, File, FileText, Search} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';
import {useClipboard} from '@/clipboard-context';
import clipboardService from '@/lib/clipboard-service';
import clipboardDatabase from '@/lib/db';
import {ClipboardEntry} from '@/types/clipboard';

const ClipboardItems: React.FC = () => {
    const {state, dispatch, refreshItems} = useClipboard();
    const {items, searchQuery, selectedEntry} = state;

    const handleCopy = async (item: ClipboardEntry) => {
        await clipboardService.copyToClipboard(item);
        await refreshItems();
    };

    const handleEntryClick = (entry: ClipboardEntry) => {
        if (selectedEntry?.id === entry.id) {
            handleCopy(entry);
        } else {
            dispatch({type: 'SELECT_ENTRY', payload: entry});
        }
    };

    const handleToggleFavorite = async (id: number, event: React.MouseEvent) => {
        event.stopPropagation();
        await clipboardDatabase.toggleFavorite(id);
        await refreshItems();
    };

    const handleDelete = async (id: number, event: React.MouseEvent) => {
        event.stopPropagation();
        await clipboardDatabase.deleteClipboardEntry(id);
        await refreshItems();
    };

    const handleClearHistory = async () => {
        if (confirm('Clear clipboard history? Favorites will be kept.')) {
            await clipboardDatabase.clearAllEntries(true);
            await refreshItems();
        }
    };

    const getEntryIcon = (entry: ClipboardEntry) => {
        switch (entry.contentType) {
            case 'text':
                return <FileText className="h-4 w-4 text-gray-400"/>
            case 'html':
                return <Code2 className="h-4 w-4 text-orange-400"/>
            case 'rtf':
                return <Braces className="h-4 w-4 text-purple-400"/>
            case 'image':
                return (
                    <img
                        src={`data:image/png;base64,${entry.content}`}
                        alt="clipboard preview"
                        className="h-6 w-6 rounded object-cover"
                    />
                )
            case 'file':
                return <File className="h-4 w-4 text-green-400"/>
            default:
                return <FileText className="h-4 w-4 text-gray-400"/>
        }
    };

    return (
        <>
            {/* Search Header */}
            <div className="p-4 border-b border-gray-700/50">
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                    <Input
                        placeholder="Type to search..."
                        value={searchQuery}
                        onChange={(e) => dispatch({type: 'SET_SEARCH_QUERY', payload: e.target.value})}
                        className="pl-10 bg-gray-800/50 border-gray-600/50 text-gray-200 placeholder:text-gray-500 focus:border-gray-500 rounded-lg h-10"
                    />
                </div>

                {/* Toolbar Icons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                        >
                            <FileText className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectedEntry && handleCopy(selectedEntry)}
                            disabled={!selectedEntry}
                            className={cn(
                                'h-8 w-8 p-0 transition-colors',
                                selectedEntry
                                    ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700/50'
                                    : 'text-gray-600 cursor-not-allowed'
                            )}
                            title={selectedEntry ? 'Copy selected entry' : 'Select an entry to copy'}
                        >
                            <Copy className={cn(
                                'h-4 w-4 transition-colors',
                                selectedEntry ? 'text-blue-400' : 'text-gray-600'
                            )}/>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch({type: 'TOGGLE_FAVORITES_ONLY'})}
                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-gray-700/50"
                        >
                            ⭐
                        </Button>
                    </div>
                </div>
            </div>

            {/* Entries List */}
            <div
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-900/20 scrollbar-thumb-slate-500/60 hover:scrollbar-thumb-slate-400/80 scrollbar-thumb-rounded-full scrollbar-track-rounded-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-track]:bg-slate-900/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80 rtl">
                <div className="direction-ltr">
                    {items.map((entry) => (
                        <div
                            key={entry.id}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors',
                                selectedEntry?.id === entry.id && 'bg-gray-700/50',
                            )}
                            onClick={() => handleEntryClick(entry)}
                            title={selectedEntry?.id === entry.id ? 'Click again to copy' : 'Click to preview'}
                        >
                            <div className="flex-shrink-0">{getEntryIcon(entry)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-gray-200 text-sm truncate">{entry.preview}</div>
                            </div>
                            <div className="flex-shrink-0">
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ClipboardItems;