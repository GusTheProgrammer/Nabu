import { useClipboardContext } from '@/clipboard-context';
import { useClipboardActions } from '@/hooks/use-clipboard-actions';
import { useSetting } from '@/hooks/use-setting';
import { DEFAULT_KEYBOARD_NAVIGATION, SETTING_KEYS } from '@/types/settings';
import { ShortcutRecorder } from '@/components/settings/shortcuts/shortcut-recorder';
import { WindowsClipboardShortcutToggle } from '@/components/settings/shortcuts/windows-clipboard-shortcut-toggle';
import { DEFAULT_SHORTCUTS } from '@/types/shortcuts';

export function KeyboardNavigationShortcuts() {
  const { state } = useClipboardContext();
  const { currentShortcut } = state;
  const { updateShortcut } = useClipboardActions();

  const {
    value: navSettings,
    setValue: setNavSettings,
    isLoaded,
  } = useSetting(SETTING_KEYS.KEYBOARD_NAVIGATION, DEFAULT_KEYBOARD_NAVIGATION, 300);

  const handleLaunchShortcutChange = async (modifiers: string[], key: string) => {
    await updateShortcut({ modifiers, key, label: DEFAULT_SHORTCUTS.launch.label });
  };

  const handleNavShortcutChange = async (shortcutKey: string, modifiers: string[], key: string) => {
    setNavSettings({
      ...navSettings,
      shortcuts: {
        ...navSettings.shortcuts,
        [shortcutKey]: { ...navSettings.shortcuts[shortcutKey], modifiers, key },
      },
    });
  };

  if (!isLoaded) {
    return <div className='text-sm text-muted-foreground'>Loading shortcuts...</div>;
  }

  return (
    <div className='space-y-4'>
      <ShortcutRecorder
        modifiers={currentShortcut.modifiers}
        keyCode={currentShortcut.key}
        onShortcutChange={handleLaunchShortcutChange}
        label={DEFAULT_SHORTCUTS.launch.label}
      />

      {Object.entries(DEFAULT_SHORTCUTS)
        .filter(([key]) => key !== 'launch')
        .map(([key, config]) => {
          const shortcut = navSettings.shortcuts[key];

          return (
            <ShortcutRecorder
              key={key}
              modifiers={shortcut?.modifiers || config.modifiers}
              keyCode={shortcut?.key || config.key}
              onShortcutChange={async (modifiers, keyCode) => {
                await handleNavShortcutChange(key, modifiers, keyCode);
              }}
              label={config.label}
            />
          );
        })}

      <div className='pt-2'>
        <WindowsClipboardShortcutToggle />
      </div>
    </div>
  );
}
