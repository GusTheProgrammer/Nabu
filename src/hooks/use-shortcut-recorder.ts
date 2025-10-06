import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface ShortcutRecorderResult {
  isCapturing: boolean;
  error: string;
  startCapture: () => void;
  cancelCapture: () => void;
}

export function useShortcutRecorder(
  onShortcutCaptured: (modifiers: string[], key: string) => Promise<void> | void,
  timeout: number = 5000
): ShortcutRecorderResult {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');

  useHotkeys(
    '*',
    async (event) => {
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

      const isModifierKey =
        event.code.includes('Control') ||
        event.code.includes('Shift') ||
        event.code.includes('Alt') ||
        event.code.includes('Meta') ||
        event.code.includes('OS');

      if (isModifierKey) return;

      setIsCapturing(false);

      try {
        await onShortcutCaptured(modifiers, event.code);
        setError('');
      } catch (err) {
        setError(String(err));
      }
    },
    {
      enabled: isCapturing,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    }
  );

  useEffect(() => {
    if (!isCapturing) return;
    const timeoutId = setTimeout(() => setIsCapturing(false), timeout);
    return () => clearTimeout(timeoutId);
  }, [isCapturing, timeout]);

  return {
    isCapturing,
    error,
    startCapture: () => setIsCapturing(true),
    cancelCapture: () => setIsCapturing(false),
  };
}
