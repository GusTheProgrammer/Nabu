import { useEffect } from 'react';

import clipboardService from '@/lib/clipboard-service';
import clipboardDatabase from '@/lib/db';
import Logger from '@/util/logger';
import { useClipboardActions } from '@/hooks/use-clipboard-actions';

export default function useClipboardInit() {
  const { initializeShortcut, invalidateClipboard } = useClipboardActions();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeShortcut();
        await clipboardService.startMonitoring();
      } catch (error) {
        Logger.error('Failed to initialize clipboard context:', error);
      }
    };

    initialize();
    clipboardService.addEventListener('update', invalidateClipboard);

    return () => {
      clipboardService.removeEventListener('update', invalidateClipboard);
      clipboardService.stopMonitoring();
      clipboardDatabase.close();
    };
  }, []);
}
