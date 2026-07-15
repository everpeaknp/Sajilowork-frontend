'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import ProposalApplicantPanel from '@/components/proposals/ProposalApplicantPanel';
import ProposalDetailHeroCard from '@/components/proposals/ProposalDetailHeroCard';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import { resolveBidListingKind } from '@/lib/buildFreelancerCvData';
import { formatNPR } from '@/lib/nepalLocale';
import { bidService } from '@/services/bid.service';
import { paymentService } from '@/services/payment.service';
import { taskService } from '@/services/task.service';
import type { Bid, Task, TaskStatus } from '@/types';
import {
  getDashboardBidsListingHref,
  getDashboardHref,
  getEmployerBidDetailCopy,
  getFreelancerBidDetailCopy,
  resolveEmployerBidDetailFrom,
  resolveFreelancerBidDetailFrom,
} from './dashboardTabs';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';
import {
  canUserViewBid,
  getEmployerAvatarBg,
  getEmployerAvatarSrc,
  getEmployerDisplayName,
  isServiceOrderBid,
  canManageServiceOrderWorkflow,
} from '@/lib/proposalDetailUtils';

interface DashboardProposalDetailProps {
  projectSlug: string;
  bidId: string;
}

function taskerName(bid: Bid | null): string {
  if (!bid?.tasker) return '—';
  const full = [bid.tasker.first_name, bid.tasker.last_name].filter(Boolean).join(' ').trim();
  return full || bid.tasker.username || bid.tasker.email || '—';
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return fallback;
}

function getListingLabel(kind: string | null): string {
  if (kind === 'job') return 'Job';
  if (kind === 'project') return 'Project';
  return 'Task';
}

function getPublicListingHref(kind: string | null, slug: string): string {
  if (kind === 'job') return `/jobs/${slug}`;
  if (kind === 'project') return `/projects/${slug}`;
  return `/tasks/${slug}`;
}

function getTaskStatusFromBid(bid: Bid): string | null {
  if (typeof bid.task === 'object' && bid.task && 'status' in bid.task) {
    const status = (bid.task as { status?: string }).status;
    return status ? String(status) : null;
  }
  return null;
}

