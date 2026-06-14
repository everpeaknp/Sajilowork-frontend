'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import ProjectProfileHero from '@/components/projects/ProjectProfileHero';
import ProjectAttachments from '@/components/projects/ProjectAttachments';
import ProjectGallery from '@/components/projects/ProjectGallery';
import ProjectSkillsRequired from '@/components/projects/ProjectSkillsRequired';
import TaskReviewsSection from '@/components/reviews/TaskReviewsSection';
import MakeOfferModal from '@/components/task/modals/MakeOfferModal';
import { useAuth } from '@/hooks/useAuth';
import { TASK_BROWSE_PATH } from '@/lib/taskBrowsePath';
import { mapTaskToTaskPageView, getTaskDetailPath } from '@/lib/taskPageApi';
import { isListingOpenForBids } from '@/lib/taskUtils';
import type { Task } from '@/types';
import TaskAbout from './TaskAbout';
import TaskOffersQuestionsTabs from './TaskOffersQuestionsTabs';
import TaskMakeOffer from './TaskMakeOffer';
import TaskMoreOptions from './TaskMoreOptions';
import TaskCancellationPolicy from './TaskCancellationPolicy';
import TaskShareSaveActions from './TaskShareSaveActions';
import TaskSidebar, { type SidebarPrimaryAction } from './TaskSidebar';
import TaskStatusTimeline from '@/components/common/TaskStatusTimeline';
import type { MyTaskManagementActions } from '@/components/my-task/MyTaskManagementSection';
import MyTaskManagementSection from '@/components/my-task/MyTaskManagementSection';

export const MAKE_OFFER_SECTION_ID = 'make-an-offer';

export type { SidebarPrimaryAction };

interface SingleTaskPageProps {
  task: Task;
  onTaskUpdated?: () => void;
  variant?: 'page' | 'overlay';
  onClose?: () => void;
  onPostSimilar?: () => void;
  onSetUpAlerts?: () => void;
  onRaiseDispute?: () => void;
  onReport?: () => void;
  canRaiseDispute?: boolean;
  /** Custom sidebar primary button; `null` hides it. */
  sidebarPrimaryAction?: SidebarPrimaryAction | null;
  hideMakeOffer?: boolean;
  /** Full-page task detail: open wallet-gated offer modal instead of inline form. */
  makeOfferPresentation?: 'inline' | 'modal';
  enableWalletGate?: boolean;
  managementActions?: MyTaskManagementActions;
  backLink?: { href: string; label: string };
  footerHint?: string;
}

function hasMeaningfulSkills(skills: string[]): boolean {
  return skills.some((skill) => skill.trim() && skill.trim().toLowerCase() !== 'general');
}

