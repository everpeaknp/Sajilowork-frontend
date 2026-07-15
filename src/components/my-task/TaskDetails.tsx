'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DisputeModal from '@/components/disputes/DisputeModal';
import TaskCompletionPopup from '@/components/reviews/TaskCompletionPopup';
import SingleTaskPage, { type SidebarPrimaryAction } from '@/components/task/page/SingleTaskPage';
import ReportTaskModal from '@/components/task/modals/ReportTaskModal';
import SetUpAlertsModal from '@/components/task/modals/SetUpAlertsModal';
import type { Task as MyTaskView } from '@/components/my-task/types';
import type { MyTaskManagementActions } from '@/components/my-task/MyTaskManagementSection';
import { getDashboardEditHref } from '@/app/dashboard/dashboardTabs';
import { apiClient } from '@/lib/api/client';
import { TASK_BROWSE_PATH } from '@/lib/taskBrowsePath';
import { postTaskHref, postTaskSignInRedirect } from '@/lib/postTaskPath';
import { saveSimilarTaskPrefill, suggestTaskAlertKeyword } from '@/lib/similarTask';
import { confirmCancelTask, confirmDeleteTask } from '@/lib/confirmToast';
import notificationService from '@/services/notification.service';
import { taskService } from '@/services/task.service';
import {
  canCancelMyTask,
  canConfirmWorkComplete,
  canDeleteMyPostedTask,
  canEditMyPostedTask,
  canSubmitOfferOnTask,
  canTaskerStartWork,
  formatTaskDisplayTitle,
  getAssignedTaskerId,
  getTaskOwnerId,
  isCurrentUserAssignedTasker,
  isCurrentUserTaskOwner,
  resolveMyTaskRoles,
} from '@/lib/taskUtils';
import { useAuthStore } from '@/store/auth.store';
import type { Task as ApiTask } from '@/types';

interface TaskDetailsProps {
  task: MyTaskView;
  onClose: () => void;
  apiTask?: ApiTask;
  variant?: 'overlay' | 'page';
  onTaskDeleted?: () => void;
  onTaskUpdated?: () => void;
}

function taskLookupKey(task: Pick<MyTaskView, 'slug' | 'id'>): string {
  return task.slug || task.id;
}

