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
  FolderKanban,
  Loader2,
  MapPin,
  Trash2,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { resolveOwnerAvatarBg, resolveOwnerInitials } from '@/lib/employerAvatarUtils';
import { formatNPR, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import { bidService, extractBidList, sortBidsByIdAlphanumeric } from '@/services/bid.service';
import type { Bid, BidStatus } from '@/types';
import DeleteConfirmModal from './DeleteConfirmModal';
import { getDashboardProposalDetailHref } from './dashboardTabs';
import {
  DASHBOARD_CARD_PLAIN,
  DASHBOARD_HEADING_PROPOSALS,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_PAGINATION_ARROW_PLAIN,
  DASHBOARD_PAGINATION_INNER,
  DASHBOARD_PAGINATION_OUTER,
  DASHBOARD_SUBTABS_ROW,
  DASHBOARD_SUBTABS_WRAP,
  dashboardPageButtonClass,
} from './dashboardResponsive';

type ProposalFilter = 'pending' | 'accepted' | 'cancelled';

const PROPOSAL_FILTER_TABS: { key: ProposalFilter; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'cancelled', label: 'Cancelled' },
];

type ProposalType = 'job' | 'service' | 'project' | 'task';

type ProposalTypeFilter = 'all' | ProposalType;

const PROPOSAL_TYPE_TABS: { key: ProposalTypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'job', label: 'Job' },
  { key: 'service', label: 'Services' },
  { key: 'project', label: 'Project' },
  { key: 'task', label: 'Task' },
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

function matchesProposalType(listingType: ProposalType, filter: ProposalTypeFilter): boolean {
  if (filter === 'all') return true;
  return listingType === filter;
}

function getPublicListingHref(type: ProposalType, slug: string): string {
  switch (type) {
    case 'job':
      return `/jobs/${slug}`;
    case 'service':
      return `/services/${slug}`;
    case 'project':
      return `/projects/${slug}`;
    case 'task':
      return `/task/${slug}`;
  }
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
    if (avatarSrc) {
      return (
        <img
          src={avatarSrc}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-neutral-100"
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white ring-1 ring-neutral-100">
        {resolveOwnerInitials(employerRow.freelancerName)}
      </div>
    );
  }

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt=""
        className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-neutral-100"
        referrerPolicy="no-referrer"
      />
    );
  }

  const displayName = row.ownerName?.trim() || row.projectTitle;
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
  if (rawStatus === 'accepted') return 'bg-emerald-50 text-emerald-700';
  if (rawStatus === 'pending') return 'bg-amber-50 text-amber-800';
  return 'bg-neutral-100 text-neutral-600';
}

function emptyMessageForFilter(
  statusFilter: ProposalFilter,
  typeFilter: ProposalTypeFilter,
  isCustomer: boolean,
): string {
  const scope = isCustomer ? 'proposals on your listings' : 'proposals';
  const typeLabel =
    typeFilter === 'all' ? '' : ` ${PROPOSAL_TYPE_LABELS[typeFilter].toLowerCase()}`;
  if (statusFilter === 'pending') return `No pending${typeLabel} ${scope}.`;
  if (statusFilter === 'accepted') return `No accepted${typeLabel} ${scope}.`;
  return `No cancelled${typeLabel} ${scope}.`;
}

