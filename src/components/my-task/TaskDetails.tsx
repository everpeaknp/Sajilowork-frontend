"use client";

import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  X,
  Edit,
  Trash2,
  Star,
  Shield,
  Loader2,
  Send,
  AlertCircle,
  ExternalLink,
  Copy,
  Ban,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { Task } from '@/components/my-task/types';
import UserAvatar from '@/components/common/UserAvatar';
import { apiClient } from '@/lib/api/client';
import { getMediaUrl, isTaskImageAttachment } from '@/lib/utils';
import { formatNPR } from '@/lib/nepalLocale';
import { taskService } from '@/services/task.service';
import { bidService, extractBidList } from '@/services/bid.service';
import { paymentService } from '@/services/payment.service';
import type { Bid, Task as ApiTask, TaskQuestion } from '@/types';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MakeOfferModal from '@/components/task/modals/MakeOfferModal';
import {
  canSubmitOfferOnTask,
  getTaskPosterId,
  getTaskPosterProfileSlug,
  getTaskPosterUser,
} from '@/lib/taskUtils';
import { confirmCancelTask, confirmDeleteTask } from '@/lib/confirmToast';
import { getTaskTimeSlotFromRequirements } from '@/lib/timeSlot';
import TaskTimeSlotText from '@/components/common/TaskTimeSlotText';
import TaskStatusTimeline from '@/components/common/TaskStatusTimeline';
import TaskPosterFollow from '@/components/users/TaskPosterFollow';
import TaskCompletionPopup from '@/components/reviews/TaskCompletionPopup';
import {
  canConfirmWorkComplete,
  canTaskerStartWork,
  getCompletionStatusMessage,
  hasOwnerMarkedComplete,
  hasTaskerMarkedComplete,
  resolveMyTaskRoles,
} from '@/lib/taskUtils';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  /** Full API task — enables browse actions (make an offer) on /task/[slug]. */
  apiTask?: ApiTask;
  /** overlay = map panel; page = full route under navbar */
  variant?: 'overlay' | 'page';
  onTaskDeleted?: () => void;
  onTaskUpdated?: () => void;
}

const USER_TEXT_CLASS =
  'whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full';

