'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  MapPin,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';
import { fetchMyListingTasks } from '@/lib/dashboardListingApi';
import { formatNPR, formatTaskLocationShort, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import { renderEmployerBrandLogo } from '@/components/employers/employerLogos';
import { bidService, extractBidList } from '@/services/bid.service';
import type { Bid } from '@/types';
import type { Task } from '@/types';
import { getDashboardApplicationsListingHref, getEmployerBidDetailHref } from './dashboardTabs';
import { matchesSearchQuery } from './dashboardListSearch';
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_PAGINATION_ARROW_PLAIN,
  DASHBOARD_PAGINATION_INNER,
  DASHBOARD_PAGINATION_OUTER,
  DASHBOARD_SUBTABS_ROW,
  DASHBOARD_SUBTABS_WRAP,
  dashboardPageButtonClass,
  dashboardSubtabClass,
} from './dashboardResponsive';

type ApplicationViewTab = 'applications' | 'shortlisted';

const APPLICATION_VIEW_TABS: { key: ApplicationViewTab; label: string }[] = [
  { key: 'applications', label: 'Applications' },
  { key: 'shortlisted', label: 'Shortlisted' },
];

type ApplicationActivityFilter = 'all' | 'pending' | 'has_any' | 'none';

const APPLICATION_ACTIVITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All jobs' },
  { value: 'pending', label: 'With pending applications' },
  { value: 'has_any', label: 'With applications' },
  { value: 'none', label: 'No applications yet' },
];

type JobBidStats = {
  total: number;
  pending: number;
  accepted: number;
  cancelled: number;
  latestTs: number;
  latestDate: string;
};

type JobApplicationGroup = {
  slug: string;
  title: string;
  location: string;
  imageUrl?: string;
  ownerLogoUrl?: string;
  ownerLogoText?: string;
  ownerLogoColor?: string;
  ownerName?: string;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  cancelledApplications: number;
  latestDate: string;
  latestTs: number;
};

type ShortlistedFreelancerRow = {
  bidId: string;
  jobSlug: string;
  jobTitle: string;
  location: string;
  freelancerName: string;
  avatarUrl?: string;
  amount: number;
  acceptedDate: string;
  acceptedTs: number;
};

const ITEMS_PER_PAGE = 10;

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

function getTaskerDisplayName(tasker: Bid['tasker']): string {
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || 'Freelancer';
}

function buildShortlistedRows(jobs: Task[], bids: Bid[]): ShortlistedFreelancerRow[] {
  const jobBySlug = new Map(
    jobs
      .map((job) => {
        const slug = job.slug?.trim();
        return slug ? ([slug, job] as const) : null;
      })
      .filter((entry): entry is [string, Task] => entry !== null),
  );

  return bids
    .filter((bid) => bid.status === 'accepted' && bid.task_listing_kind === 'job')
    .map((bid) => {
      const jobSlug = bid.task_slug?.trim() || '';
      const job = jobSlug ? jobBySlug.get(jobSlug) : undefined;
      const acceptedTs = new Date(bid.accepted_at || bid.created_at || 0).getTime();

      return {
        bidId: bid.id,
        jobSlug,
        jobTitle: bid.task_title?.trim() || job?.title?.trim() || 'Job',
        location: job ? formatJobLocation(job) : formatJobLocationFromCity(bid.task_city),
        freelancerName: getTaskerDisplayName(bid.tasker),
        avatarUrl: bid.tasker?.profile_image?.trim() || undefined,
        amount: Number(bid.amount) || 0,
        acceptedDate: formatDisplayDate(bid.accepted_at || bid.created_at),
        acceptedTs: Number.isNaN(acceptedTs) ? 0 : acceptedTs,
      };
    })
    .filter((row) => row.jobSlug && row.bidId)
    .sort(
      (a, b) =>
        b.acceptedTs - a.acceptedTs ||
        a.freelancerName.localeCompare(b.freelancerName) ||
        a.jobTitle.localeCompare(b.jobTitle),
    );
}

function formatJobLocationFromCity(city?: string | null): string {
  const raw = city?.trim();
  if (!raw || /^remote$/i.test(raw)) return 'Remote';
  return shortenCommaSeparatedLocation(raw, 1);
}
function formatJobLocation(task: Task): string {
  const raw = formatTaskLocationShort(task) || task.city || '';
  if (!raw.trim() || /^remote$/i.test(raw)) return 'Remote';
  return shortenCommaSeparatedLocation(raw, 1);
}

function isCancelledBidStatus(status: string): boolean {
  return status === 'rejected' || status === 'withdrawn' || status === 'expired';
}

