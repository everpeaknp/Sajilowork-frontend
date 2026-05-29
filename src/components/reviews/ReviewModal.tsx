'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { reviewService } from '@/services/review.service';
import StarRating from './StarRating';

export type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  revieweeName: string;
  onSuccess?: () => void;
};

export default function ReviewModal({
  isOpen,
  onClose,
  taskId,
  revieweeName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => rating >= 1 && rating <= 5, [rating]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!canSubmit) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      const res = await reviewService.createReview({
        task_id: taskId,
        rating,
        comment: comment.trim() || undefined,
      });
      if (!res.success) {
        toast.error(res.message || 'Failed to submit review');
        return;
      }
      toast.success('Review submitted');
      onSuccess?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl bg-white border border-outline-variant shadow-xl overflow-hidden">
          <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-gray-400 uppercase">
                Review
              </p>
              <h2 className="text-xl font-extrabold text-[#000d45] mt-1">
                How was working with {revieweeName}?
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your feedback helps keep the marketplace trustworthy.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-50 text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-bold text-[#000d45]">Rating</p>
              <StarRating value={rating} onChange={setRating} disabled={submitting} size="lg" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-[#000d45]">Comment (optional)</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                rows={4}
                placeholder="Share details (optional)…"
                className="w-full rounded-2xl border border-outline-variant bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none p-4 font-medium resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 rounded-2xl font-bold border border-outline-variant hover:bg-gray-50 disabled:opacity-50"
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!canSubmit || submitting}
                className="px-6 py-2.5 rounded-2xl font-bold bg-[#1161fe] text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

