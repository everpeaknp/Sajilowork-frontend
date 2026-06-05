'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { reviewService } from '@/services/review.service';
import type { Review } from '@/types';
import ReviewCard from './ReviewCard';
import { useAuthStore } from '@/store/auth.store';
import { isCurrentUserAssignedTasker, isCurrentUserTaskOwner } from '@/lib/taskUtils';
import type { Task } from '@/types';

interface TaskReviewsSectionProps {
  task: Task;
}

export default function TaskReviewsSection({ task }: TaskReviewsSectionProps) {
  const { user } = useAuthStore();
  const taskKey = task.slug || task.id;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canReview =
    task.status === 'completed' &&
    user &&
    (isCurrentUserTaskOwner(task, user.id) || isCurrentUserAssignedTasker(task, user.id));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, statusRes] = await Promise.all([
        reviewService.getTaskReviews(taskKey),
        user
          ? reviewService.getMyTaskReviewStatus(String(task.id))
          : Promise.resolve({ success: true, data: { has_reviewed: false } }),
      ]);
      if (reviewsRes.success && reviewsRes.data?.results) {
        setReviews(reviewsRes.data.results);
      } else {
        setReviews([]);
      }
      if (statusRes.success && statusRes.data) {
        setHasReviewed(Boolean(statusRes.data.has_reviewed));
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [task.id, taskKey, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating < 1) {
      toast.error('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await reviewService.createReview({
        task_id: String(task.id),
        rating,
        comment: comment.trim() || undefined,
      });
      if (res.success) {
        toast.success('Review submitted.');
        setHasReviewed(true);
        setComment('');
        void load();
      } else {
        toast.error(res.message || 'Could not submit review.');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#005fff]" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold text-[#0a1452]">Reviews</h3>

      {canReview && !hasReviewed && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
          <p className="mb-3 text-sm font-medium text-gray-600">Leave a review for this task</p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1"
                aria-label={`${n} stars`}
              >
                <Star
                  className={`h-6 w-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience (optional)"
            className="mb-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#005fff] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
