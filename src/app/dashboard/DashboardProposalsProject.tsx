'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { formatNPR, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import { resolveListingBySlug } from '@/lib/resolveListingBySlug';
import { getMediaUrl } from '@/lib/utils';
import { bidService, extractBidList, getBidTaskId, sortBidsByIdAlphanumeric } from '@/services/bid.service';
import type { Task } from '@/types';
import type { Bid, BidStatus } from '@/types';
import {
  getDashboardHref,
  getEmployerBidDetailHref,
  type EmployerBidDetailFrom,
} from './dashboardTabs';
import WalletTableToolbar from './WalletTableToolbar';
import { matchesSearchQuery } from './dashboardListSearch';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';

interface DashboardProposalsProjectProps {
  projectSlug: string;
  backHref?: string;
  backLabel?: string;
  listingKinds?: Array<'task' | 'project' | 'job' | 'service'>;
  detailFrom?: EmployerBidDetailFrom;
}

type BidStatusFilter = 'all' | BidStatus;
type PriceSort = 'lowest' | 'highest';

const BID_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'expired', label: 'Expired' },
];

const PRICE_SORT_OPTIONS = [
  { value: 'lowest', label: 'Lowest first' },
  { value: 'highest', label: 'Highest first' },
];

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

export default function DashboardProposalsProject({
  projectSlug,
  backHref,
  backLabel,
  listingKinds,
  detailFrom = 'applications',
}: DashboardProposalsProjectProps) {
  const { isCustomer, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [listingKind, setListingKind] = useState<'task' | 'project' | 'job' | 'service' | ''>('');
  const [ownerId, setOwnerId] = useState<string | undefined>();
  const [bids, setBids] = useState<Bid[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BidStatusFilter>('all');
  const [priceSort, setPriceSort] = useState<PriceSort>('lowest');

  const isBidsView = detailFrom === 'bids';
  const isApplicationsView = detailFrom === 'applications';
  const showListToolbar = isBidsView || isApplicationsView;
  const resolvedBackHref =
    backHref ??
    getDashboardHref(
      isBidsView ? 'bids' : isApplicationsView ? 'applications' : isCustomer ? 'applications' : 'proposals',
    );
  const resolvedBackLabel =
    backLabel ??
    (isBidsView
      ? isCustomer
        ? 'Back to Bids'
        : 'Back to My bids'
      : isApplicationsView
        ? 'Back to Applications'
        : isCustomer
          ? 'Back to Applications'
          : 'Back to My Proposals');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const task = await resolveListingBySlug(projectSlug, listingKinds);
      if (!task) {
        throw new Error('Listing not found');
      }
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
      const kind = task.listing_kind as string | undefined;
      setListingKind(
        kind === 'project' ||
          kind === 'task' ||
          kind === 'job' ||
          kind === 'service'
          ? (kind as 'task' | 'project' | 'job' | 'service')
          : '',
      );
      setOwnerId(resolvedOwnerId);

      if (isCustomer) {
        if (user?.id && resolvedOwnerId && String(user?.id) !== String(resolvedOwnerId)) {
          toast.error('You can only review proposals on your own listings.');
          setBids([]);
          return;
        }

        const bidsResponse = await bidService.getTaskBids(task.id);
        if (bidsResponse.success && bidsResponse.data) {
          setBids(sortBidsByIdAlphanumeric(extractBidList(bidsResponse.data)));
        } else {
          setBids([]);
        }
        return;
      }

      const myBidsResponse = await bidService.getMyBids();
      if (myBidsResponse.success && myBidsResponse.data) {
        const taskId = String(task.id);
        const mine = extractBidList(myBidsResponse.data).filter(
          (bid) => bid.task_slug === projectSlug || getBidTaskId(bid) === taskId,
        );
        setBids(sortBidsByIdAlphanumeric(mine));
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
  }, [isCustomer, listingKinds, projectSlug, user?.id]);

  useEffect(() => {
    if (isBidsView || isCustomer) {
      void loadData();
    }
  }, [isBidsView, isCustomer, loadData]);

  const filteredBids = useMemo(() => {
    const filtered = bids.filter((bid) => {
      if (statusFilter !== 'all' && bid.status !== statusFilter) return false;
      const name = taskerName(bid);
      return matchesSearchQuery(
        searchQuery,
        name,
        bid.tasker?.email,
        bid.tasker?.username,
        bid.proposal,
        bid.cover_letter,
        bid.status,
        String(bid.amount),
        formatNPR(Number(bid.amount) || 0),
      );
    });

    return [...filtered].sort((a, b) => {
      const amountA = Number(a.amount) || 0;
      const amountB = Number(b.amount) || 0;
      return priceSort === 'lowest' ? amountA - amountB : amountB - amountA;
    });
  }, [bids, priceSort, searchQuery, statusFilter]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== 'all' || priceSort !== 'lowest';
  const isEmptyFromFilters = !loading && bids.length > 0 && filteredBids.length === 0;

  if (!isCustomer && !isBidsView) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-sm text-neutral-600 dark:border dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        Proposal review is available for employer accounts.
      </div>
    );
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} space-y-6`}>
      <div className="flex flex-col gap-4">
        <Link
          href={resolvedBackHref}
          className="inline-flex w-fit items-center gap-2 text-sm font-normal text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {resolvedBackLabel}
        </Link>

        <div>
          <h2 className="font-sans text-3xl font-normal tracking-tight text-black dark:text-stone-100">
            {projectTitle || (isApplicationsView ? 'Job applications' : 'Listing bids')}
          </h2>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm text-neutral-800 dark:text-neutral-300">
            {listingKind ? (
              <>
                <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs capitalize text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {listingKind}
                </span>
                <span className="text-neutral-300 dark:text-neutral-600">|</span>
              </>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
              {projectLocation}
            </span>
            <span className="text-neutral-300 dark:text-neutral-600">|</span>
            <span>
              {hasActiveFilters
                ? `${filteredBids.length} of ${bids.length} bid${bids.length === 1 ? '' : 's'}`
                : `${bids.length} bid${bids.length === 1 ? '' : 's'}`}
            </span>
          </p>
        </div>
      </div>

      {showListToolbar ? (
        <WalletTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={
            isApplicationsView
              ? 'Search applications by freelancer, amount, or proposal'
              : isCustomer
                ? 'Search bids by freelancer, amount, or proposal'
                : 'Search your bid by amount or proposal'
          }
          filterStatus={statusFilter}
          onFilterChange={(value) => setStatusFilter(value as BidStatusFilter)}
          filterOptions={BID_STATUS_FILTER_OPTIONS}
          filterLabel={isApplicationsView ? 'Application status:' : 'Bid status:'}
          secondaryFilterStatus={priceSort}
          onSecondaryFilterChange={(value) => setPriceSort(value as PriceSort)}
          secondaryFilterOptions={PRICE_SORT_OPTIONS}
          secondaryFilterLabel="Price:"
        />
      ) : null}

      <div className="rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-8 dark:border dark:border-neutral-800 dark:bg-neutral-900">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500 dark:text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading {isApplicationsView ? 'applications' : 'proposals'}…
          </div>
        ) : bids.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {isApplicationsView
              ? 'No applications received for this job yet.'
              : isCustomer
                ? 'No bids received for this listing yet.'
                : 'You have not submitted a bid on this listing yet.'}
          </p>
        ) : isEmptyFromFilters ? (
          <div className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
            <p className="font-medium text-neutral-900 dark:text-stone-100">
              No {isApplicationsView ? 'applications' : 'bids'} match your search
            </p>
            <p className="mt-2">Try a different keyword or clear the filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredBids.map((bid) => (
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
                      <h4 className="text-[15px] font-medium text-black dark:text-stone-100">{taskerName(bid)}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDisplayDate(bid.created_at)}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-600">|</span>
                        <span className="capitalize">{bid.status}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 break-words text-sm text-neutral-700 [overflow-wrap:anywhere] dark:text-neutral-300">
                        {bid.proposal}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <p className="text-[15px] font-medium text-black dark:text-stone-100">
                    {formatNPR(Number(bid.amount) || 0)}
                  </p>
                </div>

                <div className="col-span-12 md:col-span-2 md:text-right">
                  {isCustomer ? (
                    <Link
                      href={getEmployerBidDetailHref(projectSlug, bid.id, detailFrom)}
                      className="inline-flex rounded-lg bg-[#FEF1EE] px-4 py-2.5 text-sm font-normal text-[#FF6B6B] transition-colors hover:bg-[#FCE2DC] dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                    >
                      View
                    </Link>
                  ) : (
                    <Link
                      href={getEmployerBidDetailHref(projectSlug, bid.id, 'bids')}
                      className="inline-flex rounded-lg bg-[#FEF1EE] px-4 py-2.5 text-sm font-normal text-[#FF6B6B] transition-colors hover:bg-[#FCE2DC] dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                    >
                      View offer
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
