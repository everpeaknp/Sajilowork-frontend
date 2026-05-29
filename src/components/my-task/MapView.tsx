"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Task } from '@/components/my-task/types';
import UserAvatar from '@/components/common/UserAvatar';
import { formatNPR } from '@/lib/nepalLocale';

// Fix for default Leaflet icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom price icon
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

function RecenterAutomatically({ tasks }: { tasks: Task[] }) {
  const map = useMap();
  const taskPointsKey = useMemo(
    () =>
      tasks
        .filter((t) => isValidCoord(t.coordinates))
        .map((t) => `${t.id}:${t.coordinates[0]},${t.coordinates[1]}`)
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

        const usable = tasks.map((t) => t.coordinates).filter(isValidCoord);

        if (usable.length === 0) return;
        if (usable.length === 1) {
          map.setView(usable[0], 14);
          return;
        }
        const bounds = L.latLngBounds(usable);
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

export default function MapView({ tasks, onTaskSelect }: MapViewProps) {
  const defaultCenter: [number, number] = [27.7172, 85.324];
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mappableTasks = useMemo(
    () => tasks.filter((t) => isValidCoord(t.coordinates)),
    [tasks]
  );

  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-surface-dim">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] relative group">
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
          <Marker 
            key={task.id} 
            position={task.coordinates} 
            icon={createPriceIcon(task.price)}
          >
            <Popup className="custom-popup">
              <div className="p-6 w-[280px] font-sans">
                <div className="flex gap-4 mb-6">
                  {/* UserAvatar — initials/icon fallback when there is no
                      profile picture, instead of a broken <img> box. */}
                  <UserAvatar
                    src={task.user.avatar}
                    alt={task.user.name}
                    name={task.user.name}
                    size="xl"
                    className="!w-24 !h-24 text-3xl"
                  />
                  <div 
                    className="flex-1 rounded-3xl flex flex-col items-center justify-center p-2 border border-outline-variant/30" 
                    style={{ backgroundColor: '#f1f4f9' }}
                  >
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      BUDGET
                    </span>
                    <span className="text-3xl font-extrabold text-[#000d45]">
                      {formatNPR(task.price)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h4 className="text-lg font-bold text-[#000d45] leading-tight">
                    {task.title}
                  </h4>
                  {task.location && (
                    <p className="flex items-start gap-1.5 text-on-surface-variant text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                      <span className="line-clamp-2">{task.location}</span>
                    </p>
                  )}
                  <p className="text-on-surface-variant text-sm font-medium">
                    Due in {Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </p>
                  <p className="text-on-surface-variant text-sm">
                    Posted about {Math.round((Date.now() - task.postedDate.getTime()) / (1000 * 60 * 60))} hours ago
                  </p>
                </div>

                <button 
                  onClick={() => onTaskSelect?.(task.id)}
                  className="w-full py-2 text-primary font-bold text-lg hover:underline transition-all text-center"
                >
                  View Task
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapInvalidateSize />
        <RecenterAutomatically tasks={mappableTasks} />
      </MapContainer>

      {/* Map Overlay Elements */}
      <style>{`
        .custom-div-icon {
          background: none !important;
          border: none !important;
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
          filter: grayscale(0.2) contrast(0.9);
        }
      `}</style>
    </div>
  );
}
