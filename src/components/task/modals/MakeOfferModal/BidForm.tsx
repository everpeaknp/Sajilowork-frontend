"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Calendar, FileText, Paperclip, Send, X, Loader2 } from 'lucide-react';
import { bidSchema, type BidFormData } from '@/validations/bid.schema';
import { bidService, extractBidList } from '@/services/bid.service';
import { tokenManager } from '@/lib/api/client';
import { Task } from '@/types';
import { formatNPR } from '@/lib/nepalLocale';
import { canSubmitOfferOnTask, getListingClosedOfferMessage } from '@/lib/taskUtils';
import { useAuthStore } from '@/store/auth.store';
import {
  offerBtnPrimarySm,
  offerCard,
  offerInfoBanner,
  offerInputClass,
  offerLabel,
  offerModalSubtitle,
  offerTextareaClass,
} from './makeOfferModalStyles';

interface BidFormProps {
  task: Task;
  listingKind?: 'task' | 'project';
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BidForm({ task, listingKind = 'task', onSuccess, onCancel }: BidFormProps) {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isCheckingExistingBid, setIsCheckingExistingBid] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = tokenManager.getAccessToken();
      if (!token) {
        toast.error('Please sign in to submit an offer');
        onCancel();
        return;
      }

      try {
        const response = await bidService.getMyBids('pending');
        if (response.success && response.data) {
          const pendingBids = extractBidList(response.data);
          const existingBid = pendingBids.find((bid) => String(bid.task) === String(task.id));

          if (existingBid) {
            toast.error(
              listingKind === 'project'
                ? 'You already have a pending proposal on this project. Withdraw it first if you want to submit a new one.'
                : 'You already have a pending offer on this task. Withdraw it first if you want to submit a new one.',
            );
            onCancel();
            return;
          }
        }
      } catch {
        // Backend will reject duplicate bids if this check fails
      } finally {
        setIsCheckingExistingBid(false);
      }
    };

    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      task: task.id,
      amount: task.budget_amount || 0,
      proposal: '',
      terms_accepted: false,
    },
  });

  const proposalLength = watch('proposal')?.length || 0;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (attachments.length + files.length > 5) {
      toast.error('Maximum 5 attachments allowed');
      return;
    }

    const validFiles = files.filter((file) => {
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const maxSize = 10 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File size exceeds 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploadingAttachment(true);
    try {
      const uploadPromises = validFiles.map((file) => bidService.uploadBidAttachment(file));
      const responses = await Promise.all(uploadPromises);
      const urls = responses.map((res) => res.data.url);
      setUploadedUrls((prev) => [...prev, ...urls]);
      setAttachments((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Failed to upload attachments';
      toast.error(message);
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: BidFormData) => {
    setIsSubmitting(true);
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        toast.error('Please sign in to submit an offer');
        onCancel();
        return;
      }

      if (!canSubmitOfferOnTask(task, user?.id)) {
        toast.error(getListingClosedOfferMessage(task.status, listingKind));
        onCancel();
        return;
      }

      const response = await bidService.createBid({
        task: String(data.task),
        amount: Number(data.amount),
        proposal: data.proposal.trim(),
        currency: 'NPR',
        attachments: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to submit offer');
      }

      toast.success(
        listingKind === 'project' ? 'Thank you for sending your proposal!' : 'Thank you for sending your offer!',
        {
        description:
          listingKind === 'project'
            ? "We'll notify you when the buyer accepts your proposal."
            : "We'll notify you when the task poster accepts your bid.",
        duration: 6000,
      });
      onSuccess();
    } catch (error: unknown) {
      let errorMessage = 'Failed to submit offer. Please try again.';

      const err = error as {
        status?: number;
        message?: string;
        errors?: Record<string, string[] | string> | string;
      };

      if (
        err?.status === 401 ||
        err?.message?.toLowerCase().includes('authentication') ||
        err?.message?.toLowerCase().includes('credentials')
      ) {
        toast.error(
          'You must be logged in to submit an offer. Please sign in and try again.',
        );
        return;
      }

      if (err?.message && typeof err.message === 'string' && err.message.trim() !== '') {
        errorMessage = err.message;
      } else if (err?.errors) {
        if (typeof err.errors === 'object') {
          if (err.errors.non_field_errors && Array.isArray(err.errors.non_field_errors)) {
            errorMessage = err.errors.non_field_errors.join('; ');
          } else {
            const fieldErrors: string[] = [];
            for (const [field, messages] of Object.entries(err.errors)) {
              if (Array.isArray(messages)) {
                const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
                fieldErrors.push(`${fieldName}${messages.join(', ')}`);
              } else if (typeof messages === 'string') {
                const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
                fieldErrors.push(`${fieldName}${messages}`);
              }
            }
            if (fieldErrors.length > 0) errorMessage = fieldErrors.join('; ');
          }
        } else if (typeof err.errors === 'string') {
          errorMessage = err.errors;
        }
      }

      if (
        errorMessage.toLowerCase().includes('already have') &&
        errorMessage.toLowerCase().includes('bid')
      ) {
        errorMessage =
          'You have already submitted an offer for this task. Please withdraw your existing offer first if you want to submit a new one.';
      } else if (errorMessage.toLowerCase().includes('not open')) {
        errorMessage = 'This task is no longer accepting offers.';
      } else if (errorMessage.toLowerCase().includes('cannot bid on your own')) {
        errorMessage = 'You cannot submit an offer on your own task.';
      } else if (err?.status === 401) {
        errorMessage = 'Please sign in to submit an offer.';
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      } else if (err?.status === 403) {
        errorMessage =
          'You do not have permission to submit offers. Please verify your account.';
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5"
    >
      {isCheckingExistingBid ? (
        <div className="flex flex-col items-center justify-center py-14">
          <Loader2 className="h-10 w-10 animate-spin text-brand-emerald mb-4" />
          <p className={offerModalSubtitle}>Checking your existing offers…</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit, (validationErrors) => {
            if (validationErrors.terms_accepted) {
              toast.error('Please accept the terms and conditions');
            } else if (validationErrors.proposal) {
              toast.error('Please provide a detailed proposal (minimum 50 characters)');
            } else if (validationErrors.amount) {
              toast.error('Please enter a valid offer amount');
            } else if (validationErrors.task) {
              toast.error('Invalid task selected');
            } else {
              toast.error('Please fix the form errors before submitting');
            }
          })}
          className="space-y-5"
        >
          <div className={`${offerCard} border-brand-emerald/10`}>
            <p className="font-formula font-bold text-brand-dark text-base leading-snug line-clamp-2">
              {task.title}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-body text-[#6a719a]">
              <span>
                Budget{' '}
                <span className="font-semibold text-brand-dark">
                  {formatNPR(task.budget_amount)}
                </span>
              </span>
              {task.due_date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Due {new Date(task.due_date).toLocaleDateString('en-NP')}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className={`${offerLabel} mb-2 block`}>
              Your offer amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="font-formula text-sm font-bold text-[#6a719a]">Rs.</span>
              </div>
              <input
                type="number"
                min={1}
                step={1}
                {...register('amount', { valueAsNumber: true })}
                onWheel={(e) => e.currentTarget.blur()}
                className={`${offerInputClass} pl-12 pr-14 ${
                  errors.amount ? 'border-red-300 focus:ring-red-200' : ''
                }`}
                placeholder="0"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <span className="font-body text-sm font-semibold text-[#6a719a]">NPR</span>
              </div>
            </div>
            {errors.amount && (
              <p className="mt-1.5 font-body text-sm text-red-600">{errors.amount.message}</p>
            )}
            <p className={`${offerModalSubtitle} text-xs mt-1.5`}>
              Task budget: {formatNPR(task.budget_amount)}
            </p>
          </div>

          <div>
            <label className={`${offerLabel} mb-2 block`}>
              Proposal <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('proposal')}
              rows={5}
              className={`${offerTextareaClass} ${
                errors.proposal ? 'border-red-300 focus:ring-red-200' : ''
              }`}
              placeholder="Describe how you'll complete this task, your experience, and why you're the best fit…"
            />
            <div className="mt-1.5 flex items-center justify-between">
              {errors.proposal ? (
                <p className="font-body text-sm text-red-600">{errors.proposal.message}</p>
              ) : (
                <p className={`${offerModalSubtitle} text-xs`}>Minimum 50 characters</p>
              )}
              <span
                className={`font-body text-xs font-medium ${
                  proposalLength < 50 ? 'text-red-500' : 'text-[#6a719a]'
                }`}
              >
                {proposalLength} / 5000
              </span>
            </div>
          </div>

          <div>
            <label className={`${offerLabel} mb-2 block`}>
              Attachments{' '}
              <span className="font-normal text-[#6a719a]">(optional, max 5)</span>
            </label>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d8e0ef] px-4 py-4 transition-colors hover:border-brand-emerald/40 hover:bg-brand-emerald/[0.03]">
              <Paperclip className="h-5 w-5 text-[#8a96b0]" />
              <span className="font-body text-sm font-medium text-[#5a6b8a]">
                {isUploadingAttachment ? 'Uploading…' : 'Choose files'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploadingAttachment || attachments.length >= 5}
              />
            </label>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-[#e8ecf4] bg-white p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="h-5 w-5 shrink-0 text-[#8a96b0]" />
                      <div className="min-w-0">
                        <p className="truncate font-body text-sm font-semibold text-brand-dark">
                          {file.name}
                        </p>
                        <p className="font-body text-xs text-[#6a719a]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="rounded-lg p-1.5 hover:bg-[#eef2fa] transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4 text-[#6a719a]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className={`${offerModalSubtitle} text-xs mt-2`}>
              JPG, PNG, GIF, PDF, DOC, DOCX — max 10MB each
            </p>
          </div>

          <div className={offerInfoBanner}>
            <input
              type="checkbox"
              {...register('terms_accepted')}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#d8e0ef] text-brand-emerald focus:ring-brand-emerald/30"
            />
            <div className="font-body text-sm text-brand-dark/85 leading-relaxed">
              <p className="font-formula font-bold tracking-tight mb-1">Terms & conditions</p>
              <p>
                By submitting this offer, I agree to complete the task if accepted and to the
                platform&apos;s{' '}
                <a href="/terms" className="font-semibold text-brand-emerald hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="font-semibold text-brand-emerald hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
          {errors.terms_accepted && (
            <p className="font-body text-sm text-red-600">{errors.terms_accepted.message}</p>
          )}

          <div className="flex gap-3 pt-2 border-t border-[#e8ecf4]">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 rounded-full border border-[#d8e0ef] px-5 py-3 font-body font-semibold text-brand-dark hover:bg-[#f8f9fc] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingAttachment}
              className={`${offerBtnPrimarySm} flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
              <Send className="h-5 w-5" />
              {listingKind === 'project' ? 'Submit proposal' : 'Submit offer'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
