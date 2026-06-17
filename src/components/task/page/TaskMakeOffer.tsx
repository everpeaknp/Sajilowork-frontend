'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { bidService, getMyBidForTask } from '@/services/bid.service';
import { formatNPR } from '@/lib/nepalLocale';
import {
  getListingClosedOfferMessage,
  isProjectOpenForBids,
} from '@/lib/taskUtils';
import type { Bid } from '@/types';
import type { Project } from '@/components/projects/projectListData';

interface TaskMakeOfferProps {
  project: Project;
  onSubmitted?: () => void;
}

const MIN_MESSAGE_LENGTH = 50;

function formatSubmittedDate(value?: string): string {
  if (!value) return 'recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TaskMakeOffer({ project, onSubmitted }: TaskMakeOfferProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingBid, setExistingBid] = useState<Bid | null>(null);
  const [checkingBid, setCheckingBid] = useState(false);

  const isOwner =
    Boolean(user?.id) && Boolean(project.ownerId) && String(user?.id) === String(project.ownerId);

  const offersOpen = isProjectOpenForBids(project);

  const loadExistingBid = useCallback(async () => {
    if (!user || isOwner || !project.id || !offersOpen) {
      setExistingBid(null);
      return;
    }

    setCheckingBid(true);
    try {
      const bid = await getMyBidForTask(project.id);
      setExistingBid(bid);
    } catch {
      setExistingBid(null);
    } finally {
      setCheckingBid(false);
    }
  }, [user, isOwner, project.id, offersOpen]);

  useEffect(() => {
    void loadExistingBid();
  }, [loadExistingBid]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (existingBid) {
      return;
    }

    if (!offersOpen) {
      toast.error(getListingClosedOfferMessage(project.status, 'task', project.isOpenForBids));
      return;
    }

    if (isOwner) {
      toast.error('You cannot make an offer on your own task.');
      return;
    }

    if (!user) {
      toast.error('Please sign in to make an offer.');
      router.push('/signin');
      return;
    }

    if (!project.id) {
      toast.error('This task is missing an identifier. Try refreshing the page.');
      return;
    }

    const amount = Number.parseFloat(offerAmount.replace(/,/g, '').trim());
    const proposalText = message.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid offer amount.');
      return;
    }

    if (amount < 5) {
      toast.error('Minimum offer amount is Rs. 5.');
      return;
    }

    if (proposalText.length < MIN_MESSAGE_LENGTH) {
      toast.error(`Your message must be at least ${MIN_MESSAGE_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await bidService.createBid({
        task: project.id,
        amount,
        proposal: proposalText,
        currency: 'NPR',
      });

      if (!response.success) {
        toast.error(response.message || 'Failed to submit offer.');
        return;
      }

      toast.success('Your offer was submitted.');
      setOfferAmount('');
      setMessage('');
      if (response.data) {
        setExistingBid(response.data);
      } else {
        await loadExistingBid();
      }
      onSubmitted?.();
    } catch {
      toast.error('Failed to submit offer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    'w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-normal text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-[#52C47F] focus:ring-1 focus:ring-[#52C47F]/20';

  if (isOwner) {
    return (
      <section className="border-t border-neutral-200 pt-10">
        <h2 className="mb-4 text-xl font-normal tracking-tight text-black sm:text-2xl">
          Make an Offer
        </h2>
        <p className="text-sm font-normal text-neutral-600">
          {offersOpen
            ? 'You posted this task. Taskers submit offers here — review them in the list above or under Dashboard → My Offers.'
            : getListingClosedOfferMessage(project.status, 'task', project.isOpenForBids)}
        </p>
      </section>
    );
  }

  if (!offersOpen) {
    return (
      <section className="border-t border-neutral-200 pt-10">
        <h2 className="mb-4 text-xl font-normal tracking-tight text-black sm:text-2xl">
          Make an Offer
        </h2>
        <p className="text-sm font-normal text-neutral-600">
          {getListingClosedOfferMessage(project.status, 'task', project.isOpenForBids)}
        </p>
      </section>
    );
  }

  if (checkingBid) {
    return (
      <section className="border-t border-neutral-200 pt-10">
        <h2 className="mb-6 text-xl font-normal tracking-tight text-black sm:text-2xl">
          Make an Offer
        </h2>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your offer status…
        </div>
      </section>
    );
  }

  if (existingBid) {
    return (
      <section className="border-t border-neutral-200 pt-10">
        <h2 className="mb-6 text-xl font-normal tracking-tight text-black sm:text-2xl">
          Make an Offer
        </h2>
        <div className="rounded-lg border border-[#52C47F]/25 bg-[#ebf8f2] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#52C47F]" />
            <div className="min-w-0">
              <p className="text-base font-normal text-[#1D3E35]">Offer submitted</p>
              <p className="mt-1.5 text-sm font-normal text-neutral-600">
                You offered {formatNPR(Number(existingBid.amount) || 0)} on{' '}
                {formatSubmittedDate(existingBid.created_at)}. Status:{' '}
                <span className="capitalize text-neutral-800">{existingBid.status}</span>.
              </p>
              <Link
                href="/dashboard/proposals"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-normal text-[#52C47F] hover:underline"
              >
                View in My Offers
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-neutral-200 pt-10">
      <h2 className="mb-6 text-xl font-normal tracking-tight text-black sm:text-2xl">
        Make an Offer
      </h2>

      {!user ? (
        <p className="mb-4 text-sm font-normal text-neutral-600">
          <button
            type="button"
            onClick={() => router.push('/signin')}
            className="font-normal text-black underline underline-offset-2 hover:opacity-80"
          >
            Sign in
          </button>{' '}
          to make an offer on this task.
        </p>
      ) : null}

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
        <div>
          <label htmlFor="task-offer-amount" className="mb-2 block text-sm font-normal text-black">
            Your offer amount
          </label>
          <input
            id="task-offer-amount"
            type="text"
            inputMode="decimal"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            className={`${inputClassName} max-w-md`}
            placeholder={
              project.budgetMin > 0
                ? `e.g. ${formatNPR(project.budgetMin)}`
                : 'Enter your offer'
            }
          />
        </div>

        <div>
          <label htmlFor="task-offer-message" className="mb-2 block text-sm font-normal text-black">
            Message
          </label>
          <textarea
            id="task-offer-message"
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe how you would complete this task..."
            className={`${inputClassName} min-h-[180px] resize-y`}
          />
          <p className="mt-1.5 text-xs font-normal text-neutral-500">
            {message.trim().length} / {MIN_MESSAGE_LENGTH} minimum characters
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#52C47F] px-6 py-3.5 text-base font-normal text-white transition-colors hover:bg-[#49b071] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Offer
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>
    </section>
  );
}
