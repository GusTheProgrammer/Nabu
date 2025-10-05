export interface PanelLayout {
  leftPanelSize: number;
  rightPanelSize: number;
  isRightPanelCollapsed: boolean;
  isFilterSidebarCollapsed?: boolean;
}

export interface ShortcutConfig {
  modifiers: string[];
  key: string;
}

export const DEFAULT_PANEL_LAYOUT: PanelLayout = {
  leftPanelSize: 40,
  rightPanelSize: 60,
  isRightPanelCollapsed: false,
  isFilterSidebarCollapsed: false,
};

export const DEFAULT_SHORTCUT: ShortcutConfig = {
  modifiers: ['ctrl', 'shift'],
  key: 'Space',
};

export const DEFAULT_AUTO_START = false;

export const SETTING_KEYS = {
  LEFT_PANEL: 'left_panel',
  RIGHT_PANEL: 'right_panel',
  RIGHT_PANEL_COLLAPSED: 'right_panel_collapsed',
  FILTER_SIDEBAR_COLLAPSED: 'filter_sidebar_open',
  TOGGLE_SHORTCUT: 'toggle_shortcut',
  AUTO_START: 'auto_start',
};
