'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, FileText, Loader2, Paperclip, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { bidService, extractBidList, getMyBidForTask } from '@/services/bid.service';
import { tokenManager } from '@/lib/api/client';
import { formatNPR } from '@/lib/nepalLocale';
import type { Bid } from '@/types';
import type { Job } from '@/components/jobs/jobListData';
import { getJobEditHref, isJobOwner } from '@/components/jobs/jobSlug';
import {
  offerBtnPrimarySm,
  offerCard,
  offerInputClass,
  offerLabel,
  offerModalSubtitle,
  offerTextareaClass,
} from './makeOfferModalStyles';
import OfferTermsAcceptance from './OfferTermsAcceptance';

interface JobApplyFormProps {
  job: Job;
  onSuccess: (bid?: Bid) => void;
  onCancel: () => void;
  embedded?: boolean;
}

const MIN_PROPOSAL_LENGTH = 50;
const CV_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const CV_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const CV_VALID_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function JobApplyForm({ job, onSuccess, onCancel, embedded = false }: JobApplyFormProps) {
  const { user } = useAuthStore();
  const [offerAmount, setOfferAmount] = useState('');
  const [proposal, setProposal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isCheckingExistingBid, setIsCheckingExistingBid] = useState(true);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isOwner = isJobOwner(job, user?.id);
  const editHref = getJobEditHref(job);

  useEffect(() => {
    const checkExisting = async () => {
      const token = tokenManager.getAccessToken();
      if (!token || isOwner || !job.id) {
        setIsCheckingExistingBid(false);
        return;
      }

      try {
        const existing = await getMyBidForTask(job.id);
        if (existing) {
          toast.error(
            'You already have a pending application on this job. Withdraw it first if you want to submit a new one.',
          );
          onCancel();
          return;
        }

        const response = await bidService.getMyBids('pending');
        if (response.success && response.data) {
          const pendingBids = extractBidList(response.data);
          const duplicate = pendingBids.find((bid) => String(bid.task) === String(job.id));
          if (duplicate) {
            toast.error(
              'You already have a pending application on this job. Withdraw it first if you want to submit a new one.',
            );
            onCancel();
          }
        }
      } catch {
        // Backend will reject duplicate applications if this check fails
      } finally {
        setIsCheckingExistingBid(false);
      }
    };

    void checkExisting();
  }, [isOwner, job.id, onCancel]);

  const handleCvSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!CV_VALID_TYPES.has(file.type)) {
      toast.error('CV must be a PDF or Word document (.pdf, .doc, .docx).');
      return;
    }

    if (file.size > CV_MAX_SIZE_BYTES) {
      toast.error('CV file size cannot exceed 10 MB.');
      return;
    }

    setIsUploadingCv(true);
    try {
      const response = await bidService.uploadBidAttachment(file);
      if (!response.success || !response.data?.url) {
        toast.error(response.message || 'Failed to upload CV.');
        return;
      }
      setCvFile(file);
      setCvUrl(response.data.url);
      toast.success('CV uploaded');
    } catch {
      toast.error('Failed to upload CV. Please try again.');
    } finally {
      setIsUploadingCv(false);
    }
  };

  const removeCv = useCallback(() => {
    setCvFile(null);
    setCvUrl(null);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isOwner) {
      onCancel();
      return;
    }

    const token = tokenManager.getAccessToken();
    if (!token) {
      toast.error('Please sign in to apply for this job.');
      onCancel();
      return;
    }

    if (!job.id) {
      toast.error('This job is missing an identifier. Try refreshing the page.');
      return;
    }

    const amount = Number.parseFloat(offerAmount.replace(/,/g, '').trim());
    const proposalText = proposal.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid salary or rate expectation.');
      return;
    }

    if (amount < 5) {
      toast.error('Minimum amount is Rs. 5.');
      return;
    }

    if (proposalText.length < MIN_PROPOSAL_LENGTH) {
      toast.error(`Application must be at least ${MIN_PROPOSAL_LENGTH} characters.`);
      return;
    }

    if (!cvUrl) {
      toast.error('Please upload your CV before applying.');
      return;
    }

    if (isUploadingCv) {
      toast.error('Please wait for your CV to finish uploading.');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await bidService.createBid({
        task: job.id,
        amount,
        proposal: proposalText,
        currency: 'NPR',
        attachments: [cvUrl],
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to submit application.');
      }

      toast.success('Thank you for applying!', {
        description: "We'll notify you when the employer responds to your application.",
        duration: 6000,
      });
      onSuccess(response.data);
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Failed to submit application. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isCheckingExistingBid) {
    return (
      <div className="flex flex-col items-center justify-center py-14">
        <Loader2 className="h-10 w-10 animate-spin text-brand-emerald mb-4" />
        <p className={offerModalSubtitle}>Checking your application status…</p>
      </div>
    );
  }

  if (isOwner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 py-4 text-center"
      >
        <p className={offerModalSubtitle}>You posted this job. Edit the listing from your dashboard.</p>
        <Link
          href={editHref}
          onClick={onCancel}
          className={`${offerBtnPrimarySm} inline-flex items-center justify-center gap-2`}
        >
          Edit Job
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5"
    >
      {!embedded ? (
        <div className={`${offerCard} border-brand-emerald/10`}>
          <p className="font-formula font-bold text-brand-dark text-base leading-snug line-clamp-2">
            {job.title}
          </p>
          <p className={`${offerModalSubtitle} mt-2 text-xs`}>
            {job.companyName} · {job.budgetLabel} {job.type}
          </p>
        </div>
      ) : null}

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
        <div>
          <label htmlFor="job-modal-offer-amount" className={`${offerLabel} mb-2 block`}>
            Expected salary or rate <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="font-formula text-sm font-bold text-[#6a719a]">Rs.</span>
            </div>
            <input
              id="job-modal-offer-amount"
              type="text"
              inputMode="decimal"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className={`${offerInputClass} pl-12`}
              placeholder={
                job.budgetMin > 0 ? `e.g. ${formatNPR(job.budgetMin)}` : 'Enter your expectation'
              }
            />
          </div>
        </div>

        <div>
          <label htmlFor="job-modal-application" className={`${offerLabel} mb-2 block`}>
            Cover letter <span className="text-red-500">*</span>
          </label>
          <textarea
            id="job-modal-application"
            rows={5}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Introduce yourself and explain why you are a strong fit for this role…"
            className={offerTextareaClass}
          />
          <p className={`${offerModalSubtitle} mt-1.5 text-xs`}>
            {proposal.trim().length} / {MIN_PROPOSAL_LENGTH} minimum characters
          </p>
        </div>

        <div>
          <label className={`${offerLabel} mb-2 block`}>
            Upload CV <span className="text-red-500">*</span>
          </label>
          {!cvFile ? (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d8e0ef] px-4 py-4 transition-colors hover:border-brand-emerald/40 hover:bg-brand-emerald/[0.03]">
              <Paperclip className="h-5 w-5 text-[#8a96b0]" />
              <span className="font-body text-sm font-medium text-[#5a6b8a]">
                {isUploadingCv ? 'Uploading…' : 'Choose CV file (PDF or Word, max 10 MB)'}
              </span>
              <input
                type="file"
                accept={CV_ACCEPT}
                onChange={(event) => void handleCvSelect(event)}
                className="hidden"
                disabled={isUploadingCv || submitting}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-[#e8ecf4] bg-white p-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-[#8a96b0]" />
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-semibold text-brand-dark">
                    {cvFile.name}
                  </p>
                  <p className="font-body text-xs text-[#6a719a]">
                    {formatFileSize(cvFile.size)}
                    {isUploadingCv ? ' · Uploading…' : cvUrl ? ' · Ready' : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeCv}
                disabled={isUploadingCv || submitting}
                className="rounded-lg p-1.5 hover:bg-[#eef2fa] transition-colors disabled:opacity-50"
                aria-label="Remove CV"
              >
                <X className="h-4 w-4 text-[#6a719a]" />
              </button>
            </div>
          )}
        </div>

        <OfferTermsAcceptance
          id="job-apply-terms-accepted"
          checked={termsAccepted}
          onChange={setTermsAccepted}
        />

        <div className="flex gap-3 pt-2 border-t border-[#e8ecf4]">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-full border border-[#d8e0ef] px-5 py-3 font-body font-semibold text-brand-dark hover:bg-[#f8f9fc] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || isUploadingCv || !cvUrl || !termsAccepted}
            className={`${offerBtnPrimarySm} flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Apply for job
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
