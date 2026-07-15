'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import { getServicePackages, type Service, type ServicePackage } from './serviceListData';

interface ServiceComparePackagesProps {
  service: Service;
  selectedPackageId: ServicePackage['id'];
  onSelectPackage: (packageId: ServicePackage['id']) => void;
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
    render: (pkg) => <span className="text-sm text-neutral-700 dark:text-neutral-300">{pkg.pageCount}</span>,
  },
  {
    label: 'Revisions',
    render: (pkg) => <span className="text-sm text-neutral-700 dark:text-neutral-300">{pkg.revisions}</span>,
  },
  {
    label: 'Delivery Time',
    render: (pkg) => (
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        {pkg.deliveryDays} Day{pkg.deliveryDays === 1 ? '' : 's'}
      </span>
    ),
  },
  {
    label: 'Total',
    render: (pkg) => (
      <span className="text-sm font-normal text-black dark:text-stone-100">{formatNPR(pkg.price)}</span>
    ),
  },
];

function PackageHeader({ pkg }: { pkg: ServicePackage }) {
  return (
    <div className="px-4 py-5 text-left sm:px-5">
      <p className="text-[22px] font-normal tracking-tight text-black sm:text-2xl dark:text-stone-100">
        {formatNPR(pkg.price)}
        <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">/ project</span>
      </p>
      <p className="mt-3 text-base font-normal text-black dark:text-stone-100">{pkg.name}</p>
      <p className="mt-2 text-sm font-normal leading-relaxed text-neutral-500 dark:text-neutral-400">{pkg.description}</p>
    </div>
  );
}

export default function ServiceComparePackages({
  service,
  selectedPackageId,
  onSelectPackage,
}: ServiceComparePackagesProps) {
  const packages = getServicePackages(service);

  return (
    <section className="border-b border-neutral-200 pb-10 pt-10 dark:border-neutral-800">
      <h2 className="text-2xl font-normal tracking-tight text-black sm:text-[28px] dark:text-stone-100">
        Compare Packages
      </h2>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[640px] border border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="border-r border-neutral-200 bg-white last:border-r-0 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <PackageHeader pkg={pkg} />
              </div>
            ))}
          </div>

          {COMPARE_ROWS.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-4 border-b border-neutral-200 last:border-b-0 dark:border-neutral-800"
            >
              <div className="flex items-center border-r border-neutral-200 bg-white px-4 py-4 sm:px-5 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="text-sm font-normal text-black dark:text-stone-100">{row.label}</span>
              </div>
              {packages.map((pkg) => (
                <div
                  key={`${row.label}-${pkg.id}`}
                  className="flex items-center border-r border-neutral-200 bg-white px-4 py-4 sm:px-5 last:border-r-0 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  {row.render(pkg)}
                </div>
              ))}
            </div>
          ))}

          <div className="grid grid-cols-4">
            <div className="border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
            {packages.map((pkg) => (
              <div
                key={`select-${pkg.id}`}
                className="border-r border-neutral-200 bg-white p-4 sm:p-5 last:border-r-0 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <button
                  type="button"
                  onClick={() => onSelectPackage(pkg.id)}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-5 py-2.5 text-sm font-normal text-white transition-colors ${
                    selectedPackageId === pkg.id
                      ? 'bg-[#1D3E35] hover:bg-[#163329] dark:bg-emerald-900 dark:hover:bg-emerald-800'
                      : 'bg-[#52C47F] hover:bg-[#49b071]'
                  }`}
                >
                  {selectedPackageId === pkg.id ? 'Selected' : 'Select'}
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
