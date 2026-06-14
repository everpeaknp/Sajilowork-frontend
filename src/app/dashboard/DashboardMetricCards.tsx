'use client';

import type { LucideIcon } from 'lucide-react';
import { DASHBOARD_STAT_VALUE } from './dashboardResponsive';

export interface DashboardMetricCardItem {
  label: string;
  value: string;
  hint?: string;
  hintMuted?: string;
  icon: LucideIcon;
  iconWrapClass: string;
  iconClass: string;
  glowClass: string;
}

export function DashboardMetricCards({ cards }: { cards: DashboardMetricCardItem[] }) {
  return (
    <div className="mx-auto mb-8 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-6 transition-all duration-300 hover:shadow-sm"
          >
            <div className="z-10 space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {card.label}
              </span>
              <h3 className={DASHBOARD_STAT_VALUE}>{card.value}</h3>
              {card.hint || card.hintMuted ? (
                <p className="text-[12px] font-normal leading-tight text-[#52C47F]">
                  {card.hint}
                  {card.hint && card.hintMuted ? ' ' : null}
                  {card.hintMuted ? (
                    <span className="text-neutral-500">{card.hintMuted}</span>
                  ) : null}
                </p>
              ) : null}
            </div>
            <div
              className={`z-10 flex h-12 w-12 items-center justify-center rounded-full ${card.iconWrapClass}`}
            >
              <Icon className={`h-5 w-5 ${card.iconClass}`} strokeWidth={2} />
            </div>
            <div
              className={`absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full transition-transform duration-300 group-hover:scale-[1.3] ${card.glowClass}`}
            />
          </div>
        );
      })}
    </div>
  );
}
