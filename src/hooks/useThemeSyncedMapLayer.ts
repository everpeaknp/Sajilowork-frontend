'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

export type MapLayerId = 'default' | 'dark' | 'satellite' | 'terrain';

export function getThemeMapLayer(isDark: boolean): 'default' | 'dark' {
  return isDark ? 'dark' : 'default';
}

function readDomThemeLayer(): MapLayerId {
  if (typeof window === 'undefined') return 'default';
  return getThemeMapLayer(document.documentElement.classList.contains('dark'));
}

/**
 * Keeps Leaflet basemap aligned with site light/dark theme.
 * Satellite / terrain selections are left alone until the user changes them
 * or switches theme back onto the default/dark pair.
 */
export function useThemeSyncedMapLayer() {
  const { theme, ready } = useTheme();
  const [mapLayer, setMapLayerState] = useState<MapLayerId>(readDomThemeLayer);

  useEffect(() => {
    if (!ready) return;
    const themed = getThemeMapLayer(theme === 'dark');
    setMapLayerState((current) => {
      if (current === 'satellite' || current === 'terrain') return current;
      return themed;
    });
  }, [theme, ready]);

  const setMapLayer = useCallback((id: MapLayerId) => {
    setMapLayerState(id);
  }, []);

  return { mapLayer, setMapLayer };
}
