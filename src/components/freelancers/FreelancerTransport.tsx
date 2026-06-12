'use client';

import {
  Bike,
  Car,
  Monitor,
  PersonStanding,
  Scooter,
  Truck,
  type LucideIcon,
} from 'lucide-react';

type TransportOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const TRANSPORT_OPTIONS: TransportOption[] = [
  { id: 'Bicycle', label: 'Bicycle', icon: Bike },
  { id: 'Car', label: 'Car', icon: Car },
  { id: 'Online', label: 'Online', icon: Monitor },
  { id: 'Scooter', label: 'Scooter', icon: Scooter },
  { id: 'Truck', label: 'Truck', icon: Truck },
  { id: 'Walking', label: 'Walking', icon: PersonStanding },
];

interface FreelancerTransportProps {
  options?: string[];
}

export default function FreelancerTransport({ options }: FreelancerTransportProps) {
  const selected = TRANSPORT_OPTIONS.filter((option) => options?.includes(option.id));

  if (!selected.length) {
    return null;
  }

  return (
    <div className="mt-10 w-full max-w-4xl">
      <h3 className="mb-8 text-xl font-normal tracking-tight text-black sm:text-2xl">
        How do you get around?
      </h3>

      <div className="flex flex-wrap justify-start gap-3">
        {selected.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className="flex min-w-[5.5rem] flex-col items-center justify-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-4 text-[#1D3E35] ring-2 ring-[#52C47F]/35"
            >
              <Icon className="h-6 w-6 text-[#52C47F]" strokeWidth={2} />
              <span className="text-xs font-semibold tracking-wide">{option.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