export default function DashboardProposals() {
  const { isCustomer, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employerRows, setEmployerRows] = useState<EmployerRow[]>([]);
  const [freelancerRows, setFreelancerRows] = useState<FreelancerRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<ProposalFilter>('pending');
  const [activeTypeFilter, setActiveTypeFilter] = useState<ProposalTypeFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);

  const loadEmployerRows = useCallback(async () => {
    const response = await bidService.getReceivedBids();
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

  const loadFreelancerRows = useCallback(async () => {
    const response = await bidService.getMyBids();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to load proposals');
    }

    const bids = extractBidList(response.data);

    const rows = bids.map((bid: Bid) => ({
      id: bid.id,
      listingType: resolveProposalType(bid.task_listing_kind),
      projectTitle: bid.task_title || 'Listing',
      projectSlug: bid.task_slug,
      avatarUrl: bid.task_owner_logo_url || undefined,
      logoText: bid.task_owner_logo_text || undefined,
      logoColor: bid.task_owner_logo_color || undefined,
      ownerName: bid.task_owner_business_name || bid.task_title || undefined,
      location: formatProposalLocation(bid.task_city),
      date: formatDisplayDate(bid.created_at),
      status: statusLabel(bid.status),
      rawStatus: bid.status,
      amountLabel: formatNPR(Number(bid.amount) || 0),
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
    return source.filter(
      (row) =>
        matchesProposalFilter(row.rawStatus, activeFilter) &&
        matchesProposalType(row.listingType, activeTypeFilter),
    );
  }, [activeFilter, activeTypeFilter, employerRows, freelancerRows, isCustomer]);

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
    if (!withdrawTargetId) return;

    try {
      const response = await bidService.withdrawBid(withdrawTargetId, 'Withdrawn from dashboard');
      if (!response.success) {
        toast.error(response.message || 'Failed to withdraw proposal');
        return;
      }
      toast.success('Proposal withdrawn');
      setWithdrawTargetId(null);
      await loadRows();
    } catch {
      toast.error('Failed to withdraw proposal');
    }
  };

  const subtitle = useMemo(() => {
    if (isCustomer) {
      return 'Review proposals on your jobs, services, projects, and tasks — accept or reject from the detail view.';
    }
    return 'Proposals you have submitted on marketplace jobs, services, projects, and tasks.';
  }, [isCustomer]);

  const typeTabClass = (filter: ProposalTypeFilter) =>
    `cursor-pointer rounded-full px-4 py-2 text-sm font-normal transition-all outline-none ${
      activeTypeFilter === filter
        ? 'bg-black text-white'
        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
    }`;

  const filterTabClass = (filter: ProposalFilter) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeFilter === filter
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let page = 1; page <= totalPages && page <= 5; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [totalPages]);

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} space-y-6`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className={DASHBOARD_HEADING_PROPOSALS}>My Proposals</h2>
          <p className="mt-1.5 font-sans text-sm text-neutral-800">{subtitle}</p>
        </div>
      </div>

      <div className={`${DASHBOARD_CARD_PLAIN} rounded-xl sm:rounded-2xl md:p-10`}>
        <div className="mb-6 overflow-x-auto pb-1">
          <div className="flex w-max min-w-full flex-nowrap gap-2">
          {PROPOSAL_TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTypeFilter(tab.key);
                setCurrentPage(1);
              }}
              className={typeTabClass(tab.key)}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        <div className={DASHBOARD_SUBTABS_WRAP}>
          <div className={DASHBOARD_SUBTABS_ROW}>
            {PROPOSAL_FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.key);
                  setCurrentPage(1);
                }}
                className={filterTabClass(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden grid-cols-12 gap-4 border-b border-neutral-100 pb-4 text-[13px] font-normal text-black select-none md:grid">
          <div className="col-span-12 md:col-span-5">Name</div>
          <div className="col-span-6 md:col-span-2">Type</div>
          <div className="col-span-6 md:col-span-2">Status</div>
          <div className="col-span-12 text-right md:col-span-3">Action</div>
        </div>

        <div className="divide-y divide-neutral-100">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading proposals…
            </div>
          ) : currentItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              {emptyMessageForFilter(activeFilter, activeTypeFilter, isCustomer)}
            </div>
          ) : isCustomer ? (
            (currentItems as EmployerRow[]).map((row) => (
              <div key={row.id} className="grid grid-cols-12 items-center gap-3 py-5 sm:gap-4 sm:py-7">
                <div className="col-span-12 md:col-span-5">
                  <div className="flex items-center gap-4">
                    <ProposalListAvatar row={row} variant="employer" />
                    <div className="min-w-0 flex-1 space-y-1.5 font-sans">
                      <h4 className="text-[15px] font-medium leading-snug tracking-tight text-black">
                        {row.projectTitle}
                      </h4>
                      <p className="text-sm font-medium text-black">
                        {row.amountLabel}
                        <span className="ml-1.5 text-xs font-normal text-neutral-500">{row.rateType}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-normal tracking-tight text-neutral-800">
                        <span className="flex items-center gap-1 text-neutral-800">
                          <FileText strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{row.freelancerName}</span>
                        </span>
                        <span className="font-normal text-neutral-300">|</span>
                        <span className="flex items-center gap-1 text-neutral-800">
                          <MapPin strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{row.location}</span>
                        </span>
                        <span className="font-normal text-neutral-300">|</span>
                        <span className="flex items-center gap-1 font-sans text-neutral-800">
                          <Calendar strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{row.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 flex flex-wrap items-center gap-2 md:contents">
                  <div className="md:col-span-2">
                  <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-normal text-neutral-700">
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
                        href={getDashboardProposalDetailHref(row.projectSlug, row.id)}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#FEF1EE] px-3 py-2.5 text-sm font-normal text-[#FF6B6B] transition-all hover:bg-[#FCE2DC]"
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
                      <h4 className="text-[15px] font-medium leading-snug tracking-tight text-black">
                        {row.projectTitle}
                      </h4>
                      <p className="text-sm font-medium text-black">
                        {row.amountLabel}
                        <span className="ml-1.5 text-xs font-normal text-neutral-500">{row.rateType}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-normal tracking-tight text-neutral-800">
                        <span className="flex items-center gap-1 text-neutral-800">
                          <MapPin strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{row.location}</span>
                        </span>
                        <span className="font-normal text-neutral-300">|</span>
                        <span className="flex items-center gap-1 font-sans text-neutral-800">
                          <Calendar strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{row.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 flex flex-wrap items-center gap-2 md:contents">
                  <div className="md:col-span-2">
                  <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-normal text-neutral-700">
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
                        href={getPublicListingHref(row.listingType, row.projectSlug)}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-neutral-100 px-3 py-2.5 text-sm font-normal text-neutral-800 transition-all hover:bg-neutral-200"
                      >
                        View
                      </Link>
                    ) : null}
                    {row.canWithdraw ? (
                      <button
                        type="button"
                        onClick={() => setWithdrawTargetId(row.id)}
                        className="shrink-0 cursor-pointer rounded-lg border-0 bg-[#FEF1EE] p-3 text-[#FF6B6B] outline-none transition-all hover:bg-[#FCE2DC]"
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
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, rows.length)} of {rows.length}{' '}
              proposals
            </div>
          </div>
        ) : null}
      </div>

      <DeleteConfirmModal
        open={withdrawTargetId !== null}
        onClose={() => setWithdrawTargetId(null)}
        onConfirm={() => void confirmWithdraw()}
      />
    </div>
  );
}
