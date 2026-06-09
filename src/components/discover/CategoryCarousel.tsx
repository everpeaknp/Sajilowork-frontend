'use client';

import React, { useMemo } from 'react';
import {
  Sprout,
  Paintbrush,
  Sparkles,
  Truck,
  Wrench,
  PenTool,
  FileText,
  Hammer,
} from 'lucide-react';
import { CATEGORIES } from './mockData';
import { discoverBody, discoverHeadline } from '@/components/LangingHome/landingTypography';
import FeatureCarousel, { type FeatureCarouselItem } from '@/components/ui/feature-carousel';

interface CategoryCarouselProps {
  onSelectCategory: (categoryName: string) => void;
}

const TASK_CARD_GRADIENT = 'bg-gradient-to-br from-[#000d45] via-[#0c2860] to-[#1161fe]';

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  Paintbrush,
  Sparkles,
  Truck,
  Wrench,
  PenTool,
  FileText,
  Hammer,
};

export default function CategoryCarousel({ onSelectCategory }: CategoryCarouselProps) {
  const items = useMemo<FeatureCarouselItem[]>(
    () =>
      CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.name,
        icon: IconMap[cat.iconName] || Wrench,
        image: cat.image,
        description: cat.description,
      })),
    []
  );

  return (
    <section className="w-full bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 max-w-2xl sm:mb-8">
          <h2 className={`${discoverHeadline} text-lg text-[#03113c] sm:text-2xl`}>
            Our top categories
          </h2>
          <p className={`${discoverBody} mt-2 text-xs text-gray-600 sm:text-sm`}>
            Find the exact help you need on tasknepal right now.
          </p>
        </div>

        <FeatureCarousel
          items={items}
          accentColor="#1161fe"
          panelClassName={TASK_CARD_GRADIENT}
          rightPanelClassName="bg-gradient-to-br from-[#000d45]/5 via-[#0c2860]/10 to-[#1161fe]/10"
          badgeLabel="Top category"
          onSelectItem={(item) => onSelectCategory(item.label)}
        />
      </div>
    </section>
  );
}
