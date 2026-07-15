'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';
import { resolveOwnerAvatarBg, resolveOwnerInitials } from '@/lib/employerAvatarUtils';
import { formatNPR, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import { bidService, extractBidList, formatBidDisplayId } from '@/services/bid.service';
import type { Bid, TaskStatus } from '@/types';
import { getEmployerBidDetailHref, getFreelancerBidDetailHref } from './dashboardTabs';
import WalletTableToolbar from './WalletTableToolbar';
import { matchesSearchQuery } from './dashboardListSearch';
import {
  DASHBOARD_CARD_PLAIN,
  DASHBOARD_HEADING_MD,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_PAGINATION_ARROW_PLAIN,
  DASHBOARD_PAGINATION_INNER,
  DASHBOARD_PAGINATION_OUTER,
  dashboardPageButtonClass,
} from './dashboardResponsive';

const ITEMS_PER_PAGE = 10;

type ListingType = 'job' | 'service' | 'project' | 'task';

const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  job: 'Job',
  service: 'Service',
  project: 'Project',
  task: 'Task',
};

type ContractTypeFilter = 'all' | ListingType;

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

function formatDisplayDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatLocation(value?: string | null): string {
  const raw = value?.trim();
  if (!raw || /^remote$/i.test(raw)) return 'Remote';
  return shortenCommaSeparatedLocation(raw, 1);
}

function getTaskerName(tasker: Bid['tasker']): string {
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || 'Freelancer';
}

function resolveListingType(kind?: string | null): ListingType {
  if (kind === 'job') return 'job';
  if (kind === 'service') return 'service';
  if (kind === 'project') return 'project';
  return 'task';
}

function isTaskOrProjectListing(kind?: string | null): boolean {
  if (!kind) return true;
  return kind === 'task' || kind === 'project';
}

function matchesContractTypeFilter(kind: string | null | undefined, filter: ContractTypeFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'task' || filter === 'project') {
    return kind === filter || (filter === 'task' && !kind);
  }
  return kind === filter;
}

function getContractCounterpartyName(bid: Bid, isCustomer: boolean): string {
  if (isCustomer) return getTaskerName(bid.tasker);
  return (
    bid.task_owner_business_name?.trim() ||
    bid.task_owner_name?.trim() ||
    'Employer'
  );
}

function getContractDate(bid: Bid): string {
  return formatDisplayDate(bid.accepted_at || bid.created_at);
}

function resolveContractTaskStatus(bid: Bid): TaskStatus | null {
  if (bid.task_status) return bid.task_status;
  if (typeof bid.task === 'object' && bid.task && 'status' in bid.task) {
    return (bid.task as { status?: TaskStatus }).status ?? null;
  }
  return null;
}

function getContractStatusLabel(bid: Bid): string {
  const taskStatus = resolveContractTaskStatus(bid);
  switch (taskStatus) {
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'in_progress':
    case 'pending_approval':
    case 'disputed':
      return 'In progress';
    case 'assigned':
    case 'funded':
      return 'Assigned';
    default:
      return 'Accepted';
  }
}

function contractStatusBadgeClass(bid: Bid): string {
  const taskStatus = resolveContractTaskStatus(bid);
  switch (taskStatus) {
    case 'completed':
      return 'bg-violet-50 text-violet-700';
    case 'cancelled':
      return 'bg-neutral-100 text-neutral-600';
    case 'in_progress':
    case 'pending_approval':
    case 'disputed':
      return 'bg-blue-50 text-blue-700';
    case 'assigned':
    case 'funded':
      return 'bg-emerald-50 text-emerald-700';
    default:
      return 'bg-emerald-50 text-emerald-700';
  }
}

