import { MouseEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useClipboardContext } from '@/clipboard-context';
import { ClipboardEntry } from '@/types/clipboard';
import clipboardService from '@/lib/clipboard-service';
import clipboardDatabase from '@/lib/db';
import Logger from '@/util/logger';
import { SETTING_KEYS } from '@/types/settings';
import { safeInvoke } from '@/lib/utils';
import { DEFAULT_LAUNCH_SHORTCUT, ShortcutConfig } from '@/types/shortcuts';

export const useClipboardActions = () => {
  const { state, dispatch } = useClipboardContext();
  const { selectedClipboardEntry } = state;
  const queryClient = useQueryClient();

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

  /*          Shortcuts          */
  const applyShortcut = async (shortcut: ShortcutConfig) => {
    await safeInvoke('change_shortcut', {
      modifiers: shortcut.modifiers,
      key: shortcut.key,
    });
    dispatch({ type: 'SET_SHORTCUT', payload: shortcut });
  };

  const updateShortcut = async (shortcut: ShortcutConfig) => {
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
      const savedShortcut = await clipboardDatabase.getSetting<ShortcutConfig>(
        SETTING_KEYS.TOGGLE_SHORTCUT,
        DEFAULT_LAUNCH_SHORTCUT
      );
      await applyShortcut(savedShortcut);
    } catch (error) {
      Logger.error('Failed to initialize shortcut:', error);
    }
  };

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
