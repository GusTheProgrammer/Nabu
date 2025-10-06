import { KEYBOARD_SHORTCUTS, ShortcutConfig } from './shortcuts';

export interface PanelLayout {
  leftPanelSize: number;
  rightPanelSize: number;
  isRightPanelCollapsed: boolean;
  isFilterSidebarCollapsed?: boolean;
}

export interface KeyboardNavigationSettings {
  shortcuts: Record<string, ShortcutConfig>;
  pageSize: number;
  prefetchThreshold: number;
}

export const DEFAULT_PANEL_LAYOUT: PanelLayout = {
  leftPanelSize: 40,
  rightPanelSize: 60,
  isRightPanelCollapsed: false,
  isFilterSidebarCollapsed: false,
};

export const DEFAULT_KEYBOARD_NAVIGATION: KeyboardNavigationSettings = {
  shortcuts: Object.fromEntries(
    Object.entries(KEYBOARD_SHORTCUTS).map(([key, { modifiers, key: keyCode }]) => [
      key,
      { modifiers, key: keyCode },
    ])
  ),
  pageSize: 10,
  prefetchThreshold: 3,
};

export const DEFAULT_AUTO_START = false;

export const SETTING_KEYS = {
  LEFT_PANEL: 'left_panel',
  RIGHT_PANEL: 'right_panel',
  RIGHT_PANEL_COLLAPSED: 'right_panel_collapsed',
  FILTER_SIDEBAR_COLLAPSED: 'filter_sidebar_open',
  TOGGLE_SHORTCUT: 'toggle_shortcut',
  AUTO_START: 'auto_start',
  KEYBOARD_NAVIGATION: 'keyboard_navigation',
};
