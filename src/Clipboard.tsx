import { useState, useEffect } from 'react';
import { onTextUpdate, startListening, readText } from 'tauri-plugin-clipboard-api';

import { useRef } from 'react';

const Clipboard = () => {
    const [clipboardItems, setClipboardItems] = useState<string[]>([]);
    const clipboardSet = useRef(new Set<string>());

    useEffect(() => {
        readText().then(text => {
            if (text) setClipboardItems([text]);
        });

        let unlistenText: () => void;
        let unlistenMonitor: () => Promise<void>;

        onTextUpdate((newText) => {
            setClipboardItems(prev => {
                if (clipboardSet.current.has(newText)) return prev;
                clipboardSet.current.add(newText);
                return [newText, ...prev];
            });
        }).then(unlisten => {
            unlistenText = unlisten;
        });

        startListening().then(unlisten => {
            unlistenMonitor = unlisten;
        });

        return () => {
            if (unlistenText) unlistenText();
            if (unlistenMonitor) unlistenMonitor();
        };
    }, []);

    return (
        <div>
            <h3>Clipboard History</h3>
            <ul>
                {clipboardItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

export default Clipboard;