"use client";

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layers, Loader2, Minus, Navigation, Plus, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { formatNPR } from '@/lib/nepalLocale';
import { resolveMapRadiusKm, scheduleMapRadiusFit } from '@/lib/mapRadiusFit';
import {
  geolocationFailureMessage,
  KATHMANDU_CENTER,
  requestUserGeolocationDetailed,
} from '@/lib/userGeolocation';
import { toast } from 'sonner';
import { Task } from './types';

type MapLayerId = 'default' | 'dark' | 'satellite' | 'terrain';

const MAP_LAYERS: Record<
  MapLayerId,
  {
    label: string;
    url: string;
    attribution: string;
    tileFilter?: string;
    subdomains?: string[];
  }
> = {
  default: {
    label: 'Default',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileFilter: 'grayscale(0.2) contrast(0.9)',
  },
  dark: {
    label: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: ['a', 'b', 'c', 'd'],
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
};

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createPriceIcon = (price: number) => {
  const label = formatNPR(price, { compact: true });
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="flex flex-col items-center group">
      <div class="bg-brand-emerald text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white whitespace-nowrap transform group-hover:scale-110 transition-transform">
        ${label}
      </div>
      <div class="w-3 h-3 bg-brand-emerald rounded-full -mt-1 border-2 border-white shadow-sm"></div>
    </div>`,
    iconSize: [60, 40],
    iconAnchor: [30, 40],
  });
};

interface MapViewProps {
  tasks: Task[];
  /** Changes when browse sort order changes — keeps markers in sync with sidebar */
  tasksOrderKey?: string;
  sortBy?: string;
  /** When set (map marker click), map flies to this task */
  focusTaskId?: string | null;
  /** Map marker click — centered preview on parent */
  onTaskFocus?: (taskId: string) => void;
  /** User location for default radius view */
  userCenter?: [number, number] | null;
  /** Radius in km around userCenter */
  radiusKm?: number;
  /** When user taps "my location" on the map */
  onUserLocationFound?: (lat: number, lng: number) => void;
}

/** Zoom level when focusing a marker or detecting user location */
const MARKER_FOCUS_ZOOM = 15;
/** flyTo duration in seconds */
const FLY_DURATION = 0.85;

function flyToUserLocation(map: L.Map, center: [number, number]) {
  try {
    const container = map.getContainer();
    if (!container?.isConnected) return;

    map.invalidateSize({ animate: false });
    map.flyTo(center, MARKER_FOCUS_ZOOM, {
      animate: true,
      duration: FLY_DURATION,
    });
  } catch {
    map.setView(center, MARKER_FOCUS_ZOOM);
  }
}

function getInitialMapLayer(): MapLayerId {
  if (typeof window === 'undefined') return 'default';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'default';
}

const USER_LOCATION_ICON = L.divIcon({
  className: 'user-location-dot',
  html: `<div style="width:14px;height:14px;background:#005fff;border:3px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function UserLocationDot({ center }: { center: [number, number] }) {
  return (
    <Marker
      position={center}
      icon={USER_LOCATION_ICON}
      zIndexOffset={1000}
      interactive={false}
    />
  );
}

function SwitchableTileLayer({ layerId }: { layerId: MapLayerId }) {
  const layer = MAP_LAYERS[layerId];
  return (
    <TileLayer
      key={layerId}
      attribution={layer.attribution}
      url={layer.url}
      {...(layer.subdomains ? { subdomains: layer.subdomains } : {})}
    />
  );
}

function MapToolbar({
  radiusKm,
  onUserLocationFound,
  layerId,
  onLayerChange,
}: {
  radiusKm: number;
  onUserLocationFound?: (lat: number, lng: number) => void;
  layerId: MapLayerId;
  onLayerChange: (id: MapLayerId) => void;
}) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);

  const closeToolbar = () => {
    setToolbarOpen(false);
    setLayersOpen(false);
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleGeolocate = async () => {
    setLocating(true);
    try {
      if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          if (status.state === 'denied') {
            toast.error(geolocationFailureMessage('denied'));
            return;
          }
        } catch {
          /* permissions API not fully supported — continue */
        }
      }

      const geo = await requestUserGeolocationDetailed();
      if (!geo.success) {
        toast.error(geolocationFailureMessage(geo.error));
        return;
      }

      onUserLocationFound?.(geo.lat, geo.lng);

      await new Promise<void>((resolve) => {
        map.whenReady(() => resolve());
      });
      flyToUserLocation(map, [geo.lat, geo.lng]);
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="absolute bottom-[7.5rem] right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-none lg:bottom-5">
      {toolbarOpen && layersOpen && (
        <div className="pointer-events-auto flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-white shadow-lg">
          {(Object.keys(MAP_LAYERS) as MapLayerId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                onLayerChange(id);
                setLayersOpen(false);
              }}
              className={`px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                layerId === id
                  ? 'bg-brand-emerald text-white'
                  : 'text-on-surface hover:bg-surface-dim'
              }`}
            >
              {MAP_LAYERS[id].label}
            </button>
          ))}
        </div>
      )}

      <div className="pointer-events-auto flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-white shadow-lg">
        {toolbarOpen ? (
          <>
            <button
              type="button"
              onClick={() => setLayersOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center text-on-surface transition-colors hover:bg-surface-dim"
              title="Map style"
              aria-label="Change map style"
              aria-expanded={layersOpen}
            >
              <Layers className="h-5 w-5" />
            </button>
            <div className="h-px bg-outline-variant" />
            <button
              type="button"
              onClick={handleZoomIn}
              className="flex h-10 w-10 items-center justify-center text-on-surface transition-colors hover:bg-surface-dim"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="h-px bg-outline-variant" />
            <button
              type="button"
              onClick={handleZoomOut}
              className="flex h-10 w-10 items-center justify-center text-on-surface transition-colors hover:bg-surface-dim"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div className="h-px bg-outline-variant" />
            <button
              type="button"
              onClick={() => void handleGeolocate()}
              disabled={locating}
              className="flex h-10 w-10 items-center justify-center text-brand-emerald transition-colors hover:bg-surface-dim disabled:opacity-60"
              title="Show my location"
              aria-label="Show my location"
            >
              {locating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Navigation className="h-5 w-5" />
              )}
            </button>
            <div className="h-px bg-outline-variant" />
            <button
              type="button"
              onClick={closeToolbar}
              className="flex h-10 w-10 items-center justify-center text-on-surface transition-colors hover:bg-surface-dim"
              title="Close map controls"
              aria-label="Close map controls"
            >
              <X className="h-5 w-5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setToolbarOpen(true)}
            className="flex h-10 w-10 items-center justify-center text-on-surface transition-colors hover:bg-surface-dim"
            title="Map controls"
            aria-label="Open map controls"
            aria-expanded={false}
          >
            <Layers className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function isValidCoord(c: unknown): c is [number, number] {
  return (
    Array.isArray(c) &&
    c.length === 2 &&
    Number.isFinite(c[0]) &&
    Number.isFinite(c[1]) &&
    !(c[0] === 0 && c[1] === 0)
  );
}

function MapInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    const refresh = () => {
      try {
        if (map.getContainer()?.isConnected) {
          map.invalidateSize();
        }
      } catch {
        /* map already destroyed */
      }
    };

    const t = window.setTimeout(refresh, 150);
    window.addEventListener('resize', refresh);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', refresh);
    };
  }, [map]);

  return null;
}

