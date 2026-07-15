'use client';

import type { ReactNode } from 'react';
import { BarChart3, CalendarCheck, MapPin } from 'lucide-react';
import { getDeliveryLabel, getEnglishLevel, getLocationLabel, type Service } from './serviceListData';

interface ServiceInfoBarProps {
  service: Service;
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fbf2ed] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        {icon}
      </div>
      <div>
        <p className="text-sm font-normal text-black dark:text-stone-100">{label}</p>
        <p className="text-sm font-normal text-neutral-500 dark:text-neutral-400">{value}</p>
      </div>
    </div>
  );
}

export default function ServiceInfoBar({ service }: ServiceInfoBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
      <InfoItem
        icon={<CalendarCheck className="h-5 w-5 stroke-[1.75]" />}
        label="Delivery Time"
        value={getDeliveryLabel(service)}
      />
      <InfoItem
        icon={<BarChart3 className="h-5 w-5 stroke-[1.75]" />}
        label={service.languages?.length ? 'Languages' : 'English Level'}
        value={getEnglishLevel(service)}
      />
      <InfoItem
        icon={<MapPin className="h-5 w-5 stroke-[1.75]" />}
        label="Location"
        value={getLocationLabel(service)}
      />
    </div>
  );
}
