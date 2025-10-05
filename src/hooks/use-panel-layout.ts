import { useCallback, useEffect, useRef, useState } from 'react';

import clipboardDatabase from '@/lib/db';
import { DEFAULT_PANEL_LAYOUT, PanelLayout, SETTING_KEYS } from '@/types/settings';

export function usePanelLayout() {
  const [layout, setLayout] = useState<PanelLayout>(DEFAULT_PANEL_LAYOUT);
  const [isLoaded, setIsLoaded] = useState(false);
  const leftTimeoutRef = useRef<NodeJS.Timeout>();
  const rightTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadLayout = async () => {
      const leftPanelSize = await clipboardDatabase.getSetting(
        SETTING_KEYS?.LEFT_PANEL,
        DEFAULT_PANEL_LAYOUT?.leftPanelSize
      );
      const rightPanelSize = await clipboardDatabase.getSetting(
        SETTING_KEYS?.RIGHT_PANEL,
        DEFAULT_PANEL_LAYOUT?.rightPanelSize
      );
      const isRightPanelCollapsed = await clipboardDatabase.getSetting(
        SETTING_KEYS?.RIGHT_PANEL_COLLAPSED,
        DEFAULT_PANEL_LAYOUT?.isRightPanelCollapsed
      );
      const isFilterSidebarCollapsed = await clipboardDatabase.getSetting(
        SETTING_KEYS?.FILTER_SIDEBAR_COLLAPSED,
        DEFAULT_PANEL_LAYOUT?.isFilterSidebarCollapsed
      );

      setLayout({
        leftPanelSize,
        rightPanelSize,
        isRightPanelCollapsed,
        isFilterSidebarCollapsed,
      });
      setIsLoaded(true);
    };

    loadLayout();
  }, []);

  const updateLeftPanelSize = useCallback((size: number) => {
    setLayout((prev) => ({ ...prev, leftPanelSize: size }));

    if (leftTimeoutRef.current) {
      clearTimeout(leftTimeoutRef.current);
    }

    leftTimeoutRef.current = setTimeout(async () => {
      await clipboardDatabase.setSetting(SETTING_KEYS?.LEFT_PANEL, size);
    }, 300);
  }, []);

  const updateRightPanelSize = useCallback((size: number) => {
    setLayout((prev) => ({ ...prev, rightPanelSize: size }));

    if (rightTimeoutRef.current) {
      clearTimeout(rightTimeoutRef.current);
    }

    rightTimeoutRef.current = setTimeout(async () => {
      await clipboardDatabase.setSetting(SETTING_KEYS?.RIGHT_PANEL, size);
    }, 300);
  }, []);

  const setRightPanelCollapsed = useCallback(async (collapsed: boolean) => {
    await clipboardDatabase.setSetting(SETTING_KEYS?.RIGHT_PANEL_COLLAPSED, collapsed);
    setLayout((prev) => ({ ...prev, isRightPanelCollapsed: collapsed }));
  }, []);

  const toggleFilterSidebar = useCallback(async () => {
    const newIsOpenState = !layout.isFilterSidebarCollapsed;
    await clipboardDatabase.setSetting(SETTING_KEYS?.FILTER_SIDEBAR_COLLAPSED, newIsOpenState);
    setLayout((prev) => ({ ...prev, isFilterSidebarCollapsed: newIsOpenState }));
  }, [layout.isFilterSidebarCollapsed]);

  return {
    layout,
    isLoaded,
    updateLeftPanelSize,
    updateRightPanelSize,
    setRightPanelCollapsed,
    toggleFilterSidebar,
  };
}
