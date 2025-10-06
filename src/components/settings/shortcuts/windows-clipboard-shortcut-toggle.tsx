import { useEffect, useState } from 'react';
import { AlertCircle, KeyboardOff, ShieldAlert } from 'lucide-react';

import { SettingToggle } from '@/components/settings/setting-toggle';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isWindows } from '@/util/platform';
import { safeInvoke } from '@/lib/utils';

export function WindowsClipboardShortcutToggle() {
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [status, adminStatus] = await Promise.all([
        safeInvoke<boolean>('get_windows_shortcut_status'),
        safeInvoke<boolean>('is_admin'),
      ]);

      setIsDisabled(status);
      setIsAdmin(adminStatus);
      setMessage(null);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setMessage('Failed to load shortcut status');
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (!isAdmin) return;

    setMessage(null);
    const previousState = isDisabled;
    setIsDisabled(checked);

    try {
      await safeInvoke('toggle_windows_shortcut', { disable: checked });

      if (checked) {
        setMessage('Win+V enabled. Sign out or restart for changes to take effect.');
      } else {
        setMessage('Win+V disabled. Sign out or restart for changes to take effect.');
      }
    } catch (err) {
      console.error('Failed to toggle Windows shortcut:', err);
      setIsDisabled(previousState);
      setMessage((err as string) || 'Failed to toggle Windows shortcut');
    }
  };

  if (!isWindows()) {
    return null;
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <div className='flex-1'>
          <SettingToggle
            icon={KeyboardOff}
            title='Disable Win+V'
            description='Disable default Windows clipboard shortcut'
            checked={isDisabled}
            onCheckedChange={handleToggle}
            disabled={!isAdmin}
          />
        </div>
        {!isAdmin && <ShieldAlert className='h-4 w-4 text-yellow-500' />}
      </div>
      {!isAdmin && (
        <Alert variant='default'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='text-xs'>
            Administrator privileges required. Restart app as admin to enable.
          </AlertDescription>
        </Alert>
      )}
      {message && isAdmin && (
        <Alert variant='default'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='text-xs'>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
