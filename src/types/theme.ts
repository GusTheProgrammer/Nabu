export interface ThemeConfig {
  name: string;
  label: string;
  lightColors: string[];
  darkColors: string[];
}

export const THEMES: ThemeConfig[] = [
  {
    name: 'claymorphism',
    label: 'Claymorphism',
    lightColors: ['#6366f1', '#f3e5f5', '#d6d3d1', '#d6d3d1'],
    darkColors: ['#818cf8', '#484441', '#3a3633', '#3a3633'],
  },
  {
    name: 'darkmatter',
    label: 'Dark Matter',
    lightColors: ['#d87943', '#eeeeee', '#527575', '#e5e7eb'],
    darkColors: ['#e78a53', '#333333', '#5f8787', '#222222'],
  },
  {
    name: 'modern-minimal',
    label: 'Modern Minimal',
    lightColors: ['#3b82f6', '#e0f2fe', '#f3f4f6', '#e5e7eb'],
    darkColors: ['#3b82f6', '#1e3a8a', '#1e3a8a', '#404040'],
  },
  {
    name: 'supabase',
    label: 'Supabase',
    lightColors: ['#72e3ad', '#ededed', '#fdfdfd', '#dfdfdf'],
    darkColors: ['#006239', '#313131', '#242424', '#292929'],
  },
  {
    name: 'tangerine',
    label: 'Tangerine',
    lightColors: ['#e05d38', '#d6e4f0', '#f3f4f6', '#dcdfe2'],
    darkColors: ['#e05d38', '#2a3656', '#2a303e', '#3d4354'],
  },
  {
    name: 'twitter',
    label: 'Twitter',
    lightColors: ['#1e9df1', '#E3ECF6', '#0f1419', '#e1eaef'],
    darkColors: ['#1c9cf0', '#061622', '#f0f3f4', '#242628'],
  },
  {
    name: 'vercel',
    label: 'Vercel',
    lightColors: ['#000000', '#ebebeb', '#ebebeb', '#e4e4e4'],
    darkColors: ['#ffffff', '#333333', '#222222', '#242424'],
  },
  {
    name: 'violet-bloom',
    label: 'Violet Bloom',
    lightColors: ['#7033ff', '#e2ebff', '#edf0f4', '#e7e7ee'],
    darkColors: ['#8c5cff', '#1e293b', '#2a2c33', '#33353a'],
  },
];

export type ColorTheme = (typeof THEMES)[number]['name'];

export const DEFAULT_THEME: ColorTheme = 'vercel';
