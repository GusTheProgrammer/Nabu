import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { THEMES } from '@/types/theme';

export function ColorThemeToggle() {
  const { colorTheme, setColorTheme, mode } = useTheme();

  const currentTheme = THEMES.find((t) => t.name === colorTheme) || THEMES[0];

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const currentColors = isDark ? currentTheme.darkColors : currentTheme.lightColors;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='justify-start gap-3'>
          <div className='flex gap-1'>
            {currentColors.map((color, index) => (
              <div key={index} className='w-4 h-4 rounded-sm' style={{ backgroundColor: color }} />
            ))}
          </div>
          <span>{currentTheme.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        {THEMES.map((theme) => {
          const themeColors = isDark ? theme.darkColors : theme.lightColors;

          return (
            <DropdownMenuItem
              key={theme.name}
              onClick={() => setColorTheme(theme.name)}
              className='flex items-center justify-between cursor-pointer'
            >
              <div className='flex items-center gap-3'>
                <div className='flex gap-1'>
                  {themeColors.map((color, index) => (
                    <div
                      key={index}
                      className='w-4 h-4 rounded-sm'
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span>{theme.label}</span>
              </div>
              {colorTheme === theme.name && <Check className='h-4 w-4' />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
