'use client';

import React from 'react';
import { discoverBody } from '@/components/LangingHome/landingTypography';

const PARTNER_NAMES = [
  'Local SMEs',
  'Startups',
  'Agencies',
  'Enterprises',
  'Freelancers',
  'Communities',
] as const;

interface PartnersProps {
  className?: string;
}

export default function Partners({ className = '' }: PartnersProps) {
  return (
    <section
      className={`w-full select-none bg-white py-10 sm:py-14 ${className}`}
    >
      <div className="flex w-full flex-col items-center px-6 sm:px-8 lg:px-12 xl:px-16">
        <h3
          className={`${discoverBody} mb-8 text-center text-sm tracking-normal text-neutral-500 sm:mb-10 sm:text-base`}
        >
          Built for teams across Nepal
        </h3>
      </div>

      <div className="grid w-full grid-cols-2 items-center gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-8 md:px-12 lg:grid-cols-6 lg:px-16">
        {PARTNER_NAMES.map((name) => (
          <div
            key={name}
            className="flex h-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500 sm:text-sm"
          >
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