function aggregateJobBidStats(bids: Bid[]): Map<string, JobBidStats> {
  const stats = new Map<string, JobBidStats>();

  for (const bid of bids) {
    if (bid.task_listing_kind !== 'job') continue;
    const slug = bid.task_slug?.trim();
    if (!slug) continue;

    const ts = new Date(bid.created_at || 0).getTime();
    const existing = stats.get(slug);

    if (!existing) {
      stats.set(slug, {
        total: 1,
        pending: bid.status === 'pending' ? 1 : 0,
        accepted: bid.status === 'accepted' ? 1 : 0,
        cancelled: isCancelledBidStatus(bid.status) ? 1 : 0,
        latestTs: Number.isNaN(ts) ? 0 : ts,
        latestDate: formatDisplayDate(bid.created_at),
      });
      continue;
    }

    existing.total += 1;
    if (bid.status === 'pending') existing.pending += 1;
    if (bid.status === 'accepted') existing.accepted += 1;
    if (isCancelledBidStatus(bid.status)) existing.cancelled += 1;
    if (!Number.isNaN(ts) && ts > existing.latestTs) {
      existing.latestTs = ts;
      existing.latestDate = formatDisplayDate(bid.created_at);
    }
  }

  return stats;
}

function buildJobApplicationGroups(jobs: Task[], bidStats: Map<string, JobBidStats>): JobApplicationGroup[] {
  const result: JobApplicationGroup[] = [];

  for (const job of jobs) {
    const slug = job.slug?.trim();
    if (!slug) continue;

    const stats = bidStats.get(slug);
    const createdTs = new Date(job.created_at || 0).getTime();
    const ownerName =
      job.owner_business_name?.trim() ||
      (typeof job.owner === 'object' && job.owner && 'first_name' in job.owner
        ? [job.owner.first_name, job.owner.last_name].filter(Boolean).join(' ').trim()
        : '') ||
      undefined;

    result.push({
      slug,
      title: job.title?.trim() || 'Job',
      location: formatJobLocation(job),
      imageUrl: job.primary_image?.trim() || undefined,
      ownerLogoUrl: job.owner_logo_url?.trim() || undefined,
      ownerLogoText: job.owner_logo_text?.trim() || undefined,
      ownerLogoColor: job.owner_logo_color?.trim() || undefined,
      ownerName,
      totalApplications: stats?.total ?? 0,
      pendingApplications: stats?.pending ?? 0,
      acceptedApplications: stats?.accepted ?? 0,
      cancelledApplications: stats?.cancelled ?? 0,
      latestDate: stats?.latestDate || formatDisplayDate(job.created_at),
      latestTs: stats?.latestTs || (Number.isNaN(createdTs) ? 0 : createdTs),
    });
  }

  return result.sort((a, b) => b.latestTs - a.latestTs || a.title.localeCompare(b.title));
}

function matchesActivityFilter(group: JobApplicationGroup, filter: ApplicationActivityFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'none') return group.totalApplications === 0;
  if (filter === 'pending') return group.pendingApplications > 0;
  return group.totalApplications > 0;
}

function JobApplicationAvatar({ group }: { group: JobApplicationGroup }) {
  const ownerName = group.ownerName?.trim() || group.title;
  const logoUrl = group.ownerLogoUrl?.trim() ? getMediaUrl(group.ownerLogoUrl) : undefined;
  const listingImageSrc = group.imageUrl?.trim() ? getMediaUrl(group.imageUrl) : '';

  return (
    <div className="h-14 w-14 shrink-0 [&>*]:!h-14 [&>*]:!w-14">
      {renderEmployerBrandLogo(
        group.ownerLogoColor ?? 'serif-m',
        ownerName,
        logoUrl || listingImageSrc || undefined,
        group.ownerLogoText,
      )}
    </div>
  );
}

