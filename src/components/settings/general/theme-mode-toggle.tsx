import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/components/theme-provider';
import { SettingToggle } from '@/components/settings/setting-toggle';

export function ThemeModeToggle() {
  const { mode, setMode } = useTheme();

  const Icon = mode === 'dark' ? Moon : Sun;

  return (
    <SettingToggle
      icon={Icon}
      title='Dark Mode'
      description='Switch between light and dark themes'
      checked={mode === 'dark'}
      onCheckedChange={(checked) => setMode(checked ? 'dark' : 'light')}
    />
  );
}
