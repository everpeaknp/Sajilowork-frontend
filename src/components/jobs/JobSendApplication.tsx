'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, FileText, Loader2, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { bidService, getMyBidForTask } from '@/services/bid.service';
import { formatNPR } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import type { Bid } from '@/types';
import type { Job } from './jobListData';
import { getJobEditHref, isJobOwner } from './jobSlug';

interface JobSendApplicationProps {
  job: Job;
  onSubmitted?: () => void;
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

function attachmentLabel(url: string, index: number): string {
  try {
    const pathname = new URL(url, 'http://localhost').pathname;
    const name = pathname.split('/').pop();
    if (name) return decodeURIComponent(name);
  } catch {
    // ignore
  }
  return `CV ${index + 1}`;
}

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

export default function JobSendApplication({ job, onSubmitted }: JobSendApplicationProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [offerAmount, setOfferAmount] = useState('');
  const [proposal, setProposal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingBid, setExistingBid] = useState<Bid | null>(null);
  const [checkingBid, setCheckingBid] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  const isOwner = isJobOwner(job, user?.id);
  const editHref = getJobEditHref(job);

  const loadExistingBid = useCallback(async () => {
    if (!user || isOwner || !job.id) {
      setExistingBid(null);
      return;
    }

    setCheckingBid(true);
    try {
      const bid = await getMyBidForTask(job.id);
      setExistingBid(bid);
    } catch {
      setExistingBid(null);
    } finally {
      setCheckingBid(false);
    }
  }, [user, isOwner, job.id]);

  useEffect(() => {
    void loadExistingBid();
  }, [loadExistingBid]);

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

  const removeCv = () => {
    setCvFile(null);
    setCvUrl(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (existingBid) {
      return;
    }

    if (isOwner) {
      router.push(editHref);
      return;
    }

    if (!user) {
      toast.error('Please sign in to apply for this job.');
      router.push('/signin');
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
        toast.error(response.message || 'Failed to submit application.');
        return;
      }

      toast.success('Your application was submitted.');
      setOfferAmount('');
      setProposal('');
      setCvFile(null);
      setCvUrl(null);
      if (response.data) {
        setExistingBid(response.data);
      } else {
        await loadExistingBid();
      }
      onSubmitted?.();
    } catch {
      toast.error('Failed to submit application. Please try again.');
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
          Manage This Job
        </h2>
        <p className="text-sm font-normal text-neutral-600">
          You posted this job. Update the listing or review applications from your dashboard.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={editHref}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1D3E35] px-6 py-3 text-sm font-normal text-white transition-colors hover:bg-[#5bbb7b]"
          >
            Edit Job
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard/proposals"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-6 py-3 text-sm font-normal text-neutral-800 transition-colors hover:bg-neutral-50"
          >
            View received applications
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  if (checkingBid) {
    return (
      <section className="border-t border-neutral-200 pt-10">
        <h2 className="mb-6 text-xl font-normal tracking-tight text-black sm:text-2xl">
          Apply For This Job
        </h2>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your application status…
        </div>
      </section>
    );
  }

  if (existingBid) {
    return (
      <section className="border-t border-neutral-200 pt-10">
        <h2 className="mb-6 text-xl font-normal tracking-tight text-black sm:text-2xl">
          Apply For This Job
        </h2>
        <div className="rounded-lg border border-[#52C47F]/25 bg-[#ebf8f2] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#52C47F]" />
            <div className="min-w-0">
              <p className="text-base font-normal text-[#1D3E35]">Application submitted</p>
              <p className="mt-1.5 text-sm font-normal text-neutral-600">
                You applied with {formatNPR(Number(existingBid.amount) || 0)} on{' '}
                {formatSubmittedDate(existingBid.created_at)}. Status:{' '}
                <span className="capitalize text-neutral-800">{existingBid.status}</span>.
              </p>
              {existingBid.attachments && existingBid.attachments.length > 0 ? (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {existingBid.attachments.map((url, index) => (
                    <li key={url}>
                      <a
                        href={getMediaUrl(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-normal text-[#52C47F] hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {attachmentLabel(url, index)}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href="/dashboard/proposals"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-normal text-[#52C47F] hover:underline"
              >
                View in My Proposals
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
        Apply For This Job
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
          to apply for this job.
        </p>
      ) : null}

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
        <div>
          <label htmlFor="job-offer-amount" className="mb-2 block text-sm font-normal text-black">
            Expected salary or rate
          </label>
          <input
            id="job-offer-amount"
            type="text"
            inputMode="decimal"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            className={`${inputClassName} max-w-md`}
            placeholder={
              job.budgetMin > 0 ? `e.g. ${formatNPR(job.budgetMin)}` : 'Enter your expectation'
            }
          />
        </div>

        <div>
          <label htmlFor="job-application" className="mb-2 block text-sm font-normal text-black">
            Cover letter
          </label>
          <textarea
            id="job-application"
            rows={8}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Introduce yourself and explain why you are a strong fit for this role..."
            className={`${inputClassName} min-h-[180px] resize-y`}
          />
          <p className="mt-1.5 text-xs font-normal text-neutral-500">
            {proposal.trim().length} / {MIN_PROPOSAL_LENGTH} minimum characters
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-normal text-black">
            Upload CV <span className="text-red-500">*</span>
          </label>
          <p className="mb-3 text-xs font-normal text-neutral-500">
            PDF or Word document, max 10 MB.
          </p>

          {!cvFile ? (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-200 px-4 py-5 transition-colors hover:border-[#52C47F]/40 hover:bg-[#52C47F]/[0.03]">
              <Paperclip className="h-5 w-5 text-neutral-400" />
              <span className="text-sm font-normal text-neutral-600">
                {isUploadingCv ? 'Uploading CV…' : 'Choose CV file'}
              </span>
              <input
                id="job-cv-upload"
                type="file"
                accept={CV_ACCEPT}
                onChange={(event) => void handleCvSelect(event)}
                className="hidden"
                disabled={isUploadingCv || submitting}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-neutral-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-normal text-black">{cvFile.name}</p>
                  <p className="text-xs font-normal text-neutral-500">
                    {formatFileSize(cvFile.size)}
                    {isUploadingCv ? ' · Uploading…' : cvUrl ? ' · Ready' : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeCv}
                disabled={isUploadingCv || submitting}
                className="shrink-0 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-50"
                aria-label="Remove CV"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || isUploadingCv || !cvUrl}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#1D3E35] px-6 py-3.5 text-base font-normal text-white transition-colors hover:bg-[#5bbb7b] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Apply For Job
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>
    </section>
  );
}
