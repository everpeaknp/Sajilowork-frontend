'use client';

import { Award, CheckCircle2, Droplets, Zap } from 'lucide-react';
import { getVerifiedLicenceBadges } from '@/components/users/PublicLicenceBadges';
import type { UserBadge } from '@/types';

interface FreelancerLicenceBadgesProps {
  badges?: UserBadge[] | null;
}

function badgeIcon(badgeType: string) {
  switch (badgeType) {
    case 'electrical_licence':
      return <Zap className="h-5 w-5 text-[#52C47F]" strokeWidth={2} />;
    case 'plumbing_licence':
      return <Droplets className="h-5 w-5 text-[#52C47F]" strokeWidth={2} />;
    default:
      return <Award className="h-5 w-5 text-[#52C47F]" strokeWidth={2} />;
  }
}

export default function FreelancerLicenceBadges({ badges }: FreelancerLicenceBadgesProps) {
  const verifiedLicences = getVerifiedLicenceBadges(badges);

  if (!verifiedLicences.length) {
    return null;
  }

  return (
    <div className="mt-10 w-full max-w-4xl">
      <h3 className="mb-8 text-xl font-normal tracking-tight text-black sm:text-2xl dark:text-stone-100">
        Licence badges
      </h3>

      <div className="flex flex-col gap-8">
        {verifiedLicences.map((badge) => (
          <div key={badge.id} className="flex items-start gap-4 sm:gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-100 bg-[#EAF6F0] dark:border-neutral-700 dark:bg-emerald-950/50">
              {badgeIcon(badge.badge_type)}
            </div>
            <div className="min-w-0">
              <h4 className="text-base font-normal leading-snug tracking-tight text-black sm:text-lg dark:text-stone-100">
                {badge.name}
              </h4>
              {badge.description?.trim() ? (
                <p className="mt-2 max-w-3xl text-xs font-normal leading-relaxed text-black sm:text-sm dark:text-neutral-300">
                  {badge.description.trim()}
                </p>
              ) : null}
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-normal text-[#52C47F] sm:text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Verified
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
