import { useEffect, useState } from 'react';
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';
import { Power } from 'lucide-react';

import { SettingToggle } from '@/components/settings/setting-toggle';
import clipboardDatabase from '@/lib/db';
import { DEFAULT_AUTO_START, SETTING_KEYS } from '@/types/settings';

export function AutoStartToggle() {
  const [autoStart, setAutoStart] = useState<boolean>(false);

  useEffect(() => {
    const loadAutoStartSetting = async () => {
      const setting = await clipboardDatabase.getSetting(
        SETTING_KEYS?.AUTO_START,
        DEFAULT_AUTO_START
      );
      const systemEnabled = await isEnabled();
      setAutoStart(setting && systemEnabled);
    };

    loadAutoStartSetting();
  }, []);

  const handleAutoStartToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await enable();
      } else {
        await disable();
      }

      await clipboardDatabase.setSetting(SETTING_KEYS.AUTO_START, checked);
      setAutoStart(checked);
    } catch (error) {
      console.error('Failed to toggle autostart:', error);
    }
  };

  return (
    <SettingToggle
      icon={Power}
      title='Auto Start'
      description='Start with system on boot'
      checked={autoStart}
      onCheckedChange={handleAutoStartToggle}
    />
  );
}
