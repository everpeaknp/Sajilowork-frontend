'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Filter,
  FolderKanban,
  Loader2,
  MapPin,
  Search,
  Trash2,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import FeeConfirmModal from '@/components/fees/FeeConfirmModal';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';
import { resolveOwnerAvatarBg, resolveOwnerInitials } from '@/lib/employerAvatarUtils';
import { normalizeFeeListingKind, type FeeListingKind } from '@/lib/feeUtils';
import { formatNPR, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import { bidService, extractBidList, sortBidsByIdAlphanumeric } from '@/services/bid.service';
import type { Bid, BidStatus } from '@/types';
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

type ProposalFilter = 'pending' | 'accepted' | 'cancelled' | 'all';

const PROPOSAL_STATUS_FILTER_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All statuses' },
];

type ProposalType = 'job' | 'service' | 'project' | 'task';

type ProposalTypeFilter = 'all' | ProposalType;

const PROPOSAL_TYPE_TABS: { key: ProposalTypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'job', label: 'Jobs' },
  { key: 'service', label: 'Services' },
  { key: 'project', label: 'Projects' },
  { key: 'task', label: 'Tasks' },
];

const PROPOSAL_TYPE_LABELS: Record<ProposalType, string> = {
  job: 'Job',
  service: 'Service',
  project: 'Project',
  task: 'Task',
};

type ProposalRowBase = {
  id: string;
  listingType: ProposalType;
  location: string;
  date: string;
  status: string;
  rawStatus: BidStatus;
  amountLabel: string;
  rateType: string;
  avatarUrl?: string;
  logoText?: string;
  logoColor?: string;
  ownerName?: string;
};

type EmployerRow = ProposalRowBase & {
  projectTitle: string;
  projectSlug?: string;
  freelancerName: string;
};

