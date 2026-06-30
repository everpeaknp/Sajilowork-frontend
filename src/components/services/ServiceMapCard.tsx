'use client';

import { Clock, MapPin, Star } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { discoverBody, discoverMedium } from '@/components/LangingHome/landingTypography';
import { useRoadDistanceLabel } from '@/hooks/useRoadDistanceLabel';
import HeroCardDecor from '@/components/task/HeroCardDecor';
import { formatServiceStartingPrice } from '@/lib/serviceApi';
import { cn } from '@/lib/utils';
import type { Service } from './serviceListData';

interface ServiceMapCardProps {
  service: Service;
  coordinates?: [number, number] | null;
  userCenter?: [number, number] | null;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

function locationLabel(service: Service): string {
  return service.locationLabel?.trim() || service.location;
}

function deliveryLabel(service: Service): string {
  if (service.deliveryTimeLabel?.trim()) return service.deliveryTimeLabel.trim();
  switch (service.deliveryTime) {
    case '24h':
      return '24 hours';
    case '3days':
      return '3 days';
    case '7days':
      return '7 days';
    default:
      return 'Flexible';
  }
}

export default function ServiceMapCard({
  service,
  coordinates,
  userCenter,
  onClick,
  isActive = false,
  className = '',
}: ServiceMapCardProps) {
  const { label: distanceLabel, loading: distanceLoading } = useRoadDistanceLabel(
    userCenter,
    coordinates,
  );

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'group relative flex min-w-0 w-full cursor-pointer flex-col overflow-hidden',
        'rounded-[20px] border border-neutral-200/40 bg-[#fbf2ed] p-4 shadow-sm',
        'transition-all duration-300 sm:rounded-[24px] sm:p-5',
        isActive
          ? 'border-[#52C47F]/50 ring-2 ring-[#52C47F]/25 shadow-[0_4px_14px_rgba(82,196,127,0.12)]'
          : 'hover:border-neutral-300/60 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] active:scale-[0.995]',
        className,
      )}
    >
      <HeroCardDecor accentPosition="bottom-right" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3
            className={cn(
              discoverBody,
              'min-h-[2.5rem] flex-1 min-w-0 text-base font-normal leading-snug text-black line-clamp-2 break-words [overflow-wrap:anywhere] transition-colors group-hover:text-[#52C47F] sm:text-[17px]',
            )}
          >
            {service.title}
          </h3>
          <p className={cn(discoverMedium, 'shrink-0 text-right text-base font-bold leading-snug text-[#52C47F] sm:text-lg')}>
            {formatServiceStartingPrice(service)}
          </p>
        </div>

        <div className="mb-4 flex min-w-0 flex-col gap-2">
          <div className="flex min-h-[20px] min-w-0 items-center justify-between gap-3 text-neutral-700">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 stroke-[1.6] text-neutral-500" aria-hidden />
              <span className={cn(discoverBody, 'truncate text-sm leading-5')}>{locationLabel(service)}</span>
            </div>
            {distanceLabel ? (
              <span className={cn(discoverBody, 'shrink-0 whitespace-nowrap text-right text-xs text-neutral-500')}>
                {distanceLabel}
              </span>
            ) : distanceLoading ? (
              <span className="shrink-0 text-xs text-neutral-400">…</span>
            ) : null}
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2 text-neutral-700">
            <div className="flex min-w-0 items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 stroke-[1.6] text-neutral-500" aria-hidden />
              <span className={cn(discoverBody, 'truncate text-sm leading-5')}>{deliveryLabel(service)}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-neutral-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{service.rating}</span>
              <span>({service.reviews})</span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-neutral-200/60 pt-3">
          <div className="min-w-0">
            <p className={cn(discoverMedium, 'truncate text-sm font-semibold text-[#45a874]')}>
              {service.author.name}
            </p>
            <p className={cn(discoverBody, 'mt-0.5 truncate text-xs text-neutral-500')}>{service.category}</p>
          </div>
          <UserAvatar
            src={service.author.avatar}
            alt={service.author.name}
            name={service.author.name}
            size="md"
            className="shrink-0 ring-2 ring-white/80"
          />
        </div>
      </div>
    </div>
  );
}