export default function TaskDetails({
  task,
  onClose,
  apiTask,
  variant = 'overlay',
  onTaskDeleted,
  onTaskUpdated,
}: TaskDetailsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const lookup = taskLookupKey(task);

  const [detailTask, setDetailTask] = useState<ApiTask | null>(apiTask ?? null);
  const [loadingDetailTask, setLoadingDetailTask] = useState(!apiTask);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isStartingWork, setIsStartingWork] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [shouldPromptReview, setShouldPromptReview] = useState(false);

  const viewTask = detailTask ?? apiTask;
  const isOwner = viewTask ? isCurrentUserTaskOwner(viewTask, user?.id) : false;
  const isAssignedTasker = viewTask ? isCurrentUserAssignedTasker(viewTask, user?.id) : false;
  const taskRoles = useMemo(
    () => (viewTask ? resolveMyTaskRoles(viewTask, user?.id) : { isOwner: false, isAssignee: false }),
    [viewTask, user?.id],
  );

  const canRaiseDispute =
    Boolean(user) &&
    Boolean(viewTask) &&
    (isOwner || isAssignedTasker) &&
    ['assigned', 'in_progress', 'completed'].includes(viewTask?.status ?? '');

  const disputeAgainstId = viewTask
    ? isOwner
      ? getAssignedTaskerId(viewTask)
      : getTaskOwnerId(viewTask)
    : null;

  const displayTitle = formatTaskDisplayTitle(
    viewTask?.title || task.title || 'Untitled Task',
  );

  const canStartTask = viewTask ? canTaskerStartWork(viewTask, user?.id) : false;
  const canConfirmComplete = viewTask ? canConfirmWorkComplete(viewTask, user?.id) : false;
  const canMakeOffer = viewTask ? canSubmitOfferOnTask(viewTask, user?.id) : false;

  const reviewTaskId = viewTask?.id ? String(viewTask.id) : '';
  const revieweeName = useMemo(() => {
    if (!viewTask) return 'User';
    const owner =
      viewTask.owner && typeof viewTask.owner === 'object' ? viewTask.owner : null;
    const posterName =
      owner
        ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || owner.full_name
        : task.user.name;
    const assignee =
      viewTask.assigned_tasker && typeof viewTask.assigned_tasker === 'object'
        ? viewTask.assigned_tasker
        : null;
    const taskerName =
      assignee
        ? `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim() || assignee.full_name
        : 'Tasker';
    if (taskRoles.isOwner) return taskerName || 'Tasker';
    if (taskRoles.isAssignee) return posterName || 'Poster';
    return 'User';
  }, [viewTask, task.user.name, taskRoles.isOwner, taskRoles.isAssignee]);

  useEffect(() => {
    setShouldPromptReview(false);
  }, [lookup]);

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

  const refreshTask = useCallback(async () => {
    const res = await taskService.getTaskBySlug(lookup);
    if (res.success && res.data) setDetailTask(res.data);
    onTaskUpdated?.();
  }, [lookup, onTaskUpdated]);

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
    if (!viewTask) return;
    if (!requireSignedIn('Please sign in to post a task', postTaskSignInRedirect({ from: 'similar' })))
      return;
    saveSimilarTaskPrefill(viewTask);
    router.push(postTaskHref({ from: 'similar' }));
  }, [requireSignedIn, router, viewTask]);

  const handleSetUpAlerts = useCallback(() => {
    if (!requireSignedIn('Please sign in to set up alerts', '/my-tasks')) return;
    setShowAlertsModal(true);
  }, [requireSignedIn]);

  const handleRaiseDispute = useCallback(() => {
    if (!requireSignedIn('Please sign in to raise a dispute', '/my-tasks')) return;
    setShowDisputeModal(true);
  }, [requireSignedIn]);

  const handleReport = useCallback(() => {
    if (!requireSignedIn('Please sign in to report a task', '/my-tasks')) return;
    setShowReportModal(true);
  }, [requireSignedIn]);

  const handleReportSubmit = async (reason: string, description?: string) => {
    if (!viewTask) return;
    setReportSubmitting(true);
    try {
      const response = await taskService.reportTask(String(viewTask.id), reason, description);
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

  const handleEdit = useCallback(() => {
    router.push(getDashboardEditHref('task', lookup));
  }, [router, lookup]);

  const handleDelete = useCallback(async () => {
    if (!viewTask || !canDeleteMyPostedTask(viewTask, user?.id)) {
      toast.error('This task cannot be deleted because it has been assigned to a tasker.');
      return;
    }
    if (!(await confirmDeleteTask())) return;

    setIsDeleting(true);
    try {
      await taskService.deleteTask(lookup);
      toast.success('Task deleted successfully');
      onClose();
      onTaskDeleted?.();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; error?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to delete task. Please try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  }, [viewTask, user?.id, lookup, onClose, onTaskDeleted]);

  const handleCancel = useCallback(async () => {
    if (!viewTask || !canCancelMyTask(viewTask, user?.id)) return;
    if (viewTask.status === 'completed' || viewTask.status === 'cancelled') {
      toast.error('This task cannot be cancelled.');
      return;
    }
    if (!(await confirmCancelTask())) return;

    setIsCancelling(true);
    try {
      const response = await taskService.cancelTask(lookup);
      if (response.success) {
        toast.success('Task cancelled');
        await refreshTask();
      } else {
        toast.error(response.message || 'Failed to cancel task');
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; error?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to cancel task. Please try again.',
      );
    } finally {
      setIsCancelling(false);
    }
  }, [viewTask, user?.id, lookup, refreshTask]);

  const applyStatusUpdate = async (newStatus: 'in_progress') => {
    const res = await apiClient.patch<{
      task?: ApiTask;
      message?: string;
      error?: string;
    }>(`/tasks/${lookup}/update_status/`, { status: newStatus });
    if (res.data?.error) throw new Error(res.data.error);
    if (res.data?.task) {
      setDetailTask(res.data.task);
    } else {
      const detailRes = await taskService.getTaskBySlug(lookup);
      if (detailRes.success && detailRes.data) setDetailTask(detailRes.data);
    }
    await refreshTask();
    return res.data;
  };

  const confirmWorkComplete = async () => {
    const res = await apiClient.post<{
      task?: ApiTask;
      message?: string;
      both_confirmed?: boolean;
      payment_released?: boolean;
      net_amount?: string;
      currency?: string;
      error?: string;
    }>(`/tasks/${lookup}/confirm_work_complete/`);
    if (res.data?.error) throw new Error(res.data.error);
    if (res.data?.task) {
      setDetailTask(res.data.task);
    } else {
      const detailRes = await taskService.getTaskBySlug(lookup);
      if (detailRes.success && detailRes.data) setDetailTask(detailRes.data);
    }
    await refreshTask();
    return res.data;
  };

  const handleStartTask = useCallback(async () => {
    setIsStartingWork(true);
    try {
      await applyStatusUpdate('in_progress');
      toast.success('Task marked as in progress');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start the task');
    } finally {
      setIsStartingWork(false);
    }
  }, [lookup, refreshTask]);

  const handleConfirmWorkComplete = useCallback(async () => {
    setIsCompleting(true);
    try {
      const data = await confirmWorkComplete();
      const completedStatus = (data?.task?.status ?? viewTask?.status ?? task.status ?? '')
        .toString()
        .toLowerCase();
      if (completedStatus === 'completed') {
        setShouldPromptReview(true);
      }
      toast.success(
        data?.message ||
          (data?.payment_released && data.net_amount
            ? `Payment released: ${data.net_amount} ${data.currency ?? 'NPR'} to tasker wallet.`
            : 'Completion recorded. Waiting for the other party to confirm.'),
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm work complete');
    } finally {
      setIsCompleting(false);
    }
  }, [viewTask?.status, task.status, lookup, refreshTask]);

  const sidebarPrimaryAction = useMemo((): SidebarPrimaryAction | null | undefined => {
    if (canStartTask) {
      return {
        label: isStartingWork ? 'Starting…' : 'Start work',
        onClick: () => void handleStartTask(),
        disabled: isStartingWork || isCompleting,
        loading: isStartingWork,
      };
    }
    if (canConfirmComplete) {
      return {
        label: isCompleting
          ? 'Confirming…'
          : taskRoles.isOwner
            ? 'Confirm work complete'
            : 'Mark work complete',
        onClick: () => void handleConfirmWorkComplete(),
        disabled: isStartingWork || isCompleting,
        loading: isCompleting,
      };
    }
    if (viewTask && canEditMyPostedTask(viewTask, user?.id) && viewTask.status === 'open') {
      return {
        label: 'Edit task',
        onClick: handleEdit,
        disabled: isDeleting || isCancelling,
      };
    }
    if (
      taskRoles.isOwner &&
      viewTask &&
      (viewTask.status === 'assigned' || viewTask.status === 'funded')
    ) {
      return null;
    }
    if (!canMakeOffer) {
    return null;
    }
    return undefined;
  }, [
    canStartTask,
    canConfirmComplete,
    canMakeOffer,
    handleStartTask,
    handleConfirmWorkComplete,
    handleEdit,
    isStartingWork,
    isCompleting,
    isDeleting,
    isCancelling,
    taskRoles.isOwner,
    user?.id,
    viewTask,
  ]);

  const hideMakeOffer = !canMakeOffer;

  const managementActions = useMemo((): MyTaskManagementActions | undefined => {
    if (!viewTask) return undefined;
    const canEdit = canEditMyPostedTask(viewTask, user?.id);
    const canDelete = canDeleteMyPostedTask(viewTask, user?.id);
    const canCancel = canCancelMyTask(viewTask, user?.id);
    if (!canEdit && !canDelete && !canCancel) return undefined;
    return {
      canEdit,
      canDelete,
      canCancel,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onCancel: handleCancel,
      deleting: isDeleting,
      cancelling: isCancelling,
    };
  }, [viewTask, user?.id, handleEdit, handleDelete, handleCancel, isDeleting, isCancelling]);

  const shellClassName =
    variant === 'page'
      ? 'relative flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-white dark:bg-neutral-950'
      : 'absolute inset-0 z-[50] flex max-w-[100vw] flex-col overflow-x-hidden overflow-y-auto bg-white dark:bg-neutral-950';

  if (!viewTask && loadingDetailTask) {
    return (
            <motion.div
        initial={variant === 'overlay' ? { opacity: 0, y: 16 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        exit={variant === 'overlay' ? { opacity: 0, y: 16 } : undefined}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className={shellClassName}
      >
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading task…
              </div>
            </motion.div>
    );
  }

  if (!viewTask) return null;

  return (
    <motion.div
      initial={variant === 'overlay' ? { opacity: 0, y: 16 } : undefined}
      animate={{ opacity: 1, y: 0 }}
      exit={variant === 'overlay' ? { opacity: 0, y: 16 } : undefined}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className={shellClassName}
    >
      {variant === 'overlay' ? (
      <button
          type="button"
        onClick={onClose}
          className="absolute right-3 top-3 z-[60] rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 sm:right-4 sm:top-4"
        title="Close"
        aria-label="Close task details"
      >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      ) : null}

      {loadingDetailTask && !detailTask ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading task…
              </div>
      ) : (
        <SingleTaskPage
          task={viewTask}
          variant={variant}
          onClose={onClose}
          onTaskUpdated={refreshTask}
          onPostSimilar={handlePostSimilar}
          onSetUpAlerts={handleSetUpAlerts}
          onRaiseDispute={handleRaiseDispute}
          onReport={handleReport}
          canRaiseDispute={canRaiseDispute}
          sidebarPrimaryAction={sidebarPrimaryAction}
          hideMakeOffer={hideMakeOffer}
          enableWalletGate={Boolean(managementActions?.canEdit)}
          managementActions={managementActions}
          backLink={{ href: '/my-tasks', label: 'Back to my tasks' }}
          footerHint="Manage your posted and assigned tasks from the map."
        />
      )}

      {reviewTaskId ? (
        <TaskCompletionPopup
          taskId={reviewTaskId}
          taskStatus={String(viewTask.status || '')}
          revieweeName={revieweeName}
          promptReviewNow={shouldPromptReview}
          onPromptConsumed={() => setShouldPromptReview(false)}
        />
      ) : null}

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
          taskId={String(viewTask.id)}
          againstUserId={disputeAgainstId}
          taskTitle={displayTitle}
        />
      ) : null}
    </motion.div>
  );
}
