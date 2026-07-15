"use client";

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DisputeModal from '@/components/disputes/DisputeModal';
import SingleTaskPage from '@/components/task/page/SingleTaskPage';
import ReportTaskModal from '@/components/task/modals/ReportTaskModal';
import SetUpAlertsModal from '@/components/task/modals/SetUpAlertsModal';
import { TASK_BROWSE_PATH } from '@/lib/taskBrowsePath';
import { POST_TASK_PATH, postTaskHref, postTaskSignInRedirect } from '@/lib/postTaskPath';
import { saveSimilarTaskPrefill, suggestTaskAlertKeyword } from '@/lib/similarTask';
import notificationService from '@/services/notification.service';
import { taskService } from '@/services/task.service';
import {
  formatTaskDisplayTitle,
  getAssignedTaskerId,
  getTaskOwnerId,
  isCurrentUserAssignedTasker,
  isCurrentUserTaskOwner,
} from '@/lib/taskUtils';
import { useAuthStore } from '@/store/auth.store';
import type { Task } from '@/types';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

function taskLookupKey(task: Task): string {
  return task.slug || task.id;
}

export default function TaskDetails({ task, onClose, onTaskUpdated }: TaskDetailsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [loadingDetailTask, setLoadingDetailTask] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const lookup = taskLookupKey(task);
  const viewTask = detailTask ?? task;
  const isOwner = isCurrentUserTaskOwner(task, user?.id);
  const isAssignedTasker = isCurrentUserAssignedTasker(task, user?.id);
  const canRaiseDispute =
    Boolean(user) &&
    (isOwner || isAssignedTasker) &&
    ['assigned', 'in_progress', 'completed'].includes(task.status);
  const disputeAgainstId = isOwner ? getAssignedTaskerId(task) : getTaskOwnerId(task);
  const displayTitle = formatTaskDisplayTitle(viewTask.title || task.title || 'Untitled Task');

  useEffect(() => {
    if (!lookup) return;

    let cancelled = false;
    setLoadingDetailTask(true);

    void taskService
      .getTaskBySlug(lookup)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) setDetailTask(res.data);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetailTask(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lookup]);

  const requireSignedIn = useCallback(
    (message: string, redirectPath: string): boolean => {
      if (user?.id) return true;
      toast.error(message);
      router.push(`/signin?redirect=${encodeURIComponent(redirectPath)}`);
      return false;
    },
    [router, user?.id],
  );

  const handlePostSimilar = useCallback(() => {
    if (!requireSignedIn('Please sign in to post a task', postTaskSignInRedirect({ from: 'similar' }))) {
      return;
    }
    saveSimilarTaskPrefill(viewTask);
    router.push(postTaskHref({ from: 'similar' }));
  }, [requireSignedIn, router, viewTask]);

  const handleSetUpAlerts = useCallback(() => {
    if (!requireSignedIn('Please sign in to set up alerts', TASK_BROWSE_PATH)) {
      return;
    }
    setShowAlertsModal(true);
  }, [requireSignedIn]);

  const handleRaiseDispute = useCallback(() => {
    if (!requireSignedIn('Please sign in to raise a dispute', TASK_BROWSE_PATH)) {
      return;
    }
    setShowDisputeModal(true);
  }, [requireSignedIn]);

  const handleReport = useCallback(() => {
    if (!requireSignedIn('Please sign in to report a task', TASK_BROWSE_PATH)) {
      return;
    }
    setShowReportModal(true);
  }, [requireSignedIn]);

  const handleReportSubmit = async (reason: string, description?: string) => {
    setReportSubmitting(true);
    try {
      const response = await taskService.reportTask(String(task.id), reason, description);
      if (response.success) {
        toast.success('Report submitted. Thank you for helping keep the community safe.');
        setShowReportModal(false);
      } else {
        toast.error(response.message || 'Failed to submit report');
      }
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleAlertKeywordSubmit = async (keyword: string) => {
    const response = await notificationService.addTaskAlertKeyword(keyword);
    if (response.success) {
      toast.success(`Alert saved for "${keyword}"`);
      setShowAlertsModal(false);
      return;
    }
    toast.error(response.message || 'Failed to save alert');
    throw new Error(response.message || 'Failed to save alert');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="absolute inset-0 z-[50] flex max-w-[100vw] flex-col overflow-x-hidden overflow-y-auto bg-white dark:bg-neutral-950"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-[60] rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 sm:right-4 sm:top-4 dark:hover:bg-neutral-800"
        title="Close"
        aria-label="Close task details"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {loadingDetailTask && !detailTask ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading task…
        </div>
      ) : (
        <SingleTaskPage
          task={viewTask}
          variant="overlay"
          onClose={onClose}
          onTaskUpdated={onTaskUpdated}
          onPostSimilar={handlePostSimilar}
          onSetUpAlerts={handleSetUpAlerts}
          onRaiseDispute={handleRaiseDispute}
          onReport={handleReport}
          canRaiseDispute={canRaiseDispute}
        />
      )}

      <ReportTaskModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={reportSubmitting}
      />

      <SetUpAlertsModal
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
        suggestedKeyword={suggestTaskAlertKeyword(viewTask)}
        onSubmit={handleAlertKeywordSubmit}
      />

      {disputeAgainstId ? (
        <DisputeModal
          open={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
          taskId={String(task.id)}
          againstUserId={disputeAgainstId}
          taskTitle={displayTitle}
        />
      ) : null}
    </motion.div>
  );
}