function ContractRowAvatar({
  bid,
  isCustomer,
  counterpartyName,
}: {
  bid: Bid;
  isCustomer: boolean;
  counterpartyName: string;
}) {
  const avatarClass = 'h-11 w-11 shrink-0 ring-1 ring-neutral-100';

  if (isCustomer) {
    return (
      <UserAvatar
        src={bid.tasker?.profile_image ? getMediaUrl(bid.tasker.profile_image) : undefined}
        name={counterpartyName}
        alt={counterpartyName}
        size="md"
        className={`!h-11 !w-11 ${avatarClass}`}
      />
    );
  }

  const ownerLogoSrc = bid.task_owner_logo_url?.trim()
    ? getMediaUrl(bid.task_owner_logo_url)
    : '';
  if (ownerLogoSrc) {
    return (
      <UserAvatar
        src={ownerLogoSrc}
        name={counterpartyName}
        alt={counterpartyName}
        size="md"
        className={`!h-11 !w-11 ${avatarClass}`}
      />
    );
  }

  const listingImageSrc = bid.task_image?.trim() ? getMediaUrl(bid.task_image) : '';
  if (listingImageSrc) {
    return (
      <div className={`overflow-hidden rounded-full ${avatarClass}`}>
        <img
          src={listingImageSrc}
          alt={bid.task_title || 'Listing'}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const initials = (
    bid.task_owner_logo_text?.trim() || resolveOwnerInitials(counterpartyName)
  )
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif text-sm font-black text-white ${resolveOwnerAvatarBg(counterpartyName)} ${avatarClass}`}
    >
      {initials}
    </div>
  );
}

export default function DashboardContracts({ variant = 'contracts' }: { variant?: 'contracts' | 'orders' }) {
  const { isCustomer, isAuthenticated } = useAuth();
  const isOrdersView = variant === 'orders';
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Bid[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContractTypeFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const loadContracts = useCallback(async () => {
    if (!isAuthenticated) {
      setContracts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = isCustomer
        ? await bidService.getReceivedBids()
        : await bidService.getMyBids();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load contracts');
      }
      const accepted = extractBidList(response.data).filter((bid) => {
        if (bid.status !== 'accepted') return false;
        if (isOrdersView) {
          return bid.task_listing_kind === 'service';
        }
        if (isCustomer && !isTaskOrProjectListing(bid.task_listing_kind)) return false;
        if (!isCustomer && bid.task_listing_kind === 'service') return false;
        return true;
      });
      setContracts(accepted);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load contracts';
      toast.error(message);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer, isOrdersView]);

  useEffect(() => {
    void loadContracts();
  }, [loadContracts]);

  const subtitle = useMemo(() => {
    if (isOrdersView) {
      return isCustomer
        ? 'Services you have purchased — track delivery and escrow payment status.'
        : 'Accepted service orders from buyers — track delivery and order status.';
    }
    return isCustomer
      ? 'Accepted bids on your tasks and projects — active agreements with freelancers.'
      : 'Work you are under contract to deliver after an accepted proposal.';
  }, [isCustomer, isOrdersView]);

  const typeFilterOptions = isOrdersView
    ? []
    : isCustomer
      ? EMPLOYER_TYPE_FILTER_OPTIONS
      : FREELANCER_TYPE_FILTER_OPTIONS;

  const filteredContracts = useMemo(() => {
    return contracts.filter((bid) => {
      if (!matchesContractTypeFilter(bid.task_listing_kind, typeFilter)) return false;
      const counterpartyName = getContractCounterpartyName(bid, isCustomer);
      return matchesSearchQuery(
        searchQuery,
        bid.task_title,
        counterpartyName,
        bid.task_city,
        bid.task_slug,
        formatBidDisplayId(bid.id),
      );
    });
  }, [contracts, isCustomer, searchQuery, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / ITEMS_PER_PAGE));
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentContracts = filteredContracts.slice(indexOfFirstItem, indexOfLastItem);

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

  const hasActiveFilters = searchQuery.trim().length > 0 || typeFilter !== 'all';
  const isEmptyFromFilters = !loading && contracts.length > 0 && filteredContracts.length === 0;

  const totals = useMemo(() => {
    const totalValue = filteredContracts.reduce((sum, bid) => sum + (Number(bid.amount) || 0), 0);
    return {
      count: filteredContracts.length,
      totalValue,
    };
  }, [filteredContracts]);

  const pageTitle = isOrdersView ? 'Orders' : 'Contracts';
  const countLabel = isOrdersView ? 'Active orders' : 'Active contracts';
  const countHint = isOrdersView ? 'Accepted service orders' : 'Accepted agreements';
  const valueLabel = isOrdersView ? 'Order value' : 'Contract value';
  const valueHint = isOrdersView ? 'Total order amount' : 'Total offer amount';
  const emptyTitle = isOrdersView ? 'No active orders yet' : 'No active contracts yet';
  const emptyDescription = isOrdersView
    ? isCustomer
      ? 'When you purchase a service, your order will appear here.'
      : 'When a buyer accepts your service offer, the order shows up here.'
    : isCustomer
      ? 'Accepted bids on your tasks and projects will appear here.'
      : 'When an employer accepts your proposal, the contract shows up here.';
  const filterEmptyTitle = isOrdersView ? 'No orders match your search' : 'No contracts match your search';
  const paginationLabel = isOrdersView ? 'orders' : 'contracts';
  const detailFrom = isOrdersView ? 'orders' : 'contracts';

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} space-y-6`}>
      <div>
        <h1 className={DASHBOARD_HEADING_MD}>{pageTitle}</h1>
        <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{countLabel}</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-stone-100">{totals.count}</p>
          <p className="mt-1 text-xs text-neutral-500">{countHint}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{valueLabel}</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-stone-100">{formatNPR(totals.totalValue)}</p>
          <p className="mt-1 text-xs text-neutral-500">{valueHint}</p>
        </div>
      </div>

      <WalletTableToolbar
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        searchPlaceholder={
          isOrdersView
            ? isCustomer
              ? 'Search by service, seller, location, or order #'
              : 'Search by service, buyer, location, or order #'
            : isCustomer
              ? 'Search by title, freelancer, location, or contract #'
              : 'Search by title, employer, location, or contract #'
        }
        filterStatus={typeFilter}
        onFilterChange={(value) => {
          setTypeFilter(value as ContractTypeFilter);
          setCurrentPage(1);
        }}
        filterOptions={typeFilterOptions}
        filterLabel="Listing type:"
        hidePrimaryFilter={isOrdersView}
      />

      <div className={`${DASHBOARD_CARD_PLAIN} rounded-xl sm:rounded-2xl md:p-8`}>
        <div className="hidden grid-cols-12 gap-3 border-b border-neutral-100 pb-4 text-[13px] font-medium text-neutral-800 select-none md:grid dark:border-neutral-800 dark:text-stone-100">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Date / #</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-1">Offer</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-neutral-100">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#52C47F]" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-neutral-900">{emptyTitle}</p>
              <p className="mt-2 text-sm text-neutral-500">{emptyDescription}</p>
            </div>
          ) : isEmptyFromFilters ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-neutral-900">{filterEmptyTitle}</p>
              <p className="mt-2 text-sm text-neutral-500">
                Try a different keyword{hasActiveFilters ? ' or clear the filters' : ''}.
              </p>
            </div>
          ) : (
            currentContracts.map((bid) => {
              const listingType = resolveListingType(bid.task_listing_kind);
              const counterpartyName = getContractCounterpartyName(bid, isCustomer);
              const detailHref = bid.task_slug
                ? isCustomer && bid.id
                  ? getEmployerBidDetailHref(
                      bid.task_slug,
                      bid.id,
                      isOrdersView ? 'orders' : 'contracts',
                    )
                  : !isCustomer && bid.id
                    ? getFreelancerBidDetailHref(bid.task_slug, bid.id, detailFrom as 'contracts' | 'orders')
                    : null
                : null;

              return (
                <div
                  key={bid.id}
                  className="grid grid-cols-12 items-center gap-3 py-5 sm:gap-4 sm:py-6"
                >
                  <div className="col-span-12 md:col-span-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400 md:hidden">
                      Title
                    </p>
                    <div className="flex items-center gap-3">
                      <ContractRowAvatar
                        bid={bid}
                        isCustomer={isCustomer}
                        counterpartyName={counterpartyName}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium text-black dark:text-stone-100">
                          {bid.task_title || 'Listing'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-neutral-600">
                          {isCustomer ? `With ${counterpartyName}` : `For ${counterpartyName}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400 md:hidden">
                      Date / #
                    </p>
                    <p className="text-sm text-neutral-800">{getContractDate(bid)}</p>
                    <p className="mt-0.5 font-mono text-xs font-medium text-neutral-500">
                      #{formatBidDisplayId(bid.id)}
                    </p>
                  </div>

                  <div className="col-span-6 md:col-span-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400 md:hidden">
                      Type
                    </p>
                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-normal text-neutral-700">
                      {LISTING_TYPE_LABELS[listingType]}
                    </span>
                  </div>

                  <div className="col-span-12 md:col-span-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400 md:hidden">
                      Location
                    </p>
                    <p className="truncate text-sm text-neutral-800">{formatLocation(bid.task_city)}</p>
                  </div>

                  <div className="col-span-6 md:col-span-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400 md:hidden">
                      Offer
                    </p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {formatNPR(Number(bid.amount) || 0)}
                    </p>
                  </div>

                  <div className="col-span-6 md:col-span-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400 md:hidden">
                      Status
                    </p>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${contractStatusBadgeClass(bid)}`}
                    >
                      {getContractStatusLabel(bid)}
                    </span>
                  </div>

                  <div className="col-span-12 md:col-span-1">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-neutral-400 md:hidden">
                      Action
                    </p>
                    <div className="flex md:justify-end">
                      {detailHref ? (
                        <Link
                          href={detailHref}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#FEF1EE] px-3 py-2 text-sm font-normal text-[#FF6B6B] transition-colors hover:bg-[#FCE2DC]"
                        >
                          View
                          <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                        </Link>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredContracts.length > 0 ? (
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
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, filteredContracts.length)} of{' '}
              {filteredContracts.length} {paginationLabel}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
