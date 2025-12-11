import { createContext, ReactNode, useCallback, useContext, useEffect, useRef } from 'react';

import { ShortcutManager } from '@/lib/shortcut-manager';

const manager = new ShortcutManager();

const KeyboardContext = createContext<ShortcutManager>(manager);

export function KeyboardProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      manager.handleKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <KeyboardContext.Provider value={manager}>{children}</KeyboardContext.Provider>;
}

export function useKeyboardContext() {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboardContext must be used within a KeyboardProvider');
  }
  return context;
}

type ShortcutHandler = () => void;

export function useKeyboardShortcut(
  key: string,
  handler: ShortcutHandler,
  options: {
    modifiers?: string[];
    enabled?: boolean;
  } = {}
) {
  const { modifiers = [], enabled = true } = options;
  const manager = useKeyboardContext();
  const id = useRef(`shortcut-${Math.random()}`).current;
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const stableHandler = useCallback(() => {
    handlerRef.current();
  }, []);

  useEffect(() => {
    manager.register(id, { key, modifiers, handler: stableHandler, enabled });
    return () => manager.unregister(id);
  }, [manager, id, key, modifiers.join(','), stableHandler, enabled]);
}
