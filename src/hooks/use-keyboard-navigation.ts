import { useCallback, useEffect } from 'react';

import { useClipboardContext } from '@/clipboard-context';
import { useClipboardActions } from '@/hooks/use-clipboard-actions';
import { useSetting } from '@/hooks/use-setting';
import {
  DEFAULT_KEYBOARD_NAVIGATION,
  KeyboardNavigationSettings,
  SETTING_KEYS,
} from '@/types/settings';

interface UseKeyboardNavigationProps {
  clipboardEntries: any[];
  rowVirtualizer: any;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isEnabled?: boolean;
}

export default function useKeyboardNavigation({
  clipboardEntries,
  rowVirtualizer,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isEnabled = true,
}: UseKeyboardNavigationProps) {
  const { state, dispatch } = useClipboardContext();
  const { pasteEntry, copyEntry, deleteEntry, toggleEntryFavorite } = useClipboardActions();
  const { value: settings, isLoaded } = useSetting<KeyboardNavigationSettings>(
    SETTING_KEYS.KEYBOARD_NAVIGATION,
    DEFAULT_KEYBOARD_NAVIGATION
  );

  const getSelectedIndex = () => {
    if (!state.selectedClipboardEntry) return -1;
    return clipboardEntries.findIndex((entry) => entry.id === state.selectedClipboardEntry?.id);
  };

  const selectAndScroll = (index: number) => {
    const entry = clipboardEntries[index];
    if (!entry) return;

    dispatch({ type: 'SELECT_CLIPBOARD_ENTRY', payload: entry });
    rowVirtualizer.scrollToIndex(index, { align: 'auto', behavior: 'auto' });
  };

  const prefetchIfNeeded = (index: number) => {
    const isNearEnd = index >= clipboardEntries.length - settings.prefetchThreshold;
    if (isNearEnd && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const navigateNext = () => {
    const currentIndex = getSelectedIndex();
    const isAtEnd = currentIndex >= clipboardEntries.length - 1;

    prefetchIfNeeded(currentIndex);

    if (isAtEnd) {
      if (!hasNextPage) selectAndScroll(0);
    } else {
      selectAndScroll(currentIndex + 1);
    }
  };

  const navigatePrevious = () => {
    const currentIndex = getSelectedIndex();

    if (currentIndex <= 0) {
      selectAndScroll(clipboardEntries.length - 1);
    } else {
      selectAndScroll(currentIndex - 1);
    }
  };

  const navigatePageDown = () => {
    const currentIndex = getSelectedIndex();
    const nextIndex = Math.min(currentIndex + settings.pageSize, clipboardEntries.length - 1);

    prefetchIfNeeded(nextIndex);
    selectAndScroll(nextIndex);
  };

  const navigatePageUp = () => {
    const currentIndex = getSelectedIndex();
    const prevIndex = Math.max(currentIndex - settings.pageSize, 0);

    selectAndScroll(prevIndex);
  };

  const handlePaste = () => {
    if (state.selectedClipboardEntry) {
      pasteEntry(state.selectedClipboardEntry);
    }
  };

  const handleCopy = () => {
    if (state.selectedClipboardEntry) {
      copyEntry(state.selectedClipboardEntry);
    }
  };

  const handleDelete = () => {
    if (state.selectedClipboardEntry) {
      deleteEntry(state.selectedClipboardEntry.id);
    }
  };

  const handleToggleFavorite = () => {
    if (state.selectedClipboardEntry) {
      toggleEntryFavorite(state.selectedClipboardEntry.id);
    }
  };

  const matchesShortcut = (event: KeyboardEvent, modifiers: string[], key: string) => {
    const eventModifiers: string[] = [];
    if (event.ctrlKey) eventModifiers.push('ctrl');
    if (event.shiftKey) eventModifiers.push('shift');
    if (event.altKey) eventModifiers.push('alt');
    if (event.metaKey) eventModifiers.push('meta');

    const modifiersMatch =
      modifiers.length === eventModifiers.length &&
      modifiers.every((mod) => eventModifiers.includes(mod));

    return modifiersMatch && event.code === key;
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled || !isLoaded || clipboardEntries.length === 0) return;

      const { shortcuts } = settings;

      const actionMap: Record<string, () => void> = {
        navigateNext,
        navigatePrevious,
        navigatePageDown,
        navigatePageUp,
        pasteEntry: handlePaste,
        copyEntry: handleCopy,
        deleteEntry: handleDelete,
        toggleFavorite: handleToggleFavorite,
      };

      for (const [actionKey, action] of Object.entries(actionMap)) {
        const shortcut = shortcuts[actionKey];
        if (shortcut && matchesShortcut(event, shortcut.modifiers, shortcut.key)) {
          event.preventDefault();
          action();
          return;
        }
      }
    },
    [
      isEnabled,
      isLoaded,
      settings,
      clipboardEntries,
      state.selectedClipboardEntry,
      hasNextPage,
      isFetchingNextPage,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (clipboardEntries.length > 0 && !state.selectedClipboardEntry) {
      dispatch({ type: 'SELECT_CLIPBOARD_ENTRY', payload: clipboardEntries[0] });
    }
  }, [clipboardEntries.length]);

  return {
    settings,
    isLoaded,
  };
}
