'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import FreelancerProfileHero from './FreelancerProfileHero';
import FreelancerAbout from './FreelancerAbout';
import FreelancerProfileEmptyState from './FreelancerProfileEmptyState';
import type { Freelancer } from './freelancerData';
import type { FreelancerProfileExtras } from '@/lib/freelancerProfileFromApi';

interface SingleFreelancerPageProps {
  freelancer: Freelancer;
  profileExtras?: FreelancerProfileExtras;
  isProfileConfigured?: boolean;
  isOwnProfile?: boolean;
  onInquire?: (name: string, message?: string) => void | Promise<void>;
  onNotification?: (message: string) => void;
}

export default function SingleFreelancerPage({
  freelancer: initialFreelancer,
  profileExtras,
  isProfileConfigured = true,
  isOwnProfile = false,
  onInquire,
  onNotification,
}: SingleFreelancerPageProps) {
  const [freelancer, setFreelancer] = useState(initialFreelancer);

  useEffect(() => {
    setFreelancer(initialFreelancer);
  }, [initialFreelancer]);

  const handleReviewsUpdated = useCallback((count: number, average: number) => {
    setFreelancer((prev) => {
      if (prev.reviews === count && prev.rating === average) {
        return prev;
      }
      return { ...prev, reviews: count, rating: average };
    });
  }, []);
  if (!isProfileConfigured) {
    return (
      <div className="select-none bg-white pb-12 pt-8 font-normal text-black dark:bg-neutral-950 dark:text-stone-100">
        <FreelancerProfileEmptyState
          name={freelancer.name}
          username={freelancer.username}
          isOwnProfile={isOwnProfile}
        />
      </div>
    );
  }

  return (
    <div className="select-none bg-white pb-12 pt-8 font-normal text-black dark:bg-neutral-950 dark:text-stone-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <FreelancerProfileHero freelancer={freelancer} />
      </div>

      <FreelancerAbout
        freelancer={freelancer}
        profileExtras={profileExtras}
        onContact={(name, message) => onInquire?.(name, message)}
        showToast={onNotification}
        onReviewsUpdated={handleReviewsUpdated}
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-8 dark:border-neutral-800">
          <p className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
            Browse more talent on the full freelancer directory.
          </p>
          <Link
            href="/freelancers"
            className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80 dark:text-stone-100"
          >
            Back to all freelancers
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
