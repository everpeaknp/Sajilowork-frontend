"use client";

import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MapPin, Calendar, Flag, Share2, Heart, Copy, Bell, Star, Shield, Send, AlertCircle, X, ExternalLink, Loader2 } from 'lucide-react';
import { Task, Bid, TaskQuestion } from '@/types';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import MakeOfferModal from './modals/MakeOfferModal';
import ReportTaskModal from './modals/ReportTaskModal';
import UserAvatar from '@/components/common/UserAvatar';
import { getMediaUrl, isTaskImageAttachment } from '@/lib/utils';
import { formatNPR, formatTaskLocation, formatTaskLocationShort } from '@/lib/nepalLocale';
import { useAuthStore } from '@/store/auth.store';
import {
  canSubmitOfferOnTask,
  getTaskPosterProfileSlug,
  getTaskPosterId,
  getTaskPosterUser,
  isCurrentUserTaskOwner,
} from '@/lib/taskUtils';
import TaskPosterFollow from '@/components/users/TaskPosterFollow';
import { bidService, extractBidList } from '@/services/bid.service';
import { taskService } from '@/services/task.service';
import { getTaskTimeSlotFromRequirements } from '@/lib/timeSlot';
import TaskTimeSlotText from '@/components/common/TaskTimeSlotText';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  /** Refresh parent task list after bid count changes */
  onTaskUpdated?: () => void;
}

