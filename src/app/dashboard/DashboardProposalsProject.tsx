'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { formatNPR, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import { getMediaUrl } from '@/lib/utils';
import { projectService } from '@/services/project.service';
import { bidService, extractBidList, sortBidsByIdAlphanumeric } from '@/services/bid.service';
import type { Bid } from '@/types';
import {
  getDashboardHref,
  getDashboardProposalDetailHref,
} from './dashboardTabs';

interface DashboardProposalsProjectProps {
  projectSlug: string;
}

function formatDisplayDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
}

function taskerName(bid: Bid): string {
  const tasker = bid.tasker;
  if (!tasker) return 'Freelancer';
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || tasker.email || 'Freelancer';
}

export default function DashboardProposalsProject({ projectSlug }: DashboardProposalsProjectProps) {
  const { isCustomer, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [ownerId, setOwnerId] = useState<string | undefined>();
  const [bids, setBids] = useState<Bid[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const projectResponse = await projectService.getProjectBySlug(projectSlug);
      if (!projectResponse.success || !projectResponse.data) {
        throw new Error(projectResponse.message || 'Project not found');
      }

      const task = projectResponse.data;
      const project = mapTaskToPublicProject(task);
      const resolvedOwnerId =
        typeof task.owner === 'string'
          ? task.owner
          : task.owner && typeof task.owner === 'object'
            ? String(task.owner.id)
            : undefined;

      setProjectTitle(project.title);
      const rawLocation = project.locationLabel || project.location || 'Remote';
      setProjectLocation(
        /^remote$/i.test(rawLocation)
          ? 'Remote'
          : shortenCommaSeparatedLocation(rawLocation, 1),
      );
      setOwnerId(resolvedOwnerId);

      if (user?.id && resolvedOwnerId && String(user.id) !== String(resolvedOwnerId)) {
        toast.error('You can only review proposals on your own projects.');
        setBids([]);
        return;
      }

      const bidsResponse = await bidService.getTaskBids(task.id);
      if (bidsResponse.success && bidsResponse.data) {
        setBids(sortBidsByIdAlphanumeric(extractBidList(bidsResponse.data)));
      } else {
        setBids([]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load proposals';
      toast.error(message);
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [projectSlug, user?.id]);

  useEffect(() => {
    if (!isCustomer) return;
    void loadData();
  }, [isCustomer, loadData]);

  if (!isCustomer) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-sm text-neutral-600">
        Proposal review is available for employer accounts.
      </div>
    );
  }

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen space-y-6 bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="flex flex-col gap-4">
        <Link
          href={getDashboardHref('proposals')}
          className="inline-flex w-fit items-center gap-2 text-sm font-normal text-neutral-700 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Proposals
        </Link>

        <div>
          <h2 className="font-sans text-3xl font-normal tracking-tight text-black">
            {projectTitle || 'Project proposals'}
          </h2>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm text-neutral-800">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-neutral-500" />
              {projectLocation}
            </span>
            <span className="text-neutral-300">|</span>
            <span>{bids.length} proposal{bids.length === 1 ? '' : 's'}</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading proposals…
          </div>
        ) : bids.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500">
            No proposals received for this project yet.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="grid grid-cols-12 items-center gap-4 py-6 first:pt-0 last:pb-0"
              >
                <div className="col-span-12 md:col-span-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-600">
                      {bid.tasker?.profile_image ? (
                        <img
                          src={getMediaUrl(bid.tasker.profile_image)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Briefcase className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-medium text-black">{taskerName(bid)}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-neutral-600">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDisplayDate(bid.created_at)}
                        </span>
                        <span className="text-neutral-300">|</span>
                        <span className="capitalize">{bid.status}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 break-words text-sm text-neutral-700 [overflow-wrap:anywhere]">
                        {bid.proposal}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <p className="text-[15px] font-medium text-black">
                    {formatNPR(Number(bid.amount) || 0)}
                  </p>
                </div>

                <div className="col-span-12 md:col-span-2 md:text-right">
                  <Link
                    href={getDashboardProposalDetailHref(projectSlug, bid.id)}
                    className="inline-flex rounded-lg bg-[#FEF1EE] px-4 py-2.5 text-sm font-normal text-[#FF6B6B] transition-colors hover:bg-[#FCE2DC]"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
