'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { reviewService } from '@/services/review.service';
import { useAuth } from '@/hooks/useAuth';
import ReviewModal from './ReviewModal';

export type TaskCompletionPopupProps = {
  taskId: string;
  taskStatus?: string | null;
  revieweeName: string;
};

export default function TaskCompletionPopup({
  taskId,
  taskStatus,
  revieweeName,
}: TaskCompletionPopupProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const isCompleted = useMemo(
    () => (taskStatus || '').toLowerCase() === 'completed',
    [taskStatus]
  );

  useEffect(() => {
    if (!user || !isCompleted || !taskId) {
      setChecked(false);
      setHasReviewed(false);
      return;
    }
    let cancelled = false;
    setChecked(false);
    reviewService
      .getMyTaskReviewStatus(taskId)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setHasReviewed(Boolean(res.data.has_reviewed));
        }
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, isCompleted, taskId]);

  useEffect(() => {
    if (!checked) return;
    if (isCompleted && user && !hasReviewed) {
      setOpen(true);
    }
  }, [checked, isCompleted, user, hasReviewed]);

  if (!user || !isCompleted || !taskId) return null;

  if (!checked) {
    return (
      <div className="px-1 sm:px-2 animate-pulse space-y-2">
        <div className="h-3 w-20 bg-outline-variant/40 rounded" />
        <div className="h-3 w-full bg-outline-variant/30 rounded" />
      </div>
    );
  }

  if (hasReviewed) {
    return (
      <div className="flex items-start gap-3 px-1 sm:px-2">
        <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-green-900 text-sm md:text-base">
            Thanks for leaving a review.
          </p>
          <p className="text-xs md:text-sm text-green-800">
            Your feedback helps others choose confidently.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-1 sm:px-2 space-y-3">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] md:text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">
              Review
            </p>
            <p className="font-bold text-primary text-base md:text-lg">
              How was working with {revieweeName}?
            </p>
            <p className="text-xs md:text-sm text-on-surface-variant mt-1">
              Your feedback helps others choose confidently.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full py-2.5 md:py-3 rounded-full bg-primary text-white font-semibold text-sm md:text-base hover:bg-primary/90 transition-colors"
        >
          Leave a review
        </button>
      </div>

      <ReviewModal
        isOpen={open}
        onClose={() => setOpen(false)}
        taskId={taskId}
        revieweeName={revieweeName}
        onSuccess={() => {
          setHasReviewed(true);
          setOpen(false);
        }}
      />
    </>
  );
}
