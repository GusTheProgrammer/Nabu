import {useEffect, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {invoke} from '@tauri-apps/api/core';
import {platform} from '@tauri-apps/plugin-os';

import {Button} from '@/components/ui/button';
import Logger from '@/util/logger.ts';

export function ToggleShortcut() {
    const [isCapturing, setIsCapturing] = useState(false);
    const [currentShortcut, setCurrentShortcut] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchCurrentShortcut() {
            try {
                const [modifiers, key] = await invoke('get_current_shortcut') as [string, string];
                setCurrentShortcut(formatShortcutForDisplay(modifiers.split('+'), key));
            } catch (err) {
                Logger.error('Failed to get current shortcut:', err);
            }
        }

        fetchCurrentShortcut();
    }, []);

    const formatShortcutForDisplay = (modifiers: string[], key: string) => {
        const isMac = platform() === 'macos';
        let displayText = '';

        modifiers.forEach(mod => {
            if (mod === 'ctrl') displayText += isMac ? '⌃+' : 'Ctrl+';
            if (mod === 'alt') displayText += isMac ? '⌥+' : 'Alt+';
            if (mod === 'shift') displayText += isMac ? '⇧+' : 'Shift+';
            if (mod === 'meta') displayText += isMac ? '⌘+' : 'Win+';
        });

        let keyDisplay = key.replace('Key', '').replace('Digit', '');

        if (key.startsWith('Arrow')) {
            keyDisplay = key.replace('Arrow', '');
        }

        displayText += keyDisplay;
        return displayText;
    };

    useHotkeys('*', async (event) => {
        if (!isCapturing) return;
        event.preventDefault();

        if (event.code === 'Escape') {
            setIsCapturing(false);
            return;
        }

        const modifiers = [];
        if (event.ctrlKey) modifiers.push('ctrl');
        if (event.shiftKey) modifiers.push('shift');
        if (event.altKey) modifiers.push('alt');
        if (event.metaKey) modifiers.push('meta');

        const isModifierKey = event.code.includes('Control') ||
            event.code.includes('Shift') ||
            event.code.includes('Alt') ||
            event.code.includes('Meta') ||
            event.code.includes('OS');

        if (isModifierKey) {
            return;
        }

        if (modifiers.length === 0) return;

        setIsCapturing(false);

        try {
            await invoke('change_shortcut', {modifiers, key: event.code});
            setCurrentShortcut(formatShortcutForDisplay(modifiers, event.code));
            setError('');
        } catch (err) {
            setError(String(err));
        }
    }, {
        enabled: isCapturing,
        enableOnFormTags: true,
        enableOnContentEditable: true
    });

    useEffect(() => {
        if (!isCapturing) return;
        const timeoutId = setTimeout(() => setIsCapturing(false), 5000);
        return () => clearTimeout(timeoutId);
    }, [isCapturing]);

    return (
        <div className="space-y-4">
            <Button
                variant="outline"
                className={`w-full justify-between h-auto py-3 px-4 font-normal ${
                    isCapturing ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10' : 'bg-muted/30 hover:bg-muted/50'
                }`}
                onClick={() => setIsCapturing(true)}
                type="button"
            >
                <span className="font-mono text-sm">
                  {isCapturing ? 'Press keys now...' : currentShortcut || 'Click to set shortcut'}
                </span>
                {isCapturing && <span className="text-xs text-muted-foreground">ESC to cancel</span>}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}