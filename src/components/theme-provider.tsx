import { createContext, useContext, useEffect, useState } from 'react';

import { type ColorTheme, DEFAULT_THEME, THEMES } from '@/types/theme';

type Mode = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultMode?: Mode;
  defaultColorTheme?: ColorTheme;
  modeStorageKey?: string;
  themeStorageKey?: string;
};

type ThemeProviderState = {
  mode: Mode;
  colorTheme: ColorTheme;
  setMode: (mode: Mode) => void;
  setColorTheme: (theme: ColorTheme) => void;
};

const initialState: ThemeProviderState = {
  mode: 'system',
  colorTheme: DEFAULT_THEME,
  setMode: () => null,
  setColorTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultMode = 'system',
  defaultColorTheme = DEFAULT_THEME,
  modeStorageKey = 'vite-ui-mode',
  themeStorageKey = 'vite-ui-color-theme',
  ...props
}: ThemeProviderProps) {
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem(modeStorageKey) as Mode) || defaultMode
  );

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem(themeStorageKey) as ColorTheme;
    return THEMES.find((t) => t.name === stored) ? stored : defaultColorTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(mode);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;

    if (colorTheme) {
      root.setAttribute('data-theme', colorTheme);
    } else {
      root.removeAttribute('data-theme');
    }
  }, [colorTheme]);

  const value = {
    mode,
    colorTheme,
    setMode: (mode: Mode) => {
      localStorage.setItem(modeStorageKey, mode);
      setMode(mode);
    },
    setColorTheme: (theme: ColorTheme) => {
      localStorage.setItem(themeStorageKey, theme);
      setColorTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