function taskLookupKey(task: Task): string {
  return task.slug || task.id;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

function getBidTaskerId(bid: Bid): string | null {
  const t = bid.tasker;
  if (!t) return null;
  if (typeof t === 'string') return t;
  return t.id || null;
}

function getBidTaskerName(bid: Bid): string {
  const t = bid.tasker;
  if (!t || typeof t !== 'object') return 'Tasker';
  return (
    t.full_name ||
    `${t.first_name || ''} ${t.last_name || ''}`.trim() ||
    'Tasker'
  );
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
  const { user } = useAuth();
  const lookup = taskLookupKey(task);
  const isPageVariant = variant === 'page';
  const [detailTask, setDetailTask] = useState<ApiTask | null>(apiTask ?? null);
  const [loadingDetailTask, setLoadingDetailTask] = useState(false);

  const [activeTab, setActiveTab] = useState<'offers' | 'questions'>('offers');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [questions, setQuestions] = useState<TaskQuestion[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [isStartingWork, setIsStartingWork] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submittingAnswerId, setSubmittingAnswerId] = useState<string | null>(null);
  const [isSidebarMoreOptionsOpen, setIsSidebarMoreOptionsOpen] = useState(false);
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [walletAvailableBalance, setWalletAvailableBalance] = useState<number | null>(null);
  const [loadingWalletBalance, setLoadingWalletBalance] = useState(false);

  const sidebarMoreOptionsRef = useRef<HTMLDivElement>(null);
  const mobileMoreOptionsRef = useRef<HTMLDivElement>(null);
  const canMakeOffer = Boolean(
    detailTask && canSubmitOfferOnTask(detailTask, user?.id)
  );

  const statusSource = detailTask ?? apiTask;
  const currentStatus = statusSource?.status ?? task.status;

  const reviewTaskId = useMemo(() => {
    const fromApi = statusSource?.id ?? apiTask?.id;
    return fromApi ? String(fromApi) : '';
  }, [statusSource?.id, apiTask?.id]);

  const taskRoles = useMemo(
    () => resolveMyTaskRoles(statusSource ?? (task as unknown as ApiTask), user?.id),
    [statusSource, task, user?.id]
  );

  const revieweeName = useMemo(() => {
    const src: any = statusSource;
    const owner = src?.owner && typeof src.owner === 'object' ? src.owner : null;
    const posterName =
      owner
        ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || owner.full_name
        : task.user.name;
    const tasker = src?.assigned_tasker && typeof src.assigned_tasker === 'object' ? src.assigned_tasker : null;
    const taskerName =
      tasker
        ? `${tasker.first_name || ''} ${tasker.last_name || ''}`.trim() || tasker.full_name
        : 'Tasker';

    if (taskRoles.isOwner) return taskerName || 'Tasker';
    if (taskRoles.isAssignee) return posterName || 'Poster';
    return 'User';
  }, [statusSource, task.user.name, taskRoles.isOwner, taskRoles.isAssignee]);

  const canStartTask = useMemo(
    () => (statusSource ? canTaskerStartWork(statusSource, user?.id) : false),
    [statusSource, user?.id]
  );

  const canConfirmComplete = useMemo(
    () => (statusSource ? canConfirmWorkComplete(statusSource, user?.id) : false),
    [statusSource, user?.id]
  );

  const completionStatusMessage = useMemo(
    () =>
      statusSource ? getCompletionStatusMessage(statusSource, user?.id) : null,
    [statusSource, user?.id]
  );

  const taskerConfirmed = Boolean(
    statusSource?.tasker_marked_complete_at ?? hasTaskerMarkedComplete(statusSource as ApiTask)
  );
  const ownerConfirmed = Boolean(
    statusSource?.owner_marked_complete_at ?? hasOwnerMarkedComplete(statusSource as ApiTask)
  );

  const viewsCount = useMemo(() => {
    const src = detailTask ?? apiTask;
    if (!src) return 0;
    const raw = src.views_count ?? src.view_count;
    return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
  }, [detailTask, apiTask]);

  const acceptedBid = useMemo(() => bids.find((b) => b.status === 'accepted'), [bids]);
  const hasAcceptedOffer = useMemo(
    () =>
      Boolean(acceptedBid) ||
      task.status === 'assigned' ||
      task.status === 'in_progress' ||
      task.isAssigned,
    [acceptedBid, task.status, task.isAssigned]
  );

  const loadBids = useCallback(async () => {
    if (!task.id) return;
    setLoadingBids(true);
    try {
      const res = await bidService.getTaskBids(task.id);
      if (res.success && res.data) {
        setBids(extractBidList(res.data));
      }
    } catch {
      setBids([]);
    } finally {
      setLoadingBids(false);
    }
  }, [task.id]);

  const loadQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const response = await taskService.getTaskQuestions(lookup);
      if (response.success && response.data) {
        setQuestions(response.data);
      }
    } catch {
      // non-blocking
    } finally {
      setLoadingQuestions(false);
    }
  }, [lookup]);

  useEffect(() => {
    void Promise.all([loadBids(), loadQuestions()]);
  }, [loadBids, loadQuestions]);

  useEffect(() => {
    if (apiTask) {
      setDetailTask(apiTask);
      return;
    }
    if (!lookup) return;
    let cancelled = false;
    setLoadingDetailTask(true);
    taskService
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
  }, [apiTask, lookup]);

  const timeSlot = useMemo(
    () =>
      getTaskTimeSlotFromRequirements(
        (detailTask as ApiTask & { requirements?: Array<{ type?: string; label?: string; value?: string }> })
          ?.requirements
      ),
    [detailTask]
  );

  const imageAttachments = useMemo(() => {
    const attachments = (detailTask?.attachments ?? []).filter(
      (a: any) => a && isTaskImageAttachment(a.file_type)
    );
    return attachments;
  }, [detailTask]);

  const loadWalletBalance = useCallback(async () => {
    if (!task.canEdit) return;
    setLoadingWalletBalance(true);
    try {
      const res = await paymentService.getWalletBalance();
      if (res.success && res.data) {
        setWalletAvailableBalance(Number(res.data.available_balance));
      } else {
        setWalletAvailableBalance(null);
      }
    } catch {
      setWalletAvailableBalance(null);
    } finally {
      setLoadingWalletBalance(false);
    }
  }, [task.canEdit]);

  useEffect(() => {
    void loadWalletBalance();
  }, [loadWalletBalance]);

  const canAcceptOfferWithWallet = useCallback(
    (bid: Bid) => {
      if (walletAvailableBalance === null) return true;
      return walletAvailableBalance >= Number(bid.amount);
    },
    [walletAvailableBalance]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideDesktop = sidebarMoreOptionsRef.current?.contains(target);
      const insideMobile = mobileMoreOptionsRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsSidebarMoreOptionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadBids(), loadQuestions()]);
    onTaskUpdated?.();
  }, [loadBids, loadQuestions, onTaskUpdated]);

  const handleAcceptBid = async (bid: Bid) => {
    if (bid.status !== 'pending') return;
    if (hasAcceptedOffer) {
      toast.error('This task already has an accepted offer. You can only accept one tasker.');
      return;
    }
    setAcceptingBidId(bid.id);
    try {
      const response = await bidService.acceptBid(bid.id);
      if (response.success) {
        toast.success('Offer accepted');
        await Promise.all([refreshAll(), loadWalletBalance()]);
      } else {
        toast.error(response.message || 'Failed to accept offer');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
          ? (err as { message: string }).message
          : 'An error occurred while accepting the offer';
      toast.error(message);
    } finally {
      setAcceptingBidId(null);
    }
  };

  const applyStatusUpdate = async (newStatus: 'in_progress') => {
    const res = await apiClient.patch<{
      task?: ApiTask;
      message?: string;
      error?: string;
    }>(`/tasks/${lookup}/update_status/`, { status: newStatus });
    if (res.data?.error) {
      throw new Error(res.data.error);
    }
    if (res.data?.task) {
      setDetailTask(res.data.task);
    } else {
      const detailRes = await taskService.getTaskBySlug(lookup);
      if (detailRes.success && detailRes.data) setDetailTask(detailRes.data);
    }
    await refreshAll();
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
    if (res.data?.error) {
      throw new Error(res.data.error);
    }
    if (res.data?.task) {
      setDetailTask(res.data.task);
    } else {
      const detailRes = await taskService.getTaskBySlug(lookup);
      if (detailRes.success && detailRes.data) setDetailTask(detailRes.data);
    }
    await refreshAll();
    return res.data;
  };

  const handleStartTask = async () => {
    setIsStartingWork(true);
    try {
      await applyStatusUpdate('in_progress');
      toast.success('Task marked as in progress');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start the task');
    } finally {
      setIsStartingWork(false);
    }
  };

  const handleConfirmWorkComplete = async () => {
    setIsCompleting(true);
    try {
      const data = await confirmWorkComplete();
      toast.success(
        data?.message ||
          (data?.payment_released && data.net_amount
            ? `Payment released: ${data.net_amount} ${data.currency ?? 'NPR'} to tasker wallet.`
            : 'Completion recorded. Waiting for the other party to confirm.')
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to confirm work complete'
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAnswerQuestion = async (questionId: string) => {
    const trimmed = (answerDrafts[questionId] || '').trim();
    if (!trimmed) return;

    setSubmittingAnswerId(questionId);
    try {
      const response = await taskService.answerQuestion(lookup, questionId, trimmed);
      if (response.success && response.data) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, ...response.data } : q))
        );
        setAnswerDrafts((prev) => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
        toast.success('Reply posted');
      } else {
        toast.error(response.message || 'Failed to post reply');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Failed to post reply';
      toast.error(message);
    } finally {
      setSubmittingAnswerId(null);
    }
  };

  const handleEdit = () => {
    router.push(`/edit-task/${lookup}`);
  };

  const handleDelete = async () => {
    if (task.canDelete === false) {
      toast.error('This task cannot be deleted because it has been assigned to a tasker.');
      return;
    }
    if (!(await confirmDeleteTask())) {
      return;
    }

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
          'Failed to delete task. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = async () => {
    if (task.canCancel === false) return;
    if (task.status === 'completed' || task.status === 'cancelled') {
      toast.error('This task cannot be cancelled.');
      return;
    }
    if (!(await confirmCancelTask())) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await taskService.cancelTask(lookup);
      if (response.success) {
        toast.success('Task cancelled');
        setIsSidebarMoreOptionsOpen(false);
        await refreshAll();
        onTaskUpdated?.();
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
          'Failed to cancel task. Please try again.'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const posterSource = statusSource ?? apiTask ?? null;

  const posterId = useMemo(() => {
    if (task.posterId) return task.posterId;
    if (posterSource) return getTaskPosterId(posterSource);
    return null;
  }, [task.posterId, posterSource]);

  const posterSlug = useMemo(() => {
    if (task.posterUsername) return task.posterUsername;
    if (posterSource) return getTaskPosterProfileSlug(posterSource);
    return null;
  }, [task.posterUsername, posterSource]);

  const posterDisplayName = useMemo(() => {
    const nested = posterSource ? getTaskPosterUser(posterSource) : null;
    if (nested) {
      const full =
        `${nested.first_name || ''} ${nested.last_name || ''}`.trim() ||
        nested.full_name;
      if (full) return full;
    }
    return task.user.name;
  }, [posterSource, task.user.name]);

  const posterAvatar = useMemo(() => {
    const nested = posterSource ? getTaskPosterUser(posterSource) : null;
    return getMediaUrl(nested?.profile_image || task.user.avatar);
  }, [posterSource, task.user.avatar]);

  const mapLink = (() => {
    const lat = task.coordinates[0];
    const lng = task.coordinates[1];
    const hasCoords =
      Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
    const query = hasCoords ? `${lat},${lng}` : task.location?.trim();
    if (!query) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  })();

  const moreOptionsSection = (optionsRef: RefObject<HTMLDivElement | null>) => (
    <div className="flex flex-col gap-3 md:gap-4">
      <div ref={optionsRef}>
        <div
          onClick={() => setIsSidebarMoreOptionsOpen(!isSidebarMoreOptionsOpen)}
          className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-surface-dim rounded-2xl cursor-pointer hover:bg-surface-variant/20 transition-all group border border-transparent hover:border-outline-variant"
        >
          <span className="font-bold text-sm md:text-base text-[#000d45]">More Options</span>
          <ChevronLeft
            className={`w-4 h-4 md:w-5 md:h-5 transition-transform shrink-0 ${isSidebarMoreOptionsOpen ? '-rotate-90' : 'rotate-90'}`}
          />
        </div>

        <AnimatePresence>
          {isSidebarMoreOptionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-1">
                {task.canEdit && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={isDeleting || isCancelling}
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 text-left hover:bg-surface-dim rounded-xl transition-all flex items-center gap-2 md:gap-3 text-on-surface disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4 md:w-5 md:h-5 text-on-surface-variant shrink-0" />
                    <span className="font-semibold text-xs md:text-sm">Edit task</span>
                  </button>
                )}
                {task.canCancel && (
                  <button
                    type="button"
                    onClick={() => void handleCancel()}
                    disabled={isDeleting || isCancelling}
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 text-left hover:bg-surface-dim rounded-xl transition-all flex items-center gap-2 md:gap-3 text-on-surface disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4 md:w-5 md:h-5 text-on-surface-variant shrink-0" />
                    <span className="font-semibold text-xs md:text-sm">
                      {isCancelling ? 'Cancelling…' : 'Cancel task'}
                    </span>
                  </button>
                )}
                {task.canDelete !== false && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || isCancelling}
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 text-left hover:bg-surface-dim rounded-xl transition-all flex items-center gap-2 md:gap-3 text-error disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                    <span className="font-semibold text-xs md:text-sm">
                      {isDeleting ? 'Deleting…' : 'Delete task'}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied');
                  }}
                  className="w-full px-4 md:px-6 py-2.5 md:py-3 text-left hover:bg-surface-dim rounded-xl transition-all flex items-center gap-2 md:gap-3 text-on-surface"
                >
                  <Copy className="w-4 h-4 md:w-5 md:h-5 text-on-surface-variant shrink-0" />
                  <span className="font-semibold text-xs md:text-sm">Copy task link</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {reviewTaskId ? (
        <TaskCompletionPopup
          taskId={reviewTaskId}
          taskStatus={String(currentStatus || '')}
          revieweeName={revieweeName}
        />
      ) : null}
    </div>
  );

  const rootClassName = isPageVariant
    ? 'relative w-full flex-1 min-h-0 bg-white overflow-y-auto overflow-x-hidden flex flex-col'
    : 'absolute inset-0 bg-white z-[50] max-w-[100vw] overflow-y-auto overflow-x-hidden flex flex-col';

  return (
    <motion.div
      initial={isPageVariant ? undefined : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={isPageVariant ? undefined : { opacity: 0, x: 24 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className={rootClassName}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 p-2 hover:bg-surface-dim rounded-full transition-all text-on-surface-variant"
        title="Close"
        aria-label="Close task details"
      >
        <X className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <div className="flex-1 w-full min-w-0 px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full min-w-0 flex flex-col lg:flex-row gap-5 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Budget sidebar */}
          <div className="w-full min-w-0 lg:w-[min(100%,320px)] lg:max-w-[320px] shrink-0 order-first lg:order-last">
            <div className="lg:sticky lg:top-8 space-y-4 md:space-y-6">
              <div className="bg-[#f1f4f9] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-center border border-outline-variant">
                <p className="text-[10px] md:text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-2">
                  Task Budget
                </p>
                <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#000d45] mb-4 sm:mb-6 md:mb-8 break-words">
                  {formatNPR(task.price)}
                </p>

                {canStartTask ? (
                  <button
                    type="button"
                    onClick={() => void handleStartTask()}
                    disabled={isStartingWork || isCompleting}
                    className="w-full py-3 md:py-3.5 bg-primary text-white font-bold text-base md:text-lg rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95 mb-4 disabled:opacity-60"
                  >
                    {isStartingWork ? 'Starting…' : 'Start work'}
                  </button>
                ) : canConfirmComplete ? (
                  <button
                    type="button"
                    onClick={() => void handleConfirmWorkComplete()}
                    disabled={isStartingWork || isCompleting}
                    className="w-full py-3 md:py-3.5 bg-primary text-white font-bold text-base md:text-lg rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95 mb-4 disabled:opacity-60"
                  >
                    {isCompleting
                      ? 'Confirming…'
                      : taskRoles.isOwner
                        ? 'Confirm work complete'
                        : 'Mark work complete'}
                  </button>
                ) : completionStatusMessage ? (
                  <p className="text-sm text-on-surface-variant mb-4 px-2">
                    {completionStatusMessage}
                  </p>
                ) : currentStatus === 'in_progress' &&
                  (taskerConfirmed || ownerConfirmed) ? (
                  <p className="text-sm text-on-surface-variant mb-4 px-2">
                    {taskerConfirmed && ownerConfirmed
                      ? 'Both parties confirmed. Finalizing payment…'
                      : 'Waiting for both parties to confirm completion before payment is released.'}
                  </p>
                ) : canMakeOffer ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        router.push('/signin');
                        return;
                      }
                      setShowMakeOfferModal(true);
                    }}
                    className="w-full py-3 md:py-3.5 bg-primary text-white font-bold text-base md:text-lg rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95 mb-4"
                  >
                    Make an offer
                  </button>
                ) : apiTask && !user && apiTask.status === 'open' ? (
                  <button
                    type="button"
                    onClick={() => router.push('/signin')}
                    className="w-full py-3 md:py-3.5 bg-primary text-white font-bold text-base md:text-lg rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95 mb-4"
                  >
                    Sign in to make an offer
                  </button>
                ) : taskRoles.isOwner &&
                  (currentStatus === 'assigned' || currentStatus === 'funded') ? (
                  <p className="text-sm text-on-surface-variant mb-4 px-2">
                    Your tasker is assigned. They will start work when ready.
                  </p>
                ) : apiTask && apiTask.status !== 'open' && !taskRoles.isOwner && !taskRoles.isAssignee ? (
                  <p className="text-sm text-on-surface-variant mb-4 px-2">
                    This task is not accepting offers right now.
                  </p>
                ) : task.canEdit ? (
                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={isDeleting}
                    className="w-full py-3 md:py-3.5 bg-primary text-white font-bold text-base md:text-lg rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95 mb-4 disabled:opacity-60"
                  >
                    Edit task
                  </button>
                ) : (
                  <p className="text-sm text-on-surface-variant mb-4 px-2">
                    Manage offers and questions from this task.
                  </p>
                )}
              </div>

              <TaskPosterFollow
                posterId={posterId}
                profileSlug={posterSlug}
                posterName={posterDisplayName}
                posterAvatar={posterAvatar}
              />

              <div className="hidden lg:block">{moreOptionsSection(sidebarMoreOptionsRef)}</div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 w-full space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10 order-last lg:order-first">
            <div className="pr-10 sm:pr-12">
              <TaskStatusTimeline status={currentStatus} className="mb-2 md:mb-3" />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#000d45] leading-tight mb-2 break-words">
                {task.title}
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-dim flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-on-surface-variant" />
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">
                    Location
                  </p>
                  <p className="font-bold text-primary text-base md:text-lg">{task.location}</p>
                  {mapLink && (
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold text-xs md:text-sm hover:underline inline-flex items-center gap-1"
                    >
                      View map
                      <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-dim flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-on-surface-variant" />
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">
                    To be done on
                  </p>
                  <p className="font-bold text-primary text-base md:text-lg">
                    {task.dueDate.toLocaleDateString('en-AU', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  {loadingDetailTask && !timeSlot ? (
                    <p className="text-on-surface-variant text-xs md:text-sm">Loading…</p>
                  ) : timeSlot ? (
                    <TaskTimeSlotText label={timeSlot.label} sub={timeSlot.sub} />
                  ) : (
                    <p className="text-on-surface-variant text-xs md:text-sm">Anytime</p>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 overflow-hidden">
              <h2 className="text-xl md:text-2xl font-bold text-[#000d45] mb-3 md:mb-4">Details</h2>
              <p
                className={`text-on-surface-variant leading-relaxed text-sm sm:text-base md:text-lg ${USER_TEXT_CLASS}`}
              >
                {task.description}
              </p>
            </div>

            {imageAttachments.length > 0 && (
              <div className="min-w-0 overflow-hidden">
                <h3 className="text-lg md:text-xl font-bold text-[#000d45] mb-3">Images</h3>
                <div className="flex flex-wrap gap-3">
                  {imageAttachments.map((a: any) => {
                    const imageUrl = getMediaUrl(a.file_url);
                    return (
                    <a
                      key={a.id}
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-32 h-32 rounded-2xl overflow-hidden border border-outline-variant bg-surface-dim hover:shadow-md transition-shadow"
                      title={a.file_name}
                    >
                      <img
                        src={imageUrl}
                        alt={a.file_name}
                        className="w-full h-full object-cover"
                      />
                    </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 md:pt-6 border-t border-outline-variant min-w-0 overflow-hidden">
              <div className="flex bg-[#fff9db] p-1 rounded-full w-full max-w-full mb-6 md:mb-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('offers')}
                  className={`flex-1 min-w-0 px-4 sm:px-8 md:px-12 py-2 md:py-3 rounded-full font-bold text-sm md:text-base transition-all ${
                    activeTab === 'offers'
                      ? 'bg-[#000d45] text-white shadow-lg'
                      : 'bg-transparent text-[#000d45]/70 hover:bg-[#fff3bf] hover:text-[#000d45]'
                  }`}
                >
                  Offers
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 min-w-0 px-4 sm:px-8 md:px-12 py-2 md:py-3 rounded-full font-bold text-sm md:text-base transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                    activeTab === 'questions'
                      ? 'bg-[#000d45] text-white shadow-lg'
                      : 'bg-transparent text-[#000d45]/70 hover:bg-[#fff3bf] hover:text-[#000d45]'
                  }`}
                >
                  Questions{' '}
                  <span className={activeTab === 'questions' ? 'opacity-70' : 'opacity-50'}>
                    {questions.length}
                  </span>
                </button>
              </div>

              {activeTab === 'offers' && (
                <div className="space-y-4 md:space-y-6">
                  {loadingBids ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : bids.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                      <div className="w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-full h-full text-surface-variant fill-none stroke-current"
                          strokeWidth="2"
                        >
                          <circle cx="50" cy="40" r="15" />
                          <path d="M30 70 Q50 90 70 70" />
                          <line x1="45" y1="35" x2="55" y2="45" />
                          <circle cx="70" cy="30" r="10" />
                          <path d="M10 20 L90 20 L90 80 L10 80 Z" />
                        </svg>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-[#000d45] mb-2">No offers yet</h3>
                      <p className="text-on-surface-variant text-base md:text-lg max-w-md">
                        Your task is live. Offers will appear here when taskers respond.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bids.map((bid) => {
                        const taskerName = getBidTaskerName(bid);
                        const taskerImage = getMediaUrl(
                          bid.tasker && typeof bid.tasker === 'object'
                            ? bid.tasker.profile_image
                            : undefined
                        );
                        const rating =
                          bid.tasker && typeof bid.tasker === 'object'
                            ? bid.tasker.average_rating
                            : undefined;
                        const isVerified =
                          bid.tasker &&
                          typeof bid.tasker === 'object' &&
                          bid.tasker.is_verified_tasker;

                        return (
                          <div
                            key={bid.id}
                            className="border border-outline-variant rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all min-w-0 overflow-hidden"
                          >
                            <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                              <UserAvatar src={taskerImage} name={taskerName} size="lg" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-bold text-base md:text-lg text-[#000d45]">
                                    {taskerName}
                                  </h4>
                                  {rating != null && Number(rating) > 0 && (
                                    <div className="flex items-center gap-1 text-amber-500">
                                      <Star className="w-4 h-4 fill-current" />
                                      <span className="font-bold text-sm">
                                        {Number(rating).toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {bid.created_at && (
                                  <p className="text-xs md:text-sm text-on-surface-variant mb-2">
                                    {formatRelativeTime(bid.created_at)}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 md:px-3 py-1 bg-surface-dim text-on-surface-variant rounded-full text-[10px] md:text-xs font-bold capitalize">
                                    {bid.status}
                                  </span>
                                  {isVerified && (
                                    <span className="px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1">
                                      <Shield className="w-3 h-3" />
                                      Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-left sm:text-right w-full sm:w-auto">
                                <p className="text-2xl md:text-3xl font-bold text-[#000d45]">
                                  {formatNPR(bid.amount)}
                                </p>
                              </div>
                            </div>

                            {(bid.proposal || bid.cover_letter) && (
                              <p
                                className={`text-on-surface-variant leading-relaxed mb-4 text-sm md:text-base ${USER_TEXT_CLASS}`}
                              >
                                {bid.proposal || bid.cover_letter}
                              </p>
                            )}

                            {task.canEdit && bid.status === 'pending' && !hasAcceptedOffer && (
                              <div className="space-y-2">
                                {!loadingWalletBalance &&
                                  walletAvailableBalance !== null &&
                                  !canAcceptOfferWithWallet(bid) && (
                                    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                      <p>
                                        You need at least {formatNPR(bid.amount)} in your wallet to
                                        accept this offer. Available:{' '}
                                        {formatNPR(walletAvailableBalance)}.{' '}
                                        <Link
                                          href="/tasker-dashboard/methods"
                                          className="font-semibold underline hover:text-amber-950"
                                        >
                                          Add funds to wallet
                                        </Link>
                                      </p>
                                    </div>
                                  )}
                                <button
                                  type="button"
                                  disabled={
                                    acceptingBidId === bid.id ||
                                    loadingWalletBalance ||
                                    (walletAvailableBalance !== null &&
                                      !canAcceptOfferWithWallet(bid))
                                  }
                                  onClick={() => handleAcceptBid(bid)}
                                  className="w-full py-2 md:py-3 bg-primary text-white font-bold text-sm md:text-base rounded-full hover:bg-primary/90 transition-all disabled:opacity-60"
                                >
                                  {acceptingBidId === bid.id ? 'Accepting…' : 'Accept offer'}
                                </button>
                              </div>
                            )}

                            {bid.status === 'pending' && hasAcceptedOffer && (
                              <p className="text-sm text-on-surface-variant">
                                Another offer has already been accepted for this task.
                              </p>
                            )}

                            {bid.status === 'accepted' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const taskerId = getBidTaskerId(bid);
                                  if (!taskerId) {
                                    toast.error('Could not open messaging for this offer');
                                    return;
                                  }
                                  router.push(`/message?bid=${bid.id}&tasker=${taskerId}`);
                                }}
                                className="w-full py-2 md:py-3 border-2 border-primary text-primary font-bold text-sm md:text-base rounded-full hover:bg-primary/5 transition-all"
                              >
                                Message
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-4 md:space-y-6">
                  {questions.some((q) => !q.is_answered && !q.answer) && (
                    <p className="text-sm text-on-surface-variant">
                      Reply to questions below so taskers know more about your task.
                    </p>
                  )}

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-bold text-lg md:text-xl text-[#000d45]">
                      Previous questions ({questions.length})
                    </h3>

                    {loadingQuestions ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : questions.length === 0 ? (
                      <p className="text-on-surface-variant text-sm md:text-base">
                        No questions yet. Taskers can ask before they make an offer.
                      </p>
                    ) : (
                      questions.map((q) => {
                        const askerName =
                          q.asked_by_name ||
                          (q.user && typeof q.user === 'object'
                            ? q.user.full_name ||
                              `${q.user.first_name || ''} ${q.user.last_name || ''}`.trim()
                            : '') ||
                          'User';
                        const askerImage = getMediaUrl(
                          q.asked_by_image ||
                            (q.user && typeof q.user === 'object' ? q.user.profile_image : undefined)
                        );

                        return (
                          <div
                            key={q.id}
                            className="border border-outline-variant rounded-2xl p-4 md:p-6 min-w-0 overflow-hidden"
                          >
                            <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                              <UserAvatar src={askerImage} name={askerName} size="md" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-bold text-sm md:text-base text-[#000d45]">
                                    {askerName}
                                  </h4>
                                  {q.created_at && (
                                    <span className="text-[10px] md:text-xs text-on-surface-variant">
                                      {formatRelativeTime(q.created_at)}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-on-surface-variant text-sm md:text-base ${USER_TEXT_CLASS}`}>
                                  {q.question}
                                </p>
                              </div>
                            </div>

                            {(q.is_answered || q.answer) && q.answer ? (
                              <div className="ml-4 sm:ml-8 md:ml-16 pl-3 sm:pl-4 md:pl-6 border-l-2 border-outline-variant min-w-0 overflow-hidden">
                                <div className="flex items-start gap-3 md:gap-4">
                                  <UserAvatar src={posterAvatar} name={task.user.name} size="sm" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h4 className="font-bold text-xs md:text-sm text-[#000d45]">
                                        {task.user.name}
                                      </h4>
                                      {q.answered_at && (
                                        <span className="text-[10px] md:text-xs text-on-surface-variant">
                                          {formatRelativeTime(q.answered_at)}
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-on-surface-variant text-xs md:text-sm ${USER_TEXT_CLASS}`}>
                                      {q.answer}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : task.canEdit ? (
                              <div className="ml-4 sm:ml-8 md:ml-16 mt-3 md:mt-4 min-w-0">
                                <p className="text-xs md:text-sm font-semibold text-[#000d45] mb-2">
                                  Your reply
                                </p>
                                <div className="relative">
                                  <textarea
                                    value={answerDrafts[q.id] ?? ''}
                                    onChange={(e) =>
                                      setAnswerDrafts((prev) => ({
                                        ...prev,
                                        [q.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Write your answer..."
                                    className="w-full min-h-[88px] md:min-h-[100px] p-3 md:p-4 pr-14 border-2 border-outline-variant rounded-xl resize-none focus:outline-none focus:border-primary transition-all text-on-surface text-sm md:text-base"
                                  />
                                  <button
                                    type="button"
                                    disabled={
                                      !(answerDrafts[q.id] || '').trim() ||
                                      submittingAnswerId === q.id
                                    }
                                    onClick={() => handleAnswerQuestion(q.id)}
                                    className="absolute bottom-3 right-3 p-2 md:p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Post reply"
                                  >
                                    {submittingAnswerId === q.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Send className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="ml-4 sm:ml-8 md:ml-16 mt-2 text-xs md:text-sm text-on-surface-variant italic">
                                Awaiting answer from the poster
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border border-outline-variant rounded-2xl p-4 md:p-6 min-w-0 overflow-hidden">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3 min-w-0">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className={`text-xs md:text-sm text-amber-900 ${USER_TEXT_CLASS}`}>
                        <strong>Tip:</strong> Answer questions promptly to help taskers make better offers.
                        Keep replies on the platform for your safety.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 md:pt-10 border-t border-outline-variant">
              <h3 className="text-lg md:text-xl font-bold text-[#000d45] mb-3 md:mb-4">
                Cancellation policy
              </h3>
              <p className="text-on-surface-variant text-sm md:text-lg mb-3 md:mb-4">
                If you are responsible for cancelling this task, a Cancellation Fee may be deducted
                from your next payment payout(s).
              </p>
              <Link
                href="/cancellation-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold text-sm md:text-lg hover:underline inline-block"
              >
                Learn more
              </Link>
            </div>

            <div className="lg:hidden pt-6 md:pt-8">
              {moreOptionsSection(mobileMoreOptionsRef)}
            </div>

            <div className="pt-6 md:pt-10 border-t border-outline-variant">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 text-primary font-bold hover:bg-primary/5 px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all text-sm md:text-base shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Back</span>
                </button>
                <div
                  className="flex items-center gap-2 text-on-surface-variant text-sm md:text-base"
                  aria-label={`${viewsCount} views on this task`}
                >
                  <Eye className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                  <span className="font-semibold text-[#000d45]">
                    {loadingDetailTask && !detailTask && !apiTask
                      ? '…'
                      : viewsCount.toLocaleString()}
                  </span>
                  <span>{viewsCount === 1 ? 'view' : 'views'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {detailTask && (
        <MakeOfferModal
          isOpen={showMakeOfferModal}
          task={detailTask}
          onClose={() => setShowMakeOfferModal(false)}
          onBidSuccess={() => void refreshAll()}
        />
      )}
    </motion.div>
  );
}