export default function DashboardProposalDetail({
  projectSlug,
  bidId,
}: DashboardProposalDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCustomer, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bid, setBid] = useState<Bid | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInsufficientWalletModal, setShowInsufficientWalletModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [walletAvailableBalance, setWalletAvailableBalance] = useState<number | null>(null);
  const [escrowHoldAmount, setEscrowHoldAmount] = useState<number | null>(null);

  const loadBid = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bidService.getBidById(bidId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Proposal not found');
      }
      setBid(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load proposal';
      toast.error(message);
      setBid(null);
    } finally {
      setLoading(false);
    }
  }, [bidId]);

  const loadTask = useCallback(async (slug: string) => {
    setTaskLoading(true);
    try {
      const response = await taskService.getTaskBySlug(slug);
      if (response.success && response.data) {
        setTask(response.data);
      } else {
        setTask(null);
      }
    } catch {
      setTask(null);
    } finally {
      setTaskLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!bid) {
      setTask(null);
      return;
    }
    const slug =
      bid.task_slug ||
      (typeof bid.task === 'object' && bid.task && 'slug' in bid.task
        ? String((bid.task as { slug?: string }).slug || '')
        : '') ||
      projectSlug;
    if (!slug) return;
    void loadTask(slug);
  }, [bid, loadTask, projectSlug]);

  useEffect(() => {
    void loadBid();
  }, [loadBid]);

  const fetchWalletPreview = useCallback(async (amount: number) => {
    const [walletRes, feeRes] = await Promise.all([
      paymentService.getWalletBalance(),
      paymentService.getFeePreview(amount, 'wallet'),
    ]);
    const available =
      walletRes.success && walletRes.data ? Number(walletRes.data.available_balance) : null;
    const hold =
      feeRes.success && feeRes.data
        ? Number(feeRes.data.poster_total_held ?? amount)
        : amount;
    return { available, hold };
  }, []);

  const handleAcceptClick = async () => {
    if (!bid || bid.status !== 'pending') return;

    const taskStatus = getTaskStatusFromBid(bid);
    if (taskStatus !== 'open' && taskStatus !== 'draft') {
      toast.error(
        taskStatus
          ? `This project is not open for proposals (status: ${taskStatus.replace(/_/g, ' ')}).`
          : 'This project is not open for proposals.'
      );
      return;
    }

    setActionLoading(true);
    try {
      const isJobProposal = resolveBidListingKind(bid) === 'job';

      if (!isJobProposal) {
        const amount = Number(bid.amount) || 0;
        const { available, hold } = await fetchWalletPreview(amount);
        setWalletAvailableBalance(available);
        setEscrowHoldAmount(hold);

        if (available !== null && available < hold) {
          setShowInsufficientWalletModal(true);
          return;
        }
      }

      const response = await bidService.acceptBid(bid.id);
      if (!response.success) {
        toast.error(response.message || 'Failed to accept proposal');
        return;
      }
      toast.success('Proposal accepted');
      await loadBid();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to accept proposal'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!bid || bid.status !== 'pending') return;
    const reason = rejectionReason.trim();
    if (reason.length < 10) {
      toast.error('Rejection reason must be at least 10 characters.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await bidService.rejectBid(bid.id, reason);
      if (!response.success) {
        toast.error(response.message || 'Failed to reject proposal');
        return;
      }
      toast.success('Proposal rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      await loadBid();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reject proposal'));
    } finally {
      setActionLoading(false);
    }
  };

  const applyTaskStatusUpdate = async (newStatus: TaskStatus) => {
    const slug = task?.slug || projectSlug;
    if (!slug) return;
    const response = await taskService.updateTaskStatus(slug, newStatus);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update status');
    }
    if (response.data?.task) {
      setTask(response.data.task);
    } else {
      await loadTask(slug);
    }
  };

  const confirmWorkComplete = async () => {
    const slug = task?.slug || projectSlug;
    if (!slug) return;
    const response = await apiClient.post<{
      task?: Task;
      message?: string;
      error?: string;
    }>(`/tasks/${slug}/confirm_work_complete/`);
    if (response.data?.error) {
      throw new Error(response.data.error);
    }
    if (response.data?.task) {
      setTask(response.data.task);
    } else {
      await loadTask(slug);
    }
    toast.success(
      response.data?.message ||
        'Completion recorded. Waiting for the other party to confirm if needed.',
    );
  };

  const handleWorkflowStart = async () => {
    setWorkflowLoading(true);
    try {
      await applyTaskStatusUpdate('in_progress');
      toast.success('Contract marked as in progress');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to start contract'));
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleWorkflowComplete = async () => {
    setWorkflowLoading(true);
    try {
      if (bid && resolveBidListingKind(bid) === 'job' && isCustomer) {
        await applyTaskStatusUpdate('completed');
        toast.success('Applicant hired');
        await loadBid();
        return;
      }
      await confirmWorkComplete();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          bid && resolveBidListingKind(bid) === 'job' ? 'Failed to mark as hired' : 'Failed to complete contract',
        ),
      );
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleWorkflowCancel = async () => {
    const slug = task?.slug || projectSlug;
    if (!slug) return;
    setWorkflowLoading(true);
    try {
      const response = await taskService.cancelTask(slug);
      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel contract');
      }
      toast.success('Contract cancelled');
      await loadTask(slug);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to cancel contract'));
    } finally {
      setWorkflowLoading(false);
    }
  };

  if (loading) {
    const loadingCopy = isCustomer
      ? getEmployerBidDetailCopy(
          resolveEmployerBidDetailFrom('pending', searchParams.get('from')),
        )
      : getFreelancerBidDetailCopy(
          resolveFreelancerBidDetailFrom('pending', searchParams.get('from')),
        );
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingCopy.loadingLabel}
      </div>
    );
  }

  const detailFrom = isCustomer
    ? resolveEmployerBidDetailFrom(bid?.status ?? 'pending', searchParams.get('from'))
    : resolveFreelancerBidDetailFrom(bid?.status ?? 'pending', searchParams.get('from'));
  const detailCopy = isCustomer
    ? getEmployerBidDetailCopy(
        detailFrom as 'contracts' | 'applications' | 'bids' | 'orders',
      )
    : getFreelancerBidDetailCopy(
        detailFrom as 'contracts' | 'proposals' | 'bids' | 'orders',
      );
  const sectionHref = getDashboardHref(detailCopy.sectionTab);
  const listingKind = bid ? resolveBidListingKind(bid) : null;
  const isServiceOrder = bid ? isServiceOrderBid(bid, task) : false;
  const listingMiddleHref = isCustomer
    ? detailFrom === 'bids'
      ? getDashboardBidsListingHref(projectSlug)
      : detailFrom === 'applications'
        ? getDashboardHref('applications')
        : detailFrom === 'orders'
          ? getDashboardHref('orders')
          : getDashboardHref('contracts')
    : detailFrom === 'bids'
      ? getDashboardBidsListingHref(projectSlug)
      : detailFrom === 'orders'
        ? getDashboardHref('orders')
        : getDashboardHref('proposals');

  if (!bid) {
    return (
      <div className="space-y-4">
        <Link
          href={sectionHref}
          className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {detailCopy.listBackLabel}
        </Link>
        <p className="text-sm text-neutral-600">{detailCopy.notFoundLabel}</p>
      </div>
    );
  }

  if (!canUserViewBid(bid, user?.id, isCustomer)) {
    return (
      <div className="space-y-4">
        <Link
          href={sectionHref}
          className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {detailCopy.listBackLabel}
        </Link>
        <p className="text-sm text-neutral-600">You do not have permission to view this proposal.</p>
      </div>
    );
  }

  const isPending = bid.status === 'pending';
  const isJobProposal = listingKind === 'job';
  const requiredHoldAmount = escrowHoldAmount ?? (Number(bid.amount) || 0);
  const taskTitle =
    bid.task_title ||
    (typeof bid.task === 'object' && bid.task && 'title' in bid.task
      ? String((bid.task as { title?: string }).title || '')
      : '') ||
    'Project';
  const counterpartyName = isCustomer ? taskerName(bid) : getEmployerDisplayName(bid);
  const counterpartyAvatarSrc = isCustomer ? undefined : getEmployerAvatarSrc(bid, task);
  const counterpartyAvatarBg = isCustomer ? undefined : getEmployerAvatarBg(bid, task);

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} space-y-6`}>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={sectionHref}
          className="inline-flex items-center gap-2 text-sm font-normal text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {detailCopy.sectionLabel}
        </Link>
        <span className="text-neutral-300">/</span>
        <Link
          href={listingMiddleHref}
          className="text-sm font-normal text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-stone-100"
        >
          {taskTitle}
        </Link>
      </div>

      <ProposalDetailHeroCard
        bid={bid}
        task={task}
        taskTitle={taskTitle}
        counterpartyName={counterpartyName}
        counterpartyAvatarSrc={counterpartyAvatarSrc}
        counterpartyAvatarBg={counterpartyAvatarBg}
        counterpartyLabel={isCustomer ? 'Freelancer' : 'Employer'}
        counterpartyMode={isCustomer ? 'freelancer' : 'employer'}
        offerLabel={isJobProposal ? 'Expected salary' : 'Offer amount'}
        taskLoading={taskLoading}
        userId={user?.id}
        workflowLoading={workflowLoading}
        canManageWorkflow={
          isJobProposal
            ? isCustomer
            : isServiceOrder
              ? canManageServiceOrderWorkflow(bid, task, user?.id, isCustomer)
              : isCustomer
        }
        isServiceOrder={isServiceOrder}
        onStart={
          bid.status === 'accepted' && !isJobProposal
            ? () => void handleWorkflowStart()
            : undefined
        }
        onComplete={bid.status === 'accepted' ? () => void handleWorkflowComplete() : undefined}
        onCancel={bid.status === 'accepted' ? () => void handleWorkflowCancel() : undefined}
        headerActions={
          isCustomer && isPending ? (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleAcceptClick()}
                className="rounded-lg bg-[#52C47F] px-4 py-2 text-sm font-normal text-white transition-colors hover:bg-[#49b071] disabled:opacity-60"
              >
                {actionLoading ? 'Processing…' : 'Accept'}
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowRejectModal(true)}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-normal text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:bg-neutral-900 dark:hover:bg-red-950/30"
              >
                Reject
              </button>
            </>
          ) : null
        }
      />

      <ProposalApplicantPanel
        bid={bid}
        task={task}
        variant={isJobProposal ? 'job' : 'offer'}
        profileSubject={isCustomer ? 'freelancer' : 'employer'}
        showOfferContent={false}
        collapsible
        defaultExpanded={false}
      />

      {bid.rejection_reason ? (
        <section className="rounded-xl border border-red-100 bg-white p-6 sm:p-8 dark:border-red-900/40 dark:bg-neutral-900">
          <h3 className="mb-2 text-lg font-normal text-black dark:text-stone-100">Rejection reason</h3>
          <p className="break-words text-sm leading-relaxed text-neutral-800 [overflow-wrap:anywhere] dark:text-neutral-300">
            {bid.rejection_reason}
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push(sectionHref)}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:hover:bg-neutral-800"
        >
          {detailCopy.listBackLabel}
        </button>
        <Link
          href={getPublicListingHref(listingKind, projectSlug)}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:hover:bg-neutral-800"
        >
          View public {getListingLabel(listingKind).toLowerCase()} page
        </Link>
      </div>

      {showInsufficientWalletModal ? (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close insufficient wallet dialog"
            onClick={() => setShowInsufficientWalletModal(false)}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-normal text-black dark:text-stone-100">Insufficient wallet balance</h3>
              <button
                type="button"
                onClick={() => setShowInsufficientWalletModal(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-50 hover:text-black dark:hover:bg-neutral-800 dark:hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-400">
              You need at least {formatNPR(requiredHoldAmount)} in your wallet to accept this offer
              (includes fees). Available:{' '}
              {formatNPR(walletAvailableBalance ?? 0)}.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowInsufficientWalletModal(false)}
                className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <Link
                href="/dashboard/wallet"
                onClick={() => setShowInsufficientWalletModal(false)}
                className="rounded-lg bg-[#52C47F] px-4 py-2 text-sm text-white hover:bg-[#49b071]"
              >
                Add funds
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {showRejectModal ? (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close reject dialog"
            onClick={() => setShowRejectModal(false)}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-normal text-black dark:text-stone-100">Reject proposal</h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-50 hover:text-black dark:hover:bg-neutral-800 dark:hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              Provide a rejection reason. The freelancer will be notified.
            </p>
            <label className="mb-2 block text-sm text-neutral-700 dark:text-neutral-300" htmlFor="rejection-reason">
              Rejection reason
            </label>
            <textarea
              id="rejection-reason"
              rows={5}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why you are rejecting this proposal…"
              className="w-full resize-y rounded-lg border border-neutral-200 px-4 py-3 text-sm text-black outline-none focus:border-[#52C47F] focus:ring-1 focus:ring-[#52C47F]/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100"
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Minimum 10 characters</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleReject()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading ? 'Rejecting…' : 'Reject proposal'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