/** Stop auto radius-fit after the user pans or zooms manually. */
function MapUserInteractionGuard({
  userInteractedRef,
}: {
  userInteractedRef: React.MutableRefObject<boolean>;
}) {
  const map = useMap();

  useEffect(() => {
    const markUserInteraction = (event: L.LeafletEvent) => {
      if ((event as any).originalEvent) {
        userInteractedRef.current = true;
      }
    };

    map.on('zoomend', markUserInteraction);
    map.on('dragend', markUserInteraction);
    return () => {
      map.off('zoomend', markUserInteraction);
      map.off('dragend', markUserInteraction);
    };
  }, [map, userInteractedRef]);

  return null;
}

/** Fit the map viewport to a radius circle (no visible overlay). */
function FitRadiusToWindow({
  center,
  radiusKm,
  focusTaskIdRef,
  skipAutoFitRef,
  userInteractedRef,
}: {
  center: [number, number];
  radiusKm: number;
  focusTaskIdRef: React.MutableRefObject<string | null | undefined>;
  skipAutoFitRef: React.MutableRefObject<boolean>;
  userInteractedRef: React.MutableRefObject<boolean>;
}) {
  const map = useMap();
  const fitKey = `${center[0].toFixed(5)},${center[1].toFixed(5)},${radiusKm}`;

  useEffect(() => {
    if (radiusKm <= 0) return;

    userInteractedRef.current = false;

    return scheduleMapRadiusFit(map, center, radiusKm, () =>
      Boolean(
        focusTaskIdRef.current ||
          skipAutoFitRef.current ||
          userInteractedRef.current
      )
    );
  }, [center, fitKey, map, radiusKm, skipAutoFitRef, userInteractedRef, focusTaskIdRef]);

  return null;
}

