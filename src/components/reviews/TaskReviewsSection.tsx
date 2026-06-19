'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ReviewsFeedbackPanel from './ReviewsFeedbackPanel';
import { mapApiReviewToProfileRow } from '@/lib/profileReviewDisplay';
import { reviewService } from '@/services/review.service';
import {
  getAssignedTaskerId,
  getTaskOwnerId,
  isCurrentUserAssignedTasker,
  isCurrentUserTaskOwner,
} from '@/lib/taskUtils';
import { useAuthStore } from '@/store/auth.store';
import type { Task } from '@/types';

interface TaskReviewsSectionProps {
  task: Task;
  onReviewSubmitted?: () => void;
  listingKind?: 'task' | 'project';
}

function resolveCounterpartyName(task: Task, userId: string | undefined): string {
  if (!userId) return 'the other party';
  if (isCurrentUserTaskOwner(task, userId)) {
    const tasker = task.assigned_tasker;
    if (tasker && typeof tasker === 'object') {
      return tasker.full_name?.trim() || tasker.username?.trim() || 'the assigned tasker';
    }
    return 'the assigned tasker';
  }
  return task.owner_name?.trim() || task.owner_business_name?.trim() || 'the task owner';
}

function resolveRevieweeUserId(task: Task, userId: string | undefined): string | null {
  if (!userId) return null;
  if (isCurrentUserTaskOwner(task, userId)) {
    return getAssignedTaskerId(task) ?? null;
  }
  if (isCurrentUserAssignedTasker(task, userId)) {
    return getTaskOwnerId(task) ?? null;
  }
  return null;
}

export default function TaskReviewsSection({
  task,
  onReviewSubmitted,
  listingKind = 'task',
}: TaskReviewsSectionProps) {
  const listingLabel = listingKind === 'project' ? 'project' : 'task';
  const { user } = useAuthStore();
  const taskKey = task.slug || task.id;
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [initialReviews, setInitialReviews] = useState<ReturnType<typeof mapApiReviewToProfileRow>[]>([]);

  const isCompleted = task.status === 'completed';
  const isParticipant =
    Boolean(user) &&
    (isCurrentUserTaskOwner(task, user?.id) || isCurrentUserAssignedTasker(task, user?.id));

  const canSubmitReview = isCompleted && isParticipant && !hasReviewed;
  const entityName = resolveCounterpartyName(task, user?.id);
  const revieweeUserId = resolveRevieweeUserId(task, user?.id);

  const reviewerRole = useMemo(() => {
    if (user && isCurrentUserTaskOwner(task, user.id)) return 'Client';
    if (user && isCurrentUserAssignedTasker(task, user.id)) return 'Freelancer';
    return 'Participant';
  }, [task, user]);

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
        setInitialReviews(
          reviewsRes.data.results.map((review) => mapApiReviewToProfileRow(review, reviewerRole)),
        );
      } else {
        setInitialReviews([]);
      }

      if (statusRes.success && statusRes.data) {
        setHasReviewed(Boolean(statusRes.data.has_reviewed));
      }
    } catch {
      setInitialReviews([]);
    } finally {
      setLoading(false);
    }
  }, [reviewerRole, task.id, taskKey, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const initialRating =
    initialReviews.length > 0
      ? initialReviews.reduce((sum, r) => sum + r.rating, 0) / initialReviews.length
      : 0;

  return (
    <ReviewsFeedbackPanel
      subtitle={`Ratings and feedback from the client and freelancer after this ${listingLabel} is completed.`}
      ratingLabel={`Your rating of ${entityName}`}
      initialReviews={initialReviews}
      initialRating={initialRating}
      preferApiReviews
      revieweeUserId={revieweeUserId}
      fixedTaskId={canSubmitReview ? String(task.id) : null}
      defaultReviewerRole={reviewerRole}
      entityName={entityName}
      showToast={(message) => toast.message(message)}
      loading={loading}
      showSubmitForm={canSubmitReview}
      submitHint={
        isCompleted
          ? `Share your verified experience after completing this ${listingLabel}.`
          : `Reviews open once this ${listingLabel} is marked completed.`
      }
      onReviewSubmitted={() => {
        setHasReviewed(true);
        void load();
        onReviewSubmitted?.();
      }}
    />
  );
}