type FreelancerRow = ProposalRowBase & {
  projectTitle: string;
  projectSlug?: string;
  canWithdraw: boolean;
  amount: number;
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

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

function getTaskerDisplayName(tasker: Bid['tasker']): string {
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || 'Freelancer';
}

function isCancelledStatus(status: BidStatus): boolean {
  return status === 'rejected' || status === 'withdrawn' || status === 'expired';
}

function matchesProposalFilter(rawStatus: BidStatus, filter: ProposalFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return rawStatus === 'pending';
  if (filter === 'accepted') return rawStatus === 'accepted';
  return isCancelledStatus(rawStatus);
}

function formatProposalLocation(value?: string | null): string {
  const raw = value?.trim();
  if (!raw || /^remote$/i.test(raw)) return 'Remote';
  return shortenCommaSeparatedLocation(raw, 1);
}

function resolveProposalType(listingKind?: string | null): ProposalType {
  if (listingKind === 'job') return 'job';
  if (listingKind === 'service') return 'service';
  if (listingKind === 'project') return 'project';
  return 'task';
}

const FREELANCER_APPLIED_LISTING_KINDS = new Set(['job', 'service', 'project', 'task']);

function isFreelancerAppliedListingKind(kind?: string | null): boolean {
  if (!kind) return true;
  return FREELANCER_APPLIED_LISTING_KINDS.has(kind);
}

function isFreelancerAppliedBid(bid: Bid): boolean {
  return isFreelancerAppliedListingKind(bid.task_listing_kind);
}

function matchesProposalType(listingType: ProposalType, filter: ProposalTypeFilter): boolean {
  if (filter === 'all') return true;
  return listingType === filter;
}

function proposalTypeIcon(type: ProposalType) {
  switch (type) {
    case 'job':
      return Briefcase;
    case 'service':
      return Wrench;
    case 'project':
      return FolderKanban;
    case 'task':
      return ClipboardList;
  }
}

function proposalTypeIconClass(type: ProposalType): string {
  switch (type) {
    case 'job':
      return 'bg-[#4B43DF]';
    case 'service':
      return 'bg-[#0f766e]';
    case 'project':
      return 'bg-[#4B43DF]';
    case 'task':
      return 'bg-neutral-700';
  }
}

function ProposalListAvatar({
  row,
  variant,
}: {
  row: EmployerRow | FreelancerRow;
  variant: 'employer' | 'freelancer';
}) {
  const listingType = row.listingType;
  const TypeIcon = proposalTypeIcon(listingType);
  const iconBg = proposalTypeIconClass(listingType);
  const avatarSrc = row.avatarUrl?.trim() ? getMediaUrl(row.avatarUrl) : '';

  if (variant === 'employer') {
    const employerRow = row as EmployerRow;
    return (
      <UserAvatar
        src={avatarSrc || undefined}
        name={employerRow.freelancerName}
        alt={employerRow.freelancerName}
        size="lg"
        className="h-14 w-14 shrink-0 ring-1 ring-neutral-100"
      />
    );
  }

  const displayName = row.ownerName?.trim() || 'Employer';
  if (avatarSrc) {
    return (
      <UserAvatar
        src={avatarSrc}
        name={displayName}
        alt={displayName}
        size="lg"
        className="h-14 w-14 shrink-0 ring-1 ring-neutral-100"
      />
    );
  }

  const initials = (row.logoText?.trim() || resolveOwnerInitials(displayName)).slice(0, 2).toUpperCase();
  if (initials) {
    return (
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-serif text-sm font-black text-white ring-1 ring-neutral-100 ${resolveOwnerAvatarBg(displayName)}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconBg}`}
    >
      <TypeIcon className="h-5 w-5 text-white" strokeWidth={2} />
    </div>
  );
}

function statusBadgeClass(rawStatus: BidStatus): string {
  if (rawStatus === 'accepted') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
  if (rawStatus === 'pending') return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200';
  return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
}

function emptyMessageForFilter(
  statusFilter: ProposalFilter,
  typeFilter: ProposalTypeFilter,
  isCustomer: boolean,
): string {
  const scope = isCustomer ? 'proposals on your listings' : 'proposals';
  const typeLabel =
    typeFilter === 'all' ? '' : ` ${PROPOSAL_TYPE_LABELS[typeFilter].toLowerCase()}`;
  if (statusFilter === 'all') {
    return `No${typeLabel} ${scope} yet.`;
  }
  if (statusFilter === 'pending') return `No pending${typeLabel} ${scope}.`;
  if (statusFilter === 'accepted') return `No accepted${typeLabel} ${scope}.`;
  return `No cancelled${typeLabel} ${scope}.`;
}

export type EmployerOffersView = 'applications' | 'bids';

export default function DashboardProposals({
  employerView,
}: {
  employerView?: EmployerOffersView;
} = {}) {
  const { isCustomer, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employerRows, setEmployerRows] = useState<EmployerRow[]>([]);
  const [freelancerRows, setFreelancerRows] = useState<FreelancerRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<ProposalFilter>(
    employerView === 'applications' ? 'pending' : 'pending',
  );
  const [activeTypeFilter, setActiveTypeFilter] = useState<ProposalTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawTarget, setWithdrawTarget] = useState<{
    id: string;
    amount: number;
    listingKind?: FeeListingKind;
  } | null>(null);
  const [withdrawConfirming, setWithdrawConfirming] = useState(false);

  const loadEmployerRows = useCallback(async () => {
    const response = await bidService.getReceivedBids(undefined, { fetchAll: true, page_size: 100 });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to load proposals');
    }

    const bids = extractBidList(response.data);

    const rows = bids.map((bid: Bid) => ({
      id: bid.id,
      listingType: resolveProposalType(bid.task_listing_kind),
      projectTitle: bid.task_title || 'Listing',
      projectSlug: bid.task_slug,
      freelancerName: getTaskerDisplayName(bid.tasker),
      avatarUrl: bid.tasker?.profile_image || undefined,
      location: formatProposalLocation(bid.task_city),
      date: formatDisplayDate(bid.created_at),
      status: statusLabel(bid.status),
      rawStatus: bid.status,
      amountLabel: formatNPR(Number(bid.amount) || 0),
      rateType: 'Offer',
    }));

    setEmployerRows(sortBidsByIdAlphanumeric(rows));
  }, []);

  const isFreelancerProposals = !isCustomer && !employerView;

  const loadFreelancerRows = useCallback(async () => {
    const response = await bidService.getMyBids(undefined, { fetchAll: true, page_size: 100 });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to load proposals');
    }

    const bids = extractBidList(response.data).filter(isFreelancerAppliedBid);

    const rows = bids.map((bid: Bid) => ({
      id: bid.id,
      listingType: resolveProposalType(bid.task_listing_kind),
      projectTitle: bid.task_title || 'Listing',
      projectSlug: bid.task_slug,
      avatarUrl: bid.task_owner_logo_url || bid.task_image || undefined,
      logoText: bid.task_owner_logo_text || undefined,
      logoColor: bid.task_owner_logo_color || undefined,
      ownerName:
        bid.task_owner_business_name?.trim() ||
        bid.task_owner_name?.trim() ||
        undefined,
      location: formatProposalLocation(bid.task_city),
      date: formatDisplayDate(bid.created_at),
      status: statusLabel(bid.status),
      rawStatus: bid.status,
      amountLabel: formatNPR(Number(bid.amount) || 0),
      amount: Number(bid.amount) || 0,
      rateType: 'Offer',
      canWithdraw: bid.status === 'pending',
    }));

    setFreelancerRows(sortBidsByIdAlphanumeric(rows));
  }, []);

  const loadRows = useCallback(async () => {
    if (!isAuthenticated) {
      setEmployerRows([]);
      setFreelancerRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isCustomer) {
        await loadEmployerRows();
        setFreelancerRows([]);
      } else {
        await loadFreelancerRows();
        setEmployerRows([]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load proposals';
      toast.error(message);
      setEmployerRows([]);
      setFreelancerRows([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer, loadEmployerRows, loadFreelancerRows]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const rows = useMemo(() => {
    const source = isCustomer ? employerRows : freelancerRows;
    return source.filter((row) => {
      const matchesType = matchesProposalType(row.listingType, activeTypeFilter);
      if (!matchesProposalFilter(row.rawStatus, activeFilter) || !matchesType) return false;

      if (isCustomer) {
        const employerRow = row as EmployerRow;
        return matchesSearchQuery(
          searchQuery,
          employerRow.projectTitle,
          employerRow.freelancerName,
          employerRow.location,
          employerRow.projectSlug,
        );
      }

      const freelancerRow = row as FreelancerRow;
      return matchesSearchQuery(
        searchQuery,
        freelancerRow.projectTitle,
        freelancerRow.ownerName,
        freelancerRow.location,
        freelancerRow.projectSlug,
      );
    });
  }, [activeFilter, activeTypeFilter, employerRows, freelancerRows, isCustomer, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = rows.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;

    setWithdrawConfirming(true);
    try {
      const response = await bidService.withdrawBid(withdrawTarget.id, 'Withdrawn from dashboard');
      if (!response.success) {
        toast.error(response.message || 'Failed to withdraw proposal');
        return;
      }
      toast.success('Proposal withdrawn');
      setWithdrawTarget(null);
      await loadRows();
    } catch {
      toast.error('Failed to withdraw proposal');
    } finally {
      setWithdrawConfirming(false);
    }
  };

  const statusTabs = useMemo(() => {
    if (employerView === 'applications') {
      return PROPOSAL_STATUS_FILTER_OPTIONS.filter((tab) => tab.value === 'pending');
    }
    return PROPOSAL_STATUS_FILTER_OPTIONS;
  }, [employerView]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let page = 1; page <= totalPages && page <= 5; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [totalPages]);

  const hideStatusFilter = statusTabs.length <= 1;

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} relative flex min-h-[calc(100dvh-7.5rem)] flex-col sm:min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-5.5rem)]`}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className={`${DASHBOARD_SUBTABS_WRAP} shrink-0 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
            <div className={`${DASHBOARD_SUBTABS_ROW} min-w-0 flex-1 overflow-x-auto`}>
              {PROPOSAL_TYPE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTypeFilter(tab.key);
                    setCurrentPage(1);
                  }}
                  className={dashboardSubtabClass(activeTypeFilter === tab.key)}
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
                  placeholder="Search proposals…"
                  aria-label="Search proposals"
                  className="w-full border-0 bg-transparent py-2.5 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:placeholder:text-neutral-500"
                />
              </div>

              {!hideStatusFilter ? (
                <div className="flex w-full items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50 px-3 py-2 shadow-sm sm:w-auto dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                  <Filter className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                  <span className="shrink-0 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    Status:
                  </span>
                  <select
                    value={activeFilter}
                    onChange={(e) => {
                      setActiveFilter(e.target.value as ProposalFilter);
                      setCurrentPage(1);
                    }}
                    aria-label="Filter by status"
                    className="max-w-[220px] flex-1 cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-neutral-800 outline-none focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:[color-scheme:dark]"
                  >
                    {statusTabs.map((option) => (
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
          <div className="hidden grid-cols-12 gap-4 border-b border-neutral-100 pb-4 text-[13px] font-normal text-black select-none md:grid dark:border-neutral-800 dark:text-stone-100">
            <div className="col-span-12 md:col-span-5">Name</div>
            <div className="col-span-6 md:col-span-2">Type</div>
            <div className="col-span-6 md:col-span-2">Status</div>
            <div className="col-span-12 text-right md:col-span-3">Action</div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading ? (
              <div className="flex flex-1 items-center justify-center gap-2 py-12 text-sm text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading proposals…
              </div>
            ) : currentItems.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-12 text-center text-sm text-neutral-500">
                {emptyMessageForFilter(activeFilter, activeTypeFilter, isCustomer)}
              </div>
            ) : isCustomer ? (
            (currentItems as EmployerRow[]).map((row) => (
              <div key={row.id} className="grid grid-cols-12 items-center gap-3 py-5 sm:gap-4 sm:py-7">
                <div className="col-span-12 md:col-span-5">
                  <div className="flex items-center gap-4">
                    <ProposalListAvatar row={row} variant="employer" />
                    <div className="min-w-0 flex-1 space-y-1.5 font-sans">
                      <h4 className="text-[15px] font-medium leading-snug tracking-tight text-black dark:text-stone-100">
                        {row.projectTitle}
                      </h4>
                      <p className="text-sm font-medium text-black dark:text-stone-100">
                        {row.amountLabel}
                        <span className="ml-1.5 text-xs font-normal text-neutral-500">{row.rateType}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-normal tracking-tight text-neutral-800 dark:text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-800 dark:text-neutral-300">
                          <FileText strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                          <span>{row.freelancerName}</span>
                        </span>
                        <span className="font-normal text-neutral-300 dark:text-neutral-600">|</span>
                        <span className="flex items-center gap-1 text-neutral-800 dark:text-neutral-300">
                          <MapPin strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                          <span>{row.location}</span>
                        </span>
                        <span className="font-normal text-neutral-300 dark:text-neutral-600">|</span>
                        <span className="flex items-center gap-1 font-sans text-neutral-800 dark:text-neutral-300">
                          <Calendar strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                          <span>{row.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 flex flex-wrap items-center gap-2 md:contents">
                  <div className="md:col-span-2">
                  <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-normal text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {PROPOSAL_TYPE_LABELS[row.listingType]}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-normal capitalize ${statusBadgeClass(row.rawStatus)}`}
                  >
                    {row.status}
                  </span>
                </div>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <div className="flex md:justify-end">
                    {row.projectSlug ? (
                      <Link
                        href={getEmployerBidDetailHref(
                          row.projectSlug,
                          row.id,
                          employerView === 'bids' ? 'bids' : 'applications',
                        )}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#FEF1EE] px-3 py-2.5 text-sm font-normal text-[#FF6B6B] transition-all hover:bg-[#FCE2DC] dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                      >
                        View
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            (currentItems as FreelancerRow[]).map((row) => (
              <div key={row.id} className="grid grid-cols-12 items-center gap-3 py-5 sm:gap-4 sm:py-7">
                <div className="col-span-12 md:col-span-5">
                  <div className="flex items-center gap-4">
                    <ProposalListAvatar row={row} variant="freelancer" />
                    <div className="min-w-0 flex-1 space-y-1.5 font-sans">
                      <h4 className="text-[15px] font-medium leading-snug tracking-tight text-black dark:text-stone-100">
                        {row.projectTitle}
                      </h4>
                      <p className="text-sm font-medium text-black dark:text-stone-100">
                        {row.amountLabel}
                        <span className="ml-1.5 text-xs font-normal text-neutral-500">{row.rateType}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-normal tracking-tight text-neutral-800 dark:text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-800 dark:text-neutral-300">
                          <MapPin strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                          <span>{row.location}</span>
                        </span>
                        <span className="font-normal text-neutral-300 dark:text-neutral-600">|</span>
                        <span className="flex items-center gap-1 font-sans text-neutral-800 dark:text-neutral-300">
                          <Calendar strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                          <span>{row.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 flex flex-wrap items-center gap-2 md:contents">
                  <div className="md:col-span-2">
                  <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-normal text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {PROPOSAL_TYPE_LABELS[row.listingType]}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-normal capitalize ${statusBadgeClass(row.rawStatus)}`}
                  >
                    {row.status}
                  </span>
                </div>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <div className="flex gap-2.5 md:justify-end">
                    {row.projectSlug ? (
                      <Link
                        href={getFreelancerBidDetailHref(row.projectSlug, row.id, 'proposals')}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-neutral-100 px-3 py-2.5 text-sm font-normal text-neutral-800 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:text-stone-200 dark:hover:bg-neutral-700"
                      >
                        View
                      </Link>
                    ) : null}
                    {row.canWithdraw ? (
                      <button
                        type="button"
                        onClick={() =>
                          setWithdrawTarget({
                            id: row.id,
                            amount: row.amount,
                            listingKind: normalizeFeeListingKind(row.listingType),
                          })
                        }
                        className="shrink-0 cursor-pointer rounded-lg border-0 bg-[#FEF1EE] p-3 text-[#FF6B6B] outline-none transition-all hover:bg-[#FCE2DC] dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                        title="Withdraw proposal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {rows.length > 0 ? (
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
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, rows.length)} of {rows.length}{' '}
              {isFreelancerProposals ? 'applied listings' : 'proposals'}
            </div>
          </div>
        ) : null}
        </div>
      </div>

      <FeeConfirmModal
        open={withdrawTarget !== null}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={() => void confirmWithdraw()}
        mode="withdraw"
        amount={withdrawTarget?.amount ?? 0}
        listingKind={withdrawTarget?.listingKind}
        cancellationStage="BEFORE_ACCEPT"
        confirming={withdrawConfirming}
        confirmLabel="Withdraw proposal"
      />
    </div>
  );
}
