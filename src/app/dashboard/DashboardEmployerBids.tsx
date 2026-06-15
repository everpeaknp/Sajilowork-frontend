'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import { renderEmployerBrandLogo } from '@/components/employers/employerLogos';
import { bidService, extractBidList } from '@/services/bid.service';
import type { Bid } from '@/types';
import { getDashboardBidsListingHref } from './dashboardTabs';
import WalletTableToolbar from './WalletTableToolbar';
import { matchesSearchQuery } from './dashboardListSearch';
import {
  DASHBOARD_CARD_PLAIN,
  DASHBOARD_HEADING_PROPOSALS,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_PAGINATION_ARROW_PLAIN,
  DASHBOARD_PAGINATION_INNER,
  DASHBOARD_PAGINATION_OUTER,
  dashboardPageButtonClass,
} from './dashboardResponsive';

type ListingKind = 'task' | 'project' | 'job' | 'service';
type ListingKindFilter = 'all' | ListingKind;
type BidActivityFilter = 'all' | 'pending' | 'accepted' | 'mixed';

const EMPLOYER_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'task', label: 'Tasks' },
  { value: 'project', label: 'Projects' },
];

const FREELANCER_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'task', label: 'Tasks' },
  { value: 'project', label: 'Projects' },
  { value: 'job', label: 'Jobs' },
  { value: 'service', label: 'Services' },
];

const BID_ACTIVITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All bid activity' },
  { value: 'pending', label: 'Pending bids only' },
  { value: 'accepted', label: 'Accepted bids only' },
  { value: 'mixed', label: 'Pending & accepted' },
];

const LISTING_KIND_LABELS: Record<ListingKind, string> = {
  task: 'Task',
  project: 'Project',
  job: 'Job',
  service: 'Service',
};

type ListingBidGroup = {
  slug: string;
  title: string;
  listingKind: ListingKind;
  location: string;
  imageUrl?: string;
  ownerLogoUrl?: string;
  ownerLogoText?: string;
  ownerLogoColor?: string;
  ownerName?: string;
  totalBids: number;
  pendingBids: number;
  acceptedBids: number;
  latestDate: string;
  latestTs: number;
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

function formatProposalLocation(value?: string | null): string {
  const raw = value?.trim();
  if (!raw || /^remote$/i.test(raw)) return 'Remote';
  return shortenCommaSeparatedLocation(raw, 1);
}

function isListingKind(kind?: string | null): kind is ListingKind {
  return kind === 'task' || kind === 'project' || kind === 'job' || kind === 'service';
}

function isTaskOrProjectListing(kind?: string | null): boolean {
  return kind === 'task' || kind === 'project' || !kind;
}

function resolveListingKind(kind?: string | null): ListingKind {
  if (isListingKind(kind)) return kind;
  return 'task';
}

function groupBidsByListing(bids: Bid[], employerView: boolean): ListingBidGroup[] {
  const grouped = new Map<string, ListingBidGroup>();

  for (const bid of bids) {
    if (employerView && !isTaskOrProjectListing(bid.task_listing_kind)) continue;
    const slug = bid.task_slug?.trim();
    if (!slug) continue;

    const listingKind = resolveListingKind(bid.task_listing_kind);
    const key = `${listingKind}:${slug}`;
    const ts = new Date(bid.created_at || 0).getTime();
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        slug,
        title: bid.task_title?.trim() || 'Listing',
        listingKind,
        location: formatProposalLocation(bid.task_city),
        imageUrl: bid.task_image?.trim() || undefined,
        ownerLogoUrl: bid.task_owner_logo_url?.trim() || undefined,
        ownerLogoText: bid.task_owner_logo_text?.trim() || undefined,
        ownerLogoColor: bid.task_owner_logo_color?.trim() || undefined,
        ownerName:
          bid.task_owner_business_name?.trim() ||
          bid.task_owner_name?.trim() ||
          undefined,
        totalBids: 1,
        pendingBids: bid.status === 'pending' ? 1 : 0,
        acceptedBids: bid.status === 'accepted' ? 1 : 0,
        latestDate: formatDisplayDate(bid.created_at),
        latestTs: Number.isNaN(ts) ? 0 : ts,
      });
      continue;
    }

    existing.totalBids += 1;
    if (bid.status === 'pending') existing.pendingBids += 1;
    if (bid.status === 'accepted') existing.acceptedBids += 1;
    if (!existing.imageUrl && bid.task_image?.trim()) {
      existing.imageUrl = bid.task_image.trim();
    }
    if (!existing.ownerLogoUrl && bid.task_owner_logo_url?.trim()) {
      existing.ownerLogoUrl = bid.task_owner_logo_url.trim();
    }
    if (!existing.ownerLogoText && bid.task_owner_logo_text?.trim()) {
      existing.ownerLogoText = bid.task_owner_logo_text.trim();
    }
    if (!existing.ownerLogoColor && bid.task_owner_logo_color?.trim()) {
      existing.ownerLogoColor = bid.task_owner_logo_color.trim();
    }
    if (!existing.ownerName) {
      existing.ownerName =
        bid.task_owner_business_name?.trim() ||
        bid.task_owner_name?.trim() ||
        undefined;
    }
    if (!Number.isNaN(ts) && ts > existing.latestTs) {
      existing.latestTs = ts;
      existing.latestDate = formatDisplayDate(bid.created_at);
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.latestTs - a.latestTs);
}