export default function SingleTaskPage({
  task,
  onTaskUpdated,
  variant = 'page',
  onClose,
  onPostSimilar,
  onSetUpAlerts,
  onRaiseDispute,
  onReport,
  canRaiseDispute = false,
  sidebarPrimaryAction,
  hideMakeOffer = false,
  makeOfferPresentation = 'inline',
  enableWalletGate = false,
  managementActions,
  backLink,
  footerHint,
}: SingleTaskPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isOverlay = variant === 'overlay';
  const useMakeOfferModal = makeOfferPresentation === 'modal';
  const project = useMemo(() => mapTaskToTaskPageView(task), [task]);
  const [offerRefreshKey, setOfferRefreshKey] = useState(0);
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const makeOfferRef = useRef<HTMLDivElement>(null);
  const initialOfferCount = task.bid_count ?? task.bids_count ?? 0;

  const scrollToMakeOffer = useCallback(() => {
    makeOfferRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const field = document.getElementById('task-offer-amount');
      if (field instanceof HTMLElement) {
        field.focus({ preventScroll: true });
      }
    }, 450);
  }, []);

  const openMakeOfferModal = useCallback(() => {
    if (!user) {
      toast.error('Please sign in to make an offer.');
      const redirectPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : getTaskDetailPath(task);
      router.push(`/signin?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
    setShowMakeOfferModal(true);
  }, [router, task, user]);

  const handleMakeOfferClick = useCallback(() => {
    if (useMakeOfferModal) {
      openMakeOfferModal();
      return;
    }
    scrollToMakeOffer();
  }, [openMakeOfferModal, scrollToMakeOffer, useMakeOfferModal]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== `#${MAKE_OFFER_SECTION_ID}`) {
      return;
    }
    window.requestAnimationFrame(() => {
      if (useMakeOfferModal) {
        openMakeOfferModal();
        return;
      }
      scrollToMakeOffer();
    });
  }, [openMakeOfferModal, scrollToMakeOffer, useMakeOfferModal]);

  const handleOfferRefresh = useCallback(() => {
    setOfferRefreshKey((key) => key + 1);
    onTaskUpdated?.();
  }, [onTaskUpdated]);

  const showMoreOptions =
    Boolean(onPostSimilar && onSetUpAlerts && onRaiseDispute && onReport);

  const listingOpen = isListingOpenForBids(task.status, task.is_open);
  const resolvedSidebarPrimaryAction =
    sidebarPrimaryAction !== undefined
      ? sidebarPrimaryAction
      : listingOpen
        ? undefined
        : null;

  return (
    <div className="select-none bg-white pb-8 pt-6 font-normal text-black antialiased sm:pb-12 sm:pt-8 [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_p]:font-normal [&_span]:font-normal [&_button]:font-normal [&_label]:font-normal">
      <div className={`mx-auto w-full max-w-7xl ${isOverlay ? 'px-4 py-2 sm:px-6' : 'px-4 sm:px-6 lg:px-8'}`}>
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <TaskStatusTimeline status={task.status || 'open'} />
          <TaskShareSaveActions task={task} onBookmarkChange={() => onTaskUpdated?.()} />
        </div>

        <ProjectProfileHero project={project} />

        <div className="mt-8 grid grid-cols-1 items-start gap-8 sm:mt-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <TaskAbout project={project} />

            {hasMeaningfulSkills(project.skills) ? (
              <div className="mt-12">
                <ProjectSkillsRequired project={project} />
              </div>
            ) : null}

            <ProjectAttachments project={project} />
            <ProjectGallery project={project} />

            <div className="mt-12">
              <TaskOffersQuestionsTabs
                project={project}
                taskStatus={task.status}
                initialOfferCount={initialOfferCount}
                offerRefreshKey={offerRefreshKey}
                onOfferAccepted={handleOfferRefresh}
                enableWalletGate={enableWalletGate}
              />
            </div>

            {!hideMakeOffer && !useMakeOfferModal ? (
              <div
                id={MAKE_OFFER_SECTION_ID}
                ref={makeOfferRef}
                className="mt-12 scroll-mt-28"
              >
                <TaskMakeOffer project={project} onSubmitted={handleOfferRefresh} />
              </div>
            ) : null}

            {task.status === 'completed' ? (
              <div className="mt-12 border-t border-neutral-200 pt-10">
                <TaskReviewsSection task={task} />
              </div>
            ) : null}

            <TaskCancellationPolicy />

            {managementActions ? (
              <MyTaskManagementSection actions={managementActions} />
            ) : null}
          </div>

          <TaskSidebar
            task={task}
            project={project}
            onMakeOffer={handleMakeOfferClick}
            primaryAction={resolvedSidebarPrimaryAction}
            belowPoster={
              showMoreOptions ? (
                <TaskMoreOptions
                  embedded
                  canRaiseDispute={canRaiseDispute}
                  onPostSimilar={onPostSimilar!}
                  onSetUpAlerts={onSetUpAlerts!}
                  onRaiseDispute={onRaiseDispute!}
                  onReport={onReport!}
                />
              ) : null
            }
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm font-normal text-neutral-500">
            {footerHint ??
              (isOverlay
                ? 'Browse more tasks on the task map.'
                : 'Browse more tasks on the full task directory.')}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {isOverlay && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
              >
                Close
                <ArrowUpRight className="h-4 w-4 rotate-45" />
              </button>
            ) : null}
            {isOverlay ? (
              <Link
                href={getTaskDetailPath(task)}
                className="inline-flex items-center gap-1.5 text-sm font-normal text-[#52C47F] transition-opacity hover:opacity-80"
              >
                Open full page
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
            <Link
              href={backLink?.href ?? TASK_BROWSE_PATH}
              className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
            >
              {backLink?.label ?? 'Back to all tasks'}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {useMakeOfferModal && !hideMakeOffer ? (
        <MakeOfferModal
          isOpen={showMakeOfferModal}
          onClose={() => setShowMakeOfferModal(false)}
          task={task}
          onBidSuccess={handleOfferRefresh}
        />
      ) : null}
    </div>
  );
}
