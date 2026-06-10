'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import { getServicePackages, type Service, type ServicePackage } from './serviceListData';

interface ServiceComparePackagesProps {
  service: Service;
}

const COMPARE_ROWS: {
  label: string;
  render: (pkg: ServicePackage) => ReactNode;
}[] = [
  {
    label: 'Source file',
    render: (pkg) =>
      pkg.sourceFile ? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#52C47F]">
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </span>
      ) : (
        <span className="text-sm text-neutral-400">—</span>
      ),
  },
  {
    label: 'Number of pages',
    render: (pkg) => <span className="text-sm text-neutral-700">{pkg.pageCount}</span>,
  },
  {
    label: 'Revisions',
    render: (pkg) => <span className="text-sm text-neutral-700">{pkg.revisions}</span>,
  },
  {
    label: 'Delivery Time',
    render: (pkg) => (
      <span className="text-sm text-neutral-700">
        {pkg.deliveryDays} Day{pkg.deliveryDays === 1 ? '' : 's'}
      </span>
    ),
  },
  {
    label: 'Total',
    render: (pkg) => (
      <span className="text-sm font-normal text-black">{formatNPR(pkg.price)}</span>
    ),
  },
];

function PackageHeader({ pkg }: { pkg: ServicePackage }) {
  return (
    <div className="px-4 py-5 text-left sm:px-5">
      <p className="text-[22px] font-normal tracking-tight text-black sm:text-2xl">
        {formatNPR(pkg.price)}
        <span className="ml-1 text-sm font-normal text-neutral-500">/ project</span>
      </p>
      <p className="mt-3 text-base font-normal text-black">{pkg.name}</p>
      <p className="mt-2 text-sm font-normal leading-relaxed text-neutral-500">{pkg.description}</p>
    </div>
  );
}

export default function ServiceComparePackages({ service }: ServiceComparePackagesProps) {
  const packages = getServicePackages(service);

  return (
    <section className="border-b border-neutral-200 pb-10 pt-10">
      <h2 className="text-2xl font-normal tracking-tight text-black sm:text-[28px]">
        Compare Packages
      </h2>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[640px] border border-neutral-200">
          <div className="grid grid-cols-4 border-b border-neutral-200">
            <div className="border-r border-neutral-200 bg-white" />
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="border-r border-neutral-200 bg-white last:border-r-0"
              >
                <PackageHeader pkg={pkg} />
              </div>
            ))}
          </div>

          {COMPARE_ROWS.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-4 border-b border-neutral-200 last:border-b-0"
            >
              <div className="flex items-center border-r border-neutral-200 bg-white px-4 py-4 sm:px-5">
                <span className="text-sm font-normal text-black">{row.label}</span>
              </div>
              {packages.map((pkg) => (
                <div
                  key={`${row.label}-${pkg.id}`}
                  className="flex items-center border-r border-neutral-200 bg-white px-4 py-4 sm:px-5 last:border-r-0"
                >
                  {row.render(pkg)}
                </div>
              ))}
            </div>
          ))}

          <div className="grid grid-cols-4">
            <div className="border-r border-neutral-200 bg-white" />
            {packages.map((pkg) => (
              <div
                key={`select-${pkg.id}`}
                className="border-r border-neutral-200 bg-white p-4 sm:p-5 last:border-r-0"
              >
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#52C47F] px-5 py-2.5 text-sm font-normal text-white transition-colors hover:bg-[#49b071]"
                >
                  Select
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