function taskLookupKey(task: Task): string {
  return task.slug || task.id;
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

/** User-generated copy — breaks long unbroken strings so text stays in the card. */
const USER_TEXT_CLASS =
  'whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full';

function formatRelativeTime(iso?: string): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

export default function TaskDetails({ task, onClose, onTaskUpdated }: TaskDetailsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'offers' | 'questions'>('offers');
  const [questionText, setQuestionText] = useState('');
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [isSidebarMoreOptionsOpen, setIsSidebarMoreOptionsOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [questions, setQuestions] = useState<TaskQuestion[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submittingAnswerId, setSubmittingAnswerId] = useState<string | null>(null);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [loadingDetailTask, setLoadingDetailTask] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const isOwner = isCurrentUserTaskOwner(task, user?.id);
  const lookup = taskLookupKey(task);
  const viewTask = detailTask ?? task;

  const hasAcceptedOffer = useMemo(
    () =>
      bids.some((b) => b.status === 'accepted') ||
      task.status === 'assigned' ||
      task.status === 'in_progress',
    [bids, task.status]
  );

  const myPendingOffer = useMemo(() => {
    if (!user?.id) return null;
    const mine = bids.find(
      (b) => getBidTaskerId(b) === String(user.id) && b.status === 'pending'
    );
    return mine ?? null;
  }, [bids, user?.id]);

  const loadBids = useCallback(async () => {
    if (!task.id) return;
    setLoadingBids(true);
    try {
      const response = await bidService.getTaskBids(task.id);
      if (response.success && response.data) {
        setBids(extractBidList(response.data));
      }
    } catch {
      // Non-blocking: offers tab can still show empty state
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
      // Non-blocking
    } finally {
      setLoadingQuestions(false);
    }
  }, [lookup]);

  useEffect(() => {
    void Promise.all([loadBids(), loadQuestions()]);
  }, [loadBids, loadQuestions]);

  // List API omits attachments/requirements — load full task when panel opens.
  useEffect(() => {
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
  }, [lookup]);

  useEffect(() => {
    const src = detailTask ?? task;
    setIsBookmarked(Boolean(src.is_bookmarked));
  }, [detailTask, task]);

  const taskShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const slug = viewTask.slug || task.slug || task.id;
    return `${window.location.origin}/task/${slug}`;
  }, [viewTask.slug, task.slug, task.id]);

  const handleToggleBookmark = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const slug = lookup;
    const nextBookmarked = !isBookmarked;
    setBookmarkLoading(true);
    setIsBookmarked(nextBookmarked);

    try {
      const response = nextBookmarked
        ? await taskService.bookmarkTask(slug)
        : await taskService.unbookmarkTask(slug);

      if (response.success) {
        toast.success(nextBookmarked ? 'Task saved to bookmarks' : 'Removed from bookmarks');
        setDetailTask((prev) =>
          prev
            ? {
                ...prev,
                is_bookmarked: nextBookmarked,
                bookmarks_count: Math.max(
                  0,
                  (prev.bookmarks_count ?? 0) + (nextBookmarked ? 1 : -1)
                ),
              }
            : prev
        );
      } else {
        setIsBookmarked(!nextBookmarked);
        toast.error(response.message || 'Could not update bookmark');
      }
    } catch (err: unknown) {
      setIsBookmarked(!nextBookmarked);
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Could not update bookmark';
      toast.error(message);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShareTask = async () => {
    if (!taskShareUrl) return;

    setShareLoading(true);
    const shareTitle = viewTask.title || task.title || 'Task on tasknepal';
    const shareText = `Check out this task: ${shareTitle}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: taskShareUrl,
        });
        toast.success('Share dialog opened');
      } else {
        await navigator.clipboard.writeText(taskShareUrl);
        toast.success('Task link copied to clipboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      try {
        await navigator.clipboard.writeText(taskShareUrl);
        toast.success('Task link copied to clipboard');
      } catch {
        toast.error('Could not share this task');
      }
    } finally {
      setShareLoading(false);
    }
  };

  /** Reload tabs and refresh list counts (after bid submit / accept only). */
  const refreshOffersAndNotifyParent = useCallback(async () => {
    await Promise.all([loadBids(), loadQuestions()]);
    onTaskUpdated?.();
  }, [loadBids, loadQuestions, onTaskUpdated]);

  const handleBidSuccess = useCallback(async () => {
    // Close the modal and refresh offers immediately so the sidebar can show "Offer sent".
    setShowMakeOfferModal(false);
    setActiveTab('offers');
    await refreshOffersAndNotifyParent();
  }, [refreshOffersAndNotifyParent]);

  const sidebarMoreOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarMoreOptionsRef.current && !sidebarMoreOptionsRef.current.contains(event.target as Node)) {
        setIsSidebarMoreOptionsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAskQuestion = async () => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    if (!user) {
      window.location.href = '/signin';
      return;
    }

    setSubmittingQuestion(true);
    try {
      const response = await taskService.askQuestion(lookup, trimmed);
      if (response.success) {
        setQuestionText('');
        toast.success('Question posted');
        await loadQuestions();
      } else {
        toast.error(response.message || 'Failed to post question');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Failed to post question';
      toast.error(message);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAnswerQuestion = async (questionId: string) => {
    const trimmed = (answerDrafts[questionId] || '').trim();
    if (!trimmed) return;

    if (!isOwner) {
      toast.error('Only the task poster can reply to questions.');
      return;
    }

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

  const handleAcceptBid = async (bid: Bid) => {
    if (!isOwner || bid.status !== 'pending') return;
    if (hasAcceptedOffer) {
      toast.error('This task already has an accepted offer. You can only accept one tasker.');
      return;
    }

    setAcceptingBidId(bid.id);
    try {
      const response = await bidService.acceptBid(bid.id);
      if (response.success) {
        toast.success('Offer accepted');
        await refreshOffersAndNotifyParent();
      } else {
        toast.error(response.message || 'Failed to accept offer');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Failed to accept offer';
      toast.error(message);
    } finally {
      setAcceptingBidId(null);
    }
  };

  const handleReportSubmit = (category: string, comment: string) => {
    // Handle report submission
    console.log('Report submitted:', { category, comment });
    setShowReportModal(false);
  };

  const nestedPoster = getTaskPosterUser(task);
  const posterId = getTaskPosterId(task);
  const posterProfileSlug = getTaskPosterProfileSlug(task);

  const posterName =
    (nestedPoster &&
      (`${nestedPoster.first_name || ''} ${nestedPoster.last_name || ''}`.trim() ||
        nestedPoster.full_name)) ||
    task.owner_name ||
    'User';

  const posterAvatar = getMediaUrl(nestedPoster?.profile_image || task.owner_image);
  const timeSlot = getTaskTimeSlotFromRequirements(
    (viewTask as Task & { requirements?: Array<{ type?: string; label?: string; value?: string }> })
      .requirements
  );
  const attachments = (viewTask.attachments ?? []).filter(
    (a) => a && isTaskImageAttachment(a.file_type)
  );

  const postedAgo = task.created_at
    ? `${Math.floor((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`
    : 'Recently';
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="absolute inset-0 bg-white z-[50] max-w-[100vw] overflow-y-auto overflow-x-hidden flex flex-col"
    >
      {/* Close Button - Top Right */}
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
          {/* Budget sidebar — top on mobile, right column on desktop */}
          <div className="w-full min-w-0 lg:w-[min(100%,320px)] lg:max-w-[320px] shrink-0 order-first lg:order-last">
            <div className="lg:sticky lg:top-8 space-y-4 md:space-y-6">
              <div className="bg-[#f1f4f9] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-center border border-outline-variant">
                <p className="text-[10px] md:text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-2">
                  Task Budget
                </p>
                <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#000d45] mb-4 sm:mb-6 md:mb-8 break-words">
                  {formatNPR(task.budget_amount)}
                </p>
                {canSubmitOfferOnTask(task, user?.id) ? (
                  myPendingOffer ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3 md:py-3.5 bg-blue-600 text-white font-bold text-base md:text-lg rounded-full border border-blue-700 shadow-sm mb-4 cursor-not-allowed"
                    >
                      Offer sent
                    </button>
                  ) : (
                  <button
                    onClick={() => setShowMakeOfferModal(true)}
                    className="w-full py-3 md:py-3.5 bg-primary text-white font-bold text-base md:text-lg rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95 mb-4"
                  >
                    Make an offer
                  </button>
                  )
                ) : isCurrentUserTaskOwner(task, user?.id) ? (
                  <p className="text-sm text-on-surface-variant mb-4 px-2">
                    This is your task. You cannot submit an offer on your own listing.
                  </p>
                ) : task.status !== 'open' ? (
                  <p className="text-sm text-on-surface-variant mb-4 px-2">
                    This task is not accepting offers right now.
                  </p>
                ) : (
                  <button
                    onClick={() => (window.location.href = '/signin')}
                    className="w-full py-3 md:py-3.5 bg-primary text-white font-bold text-base md:text-lg rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95 mb-4"
                  >
                    Sign in to make an offer
                  </button>
                )}
              </div>

              <TaskPosterFollow
                posterId={posterId}
                profileSlug={posterProfileSlug}
                posterName={posterName}
                posterAvatar={posterAvatar}
                postedAgo={postedAgo}
              />

              <div className="flex flex-col gap-3 md:gap-4">
                <div ref={sidebarMoreOptionsRef}>
                  <div 
                    onClick={() => setIsSidebarMoreOptionsOpen(!isSidebarMoreOptionsOpen)}
                    className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-surface-dim rounded-2xl cursor-pointer hover:bg-surface-variant/20 transition-all group border border-transparent hover:border-outline-variant"
                  >
                    <span className="font-bold text-sm md:text-base text-[#000d45]">More Options</span>
                    <ChevronLeft className={`w-4 h-4 md:w-5 md:h-5 transition-transform shrink-0 ${isSidebarMoreOptionsOpen ? '-rotate-90' : 'rotate-90'}`} />
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
                          <button
                            onClick={() => {
                              // Handle post similar task
                            }}
                            className="w-full px-4 md:px-6 py-2.5 md:py-3 text-left hover:bg-surface-dim rounded-xl transition-all flex items-center gap-2 md:gap-3 text-on-surface"
                          >
                            <Copy className="w-4 h-4 md:w-5 md:h-5 text-on-surface-variant shrink-0" />
                            <span className="font-semibold text-xs md:text-sm">Post a similar task</span>
                          </button>
                          <button
                            onClick={() => {
                              // Handle set up alerts
                            }}
                            className="w-full px-4 md:px-6 py-2.5 md:py-3 text-left hover:bg-surface-dim rounded-xl transition-all flex items-center gap-2 md:gap-3 text-on-surface"
                          >
                            <Bell className="w-4 h-4 md:w-5 md:h-5 text-on-surface-variant shrink-0" />
                            <span className="font-semibold text-xs md:text-sm">Set up Alerts</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center justify-center gap-2 text-on-surface-variant font-sans text-xs md:text-[14px] font-normal leading-[20px] hover:text-error transition-colors py-2"
                >
                  <Flag className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                  Report this task
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10 order-last lg:order-first">
            {/* Title & Status */}
            <div className="pr-10 sm:pr-12">
              <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                  task.status === 'open' ? 'bg-green-100 text-green-700' : 'text-on-surface-variant opacity-30'
                }`}>
                  Open
                </span>
                <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                  task.status === 'assigned' ? 'bg-blue-100 text-blue-700' : 'text-on-surface-variant opacity-30'
                }`}>
                  Assigned
                </span>
                <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                  task.status === 'completed' ? 'bg-purple-100 text-purple-700' : 'text-on-surface-variant opacity-30'
                }`}>
                  Completed
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#000d45] leading-tight mb-2 break-words">
                {task.title}
              </h1>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-dim flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-on-surface-variant" />
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">
                    Location
                  </p>
                  <p className="font-bold text-primary text-base md:text-lg">
                    {formatTaskLocationShort(task)}
                  </p>
                  {(() => {
                    // Build a Google Maps URL.
                    // - If we have real coords, use the ?q=lat,lng form so the
                    //   pin lands exactly on the task.
                    // - Otherwise, fall back to a free-form query built from
                    //   address + city + country so the map at least shows the
                    //   right neighbourhood.
                    // DRF serializes DecimalField as strings — coerce to Number
                    // before testing for finiteness.
                    const lat = Number(task.latitude);
                    const lng = Number(task.longitude);
                    const hasCoords =
                      Number.isFinite(lat) &&
                      Number.isFinite(lng) &&
                      !(lat === 0 && lng === 0);

                    const query = hasCoords
                      ? `${lat},${lng}`
                      : formatTaskLocation(task, '');

                    if (!query) return null;

                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

                    return (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold text-xs md:text-sm hover:underline inline-flex items-center gap-1"
                      >
                        View map
                        <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </a>
                    );
                  })()}
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
                    {task.due_date ? new Date(task.due_date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Flexible'}
                  </p>
                  {timeSlot ? (
                    <TaskTimeSlotText label={timeSlot.label} sub={timeSlot.sub} />
                  ) : (
                    <p className="text-on-surface-variant text-xs md:text-sm">Anytime</p>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="min-w-0 overflow-hidden">
              <h2 className="text-xl md:text-2xl font-bold text-[#000d45] mb-3 md:mb-4">Details</h2>
              <p className={`text-on-surface-variant leading-relaxed text-sm sm:text-base md:text-lg ${USER_TEXT_CLASS}`}>
                {viewTask.description}
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="min-w-0 overflow-hidden">
                <h3 className="text-lg md:text-xl font-bold text-[#000d45] mb-3">Images</h3>
                <div className="flex flex-wrap gap-3">
                  {attachments.map((a) => {
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

            {/* Tabs */}
            <div className="pt-4 md:pt-6 border-t border-outline-variant min-w-0 overflow-hidden">
              <div className="flex bg-[#fff9db] p-1 rounded-full w-full max-w-full mb-6 md:mb-8">
                <button 
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

              {/* Offers Tab Content */}
              {activeTab === 'offers' && (
                <div className="space-y-4 md:space-y-6">
                  {loadingBids ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : !user && (task.bid_count || task.bids_count || 0) > 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                      <h3 className="text-xl md:text-2xl font-bold text-[#000d45] mb-2">
                        {task.bid_count || task.bids_count} offer
                        {(task.bid_count || task.bids_count) === 1 ? '' : 's'} on this task
                      </h3>
                      <p className="text-on-surface-variant text-base md:text-lg max-w-md mb-4">
                        Sign in to view every tasker&apos;s proposal and submit your own offer.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push('/signin')}
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
                      >
                        Sign in to view offers
                      </button>
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
                      <p className="text-on-surface-variant text-base md:text-lg">
                        {canSubmitOfferOnTask(task, user?.id)
                          ? 'Make the first offer and get ahead of the competition!'
                          : 'Offers from taskers will appear here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-on-surface-variant font-medium">
                        {bids.length} offer{bids.length === 1 ? '' : 's'} — each proposal is visible to all taskers browsing this task.
                      </p>
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
                                      <span className="font-bold text-sm">{Number(rating).toFixed(1)}</span>
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
                              <div className="mb-4 rounded-xl bg-surface-dim/80 border border-outline-variant/60 p-3 md:p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">
                                  Proposal
                                </p>
                                <p
                                  className={`text-on-surface leading-relaxed text-sm md:text-base ${USER_TEXT_CLASS}`}
                                >
                                  {bid.proposal || bid.cover_letter}
                                </p>
                              </div>
                            )}
                            {isOwner && bid.status === 'pending' && !hasAcceptedOffer && (
                              <button
                                type="button"
                                disabled={acceptingBidId === bid.id}
                                onClick={() => handleAcceptBid(bid)}
                                className="w-full py-2 md:py-3 bg-primary text-white font-bold text-sm md:text-base rounded-full hover:bg-primary/90 transition-all disabled:opacity-60"
                              >
                                {acceptingBidId === bid.id ? 'Accepting…' : 'Accept offer'}
                              </button>
                            )}

                            {isOwner && bid.status === 'pending' && hasAcceptedOffer && (
                              <p className="text-sm text-on-surface-variant">
                                Another offer has already been accepted for this task.
                              </p>
                            )}

                            {isOwner && bid.status === 'accepted' && (
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

              {/* Questions Tab Content */}
              {activeTab === 'questions' && (
                <div className="space-y-4 md:space-y-6">
                  {/* Ask — taskers / visitors only */}
                  {!isOwner && (
                    <div className="border border-outline-variant rounded-2xl p-4 md:p-6 min-w-0 overflow-hidden">
                      <h3 className="font-bold text-base md:text-lg text-[#000d45] mb-3 md:mb-4">Ask a question</h3>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4 mb-3 md:mb-4 flex items-start gap-2 md:gap-3 min-w-0">
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className={`text-xs md:text-sm text-amber-900 ${USER_TEXT_CLASS}`}>
                          <strong>Important:</strong> Don't share personal information like phone numbers or email addresses in your question. Keep all communication on the platform for your safety.
                        </p>
                      </div>
                      <div className="relative">
                        <textarea
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          placeholder="Type your question here..."
                          className="w-full min-h-[100px] md:min-h-[120px] p-3 md:p-4 border-2 border-outline-variant rounded-xl resize-none focus:outline-none focus:border-primary transition-all text-on-surface text-sm md:text-base"
                        />
                        <button
                          type="button"
                          disabled={!questionText.trim() || submittingQuestion}
                          onClick={handleAskQuestion}
                          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 p-2 md:p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingQuestion ? (
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 md:w-5 md:h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {isOwner && questions.some((q) => !q.is_answered && !q.answer) && (
                    <p className="text-sm text-on-surface-variant">
                      Reply to questions below so taskers know more about your task.
                    </p>
                  )}

                  {/* Existing Questions */}
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
                        No questions yet. Be the first to ask about this task.
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
                                  <UserAvatar src={posterAvatar} name={posterName} size="sm" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h4 className="font-bold text-xs md:text-sm text-[#000d45]">
                                        {posterName}
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
                            ) : isOwner ? (
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
                                Waiting for the task poster to reply.
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cancellation Policy */}
            <div className="pt-6 md:pt-10 border-t border-outline-variant">
              <h3 className="text-lg md:text-xl font-bold text-[#000d45] mb-3 md:mb-4">Cancellation policy</h3>
              <p className="text-on-surface-variant text-sm md:text-lg mb-3 md:mb-4">
                If you are responsible for cancelling this task, a Cancellation Fee will be deducted from your next payment payout(s).
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

            {/* Horizontal Action Buttons - Bottom */}
            <div className="pt-6 md:pt-10 border-t border-outline-variant">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-6">
                <button 
                  onClick={onClose}
                  className="flex items-center gap-2 text-primary font-bold hover:bg-primary/5 px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all text-sm md:text-base"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleToggleBookmark()}
                  disabled={bookmarkLoading}
                  className={`p-2 md:p-3 hover:bg-surface-dim rounded-full transition-all disabled:opacity-50 ${
                    isBookmarked ? 'text-error' : 'text-on-surface-variant'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Save task'}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark task'}
                  aria-pressed={isBookmarked}
                >
                  {bookmarkLoading ? (
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  ) : (
                    <Heart
                      className={`w-5 h-5 md:w-6 md:h-6 ${isBookmarked ? 'fill-current' : ''}`}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void handleShareTask()}
                  disabled={shareLoading}
                  className="p-2 md:p-3 hover:bg-surface-dim rounded-full transition-all text-on-surface-variant disabled:opacity-50"
                  title="Share task link"
                  aria-label="Share task"
                >
                  {shareLoading ? (
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  ) : (
                    <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MakeOfferModal
        isOpen={showMakeOfferModal}
        onClose={() => setShowMakeOfferModal(false)}
        task={task}
        onBidSuccess={handleBidSuccess}
      />

      <ReportTaskModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
      />
    </motion.div>
  );
}
