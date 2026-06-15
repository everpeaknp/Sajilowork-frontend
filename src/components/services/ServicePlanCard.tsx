'use client';

import { ArrowUpRight, Check, Hourglass, RotateCcw } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import { getServicePackages, type Service, type ServicePackage } from './serviceListData';

interface ServicePlanCardProps {
  service: Service;
  selectedPackageId: ServicePackage['id'];
  onSelectPackage: (packageId: ServicePackage['id']) => void;
  onPurchase?: (pkg: ServicePackage) => void;
}

function PackagePanel({
  pkg,
  onPurchase,
}: {
  pkg: ServicePackage;
  onPurchase?: (pkg: ServicePackage) => void;
}) {
  return (
    <>
      <p className="text-[28px] font-normal tracking-tight text-black">
        {formatNPR(pkg.price)}
      </p>

      <h3 className="mt-3 text-lg font-normal text-black">{pkg.title}</h3>
      <p className="mt-2 min-h-[3.25rem] text-sm font-normal leading-relaxed text-neutral-500">
        {pkg.description}
      </p>

      <ul className="mt-5 space-y-3 border-b border-neutral-200 pb-5 text-sm font-normal text-neutral-700">
        <li className="flex items-center gap-2.5">
          <Hourglass className="h-4 w-4 shrink-0 text-neutral-400" />
          {pkg.deliveryDays} Days Delivery
        </li>
        <li className="flex items-center gap-2.5">
          <RotateCcw className="h-4 w-4 shrink-0 text-neutral-400" />
          {pkg.revisions} Revisions
        </li>
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <Check className="h-4 w-4 shrink-0 text-[#52C47F]" strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onPurchase?.(pkg)}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#52C47F] px-6 py-3.5 text-[15px] font-normal text-white transition-colors hover:bg-[#49b071]"
      >
        Continue {formatNPR(pkg.price)}
        <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
      </button>
    </>
  );
}

export default function ServicePlanCard({
  service,
  selectedPackageId,
  onSelectPackage,
  onPurchase,
}: ServicePlanCardProps) {
  const packages = getServicePackages(service);

  if (!packages.length) return null;

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-6 border-b border-neutral-200 pb-4">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            onClick={() => onSelectPackage(pkg.id)}
            className={`cursor-pointer pb-1 text-sm font-normal transition-colors ${
              selectedPackageId === pkg.id
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {pkg.name}
          </button>
        ))}
      </div>

      <div className="mt-5 grid [&>*]:col-start-1 [&>*]:row-start-1">
        {packages.map((pkg) => {
          const isActive = selectedPackageId === pkg.id;

          return (
            <div
              key={pkg.id}
              className={`col-start-1 row-start-1 transition-opacity duration-200 ${
                isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={!isActive}
            >
              <PackagePanel pkg={pkg} onPurchase={onPurchase} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
