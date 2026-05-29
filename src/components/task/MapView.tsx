"use client";

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { formatNPR } from '@/lib/nepalLocale';
import { Task } from './types';

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
      <div class="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white whitespace-nowrap transform group-hover:scale-110 transition-transform">
        ${label}
      </div>
      <div class="w-3 h-3 bg-primary rounded-full -mt-1 border-2 border-white shadow-sm"></div>
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
}

/** Zoom level when focusing a marker after click */
const MARKER_FOCUS_ZOOM = 15;
/** flyTo duration in seconds */
const FLY_DURATION = 0.85;

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

function RecenterAutomatically({ tasks }: { tasks: Task[] }) {
  const map = useMap();
  const taskPointsKey = useMemo(
    () =>
      tasks
        .filter((t) => isValidCoord(t.coordinates))
        .map(
          (t) =>
            `${t.browseOrder ?? ''}:${t.id}:${t.coordinates[0]},${t.coordinates[1]}`
        )
        .join('|'),
    [tasks]
  );

  useEffect(() => {
    let cancelled = false;

    const frame = requestAnimationFrame(() => {
      if (cancelled) return;

      try {
        const container = map.getContainer();
        if (!container?.isConnected) return;

        const points = tasks
          .map((t) => t.coordinates)
          .filter(isValidCoord);

        if (points.length === 0) return;

        if (points.length === 1) {
          map.setView(points[0], 13);
          return;
        }

        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch {
        /* map not ready or already removed */
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [taskPointsKey, map, tasks]);

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
}: MapViewProps) {
  const defaultCenter: [number, number] = [27.7172, 85.324];
  const [isClient, setIsClient] = useState(false);

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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom
        className="w-full h-full z-0"
        zoomControl={false}
        style={{ height: '100%', width: '100%', minHeight: 300 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappableTasks.map((task) => (
          <TaskMarker key={task.id} task={task} onTaskFocus={onTaskFocus} />
        ))}
        <MapInvalidateSize />
        <RecenterAutomatically tasks={mappableTasks} />
        <FocusOnTask tasks={mappableTasks} focusTaskId={focusTaskId} />
      </MapContainer>

      <style>{`
        .custom-div-icon {
          background: none !important;
          border: none !important;
        }
        .leaflet-tile {
          filter: grayscale(0.2) contrast(0.9);
        }
      `}</style>
    </div>
  );
}
