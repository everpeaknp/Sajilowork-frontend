'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, FileText, Loader2, Star, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { bidService, extractBidList } from '@/services/bid.service';
import { paymentService } from '@/services/payment.service';
import { formatNPR } from '@/lib/nepalLocale';
import { isListingOpenForBids } from '@/lib/taskUtils';
import { getMediaUrl } from '@/lib/utils';
import type { Bid } from '@/types';
import type { Project } from '@/components/projects/projectListData';

interface TaskOffersProps {
  project: Project;
  taskStatus?: string;
  initialOfferCount?: number;
  refreshKey?: number;
  onOfferAccepted?: () => void;
  enableWalletGate?: boolean;
  /** Render inside tab panel — hides section chrome */
  embedded?: boolean;
  onCountChange?: (count: number) => void;
}

function MetaDivider() {
  return <span className="h-3.5 w-px shrink-0 bg-neutral-300" aria-hidden />;
}

function formatBidDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
}

function taskerDisplayName(bid: Bid): string {
  const tasker = bid.tasker;
  if (!tasker) return 'Tasker';
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || tasker.email || 'Tasker';
}

function taskerAvatar(bid: Bid): string {
  const image = bid.tasker?.profile_image;
  if (image) return getMediaUrl(image);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(taskerDisplayName(bid))}`;
}

function getBidTaskerId(bid: Bid): string | null {
  const tasker = bid.tasker;
  if (!tasker) return null;
  if (typeof tasker === 'string') return tasker;
  return tasker.id ? String(tasker.id) : null;
}

export default function TaskOffers({
  project,
  taskStatus,
  initialOfferCount = 0,
  refreshKey = 0,
  onOfferAccepted,
  enableWalletGate = false,
  embedded = false,
  onCountChange,
}: TaskOffersProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [walletAvailableBalance, setWalletAvailableBalance] = useState<number | null>(null);
  const [loadingWalletBalance, setLoadingWalletBalance] = useState(false);

  const isOwner =
    Boolean(user?.id) &&
    Boolean(project.ownerId) &&
    String(user?.id) === String(project.ownerId);

  const offersOpen = isListingOpenForBids(taskStatus);

  const hasAcceptedOffer =
    bids.some((bid) => bid.status === 'accepted') ||
    taskStatus === 'assigned' ||
    taskStatus === 'in_progress';

  const loadBids = useCallback(async () => {
    if (!project.id) {
      setBids([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await bidService.getTaskBids(project.id);
      if (response.success && response.data) {
        setBids(extractBidList(response.data));
      } else {
        setBids([]);
      }
    } catch {
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    void loadBids();
  }, [loadBids, refreshKey]);

  const loadWalletBalance = useCallback(async () => {
    if (!enableWalletGate || !isOwner) return;
    setLoadingWalletBalance(true);
    try {
      const res = await paymentService.getWalletBalance();
      if (res.success && res.data) {
        setWalletAvailableBalance(Number(res.data.available_balance));
      } else {
        setWalletAvailableBalance(null);
      }
    } catch {
      setWalletAvailableBalance(null);
    } finally {
      setLoadingWalletBalance(false);
    }
  }, [enableWalletGate, isOwner]);

  useEffect(() => {
    void loadWalletBalance();
  }, [loadWalletBalance]);

  const canAcceptOfferWithWallet = useCallback(
    (bid: Bid) => {
      if (!enableWalletGate || bid.task_listing_kind === 'job') return true;
      if (walletAvailableBalance === null) return true;
      return walletAvailableBalance >= Number(bid.amount);
    },
    [enableWalletGate, walletAvailableBalance],
  );

  const handleAcceptBid = async (bid: Bid) => {
    if (!isOwner || bid.status !== 'pending' || hasAcceptedOffer) return;

    setAcceptingBidId(bid.id);
    try {
      const response = await bidService.acceptBid(bid.id);
      if (response.success) {
        toast.success('Offer accepted');
        await loadBids();
        await loadWalletBalance();
        onOfferAccepted?.();
      } else {
        toast.error(response.message || 'Failed to accept offer');
      }
    } catch {
      toast.error('Failed to accept offer');
    } finally {
      setAcceptingBidId(null);
    }
  };

  const hiddenOfferCount = initialOfferCount > bids.length ? initialOfferCount : 0;

  useEffect(() => {
    onCountChange?.(bids.length);
  }, [bids.length, onCountChange]);

  return (
    <section className={embedded ? '' : 'border-t border-neutral-200 pt-10'}>
      {!embedded ? (
        <h2 className="mb-6 text-xl font-normal tracking-tight text-black sm:text-2xl">
          Offers ({bids.length})
        </h2>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm font-normal text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading offers…
        </div>
      ) : !user && hiddenOfferCount > 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 px-5 py-8 text-center">
          <p className="text-base font-normal text-black">
            {hiddenOfferCount} offer{hiddenOfferCount === 1 ? '' : 's'} on this task
          </p>
          <p className="mt-2 text-sm font-normal text-neutral-500">
            Sign in to view proposals and submit your own offer.
          </p>
          <button
            type="button"
            onClick={() => router.push('/signin')}
            className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-[#52C47F] px-5 py-2.5 text-sm font-normal text-white transition-colors hover:bg-[#49b071]"
          >
            Sign in to view offers
          </button>
        </div>
      ) : bids.length === 0 ? (
        <p className="text-sm font-normal text-neutral-500">
          {offersOpen
            ? isOwner
              ? 'No offers yet. Taskers can submit from the form below.'
              : 'No offers yet. Be the first to make an offer below.'
            : isOwner
              ? 'No offers were submitted on this task.'
              : 'This task is not accepting new offers.'}
        </p>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <article
              key={bid.id}
              className="rounded-lg border border-neutral-200 bg-white px-5 py-5 sm:px-6 sm:py-6"
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="relative shrink-0">
                  <img
                    src={taskerAvatar(bid)}
                    alt={taskerDisplayName(bid)}
                    className="h-16 w-16 rounded-full border border-neutral-100 bg-neutral-50 object-cover sm:h-[72px] sm:w-[72px]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#52C47F]" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-normal text-black sm:text-lg">
                      {taskerDisplayName(bid)}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-normal text-neutral-500">
                      {bid.tasker?.average_rating != null ? (
                        <>
                          <span className="inline-flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            {Number(bid.tasker.average_rating).toFixed(1)}
                          </span>
                          <MetaDivider />
                        </>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        {formatBidDate(bid.created_at)}
                      </span>
                      <MetaDivider />
                      <span className="inline-flex items-center gap-1.5 capitalize">
                        <FileText className="h-4 w-4 text-neutral-400" />
                        {bid.status}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm font-normal leading-normal text-black sm:text-[15px] [overflow-wrap:anywhere]">
                      {bid.proposal}
                    </p>

                    {isOwner && bid.status === 'pending' && !hasAcceptedOffer ? (
                      <div className="mt-4 space-y-2">
                        {enableWalletGate &&
                        !loadingWalletBalance &&
                        walletAvailableBalance !== null &&
                        !canAcceptOfferWithWallet(bid) ? (
                          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-normal text-amber-900">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>
                              You need at least {formatNPR(bid.amount)} in your wallet to accept
                              this offer. Available: {formatNPR(walletAvailableBalance)}.{' '}
                              <Link
                                href="/tasker-dashboard/methods"
                                className="font-semibold underline hover:text-amber-950"
                              >
                                Add funds to wallet
                              </Link>
                            </p>
                          </div>
                        ) : null}
                        <button
                          type="button"
                          disabled={
                            acceptingBidId === bid.id ||
                            loadingWalletBalance ||
                            (enableWalletGate &&
                              walletAvailableBalance !== null &&
                              !canAcceptOfferWithWallet(bid))
                          }
                          onClick={() => void handleAcceptBid(bid)}
                          className="flex w-full cursor-pointer items-center justify-center rounded-md bg-[#52C47F] px-5 py-2.5 text-sm font-normal text-white transition-colors hover:bg-[#49b071] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {acceptingBidId === bid.id ? 'Accepting…' : 'Accept offer'}
                        </button>
                      </div>
                    ) : null}

                    {isOwner && bid.status === 'pending' && hasAcceptedOffer ? (
                      <p className="mt-4 text-sm font-normal text-neutral-500">
                        Another offer has already been accepted for this task.
                      </p>
                    ) : null}

                    {isOwner && bid.status === 'accepted' ? (
                      <button
                        type="button"
                        onClick={() => {
                          const taskerId = getBidTaskerId(bid);
                          if (!taskerId) {
                            toast.error('Could not open messaging for this offer');
                            return;
                          }
                          router.push(`/message?bid=${bid.id}&tasker=${taskerId}`);
                        }}
                        className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-md border border-[#52C47F] bg-white px-5 py-2.5 text-sm font-normal text-[#52C47F] transition-colors hover:bg-[#52C47F] hover:text-white"
                      >
                        Message tasker
                      </button>
                    ) : null}
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-lg font-normal text-black sm:text-xl">
                      {formatNPR(Number(bid.amount) || 0)}
                    </p>
                    <p className="mt-1 text-sm font-normal capitalize text-neutral-500">
                      {project.type === 'Hourly' ? 'Hourly offer' : 'Fixed offer'}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
