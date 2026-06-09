'use client';

import { Award, CheckCircle2, Droplets, Zap } from 'lucide-react';
import type { UserBadge } from '@/types';
import PublicProfileSection from '@/components/users/PublicProfileSection';

const LICENCE_BADGE_TYPES = new Set([
  'electrical_licence',
  'plumbing_licence',
  'custom_licence',
]);

type PublicLicenceBadgesProps = {
  badges?: UserBadge[] | null;
  embedded?: boolean;
};

function badgeIcon(badgeType: string) {
  switch (badgeType) {
    case 'electrical_licence':
      return <Zap className="h-5 w-5 text-emerald-600 shrink-0" />;
    case 'plumbing_licence':
      return <Droplets className="h-5 w-5 text-emerald-600 shrink-0" />;
    default:
      return <Award className="h-5 w-5 text-emerald-600 shrink-0" />;
  }
}

function isLicenceBadge(badge: UserBadge): boolean {
  const type = String(badge.badge_type ?? '').trim().toLowerCase();
  return LICENCE_BADGE_TYPES.has(type);
}

export function getVerifiedLicenceBadges(badges?: UserBadge[] | null): UserBadge[] {
  return (badges ?? []).filter((b) => isLicenceBadge(b) && b.is_verified !== false);
}

export default function PublicLicenceBadges({ badges, embedded = false }: PublicLicenceBadgesProps) {
  const verifiedLicences = getVerifiedLicenceBadges(badges);

  if (!verifiedLicences.length) return null;

  const list = (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {verifiedLicences.map((badge) => (
        <li
          key={badge.id}
          className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
        >
          <div className="rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-emerald-100">
            {badgeIcon(badge.badge_type)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-brand-dark">{badge.name}</p>
            {badge.description ? (
              <p className="mt-0.5 text-sm text-slate-600 line-clamp-2">{badge.description}</p>
            ) : null}
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </p>
          </div>
        </li>
      ))}
    </ul>
  );

  if (embedded) return list;

  return (
    <PublicProfileSection
      id="licences"
      eyebrow="Trust"
      title="Licence badges"
      description="Verified trade licences and certifications"
    >
      {list}
    </PublicProfileSection>
  );
}
