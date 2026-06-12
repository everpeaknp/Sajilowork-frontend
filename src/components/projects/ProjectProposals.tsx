'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, FileText, Loader2, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { bidService, extractBidList } from '@/services/bid.service';
import { formatNPR } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import type { Bid } from '@/types';
import type { Project } from './projectListData';

interface ProjectProposalsProps {
  project: Project;
  refreshKey?: number;
}

function MetaDivider() {
  return <span className="h-3.5 w-px shrink-0 bg-neutral-300" aria-hidden />;
}

function formatBidDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
}

function taskerDisplayName(bid: Bid): string {
  const tasker = bid.tasker;
  if (!tasker) return 'Freelancer';
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || tasker.email || 'Freelancer';
}

function taskerAvatar(bid: Bid): string {
  const image = bid.tasker?.profile_image;
  if (image) return getMediaUrl(image);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(taskerDisplayName(bid))}`;
}

export default function ProjectProposals({ project, refreshKey = 0 }: ProjectProposalsProps) {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner =
    Boolean(user?.id) && Boolean(project.ownerId) && String(user.id) === String(project.ownerId);

  const loadBids = useCallback(async () => {
    if (!project.id) {
      setBids([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await bidService.getTaskBids(project.id);
      if (response.success && response.data) {
        setBids(extractBidList(response.data));
      } else {
        setBids([]);
      }
    } catch {
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    void loadBids();
  }, [loadBids, refreshKey]);

  return (
    <section className="border-t border-neutral-200 pt-10">
      <h2 className="mb-6 text-xl font-normal tracking-tight text-black sm:text-2xl">
        Project Proposals ({bids.length})
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-sm font-normal text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading proposals…
        </div>
      ) : bids.length === 0 ? (
        <p className="text-sm font-normal text-neutral-500">
          {isOwner
            ? 'No proposals yet. Freelancers can submit from the form below.'
            : 'No proposals yet. Be the first to submit yours below.'}
        </p>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <article
              key={bid.id}
              className="rounded-lg border border-neutral-200 bg-white px-5 py-5 sm:px-6 sm:py-6"
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="relative shrink-0">
                  <img
                    src={taskerAvatar(bid)}
                    alt={taskerDisplayName(bid)}
                    className="h-16 w-16 rounded-full border border-neutral-100 bg-neutral-50 object-cover sm:h-[72px] sm:w-[72px]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#52C47F]" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-normal text-black sm:text-lg">
                      {taskerDisplayName(bid)}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-normal text-neutral-500">
                      {bid.tasker?.average_rating != null ? (
                        <>
                          <span className="inline-flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            {Number(bid.tasker.average_rating).toFixed(1)}
                          </span>
                          <MetaDivider />
                        </>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        {formatBidDate(bid.created_at)}
                      </span>
                      <MetaDivider />
                      <span className="inline-flex items-center gap-1.5 capitalize">
                        <FileText className="h-4 w-4 text-neutral-400" />
                        {bid.status}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm font-normal leading-normal text-black sm:text-[15px]">
                      {bid.proposal}
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-lg font-normal text-black sm:text-xl">
                      {formatNPR(Number(bid.amount) || 0)}
                    </p>
                    <p className="mt-1 text-sm font-normal capitalize text-neutral-500">
                      {project.type === 'Hourly' ? 'Hourly offer' : 'Fixed offer'}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
