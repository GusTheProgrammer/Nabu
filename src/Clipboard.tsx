import { useState, useEffect } from 'react';
import { onTextUpdate, startListening, readText } from 'tauri-plugin-clipboard-api';

const Clipboard = () => {
    const [clipboardItems, setClipboardItems] = useState<string[]>([]);

    useEffect(() => {
        readText().then(text => {
            if (text) setClipboardItems([text]);
        });

        let unlistenText: () => void;
        let unlistenMonitor: () => Promise<void>;

        onTextUpdate((newText) => {
            setClipboardItems(prev => {
                if (prev[0] === newText) return prev;
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