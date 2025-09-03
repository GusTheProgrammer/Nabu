"use client"

import { Search, Copy, Pin, FileText, Link, Mail, ImageIcon, File, Hash, Minus, Square, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import React, { useEffect, useState, useCallback } from 'react';
import { cn } from "@/lib/utils"
import clipboardDatabase from '@/lib/db';
import clipboardService from '@/lib/clipboard-service';
import { ClipboardItem } from '@/components/clipboard/clipboard-item';
import { ClipboardEntry } from '@/types/clipboard';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// import { ToggleShortcut } from '@/components/settings/toggle-shortcut.tsx';

const ClipboardManager: React.FC = () => {
    const [items, setItems] = useState<ClipboardEntry[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<ClipboardEntry | null>(null)

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
        <div>
            <div className="h-[600px] bg-black">
                <ResizablePanelGroup direction="horizontal">
                    {/* Left Panel - Clipboard List */}
                    <ResizablePanel
                        defaultSize={40}
                        minSize={20}
                        className="bg-gray-900/50 border-r border-gray-700/50 flex flex-col"
                    >
                        {/* Search Header */}
                        <div className="p-4 border-b border-gray-700/50">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Type to search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-gray-700/50"
                                    >
                                        ⭐
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                                    >
                                        ⋯
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                                    >
                                        📋
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                                    >
                                        📄
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Entries List */}
                        <div className="flex-1 overflow-y-auto">
                            {items.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors",
                                        selectedEntry?.id === entry.id && "bg-gray-700/50",
                                    )}
                                    onClick={() => {setSelectedEntry(entry); handleCopy(entry); console.log("Entry clicked:", entry);}}
                                >
                                    <div className="flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-gray-200 text-sm truncate">{entry.preview}</div>
                                    </div>
                                    <div className="flex-shrink-0">
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Navigation */}
                        <div className="p-4 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-4">
                                <span>↑ ↓ Navigate</span>
                            </div>
                            <div>
                                <span>⌘ Paste to Sketch</span>
                            </div>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-1 bg-gray-700/50 hover:bg-gray-600 transition-colors" />

                    {/* Right Panel - Entry Details */}
                    <ResizablePanel
                        defaultSize={30}
                        minSize={0}
                        maxSize={60}
                        collapsible={true}
                        className="bg-gray-900/30 flex flex-col"
                    >
                        {selectedEntry ? (
                            <>
                                {/* Selected Entry Content */}
                                <div className="flex-[0.65] overflow-y-auto">
                                    <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                                        <div className="text-right text-xs text-gray-400">Preview</div>
                                    </div>

                                    <div className="p-6">
                                        <div className="text-gray-200 text-lg font-mono break-all leading-relaxed">
                                            {selectedEntry.preview}
                                        </div>
                                    </div>
                                </div>

                                {/* Entry Metadata */}
                                <div className="flex-[0.35] p-6 border-t border-gray-700/50 bg-gray-900/40">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Application</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                                                <span className="text-gray-200 text-sm">{selectedEntry.metadata}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Source URL</span>
                                            <span className="text-gray-200 text-sm">
                                                {selectedEntry.source_url}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Type</span>
                                            <span className="text-gray-200 text-sm capitalize">
                                                {selectedEntry.contentType || "Text"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Copy time</span>
                                            <span className="text-gray-200 text-sm">
                                                {new Date(selectedEntry.last_copied_at).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Characters</span>
                                            <span className="text-gray-200 text-sm">
                                                {selectedEntry.preview?.length || 0}
                                            </span>
                                        </div>

                                        <div className="pt-4 border-t border-gray-700/50">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCopy(selectedEntry)}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <Copy className="h-3 w-3 mr-2" />
                                                    Copy
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => handleToggleFavorite(selectedEntry.id, e)}
                                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                >
                                                    <Pin className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">Select an entry to view details</p>
                                </div>
                            </div>
                        )}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
export default ClipboardManager;