export default function DashboardEmployerApplications() {
  const { isCustomer, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<JobApplicationGroup[]>([]);
  const [shortlistedRows, setShortlistedRows] = useState<ShortlistedFreelancerRow[]>([]);
  const [viewTab, setViewTab] = useState<ApplicationViewTab>('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<ApplicationActivityFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const loadGroups = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setGroups([]);
      setShortlistedRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [jobs, bidsResponse] = await Promise.all([
        fetchMyListingTasks('job'),
        bidService.getReceivedBids(),
      ]);

      if (!bidsResponse.success || !bidsResponse.data) {
        throw new Error(bidsResponse.message || 'Failed to load applications');
      }

      const jobBids = extractBidList(bidsResponse.data).filter(
        (bid) => bid.task_listing_kind === 'job',
      );
      const bidStats = aggregateJobBidStats(jobBids);
      setGroups(buildJobApplicationGroups(jobs, bidStats));
      setShortlistedRows(buildShortlistedRows(jobs, jobBids));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load applications';
      toast.error(message);
      setGroups([]);
      setShortlistedRows([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      if (!matchesActivityFilter(group, activityFilter)) return false;
      return matchesSearchQuery(searchQuery, group.title, group.location, group.slug);
    });
  }, [activityFilter, groups, searchQuery]);

  const filteredShortlisted = useMemo(() => {
    return shortlistedRows.filter((row) =>
      matchesSearchQuery(
        searchQuery,
        row.freelancerName,
        row.jobTitle,
        row.location,
        row.jobSlug,
        formatNPR(row.amount),
      ),
    );
  }, [searchQuery, shortlistedRows]);

  const isShortlistedView = viewTab === 'shortlisted';
  const activeItemCount = isShortlistedView ? filteredShortlisted.length : filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(activeItemCount / ITEMS_PER_PAGE));
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentGroups = filteredGroups.slice(indexOfFirstItem, indexOfLastItem);
  const currentShortlisted = filteredShortlisted.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let page = 1; page <= totalPages && page <= 5; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [totalPages]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || (!isShortlistedView && activityFilter !== 'all');
  const isEmptyFromFilters =
    !loading &&
    (isShortlistedView
      ? shortlistedRows.length > 0 && filteredShortlisted.length === 0
      : groups.length > 0 && filteredGroups.length === 0);

  const viewTabClass = (tab: ApplicationViewTab) => dashboardSubtabClass(viewTab === tab);

  if (!isCustomer) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-sm text-neutral-600 dark:border dark:border-neutral-800 dark:bg-neutral-900 dark:text-stone-300">
        Applications review is available for employer accounts.
      </div>
    );
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} relative flex min-h-[calc(100dvh-7.5rem)] flex-col sm:min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-5.5rem)]`}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className={`${DASHBOARD_SUBTABS_WRAP} shrink-0 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
            <div className={`${DASHBOARD_SUBTABS_ROW} min-w-0 flex-1 overflow-x-auto`}>
              {APPLICATION_VIEW_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setViewTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={viewTabClass(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mb-3 flex w-full flex-col gap-2 sm:mb-3.5 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
              <div className="relative flex w-full items-center rounded-xl border border-neutral-200/80 bg-neutral-50 px-3 shadow-sm sm:w-[240px] md:w-[280px] dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                <Search className="mr-2 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={
                    isShortlistedView
                      ? 'Search freelancers…'
                      : 'Search jobs…'
                  }
                  aria-label={isShortlistedView ? 'Search shortlisted freelancers' : 'Search jobs'}
                  className="w-full border-0 bg-transparent py-2.5 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:placeholder:text-neutral-500"
                />
              </div>

              {!isShortlistedView ? (
                <div className="flex w-full items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50 px-3 py-2 shadow-sm sm:w-auto dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                  <Filter className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                  <span className="shrink-0 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    Applications:
                  </span>
                  <select
                    value={activityFilter}
                    onChange={(e) => {
                      setActivityFilter(e.target.value as ApplicationActivityFilter);
                      setCurrentPage(1);
                    }}
                    aria-label="Filter by application activity"
                    className="max-w-[220px] flex-1 cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-neutral-800 outline-none focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:[color-scheme:dark]"
                  >
                    {APPLICATION_ACTIVITY_FILTER_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-white text-neutral-800 dark:bg-neutral-900 dark:text-stone-100"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-6 sm:px-6 md:px-8 md:pb-8">
        {isShortlistedView ? (
          <>
            <div className="hidden grid-cols-12 gap-4 border-b border-neutral-100 pb-4 text-[13px] font-normal text-black select-none md:grid dark:border-neutral-800 dark:text-stone-100">
              <div className="col-span-12 md:col-span-4">Freelancer</div>
              <div className="col-span-12 md:col-span-3">Job</div>
              <div className="col-span-6 md:col-span-2">Offer</div>
              <div className="col-span-6 md:col-span-2">Accepted</div>
              <div className="col-span-12 text-right md:col-span-1">Action</div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading ? (
                <div className="flex flex-1 items-center justify-center gap-2 py-12 text-sm text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading shortlisted freelancers…
                </div>
              ) : shortlistedRows.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-sm text-neutral-500">
                  <p className="font-medium text-neutral-900 dark:text-stone-100">No shortlisted freelancers yet</p>
                  <p className="mt-2">Accepted applicants will appear here after you hire from Applications.</p>
                </div>
              ) : isEmptyFromFilters ? (
                <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-sm text-neutral-500">
                  <p className="font-medium text-neutral-900 dark:text-stone-100">No shortlisted freelancers match your search</p>
                  <p className="mt-2">Try a different keyword or clear the search.</p>
                </div>
              ) : (
                currentShortlisted.map((row) => (
                  <div
                    key={row.bidId}
                    className="grid grid-cols-12 items-center gap-3 py-5 sm:gap-4 sm:py-7"
                  >
                    <div className="col-span-12 md:col-span-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={row.avatarUrl ? getMediaUrl(row.avatarUrl) : undefined}
                          name={row.freelancerName}
                          alt={row.freelancerName}
                          size="md"
                          className="!h-11 !w-11 shrink-0 ring-1 ring-neutral-100"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-medium text-black dark:text-stone-100">
                            {row.freelancerName}
                          </p>
                          <span className="mt-1 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                            Accepted
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-3">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-stone-100">{row.jobTitle}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-neutral-600">
                        <MapPin strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                        {row.location}
                      </p>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-stone-100">{formatNPR(row.amount)}</p>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <p className="text-sm text-neutral-800">{row.acceptedDate}</p>
                    </div>

                    <div className="col-span-12 md:col-span-1">
                      <div className="flex md:justify-end">
                        <Link
                          href={getEmployerBidDetailHref(row.jobSlug, row.bidId, 'applications')}
                          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#FEF1EE] px-3 py-2.5 text-sm font-normal text-[#FF6B6B] transition-all hover:bg-[#FCE2DC] dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                        >
                          View
                          <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
        <div className="hidden grid-cols-12 gap-4 border-b border-neutral-100 pb-4 text-[13px] font-normal text-black select-none md:grid dark:border-neutral-800 dark:text-stone-100">
          <div className="col-span-12 md:col-span-6">Job</div>
          <div className="col-span-6 md:col-span-2">Applications</div>
          <div className="col-span-6 md:col-span-2">Status</div>
          <div className="col-span-12 text-right md:col-span-2">Action</div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
          {loading ? (
            <div className="flex flex-1 items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading applications…
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-sm text-neutral-500">
              <Briefcase className="mx-auto mb-3 h-10 w-10 text-neutral-300" strokeWidth={1.5} />
              <p>You have not posted any jobs yet.</p>
            </div>
          ) : isEmptyFromFilters ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-sm text-neutral-500">
              <p className="font-medium text-neutral-900 dark:text-stone-100">No jobs match your search</p>
              <p className="mt-2">Try a different keyword or clear the filters.</p>
            </div>
          ) : (
            currentGroups.map((group) => (
              <div
                key={group.slug}
                className="grid grid-cols-12 items-center gap-3 py-5 sm:gap-4 sm:py-7"
              >
                <div className="col-span-12 md:col-span-6">
                  <div className="flex items-center gap-4">
                    <JobApplicationAvatar group={group} />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h4 className="truncate text-[15px] font-medium tracking-tight text-black dark:text-stone-100">
                        {group.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-neutral-800">
                        <span className="inline-flex items-center gap-1">
                          <MapPin strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          {group.location}
                        </span>
                        {group.totalApplications > 0 ? (
                          <>
                            <span className="text-neutral-300">|</span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                              Latest {group.latestDate}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-stone-100">
                    {group.totalApplications} application{group.totalApplications === 1 ? '' : 's'}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {group.pendingApplications} pending
                    {group.acceptedApplications > 0
                      ? ` · ${group.acceptedApplications} accepted`
                      : ''}
                  </p>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-normal ${
                      group.pendingApplications > 0
                        ? 'bg-amber-50 text-amber-800'
                        : group.totalApplications > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {group.pendingApplications > 0
                      ? 'Pending review'
                      : group.totalApplications > 0
                        ? 'Reviewed'
                        : 'No applicants'}
                  </span>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <div className="flex md:justify-end">
                    <Link
                      href={getDashboardApplicationsListingHref(group.slug)}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#FEF1EE] px-3 py-2.5 text-sm font-normal text-[#FF6B6B] transition-all hover:bg-[#FCE2DC] dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                    >
                      View applications
                      <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}

        {activeItemCount > 0 ? (
          <div className={DASHBOARD_PAGINATION_OUTER}>
            <div className={DASHBOARD_PAGINATION_INNER}>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={DASHBOARD_PAGINATION_ARROW_PLAIN}
              >
                <ChevronLeft className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
              </button>

              <div className="flex shrink-0 items-center gap-1">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={dashboardPageButtonClass(currentPage === page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={DASHBOARD_PAGINATION_ARROW_PLAIN}
              >
                <ChevronRight className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
              </button>
            </div>

            <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, activeItemCount)} of{' '}
              {activeItemCount} {isShortlistedView ? 'freelancers' : 'jobs'}
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}
