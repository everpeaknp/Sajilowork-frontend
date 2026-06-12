'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import FreelancerProfileHero from './FreelancerProfileHero';
import FreelancerAbout from './FreelancerAbout';
import type { Freelancer } from './freelancerData';
import type { FreelancerProfileExtras } from '@/lib/freelancerProfileFromApi';

interface SingleFreelancerPageProps {
  freelancer: Freelancer;
  profileExtras?: FreelancerProfileExtras;
  onInquire?: (name: string, message?: string) => void | Promise<void>;
}

export default function SingleFreelancerPage({
  freelancer,
  profileExtras,
  onInquire,
}: SingleFreelancerPageProps) {
  return (
    <div className="select-none bg-white pb-12 pt-8 font-normal text-black">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <FreelancerProfileHero freelancer={freelancer} />
      </div>

      <FreelancerAbout
        freelancer={freelancer}
        profileExtras={profileExtras}
        onContact={(name, message) => onInquire?.(name, message)}
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-8">
          <p className="text-sm font-normal text-neutral-500">
            Browse more talent on the full freelancer directory.
          </p>
          <Link
            href="/freelancers"
            className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
          >
            Back to all freelancers
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
