import { MouseEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useClipboardContext } from '@/clipboard-context';
import { useKeyboardShortcut } from '@/context/keyboard-context';
import { useSetting } from '@/hooks/use-setting';
import { ClipboardEntry } from '@/types/clipboard';
import clipboardService from '@/lib/clipboard-service';
import clipboardDatabase from '@/lib/db';
import Logger from '@/util/logger';
import {
  DEFAULT_KEYBOARD_NAVIGATION,
  KeyboardNavigationSettings,
  SETTING_KEYS,
} from '@/types/settings';
import { safeInvoke } from '@/lib/utils';
import { DEFAULT_SHORTCUTS, type ShortcutDefinition } from '@/types/shortcuts';

export const useClipboardActions = () => {
  const { state, dispatch } = useClipboardContext();
  const { selectedClipboardEntry } = state;
  const queryClient = useQueryClient();

  const { value: settings } = useSetting<KeyboardNavigationSettings>(
    SETTING_KEYS.KEYBOARD_NAVIGATION,
    DEFAULT_KEYBOARD_NAVIGATION
  );

  const invalidateClipboard = async () => {
    await queryClient.invalidateQueries({ queryKey: ['clipboardEntries'] });
  };

  const copyEntry = async (entry: ClipboardEntry) => {
    try {
      await clipboardService.copyToClipboard(entry);
      await invalidateClipboard();
    } catch (error) {
      Logger.error(`Failed to copy entry with ID ${entry.id}:`, error);
    }
  };

  const selectOrCopyEntry = async (entry: ClipboardEntry) => {
    if (selectedClipboardEntry?.id === entry.id) {
      await copyEntry(entry);
    } else {
      dispatch({ type: 'SELECT_CLIPBOARD_ENTRY', payload: entry });
    }
  };

  const pasteEntry = async (entry: ClipboardEntry) => {
    await clipboardService.pasteEntry(entry);
  };

  const toggleEntryFavorite = async (id: number, event?: MouseEvent) => {
    event?.stopPropagation();
    try {
      await clipboardDatabase.toggleFavorite(id);
      await invalidateClipboard();
    } catch (error) {
      Logger.error(`Failed to toggle favorite for entry with ID ${id}:`, error);
    }
  };

  const deleteEntry = async (id: number, event?: MouseEvent) => {
    event?.stopPropagation();
    try {
      await clipboardDatabase.deleteClipboardEntry(id);
      await invalidateClipboard();
    } catch (error) {
      Logger.error(`Failed to delete entry with ID ${id}:`, error);
    }
  };

  const toggleFavoritesFilter = () => {
    dispatch({ type: 'TOGGLE_FAVORITES_ONLY' });
  };

  const applyShortcut = async (shortcut: ShortcutDefinition) => {
    await safeInvoke('change_shortcut', {
      modifiers: shortcut.modifiers,
      key: shortcut.key,
    });
    dispatch({ type: 'SET_SHORTCUT', payload: shortcut });
  };

  const updateShortcut = async (shortcut: ShortcutDefinition) => {
    try {
      await clipboardDatabase.setSetting(SETTING_KEYS.TOGGLE_SHORTCUT, shortcut);
      await applyShortcut(shortcut);
    } catch (error) {
      Logger.error('Failed to update shortcut:', error);
      throw error;
    }
  };

  const initializeShortcut = async () => {
    try {
      const savedShortcut = await clipboardDatabase.getSetting<ShortcutDefinition>(
        SETTING_KEYS.TOGGLE_SHORTCUT,
        DEFAULT_SHORTCUTS.launch
      );
      await applyShortcut(savedShortcut);
    } catch (error) {
      Logger.error('Failed to initialize shortcut:', error);
    }
  };

  useKeyboardShortcut(
    settings.shortcuts.pasteEntry.key,
    () => selectedClipboardEntry && pasteEntry(selectedClipboardEntry),
    {
      modifiers: settings.shortcuts.pasteEntry.modifiers,
      enabled: !!selectedClipboardEntry,
    }
  );

  useKeyboardShortcut(
    settings.shortcuts.copyEntry.key,
    () => selectedClipboardEntry && copyEntry(selectedClipboardEntry),
    {
      modifiers: settings.shortcuts.copyEntry.modifiers,
      enabled: !!selectedClipboardEntry,
    }
  );

  useKeyboardShortcut(
    settings.shortcuts.deleteEntry.key,
    () => selectedClipboardEntry && deleteEntry(selectedClipboardEntry.id),
    {
      modifiers: settings.shortcuts.deleteEntry.modifiers,
      enabled: !!selectedClipboardEntry,
    }
  );

  useKeyboardShortcut(
    settings.shortcuts.toggleFavorite.key,
    () => selectedClipboardEntry && toggleEntryFavorite(selectedClipboardEntry.id),
    {
      modifiers: settings.shortcuts.toggleFavorite.modifiers,
      enabled: !!selectedClipboardEntry,
    }
  );

  return {
    invalidateClipboard,
    copyEntry,
    selectOrCopyEntry,
    pasteEntry,
    toggleEntryFavorite,
    deleteEntry,
    toggleFavoritesFilter,
    initializeShortcut,
    updateShortcut,
  };
};
