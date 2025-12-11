type ShortcutHandler = () => void;

export interface RegisteredShortcut {
  key: string;
  modifiers: string[];
  handler: ShortcutHandler;
  enabled: boolean;
}

export class ShortcutManager {
  private shortcuts: Map<string, RegisteredShortcut> = new Map();

  register(id: string, config: RegisteredShortcut) {
    this.shortcuts.set(id, config);
  }

  unregister(id: string) {
    this.shortcuts.delete(id);
  }

  updateConfig(id: string, config: Partial<RegisteredShortcut>) {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      this.shortcuts.set(id, { ...shortcut, ...config });
    }
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    const isInputFocused =
      document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

    if (isInputFocused) {
      if (event.code === 'Escape') {
        event.preventDefault();
        (document.activeElement as HTMLElement)?.blur();
        return true;
      }
      return false;
    }

    const eventModifiers: string[] = [];
    if (event.ctrlKey) eventModifiers.push('ctrl');
    if (event.shiftKey) eventModifiers.push('shift');
    if (event.altKey) eventModifiers.push('alt');
    if (event.metaKey) eventModifiers.push('meta');

    for (const shortcut of this.shortcuts.values()) {
      if (!shortcut.enabled) continue;

      const modifiersMatch =
        shortcut.modifiers.length === eventModifiers.length &&
        shortcut.modifiers.every((mod) => eventModifiers.includes(mod));

      if (modifiersMatch && event.code === shortcut.key) {
        event.preventDefault();
        shortcut.handler();
        return true;
      }
    }

    return false;
  }
}
