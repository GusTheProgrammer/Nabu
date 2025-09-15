import {Copy, Star, Trash} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {useClipboardActions} from '@/hooks/use-clipboard-actions.ts';

const ClipboardActions = () => {
    const {
        handleCopy,
        handleClearHistory,
        handleToggleFavoritesFilter,
        selectedClipboardEntry,
        showFavoritesOnly
    } = useClipboardActions();

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={handleClearHistory}
                    title="Clear clipboard history (favorites will be kept)"
                >
                    <Trash className="h-4 w-4"/>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectedClipboardEntry && handleCopy(selectedClipboardEntry)}
                    disabled={!selectedClipboardEntry}
                    className={cn(
                        'h-8 w-8 p-0 transition-colors',
                        selectedClipboardEntry && 'text-primary hover:bg-accent hover:text-primary/90'
                    )}
                    title={selectedClipboardEntry ? 'Copy selected entry' : 'Select an entry to copy'}
                >
                    <Copy className="h-4 w-4"/>
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavoritesFilter}
                    className={cn(
                        'h-8 w-8 p-0 hover:bg-accent',
                        showFavoritesOnly
                            ? 'text-yellow-400 hover:text-yellow-300'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                    title={showFavoritesOnly ? 'Show all entries' : 'Show favorites only'}
                >
                    <Star className={cn(
                        'h-4 w-4',
                        showFavoritesOnly ? 'fill-yellow-400' : ''
                    )}/>
                </Button>
            </div>
        </div>
    );
};

export default ClipboardActions;