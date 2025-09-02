import {useEffect, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {invoke} from '@tauri-apps/api/core';
import {Keyboard} from 'lucide-react';

export function ToggleShortcut() {
    const [isCapturing, setIsCapturing] = useState(false);
    const [currentShortcut, setCurrentShortcut] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchCurrentShortcut() {
            try {
                const [modifiers, key] = await invoke('get_current_shortcut');
                setCurrentShortcut(formatShortcutForDisplay(modifiers.split('+'), key));
            } catch (err) {
                console.error('Failed to get current shortcut:', err);
            }
        }

        fetchCurrentShortcut();
    }, []);

    const formatShortcutForDisplay = (modifiers, key) => {
        const isMac = navigator.platform.includes('Mac');
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
        <div className="p-4 border rounded-lg dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
                <Keyboard className="h-5 w-5"/>
                <span className="font-medium">Toggle Shortcut</span>
            </div>

            <button
                className={`px-4 py-3 w-full text-left border rounded-md flex items-center justify-between
          ${isCapturing
                    ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 dark:border-gray-700'}`}
                onClick={() => setIsCapturing(true)}
                type="button"
            >
                <span>{isCapturing ? 'Press keys now...' : currentShortcut || 'Click to set shortcut'}</span>
                {isCapturing && (
                    <span className="text-xs text-gray-500">ESC to cancel</span>
                )}
            </button>

            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}