function matchesKindFilter(kind: ListingKind, filter: ListingKindFilter): boolean {
  if (filter === 'all') return true;
  return kind === filter;
}

function matchesActivityFilter(group: ListingBidGroup, filter: BidActivityFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return group.pendingBids > 0 && group.acceptedBids === 0;
  if (filter === 'accepted') return group.acceptedBids > 0 && group.pendingBids === 0;
  return group.pendingBids > 0 && group.acceptedBids > 0;
}

function ListingBidAvatar({ group }: { group: ListingBidGroup }) {
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

export default function DashboardEmployerBids() {
  const { isCustomer, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ListingBidGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<ListingKindFilter>('all');
  const [activityFilter, setActivityFilter] = useState<BidActivityFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const loadGroups = useCallback(async () => {
    if (!isAuthenticated) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = isCustomer
        ? await bidService.getReceivedBids()
        : await bidService.getMyBids();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load bids');
      }
      setGroups(groupBidsByListing(extractBidList(response.data), isCustomer));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load bids';
      toast.error(message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    setKindFilter('all');
    setActivityFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  }, [isCustomer]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      if (!matchesKindFilter(group.listingKind, kindFilter)) return false;
      if (!matchesActivityFilter(group, activityFilter)) return false;
      return matchesSearchQuery(
        searchQuery,
        group.title,
        group.ownerName,
        group.location,
        group.slug,
        LISTING_KIND_LABELS[group.listingKind],
      );
    });
  }, [activityFilter, groups, kindFilter, searchQuery]);

  const totals = useMemo(() => {
    const totalBids = filteredGroups.reduce((sum, group) => sum + group.totalBids, 0);
    const pendingBids = filteredGroups.reduce((sum, group) => sum + group.pendingBids, 0);
    return {
      listings: filteredGroups.length,
      totalBids,
      pendingBids,
    };
  }, [filteredGroups]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / ITEMS_PER_PAGE));
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentGroups = filteredGroups.slice(indexOfFirstItem, indexOfLastItem);

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

  const typeFilterOptions = isCustomer ? EMPLOYER_TYPE_FILTER_OPTIONS : FREELANCER_TYPE_FILTER_OPTIONS;
  const hasActiveFilters =
    searchQuery.trim().length > 0 || kindFilter !== 'all' || activityFilter !== 'all';
  const isEmptyFromFilters = !loading && groups.length > 0 && filteredGroups.length === 0;

  const pageTitle = isCustomer ? 'Bids' : 'My bids';
  const pageDescription = isCustomer
    ? 'All bids received on your tasks and projects. Select a listing to view every bid.'
    : 'Bids you have submitted, grouped by listing. Select a listing to review your offers.';

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} space-y-6`}>
      <div>
        <h2 className={DASHBOARD_HEADING_PROPOSALS}>{pageTitle}</h2>
        <p className="mt-1.5 font-sans text-sm text-neutral-800">{pageDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Listings</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{totals.listings}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {isCustomer ? 'Tasks & projects with bids' : 'Listings with your bids'}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Total bids</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{totals.totalBids}</p>
          <p className="mt-1 text-xs text-neutral-500">Across filtered listings</p>
        </div>
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{totals.pendingBids}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {isCustomer ? 'Awaiting your review' : 'Still under review'}
          </p>
        </div>
      </div>

      <WalletTableToolbar
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        searchPlaceholder={
          isCustomer
            ? 'Search listings by title or location'
            : 'Search listings by title, employer, or location'
        }
        filterStatus={kindFilter}
        onFilterChange={(value) => {
          setKindFilter(value as ListingKindFilter);
          setCurrentPage(1);
        }}
        filterOptions={typeFilterOptions}
        filterLabel="Listing type:"
        secondaryFilterStatus={activityFilter}
        onSecondaryFilterChange={(value) => {
          setActivityFilter(value as BidActivityFilter);
          setCurrentPage(1);
        }}
        secondaryFilterOptions={BID_ACTIVITY_FILTER_OPTIONS}
        secondaryFilterLabel="Bid activity:"
      />

      <div className={`${DASHBOARD_CARD_PLAIN} rounded-xl sm:rounded-2xl md:p-10`}>
        <div className="hidden grid-cols-12 gap-4 border-b border-neutral-100 pb-4 text-[13px] font-normal text-black select-none md:grid">
          <div className="col-span-12 md:col-span-6">Listing</div>
          <div className="col-span-6 md:col-span-2">Type</div>
          <div className="col-span-6 md:col-span-2">Bids</div>
          <div className="col-span-12 text-right md:col-span-2">Action</div>
        </div>

        <div className="divide-y divide-neutral-100">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading bids…
            </div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              {isCustomer
                ? 'No bids on your tasks or projects yet.'
                : 'You have not submitted any bids yet.'}
            </div>
          ) : isEmptyFromFilters ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              <p className="font-medium text-neutral-900">No listings match your search</p>
              <p className="mt-2">
                Try a different keyword{hasActiveFilters ? ' or clear the filters' : ''}.
              </p>
            </div>
          ) : (
            currentGroups.map((group) => (
              <div
                key={`${group.listingKind}:${group.slug}`}
                className="grid grid-cols-12 items-center gap-3 py-5 sm:gap-4 sm:py-7"
              >
                <div className="col-span-12 md:col-span-6">
                  <div className="flex items-center gap-4">
                    <ListingBidAvatar group={group} />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h4 className="truncate text-[15px] font-medium tracking-tight text-black">
                        {group.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-neutral-800">
                        <span className="inline-flex items-center gap-1">
                          <MapPin strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          {group.location}
                        </span>
                        <span className="text-neutral-300">|</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          Latest {group.latestDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-normal text-neutral-700">
                    {LISTING_KIND_LABELS[group.listingKind]}
                  </span>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <p className="text-sm font-semibold text-neutral-900">
                    {group.totalBids} bid{group.totalBids === 1 ? '' : 's'}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {group.pendingBids} pending
                    {group.acceptedBids > 0 ? ` · ${group.acceptedBids} accepted` : ''}
                  </p>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <div className="flex md:justify-end">
                    {isCustomer ? (
                      <Link
                        href={getDashboardBidsListingHref(group.slug)}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#FEF1EE] px-3 py-2.5 text-sm font-normal text-[#FF6B6B] transition-all hover:bg-[#FCE2DC]"
                      >
                        View bids
                        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                      </Link>
                    ) : (
                      <Link
                        href={getDashboardBidsListingHref(group.slug)}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#FEF1EE] px-3 py-2.5 text-sm font-normal text-[#FF6B6B] transition-all hover:bg-[#FCE2DC]"
                      >
                        View offer
                        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredGroups.length > 0 ? (
          <div className={DASHBOARD_PAGINATION_OUTER}>
            <div className={DASHBOARD_PAGINATION_INNER}>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={DASHBOARD_PAGINATION_ARROW_PLAIN}
              >
                <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
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
                <ChevronRight className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>
            </div>

            <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, filteredGroups.length)} of{' '}
              {filteredGroups.length} listings
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
