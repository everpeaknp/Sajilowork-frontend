'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import FreelancerProfileHero from '@/components/freelancers/FreelancerProfileHero';
import FreelancerProfileEmptyState from '@/components/freelancers/FreelancerProfileEmptyState';
import FreelancerAbout from '@/components/freelancers/FreelancerAbout';
import { getFreelancerProfilePath } from '@/components/freelancers/freelancerSlug';
import { loadFreelancerPageData } from '@/lib/freelancerApi';
import type { FreelancerProfileBundle } from '@/lib/freelancerProfileFromApi';
import { getMediaUrl } from '@/lib/utils';
import type { Bid } from '@/types';

type ProposalFreelancerProfileProps = {
  bid: Bid;
  loadingMessage?: string;
};

function taskerDisplayName(bid: Bid): string {
  const tasker = bid.tasker;
  if (!tasker) return 'Freelancer';
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || tasker.email || 'Freelancer';
}

function resolveFreelancerSlug(bid: Bid): string {
  const tasker = bid.tasker;
  if (!tasker) return '';
  return String(tasker.username || tasker.id || '').trim();
}

function resolveFreelancerAvatar(bid: Bid, profileAvatar?: string): string {
  const fromProfile = profileAvatar?.trim() || '';
  if (fromProfile) return fromProfile;
  const fromBid = bid.tasker?.profile_image?.trim();
  return fromBid ? getMediaUrl(fromBid) : '';
}

export default function ProposalFreelancerProfile({
  bid,
  loadingMessage = 'Loading freelancer profile…',
}: ProposalFreelancerProfileProps) {
  const [bundle, setBundle] = useState<FreelancerProfileBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const slug = resolveFreelancerSlug(bid);
  const displayName = taskerDisplayName(bid);

  useEffect(() => {
    let cancelled = false;

    if (!slug) {
      setBundle(null);
      setLoadFailed(true);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setLoadFailed(false);

    void loadFreelancerPageData(slug)
      .then((loaded) => {
        if (cancelled) return;
        setBundle(loaded);
        setLoadFailed(!loaded);
      })
      .catch(() => {
        if (cancelled) return;
        setBundle(null);
        setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#52C47F]" />
        <p className="text-sm text-neutral-500">{loadingMessage}</p>
      </div>
    );
  }

  if (!bundle || loadFailed) {
    return (
      <div className="overflow-hidden rounded-[20px] border border-neutral-200/80 bg-white">
        <FreelancerProfileEmptyState name={displayName} username={bid.tasker?.username ?? undefined} />
      </div>
    );
  }

  const profileHref = getFreelancerProfilePath(bundle.freelancer);
  const freelancer = {
    ...bundle.freelancer,
    avatar: resolveFreelancerAvatar(bid, bundle.freelancer.avatar),
  };

  return (
    <div className="overflow-hidden rounded-[20px] bg-white">
      <div className="border-b border-neutral-100 bg-white px-4 py-3 sm:px-6">
        <Link
          href={profileHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-normal text-[#45a874] transition-opacity hover:opacity-80"
        >
          View public profile
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {!bundle.isProfileConfigured ? (
        <FreelancerProfileEmptyState
          name={freelancer.name}
          username={freelancer.username}
        />
      ) : (
        <div className="bg-white">
          <div className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
            <FreelancerProfileHero freelancer={freelancer} embedded />
          </div>
          <FreelancerAbout
            freelancer={freelancer}
            profileExtras={bundle.extras}
            embedded
          />
        </div>
      )}
    </div>
  );
}
