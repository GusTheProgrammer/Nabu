import { useCallback } from 'react';

import { useSetting } from '@/hooks/use-setting';
import { DEFAULT_PANEL_LAYOUT, PanelLayout, SETTING_KEYS } from '@/types/settings';

export function usePanelLayout() {
  const leftPanel = useSetting(SETTING_KEYS.LEFT_PANEL, DEFAULT_PANEL_LAYOUT.leftPanelSize, 300);
  const rightPanel = useSetting(SETTING_KEYS.RIGHT_PANEL, DEFAULT_PANEL_LAYOUT.rightPanelSize, 300);
  const rightPanelCollapsed = useSetting(
    SETTING_KEYS.RIGHT_PANEL_COLLAPSED,
    DEFAULT_PANEL_LAYOUT.isRightPanelCollapsed
  );
  const filterSidebarCollapsed = useSetting(
    SETTING_KEYS.FILTER_SIDEBAR_COLLAPSED,
    DEFAULT_PANEL_LAYOUT.isFilterSidebarCollapsed
  );

  const isLoaded =
    leftPanel.isLoaded &&
    rightPanel.isLoaded &&
    rightPanelCollapsed.isLoaded &&
    filterSidebarCollapsed.isLoaded;

  const layout: PanelLayout = {
    leftPanelSize: leftPanel.value,
    rightPanelSize: rightPanel.value,
    isRightPanelCollapsed: rightPanelCollapsed.value,
    isFilterSidebarCollapsed: filterSidebarCollapsed.value,
  };

  const updateLeftPanelSize = useCallback(
    (size: number) => leftPanel.setValue(size),
    [leftPanel.setValue]
  );

  const updateRightPanelSize = useCallback(
    (size: number) => rightPanel.setValue(size),
    [rightPanel.setValue]
  );

  const setRightPanelCollapsed = useCallback(
    (collapsed: boolean) => rightPanelCollapsed.setValue(collapsed),
    [rightPanelCollapsed.setValue]
  );

  const toggleFilterSidebar = useCallback(
    () => filterSidebarCollapsed.setValue(!filterSidebarCollapsed.value),
    [filterSidebarCollapsed.setValue, filterSidebarCollapsed.value]
  );

  return {
    layout,
    isLoaded,
    updateLeftPanelSize,
    updateRightPanelSize,
    setRightPanelCollapsed,
    toggleFilterSidebar,
  };
}
