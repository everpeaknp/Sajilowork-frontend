'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  MapPin,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { formatNPR, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { bidService, extractBidList, sortBidsByIdAlphanumeric } from '@/services/bid.service';
import type { Bid, BidStatus } from '@/types';
import DeleteConfirmModal from './DeleteConfirmModal';
import { getDashboardProposalDetailHref } from './dashboardTabs';

type ProposalFilter = 'pending' | 'accepted' | 'cancelled';

const PROPOSAL_FILTER_TABS: { key: ProposalFilter; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'cancelled', label: 'Cancelled' },
];

type ProposalRowBase = {
  id: string;
  location: string;
  date: string;
  status: string;
  rawStatus: BidStatus;
  amountLabel: string;
  rateType: string;
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

function emptyMessageForFilter(filter: ProposalFilter, isCustomer: boolean): string {
  const scope = isCustomer ? 'proposals on your projects' : 'proposals';
  if (filter === 'pending') return `No pending ${scope}.`;
  if (filter === 'accepted') return `No accepted ${scope}.`;
  return `No cancelled ${scope}.`;
}

export default function DashboardProposals() {
  const { isCustomer, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employerRows, setEmployerRows] = useState<EmployerRow[]>([]);
  const [freelancerRows, setFreelancerRows] = useState<FreelancerRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<ProposalFilter>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);

  const loadEmployerRows = useCallback(async () => {
    const response = await bidService.getReceivedBids();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to load proposals');
    }

    const bids = extractBidList(response.data);
    const projectBids = bids.filter((bid) => bid.task_listing_kind === 'project');

    const rows = projectBids.map((bid: Bid) => ({
      id: bid.id,
      projectTitle: bid.task_title || 'Project',
      projectSlug: bid.task_slug,
      freelancerName: getTaskerDisplayName(bid.tasker),
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
    const projectBids = bids.filter((bid) => bid.task_listing_kind === 'project');

    const rows = projectBids.map((bid: Bid) => ({
      id: bid.id,
      projectTitle: bid.task_title || 'Project',
      projectSlug: bid.task_slug,
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
    return source.filter((row) => matchesProposalFilter(row.rawStatus, activeFilter));
  }, [activeFilter, employerRows, freelancerRows, isCustomer]);

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
      return 'Review proposals on your posted projects — open a project to accept or reject.';
    }
    return 'Proposals you have submitted on marketplace projects.';
  }, [isCustomer]);

  const filterTabClass = (filter: ProposalFilter) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeFilter === filter
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full border-0 text-sm font-normal outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 ${
      currentPage === page
        ? 'bg-[#52C47F] text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let page = 1; page <= totalPages && page <= 5; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [totalPages]);

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen space-y-6 bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-sans text-3xl font-normal tracking-tight text-black">My Proposals</h2>
          <p className="mt-1.5 font-sans text-sm text-neutral-800">{subtitle}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-8 md:p-10">
        <div className="mb-8 flex items-center border-b border-neutral-100">
          <div className="flex flex-wrap gap-6 sm:gap-8">
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

        <div className="grid grid-cols-12 gap-4 border-b border-neutral-100 pb-4 text-[13px] font-normal text-black select-none">
          <div className="col-span-12 md:col-span-7">Name</div>
          <div className="col-span-12 md:col-span-3">Cost / Delivery</div>
          <div className="col-span-12 text-right md:col-span-2">Action</div>
        </div>

        <div className="divide-y divide-neutral-100">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading proposals…
            </div>
          ) : currentItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              {emptyMessageForFilter(activeFilter, isCustomer)}
            </div>
          ) : isCustomer ? (
            (currentItems as EmployerRow[]).map((row) => (
              <div key={row.id} className="grid grid-cols-12 items-center gap-4 py-7">
                <div className="col-span-12 md:col-span-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#4B43DF]">
                      <Briefcase className="h-5 w-5 text-white" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5 font-sans">
                      <h4 className="text-[15px] font-medium leading-snug tracking-tight text-black">
                        {row.projectTitle}
                      </h4>
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
                        <span className="font-normal text-neutral-300">|</span>
                        <span className="capitalize text-neutral-800">{row.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <div className="flex items-center font-sans text-[15px] font-medium text-black">
                    <span>{row.amountLabel}</span>
                    <span className="ml-1.5 mt-0.5 text-xs font-normal leading-none text-neutral-500">
                      {row.rateType}
                    </span>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-2">
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
              <div key={row.id} className="grid grid-cols-12 items-center gap-4 py-7">
                <div className="col-span-12 md:col-span-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-600">
                      <Briefcase className="h-5 w-5 text-white" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5 font-sans">
                      <h4 className="text-[15px] font-medium leading-snug tracking-tight text-black">
                        {row.projectTitle}
                      </h4>
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
                        <span className="font-normal text-neutral-300">|</span>
                        <span className="capitalize text-neutral-800">{row.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <div className="flex items-center font-sans text-[15px] font-medium text-black">
                    <span>{row.amountLabel}</span>
                    <span className="ml-1.5 mt-0.5 text-xs font-normal leading-none text-neutral-500">
                      {row.rateType}
                    </span>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <div className="flex gap-2.5 md:justify-end">
                    {row.projectSlug ? (
                      <Link
                        href={`/projects/${row.projectSlug}`}
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
          <div className="mt-8 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-10 font-sans">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>

              <div className="flex items-center gap-1">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={pageButtonClass(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
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