function FocusOnTask({
  tasks,
  focusTaskId,
}: {
  tasks: Task[];
  focusTaskId?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusTaskId) return;

    const task = tasks.find(
      (t) => String(t.id) === String(focusTaskId) || String(t.slug) === String(focusTaskId)
    );
    if (!task || !isValidCoord(task.coordinates)) return;

    try {
      map.flyTo(task.coordinates, MARKER_FOCUS_ZOOM, {
        animate: true,
        duration: FLY_DURATION,
      });
    } catch {
      /* map not ready */
    }
  }, [focusTaskId, map, tasks]);

  return null;
}

function TaskMarker({
  task,
  onTaskFocus,
}: {
  task: Task;
  onTaskFocus?: (taskId: string) => void;
}) {
  const map = useMap();
  const taskKey = String(task.slug || task.id);

  const handleMarkerClick = () => {
    const [lat, lng] = task.coordinates;
    map.flyTo([lat, lng], MARKER_FOCUS_ZOOM, {
      animate: true,
      duration: FLY_DURATION,
    });
    onTaskFocus?.(taskKey);
  };

  const stackOrder =
    task.browseOrder != null ? 1000 - task.browseOrder : 0;

  return (
    <Marker
      position={task.coordinates}
      icon={createPriceIcon(task.price)}
      zIndexOffset={stackOrder}
      eventHandlers={{ click: handleMarkerClick }}
    />
  );
}

export default function MapView({
  tasks,
  tasksOrderKey,
  sortBy,
  focusTaskId,
  onTaskFocus,
  userCenter,
  radiusKm,
  onUserLocationFound,
}: MapViewProps) {
  const effectiveRadius = resolveMapRadiusKm(radiusKm);
  const effectiveCenter: [number, number] = userCenter ?? [
    KATHMANDU_CENTER.lat,
    KATHMANDU_CENTER.lng,
  ];
  const skipRadiusFitRef = useRef(false);
  const userInteractedRef = useRef(false);
  const focusTaskIdRef = useRef(focusTaskId);
  focusTaskIdRef.current = focusTaskId;
  const [isClient, setIsClient] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayerId>(getInitialMapLayer);
  const activeTileFilter = MAP_LAYERS[mapLayer].tileFilter;

  const handleUserLocationFound = useCallback(
    (lat: number, lng: number) => {
      skipRadiusFitRef.current = true;
      window.setTimeout(() => {
        skipRadiusFitRef.current = false;
      }, 4000);
      onUserLocationFound?.(lat, lng);
    },
    [onUserLocationFound]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mappableTasks = useMemo(
    () => tasks.filter((t) => isValidCoord(t.coordinates)),
    [tasks, tasksOrderKey, sortBy]
  );

  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-surface-dim">
        <div className="w-12 h-12 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <MapContainer
        center={effectiveCenter}
        zoom={12}
        scrollWheelZoom
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', minHeight: 300 }}
      >
        <SwitchableTileLayer layerId={mapLayer} />
        <MapToolbar
          radiusKm={effectiveRadius}
          layerId={mapLayer}
          onLayerChange={setMapLayer}
          onUserLocationFound={handleUserLocationFound}
        />
        <UserLocationDot center={effectiveCenter} />
        {mappableTasks.map((task) => (
          <TaskMarker key={task.id} task={task} onTaskFocus={onTaskFocus} />
        ))}
        <MapInvalidateSize />
        <MapUserInteractionGuard userInteractedRef={userInteractedRef} />
        <FitRadiusToWindow
          center={effectiveCenter}
          radiusKm={effectiveRadius}
          focusTaskIdRef={focusTaskIdRef}
          skipAutoFitRef={skipRadiusFitRef}
          userInteractedRef={userInteractedRef}
        />
        <FocusOnTask tasks={mappableTasks} focusTaskId={focusTaskId} />
      </MapContainer>

      <style>{`
        .custom-div-icon,
        .user-location-dot {
          background: none !important;
          border: none !important;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
        .leaflet-tile {
          filter: ${activeTileFilter ?? 'none'};
        }
      `}</style>
    </div>
  );
}
