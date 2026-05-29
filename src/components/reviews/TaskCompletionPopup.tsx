'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
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

  const isCompleted = useMemo(() => (taskStatus || '').toLowerCase() === 'completed', [taskStatus]);

  useEffect(() => {
    if (!user || !isCompleted || !taskId) return;
    let cancelled = false;
    reviewService
      .getMyTaskReviewStatus(taskId)
      .then((res) => {
        if (cancelled || !res.success || !res.data) return;
        setHasReviewed(Boolean(res.data.has_reviewed));
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

  if (!user || !isCompleted) return null;

  if (checked && hasReviewed) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-green-900">Thanks for leaving a review.</p>
          <p className="text-sm text-green-800">Your feedback helps others choose confidently.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReviewModal
        isOpen={open}
        onClose={() => setOpen(false)}
        taskId={taskId}
        revieweeName={revieweeName}
      />
    </>
  );
}

