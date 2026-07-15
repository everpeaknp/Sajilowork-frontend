'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useThemeSyncedMapLayer, type MapLayerId } from '@/hooks/useThemeSyncedMapLayer';

/** Lazimpat Road, Kathmandu */
export const CONTACT_OFFICE_COORDS = {
  lat: 27.7245,
  lng: 85.3206,
} as const;

const MAP_LAYERS: Record<
  MapLayerId,
  { url: string; attribution: string; subdomains?: string[] }
> = {
  default: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO',
    subdomains: ['a', 'b', 'c', 'd'],
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap · OpenTopoMap',
  },
};

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapViewSync({ zoom }: { zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoom);
  }, [map, zoom]);
  useEffect(() => {
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    const t = window.setTimeout(onResize, 80);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);
  return null;
}

type ContactOfficeMapProps = {
  zoom: number;
  mapStyle: 'streets' | 'satellite' | 'terrain';
};

export default function ContactOfficeMap({ zoom, mapStyle }: ContactOfficeMapProps) {
  const { mapLayer, setMapLayer } = useThemeSyncedMapLayer();

  // Keep layer in sync with the Streets / Satellite / Terrain UI
  useEffect(() => {
    if (mapStyle === 'satellite') {
      setMapLayer('satellite');
      return;
    }
    if (mapStyle === 'terrain') {
      setMapLayer('terrain');
      return;
    }
    // streets → theme-aware default/dark
    setMapLayer(document.documentElement.classList.contains('dark') ? 'dark' : 'default');
  }, [mapStyle, setMapLayer]);

  const layer = MAP_LAYERS[mapLayer] ?? MAP_LAYERS.default;

  return (
    <MapContainer
      center={[CONTACT_OFFICE_COORDS.lat, CONTACT_OFFICE_COORDS.lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl
      className="absolute inset-0 z-0 h-full w-full bg-neutral-100 dark:bg-neutral-900 [&_.leaflet-control-attribution]:bg-white/80 [&_.leaflet-control-attribution]:text-[10px] dark:[&_.leaflet-control-attribution]:bg-neutral-900/80 dark:[&_.leaflet-control-attribution]:text-neutral-400"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        key={mapLayer}
        url={layer.url}
        attribution={layer.attribution}
        {...(layer.subdomains ? { subdomains: layer.subdomains } : {})}
      />
      <Marker position={[CONTACT_OFFICE_COORDS.lat, CONTACT_OFFICE_COORDS.lng]} />
      <MapViewSync zoom={zoom} />
    </MapContainer>
  );
}
