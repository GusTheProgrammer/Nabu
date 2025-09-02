import React, {useEffect, useState, useCallback} from 'react';
import {Heart, Trash2} from 'lucide-react';

import clipboardDatabase from '@/lib/db';
import clipboardService from '@/lib/clipboard-service';
import {ClipboardItem} from '@/components/clipboard/clipboard-item';
import {ClipboardEntry} from '@/types/clipboard';
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandList,} from "@/components/ui/command";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

const ClipboardManager: React.FC = () => {
    const [items, setItems] = useState<ClipboardEntry[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const refreshItems = useCallback(async () => {
        const clipboardItems = await clipboardDatabase.getClipboardEntries({
            favoritesOnly: showFavoritesOnly,
            searchQuery
        });
        setItems(clipboardItems);
    }, [showFavoritesOnly, searchQuery]);

    const handleClipboardUpdate = useCallback(() => {
        refreshItems();
    }, [refreshItems]);

    useEffect(() => {
        const initialize = async () => {
            await clipboardDatabase.init();
            await clipboardService.startMonitoring();
            await refreshItems();
            setIsInitialized(true);
        };

        initialize();
        clipboardService.addEventListener('update', handleClipboardUpdate);

        return () => {
            clipboardService.removeEventListener('update', handleClipboardUpdate);
            clipboardService.stopMonitoring();
            clipboardDatabase.close();
        };
    }, [refreshItems, handleClipboardUpdate]);

    useEffect(() => {
        if (isInitialized) {
            refreshItems();
        }
    }, [showFavoritesOnly, searchQuery, isInitialized, refreshItems]);

    const handleCopy = async (item: ClipboardEntry) => {
        await clipboardService.copyToClipboard(item);
        await refreshItems();
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

    return (
        <div className="flex flex-col gap-4 w-full max-w-3xl">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Clipboard History</h2>
                <div className="flex gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={showFavoritesOnly ? "default" : "outline"}
                                size="icon"
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            >
                                <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {showFavoritesOnly ? 'Show all items' : 'Show favorites only'}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleClearHistory}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear history (keeps favorites)</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <Command className="rounded-lg border shadow-md w-full">
                <CommandInput
                    placeholder="Search clipboard history..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />

                <CommandList className="max-h-[500px] overflow-auto">
                    {items.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                            <CommandEmpty>No clipboard items found.</CommandEmpty>
                            {searchQuery ? "No matching items" : "Clipboard history is empty"}
                        </div>
                    ) : (
                        <CommandGroup>
                            {items.map((item) => (
                                <ClipboardItem
                                    key={item.id}
                                    item={item}
                                    onCopy={handleCopy}
                                    onToggleFavorite={handleToggleFavorite}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </div>
    );
};

export default ClipboardManager;