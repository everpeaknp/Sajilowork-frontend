'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, Hourglass, RotateCcw } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import { getServicePackages, type Service } from './serviceListData';

interface ServicePlanCardProps {
  service: Service;
}

export default function ServicePlanCard({ service }: ServicePlanCardProps) {
  const packages = getServicePackages(service);
  const [activeId, setActiveId] = useState(packages[0]?.id ?? 'basic');
  const activePackage = packages.find((pkg) => pkg.id === activeId) ?? packages[0];

  if (!activePackage) return null;

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-6 border-b border-neutral-200 pb-4">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            onClick={() => setActiveId(pkg.id)}
            className={`cursor-pointer pb-1 text-sm font-normal transition-colors ${
              activeId === pkg.id
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {pkg.name}
          </button>
        ))}
      </div>

      <p className="mt-5 text-[28px] font-normal tracking-tight text-black">
        {formatNPR(activePackage.price)}
      </p>

      <h3 className="mt-3 text-lg font-normal text-black">{activePackage.title}</h3>
      <p className="mt-2 text-sm font-normal leading-relaxed text-neutral-500">
        {activePackage.description}
      </p>

      <ul className="mt-5 space-y-3 border-b border-neutral-200 pb-5 text-sm font-normal text-neutral-700">
        <li className="flex items-center gap-2.5">
          <Hourglass className="h-4 w-4 shrink-0 text-neutral-400" />
          {activePackage.deliveryDays} Days Delivery
        </li>
        <li className="flex items-center gap-2.5">
          <RotateCcw className="h-4 w-4 shrink-0 text-neutral-400" />
          {activePackage.revisions} Revisions
        </li>
        {activePackage.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <Check className="h-4 w-4 shrink-0 text-[#52C47F]" strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#52C47F] px-6 py-3.5 text-[15px] font-normal text-white transition-colors hover:bg-[#49b071]"
      >
        Continue {formatNPR(activePackage.price)}
        <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
      </button>
    </div>
  );
}
