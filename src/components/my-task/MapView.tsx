"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layers, Loader2, MapPin, Minus, Navigation, Plus, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Task } from '@/components/my-task/types';
import UserAvatar from '@/components/common/UserAvatar';
import { formatNPR } from '@/lib/nepalLocale';
import { resolveMapRadiusKm, scheduleMapRadiusFit } from '@/lib/mapRadiusFit';
import {
  geolocationFailureMessage,
  KATHMANDU_CENTER,
  requestUserGeolocationDetailed,
} from '@/lib/userGeolocation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useThemeSyncedMapLayer, type MapLayerId } from '@/hooks/useThemeSyncedMapLayer';

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

const MARKER_FOCUS_ZOOM = 15;
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
  onUserLocationFound,
  layerId,
  onLayerChange,
}: {
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
          /* permissions API not fully supported */
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
              onClick={() => map.zoomIn()}
              className="flex h-10 w-10 items-center justify-center text-on-surface transition-colors hover:bg-surface-dim"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="h-px bg-outline-variant" />
            <button
              type="button"
              onClick={() => map.zoomOut()}
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

interface MapViewProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
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
  skipAutoFitRef,
  userInteractedRef,
}: {
  center: [number, number];
  radiusKm: number;
  skipAutoFitRef: React.MutableRefObject<boolean>;
  userInteractedRef: React.MutableRefObject<boolean>;
}) {
  const map = useMap();
  const fitKey = `${center[0].toFixed(5)},${center[1].toFixed(5)},${radiusKm}`;

  useEffect(() => {
    if (radiusKm <= 0) return;

    userInteractedRef.current = false;

    return scheduleMapRadiusFit(map, center, radiusKm, () =>
      Boolean(skipAutoFitRef.current || userInteractedRef.current)
    );
  }, [center, fitKey, map, radiusKm, skipAutoFitRef, userInteractedRef]);

  return null;
}

export default function MapView({ tasks, onTaskSelect }: MapViewProps) {
  const { user } = useAuth();
  const skipRadiusFitRef = useRef(false);
  const userInteractedRef = useRef(false);
  const geoInitialized = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const { mapLayer, setMapLayer } = useThemeSyncedMapLayer();
  const [userCenter, setUserCenter] = useState<[number, number]>([
    KATHMANDU_CENTER.lat,
    KATHMANDU_CENTER.lng,
  ]);

  const radiusKm = resolveMapRadiusKm();
  const activeTileFilter = MAP_LAYERS[mapLayer].tileFilter;

  const handleUserLocationFound = useCallback((lat: number, lng: number) => {
    skipRadiusFitRef.current = true;
    window.setTimeout(() => {
      skipRadiusFitRef.current = false;
    }, 4000);
    setUserCenter([lat, lng]);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (geoInitialized.current) return;
    geoInitialized.current = true;

    (async () => {
      const geo = await requestUserGeolocationDetailed();
      if (geo.success) {
        setUserCenter([geo.lat, geo.lng]);
        return;
      }

      const profileLat = user?.latitude != null ? Number(user.latitude) : NaN;
      const profileLng = user?.longitude != null ? Number(user.longitude) : NaN;
      if (Number.isFinite(profileLat) && Number.isFinite(profileLng)) {
        setUserCenter([profileLat, profileLng]);
      }
    })();
  }, [user?.latitude, user?.longitude]);

  const mappableTasks = useMemo(
    () => tasks.filter((t) => isValidCoord(t.coordinates)),
    [tasks]
  );

  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-surface-dim">
        <div className="w-12 h-12 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] relative group">
      <MapContainer
        center={userCenter}
        zoom={12}
        scrollWheelZoom
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', minHeight: 300 }}
      >
        <SwitchableTileLayer layerId={mapLayer} />
        <MapToolbar
          layerId={mapLayer}
          onLayerChange={setMapLayer}
          onUserLocationFound={handleUserLocationFound}
        />
        <UserLocationDot center={userCenter} />
        {mappableTasks.map((task) => (
          <Marker
            key={task.id}
            position={task.coordinates}
            icon={createPriceIcon(task.price)}
          >
            <Popup className="custom-popup">
              <div className="p-6 w-[280px] font-sans">
                <div className="flex gap-4 mb-6">
                  <UserAvatar
                    src={task.user.avatar}
                    alt={task.user.name}
                    name={task.user.name}
                    size="xl"
                    verified={task.user.verified}
                    className="!w-24 !h-24 text-3xl"
                  />
                  <div
                    className="flex-1 rounded-3xl flex flex-col items-center justify-center p-2 border border-outline-variant/30"
                    style={{ backgroundColor: '#f1f4f9' }}
                  >
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      BUDGET
                    </span>
                    <span className="text-3xl font-extrabold text-brand-dark">
                      {formatNPR(task.price)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h4 className="text-lg font-bold text-brand-dark leading-tight">
                    {task.title}
                  </h4>
                  {task.location && (
                    <p className="flex items-start gap-1.5 text-on-surface-variant text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-emerald" />
                      <span className="line-clamp-2">{task.location}</span>
                    </p>
                  )}
                  <p className="text-on-surface-variant text-sm font-medium">
                    Due in{' '}
                    {Math.ceil(
                      (task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </p>
                  <p className="text-on-surface-variant text-sm">
                    Posted about{' '}
                    {Math.round(
                      (Date.now() - task.postedDate.getTime()) / (1000 * 60 * 60)
                    )}{' '}
                    hours ago
                  </p>
                </div>

                <button
                  onClick={() => onTaskSelect?.(task.id)}
                  className="w-full py-2 text-brand-emerald font-bold text-lg hover:underline transition-all text-center"
                >
                  View Task
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapInvalidateSize />
        <MapUserInteractionGuard userInteractedRef={userInteractedRef} />
        <FitRadiusToWindow
          center={userCenter}
          radiusKm={radiusKm}
          skipAutoFitRef={skipRadiusFitRef}
          userInteractedRef={userInteractedRef}
        />
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
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 1.5rem;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 50px -10px rgba(0, 0, 0, 0.2);
          border: none;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .custom-popup .leaflet-popup-tip-container {
          display: none;
        }
        .custom-popup .leaflet-popup-close-button {
          padding: 8px !important;
          color: #6b7280 !important;
          font-size: 16px !important;
        }
        .leaflet-tile {
          filter: ${activeTileFilter ?? 'none'};
        }
        .leaflet-container {
          background: ${mapLayer === 'dark' ? '#0b0b0b' : mapLayer === 'satellite' ? '#111' : '#e4e4e7'};
        }
      `}</style>
    </div>
  );
}
