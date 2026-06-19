'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  applyHelpfulVoteToRow,
  mapApiReviewToProfileRow,
  type ProfileReviewRow,
} from '@/lib/profileReviewDisplay';
import { reviewService } from '@/services/review.service';
import { useAuthStore } from '@/store/auth.store';
import type { Review } from '@/types';

export type ReviewEligibleTask = {
  taskId: string;
  taskTitle: string;
};

type UseProfileReviewActionsOptions = {
  revieweeUserId?: string | null;
  fixedTaskId?: string | null;
  defaultReviewerRole?: string;
  showToast?: (message: string) => void;
  onReviewCreated?: (review: ProfileReviewRow) => void;
};

function mapEligibleTasks(
  rows: Array<{ task_id: string; task_title?: string }>,
): ReviewEligibleTask[] {
  return rows.map((row) => ({
    taskId: String(row.task_id),
    taskTitle: row.task_title?.trim() || 'Completed work',
  }));
}

export function useProfileReviewActions({
  revieweeUserId,
  fixedTaskId,
  defaultReviewerRole = 'Client',
  showToast = () => {},
  onReviewCreated,
}: UseProfileReviewActionsOptions) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [eligibleTasks, setEligibleTasks] = useState<ReviewEligibleTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setEligibleTasks([]);
      setSelectedTaskId('');
      return;
    }

    if (fixedTaskId) {
      setEligibleTasks([{ taskId: fixedTaskId, taskTitle: 'Completed work' }]);
      setSelectedTaskId(fixedTaskId);
      return;
    }

    if (!revieweeUserId) {
      setEligibleTasks([]);
      setSelectedTaskId('');
      return;
    }

    let cancelled = false;
    setLoadingEligible(true);

    void reviewService
      .getEligibleReviewTasks(revieweeUserId)
      .then(async (res) => {
        if (cancelled) return;

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const tasks = mapEligibleTasks(res.data);
          setEligibleTasks(tasks);
          setSelectedTaskId(tasks[0]?.taskId ?? '');
          return;
        }

        const fallback = await reviewService.getPendingInvitations();
        if (cancelled) return;

        const invitations = fallback.success && Array.isArray(fallback.data) ? fallback.data : [];
        const tasks = invitations
          .filter((inv) => {
            const revieweeId = (inv as { reviewee_id?: string }).reviewee_id;
            return revieweeId && revieweeId === revieweeUserId;
          })
          .map((inv) => ({
            taskId: String((inv as { task: string }).task),
            taskTitle:
              (inv as { task_title?: string }).task_title?.trim() || 'Completed work',
          }));

        setEligibleTasks(tasks);
        setSelectedTaskId(tasks[0]?.taskId ?? '');
      })
      .catch(() => {
        if (!cancelled) {
          setEligibleTasks([]);
          setSelectedTaskId('');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingEligible(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fixedTaskId, isAuthenticated, revieweeUserId, user]);

  const requireAuth = useCallback(() => {
    if (isAuthenticated) return true;
    showToast('Sign in to interact with reviews.');
    router.push(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
    return false;
  }, [isAuthenticated, router, showToast]);

  const voteReview = useCallback(
    async (
      reviewId: string,
      type: 'like' | 'dislike',
      updateRow: (updater: (rows: ProfileReviewRow[]) => ProfileReviewRow[]) => void,
      currentVote?: 'like' | 'dislike',
    ) => {
      if (!requireAuth()) return;

      const vote =
        currentVote === type ? 'clear' : type === 'like' ? 'helpful' : 'not_helpful';
      try {
        const res = await reviewService.voteHelpful(reviewId, vote);
        if (res.success && res.data) {
          updateRow((rows) =>
            rows.map((row) =>
              row.id === reviewId
                ? applyHelpfulVoteToRow(row, res.data as Review)
                : row,
            ),
          );
          return;
        }
        showToast(res.message || 'Could not save your vote.');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Could not save your vote.');
      }
    },
    [requireAuth, showToast],
  );

  const reportReview = useCallback(
    async (
      reviewId: string,
      updateRow: (updater: (rows: ProfileReviewRow[]) => ProfileReviewRow[]) => void,
    ) => {
      if (!requireAuth()) return;

      try {
        const res = await reviewService.reportReview(reviewId, 'other', 'Flagged from public profile page.');
        if (res.success) {
          updateRow((rows) =>
            rows.map((row) => (row.id === reviewId ? { ...row, isFlagged: true } : row)),
          );
          showToast('Feedback review flagged and sent to moderator queue.');
          return;
        }
        showToast(res.message || 'Could not report this review.');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Could not report this review.');
      }
    },
    [requireAuth, showToast],
  );

  const submitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!requireAuth()) return false;

      const taskId = fixedTaskId || selectedTaskId;
      if (!taskId) {
        showToast('You can only review after completing work together on the platform.');
        return false;
      }
      if (!comment.trim()) {
        showToast('Please add a comment to your review.');
        return false;
      }
      if (rating < 1) {
        showToast('Please select a star rating.');
        return false;
      }

      setSubmitting(true);
      try {
        const res = await reviewService.createReview({
          task_id: taskId,
          rating,
          comment: comment.trim(),
        });
        if (res.success && res.data) {
          const row = mapApiReviewToProfileRow(res.data, defaultReviewerRole);
          onReviewCreated?.(row);
          showToast('Thank you! Your verified review has been published.');
          setEligibleTasks((prev) => prev.filter((task) => task.taskId !== taskId));
          if (!fixedTaskId) {
            setSelectedTaskId((current) =>
              current === taskId
                ? (eligibleTasks.find((t) => t.taskId !== taskId)?.taskId ?? '')
                : current,
            );
          }
          return true;
        }
        showToast(res.message || 'Could not submit your review.');
        return false;
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Could not submit your review.');
      } finally {
        setSubmitting(false);
      }
      return false;
    },
    [
      defaultReviewerRole,
      eligibleTasks,
      fixedTaskId,
      onReviewCreated,
      requireAuth,
      selectedTaskId,
      showToast,
    ],
  );

  return {
    eligibleTasks,
    selectedTaskId,
    setSelectedTaskId,
    loadingEligible,
    submitting,
    isAuthenticated,
    voteReview,
    reportReview,
    submitReview,
  };
}
