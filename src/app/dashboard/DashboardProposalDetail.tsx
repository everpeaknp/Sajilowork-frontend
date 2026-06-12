'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { formatNPR } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import { bidService, formatBidDisplayId } from '@/services/bid.service';
import { paymentService } from '@/services/payment.service';
import type { Bid } from '@/types';
import {
  getDashboardProposalProjectHref,
  getDashboardHref,
} from './dashboardTabs';

interface DashboardProposalDetailProps {
  projectSlug: string;
  bidId: string;
}

function formatDisplayDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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

function getTaskStatusFromBid(bid: Bid): string | null {
  if (typeof bid.task === 'object' && bid.task && 'status' in bid.task) {
    const status = (bid.task as { status?: string }).status;
    return status ? String(status) : null;
  }
  return null;
}

function InfoRow({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="grid gap-1 border-b border-neutral-100 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd
        className="min-w-0 break-words font-mono text-sm tracking-wide text-black sm:col-span-2 [overflow-wrap:anywhere]"
        title={title}
      >
        {value}
      </dd>
    </div>
  );
}

export default function DashboardProposalDetail({
  projectSlug,
  bidId,
}: DashboardProposalDetailProps) {
  const router = useRouter();
  const { isCustomer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bid, setBid] = useState<Bid | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
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

  useEffect(() => {
    if (!isCustomer) return;
    void loadBid();
  }, [isCustomer, loadBid]);

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
      const amount = Number(bid.amount) || 0;
      const { available, hold } = await fetchWalletPreview(amount);
      setWalletAvailableBalance(available);
      setEscrowHoldAmount(hold);

      if (available !== null && available < hold) {
        setShowInsufficientWalletModal(true);
        return;
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

  if (!isCustomer) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-sm text-neutral-600">
        Proposal review is available for employer accounts.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading proposal…
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="space-y-4">
        <Link
          href={getDashboardProposalProjectHref(projectSlug)}
          className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to project proposals
        </Link>
        <p className="text-sm text-neutral-600">Proposal not found.</p>
      </div>
    );
  }

  const isPending = bid.status === 'pending';
  const requiredHoldAmount = escrowHoldAmount ?? (Number(bid.amount) || 0);
  const taskTitle =
    bid.task_title ||
    (typeof bid.task === 'object' && bid.task && 'title' in bid.task
      ? String((bid.task as { title?: string }).title || '')
      : '') ||
    'Project';

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen space-y-6 bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={getDashboardHref('proposals')}
            className="inline-flex items-center gap-2 text-sm font-normal text-neutral-700 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            My Proposals
          </Link>
          <span className="text-neutral-300">/</span>
          <Link
            href={getDashboardProposalProjectHref(projectSlug)}
            className="text-sm font-normal text-neutral-700 hover:text-black"
          >
            {taskTitle}
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="font-sans text-3xl font-normal tracking-tight text-black">
              Proposal from {taskerName(bid)}
            </h2>
            <p className="mt-1.5 text-sm capitalize text-neutral-700">Status: {bid.status}</p>
          </div>

          {isPending ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleAcceptClick()}
                className="rounded-lg bg-[#52C47F] px-5 py-2.5 text-sm font-normal text-white transition-colors hover:bg-[#49b071] disabled:opacity-60"
              >
                {actionLoading ? 'Processing…' : 'Accept'}
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowRejectModal(true)}
                className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-normal text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section className="min-w-0 overflow-hidden rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-8">
          <h3 className="mb-4 text-lg font-normal text-black">Basic Information</h3>
          <dl>
            <InfoRow
              label="Bid ID"
              value={formatBidDisplayId(bid.id)}
              title={bid.id}
            />
            <InfoRow label="Status" value={bid.status} />
            <InfoRow label="Project" value={taskTitle} />
            <InfoRow label="Freelancer" value={taskerName(bid)} />
            <InfoRow label="Email" value={bid.tasker?.email || '—'} />
            <InfoRow label="Submitted" value={formatDisplayDate(bid.created_at)} />
            <InfoRow label="Last updated" value={formatDisplayDate(bid.updated_at)} />
            {bid.accepted_at ? (
              <InfoRow label="Accepted at" value={formatDisplayDate(bid.accepted_at)} />
            ) : null}
            {bid.rejected_at ? (
              <InfoRow label="Rejected at" value={formatDisplayDate(bid.rejected_at)} />
            ) : null}
          </dl>
        </section>

        <section className="min-w-0 overflow-hidden rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-8">
          <h3 className="mb-4 text-lg font-normal text-black">Offer Details</h3>
          <dl>
            <InfoRow label="Amount" value={formatNPR(Number(bid.amount) || 0)} />
          </dl>
          <div className="mt-4 min-w-0 border-t border-neutral-100 pt-4">
            <p className="mb-2 text-sm text-neutral-500">Proposal</p>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-black [overflow-wrap:anywhere]">
              {bid.proposal}
            </p>
          </div>
          {bid.cover_letter ? (
            <div className="mt-4 min-w-0 border-t border-neutral-100 pt-4">
              <p className="mb-2 text-sm text-neutral-500">Cover letter</p>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-black [overflow-wrap:anywhere]">
                {bid.cover_letter}
              </p>
            </div>
          ) : null}
          {bid.tasker?.profile_image ? (
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <p className="mb-2 text-sm text-neutral-500">Freelancer photo</p>
              <img
                src={getMediaUrl(bid.tasker.profile_image)}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            </div>
          ) : null}
        </section>
      </div>

      {bid.rejection_reason ? (
        <section className="rounded-xl border border-red-100 bg-white p-6 sm:p-8">
          <h3 className="mb-2 text-lg font-normal text-black">Rejection reason</h3>
          <p className="break-words text-sm leading-relaxed text-neutral-800 [overflow-wrap:anywhere]">
            {bid.rejection_reason}
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push(getDashboardProposalProjectHref(projectSlug))}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
        >
          Back to all proposals
        </button>
        <Link
          href={`/projects/${projectSlug}`}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
        >
          View public project page
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
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-normal text-black">Insufficient wallet balance</h3>
              <button
                type="button"
                onClick={() => setShowInsufficientWalletModal(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-50 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-neutral-700">
              You need at least {formatNPR(requiredHoldAmount)} in your wallet to accept this offer
              (includes fees). Available:{' '}
              {formatNPR(walletAvailableBalance ?? 0)}.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowInsufficientWalletModal(false)}
                className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200"
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
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-normal text-black">Reject proposal</h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-50 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-neutral-600">
              Provide a rejection reason. The freelancer will be notified.
            </p>
            <label className="mb-2 block text-sm text-neutral-700" htmlFor="rejection-reason">
              Rejection reason
            </label>
            <textarea
              id="rejection-reason"
              rows={5}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why you are rejecting this proposal…"
              className="w-full resize-y rounded-lg border border-neutral-200 px-4 py-3 text-sm text-black outline-none focus:border-[#52C47F] focus:ring-1 focus:ring-[#52C47F]/20"
            />
            <p className="mt-1 text-xs text-neutral-500">Minimum 10 characters</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200"
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
