'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Filter, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';
import { resolveOwnerAvatarBg, resolveOwnerInitials } from '@/lib/employerAvatarUtils';
import { formatNPR, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import { bidService, extractBidList, formatBidDisplayId } from '@/services/bid.service';
import type { Bid, TaskStatus } from '@/types';
import { getEmployerBidDetailHref, getFreelancerBidDetailHref } from './dashboardTabs';
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

const ITEMS_PER_PAGE = 10;

type ListingType = 'job' | 'service' | 'project' | 'task';

const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  job: 'Job',
  service: 'Service',
  project: 'Project',
  task: 'Task',
};

type ContractTypeFilter = 'all' | ListingType;
type ContractStatusFilter = 'active' | 'history' | 'all';

const CONTRACT_TYPE_TABS: { key: ContractTypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'job', label: 'Jobs' },
  { key: 'service', label: 'Services' },
  { key: 'project', label: 'Projects' },
  { key: 'task', label: 'Tasks' },
];

const CONTRACT_STATUS_FILTER_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'history', label: 'History' },
  { value: 'all', label: 'All statuses' },
];

function isHistoryContractStatus(status: TaskStatus | null): boolean {
  return status === 'completed' || status === 'cancelled';
}

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

function matchesContractTypeFilter(kind: string | null | undefined, filter: ContractTypeFilter): boolean {
  if (filter === 'all') return true;
  return resolveListingType(kind) === filter;
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
      return 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300';
    case 'cancelled':
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
    case 'in_progress':
    case 'pending_approval':
    case 'disputed':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
    case 'assigned':
    case 'funded':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    default:
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
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
  const [statusFilter, setStatusFilter] = useState<ContractStatusFilter>('active');
  const [currentPage, setCurrentPage] = useState(1);

  const loadContracts = useCallback(async () => {
    if (!isAuthenticated) {
      setContracts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Always load accepted agreements (including completed/cancelled tasks).
      // Fetch all pages so older completed contracts are not dropped by pagination.
      const response = isCustomer
        ? await bidService.getReceivedBids('accepted', { fetchAll: true, page_size: 100 })
        : await bidService.getMyBids('accepted', { fetchAll: true, page_size: 100 });
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load contracts');
      }
      const accepted = extractBidList(response.data).filter((bid) => {
        if (bid.status !== 'accepted') return false;
        if (isOrdersView) {
          return bid.task_listing_kind === 'service';
        }
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

  const filteredContracts = useMemo(() => {
    return contracts.filter((bid) => {
      if (!matchesContractTypeFilter(bid.task_listing_kind, typeFilter)) return false;

      const taskStatus = resolveContractTaskStatus(bid);
      if (statusFilter === 'active' && isHistoryContractStatus(taskStatus)) return false;
      if (statusFilter === 'history' && !isHistoryContractStatus(taskStatus)) return false;

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
  }, [contracts, isCustomer, searchQuery, statusFilter, typeFilter]);

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

  const hasActiveFilters =
    searchQuery.trim().length > 0 || typeFilter !== 'all' || statusFilter !== 'active';
  const isEmptyFromFilters = !loading && contracts.length > 0 && filteredContracts.length === 0;

  const emptyTitle =
    statusFilter === 'history'
      ? isOrdersView
        ? 'No order history yet'
        : 'No contract history yet'
      : isOrdersView
        ? 'No active orders yet'
        : 'No active contracts yet';
  const emptyDescription =
    statusFilter === 'history'
      ? isCustomer
        ? 'Completed and cancelled listings will appear here.'
        : 'Completed and cancelled contracts will appear here.'
      : isOrdersView
        ? isCustomer
          ? 'When you purchase a service, your order will appear here.'
          : 'When a buyer accepts your service offer, the order shows up here.'
        : isCustomer
          ? 'Accepted bids on your jobs, services, projects, and tasks will appear here.'
          : 'When an employer accepts your proposal, the contract shows up here.';
  const filterEmptyTitle =
    statusFilter === 'history'
      ? isOrdersView
        ? 'No past orders match your search'
        : 'No past contracts match your search'
      : isOrdersView
        ? 'No orders match your search'
        : 'No contracts match your search';
  const paginationLabel = isOrdersView ? 'orders' : 'contracts';
  const detailFrom = isOrdersView ? 'orders' : 'contracts';
  const searchPlaceholder = isOrdersView ? 'Search orders…' : 'Search contracts…';

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} relative flex min-h-[calc(100dvh-7.5rem)] flex-col sm:min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-5.5rem)]`}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className={`${DASHBOARD_SUBTABS_WRAP} shrink-0 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
            {!isOrdersView ? (
              <div className={`${DASHBOARD_SUBTABS_ROW} min-w-0 flex-1 overflow-x-auto`}>
                {CONTRACT_TYPE_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setTypeFilter(tab.key);
                      setCurrentPage(1);
                    }}
                    className={dashboardSubtabClass(typeFilter === tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="min-w-0 flex-1" />
            )}

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
                  placeholder={searchPlaceholder}
                  aria-label={isOrdersView ? 'Search orders' : 'Search contracts'}
                  className="w-full border-0 bg-transparent py-2.5 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:placeholder:text-neutral-500"
                />
              </div>

              <div className="flex w-full items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50 px-3 py-2 shadow-sm sm:w-auto dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                <Filter className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                <span className="shrink-0 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as ContractStatusFilter);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by status"
                  className="max-w-[220px] flex-1 cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-neutral-800 outline-none focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:[color-scheme:dark]"
                >
                  {CONTRACT_STATUS_FILTER_OPTIONS.map((option) => (
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
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-6 sm:px-6 md:px-8 md:pb-8">
          <div className="hidden grid-cols-12 gap-3 border-b border-neutral-100 pb-4 text-[13px] font-medium text-neutral-800 select-none md:grid dark:border-neutral-800 dark:text-stone-100">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Date / #</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-1">Offer</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading ? (
              <div className="flex flex-1 items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#52C47F]" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-neutral-900 dark:text-stone-100">{emptyTitle}</p>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{emptyDescription}</p>
              </div>
            ) : isEmptyFromFilters ? (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-neutral-900 dark:text-stone-100">{filterEmptyTitle}</p>
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
                    <p className="text-sm font-semibold text-neutral-900 dark:text-stone-100">
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
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#FEF1EE] px-3 py-2 text-sm font-normal text-[#FF6B6B] transition-colors hover:bg-[#FCE2DC] dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
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

              <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800 dark:text-neutral-300">
                {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, filteredContracts.length)} of{' '}
                {filteredContracts.length} {paginationLabel}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
