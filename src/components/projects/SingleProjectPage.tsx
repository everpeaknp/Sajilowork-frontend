'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getCheckoutHref } from '@/lib/checkout';
import { useCheckoutProfileGate } from '@/hooks/useCheckoutProfileGate';
import MakeOfferModal from '@/components/task/modals/MakeOfferModal';
import { getListingClosedOfferMessage, isProjectOpenForBids } from '@/lib/taskUtils';
import ProjectProfileHero from './ProjectProfileHero';
import ProjectAbout from './ProjectAbout';
import ProjectSidebar from './ProjectSidebar';
import ProjectSkillsRequired from './ProjectSkillsRequired';
import ProjectAttachments from './ProjectAttachments';
import ProjectGallery from './ProjectGallery';
import ProjectSendProposal from './ProjectSendProposal';
import ProjectShareSaveActions from './ProjectShareSaveActions';
import TaskOffersQuestionsTabs from '@/components/task/page/TaskOffersQuestionsTabs';
import TaskCancellationPolicy from '@/components/task/page/TaskCancellationPolicy';
import TaskReviewsSection from '@/components/reviews/TaskReviewsSection';
import TaskStatusTimeline from '@/components/common/TaskStatusTimeline';
import { projectToReviewTask } from '@/lib/projectApi';
import { getProjectDetailPath } from './projectSlug';
import type { Project } from './projectListData';

export const SEND_PROPOSAL_SECTION_ID = 'send-your-proposal';

interface SingleProjectPageProps {
  project: Project;
  onSubmitProposal?: () => void;
  onContactBuyer?: () => void;
  /** Full-page project detail: open wallet-gated proposal modal instead of inline form. */
  proposalPresentation?: 'inline' | 'modal';
  hideSendProposal?: boolean;
  /** Rendered above the status timeline (e.g. dashboard back link and actions). */
  topSlot?: React.ReactNode;
  /** Rendered below the main grid (e.g. dashboard management links). */
  managementSlot?: React.ReactNode;
  hideShareActions?: boolean;
  hideDirectoryFooter?: boolean;
  offerRefreshKey?: number;
  enableWalletGate?: boolean;
  variant?: 'page' | 'overlay';
  backLink?: { href: string; label: string };
  footerHint?: string;
}

export default function SingleProjectPage({
  project,
  onSubmitProposal,
  onContactBuyer,
  proposalPresentation = 'inline',
  hideSendProposal = false,
  topSlot,
  managementSlot,
  hideShareActions = false,
  hideDirectoryFooter = false,
  offerRefreshKey: offerRefreshKeyProp,
  enableWalletGate = false,
  variant = 'page',
  backLink,
  footerHint,
}: SingleProjectPageProps) {
  const isOverlay = variant === 'overlay';
  const router = useRouter();
  const { user } = useAuth();
  const useProposalModal = proposalPresentation === 'modal';
  const [proposalRefreshKey, setProposalRefreshKey] = useState(0);
  const offerRefreshKey = offerRefreshKeyProp ?? proposalRefreshKey;
  const { showProfilePopup, goToCheckout, completeProfileGate, cancelProfileGate } =
    useCheckoutProfileGate();
  const sendProposalRef = useRef<HTMLDivElement>(null);

  const openProposalCheckout = useCallback(() => {
    if (!user) {
      toast.error('Please sign in to submit a proposal.');
      const redirectPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : getProjectDetailPath(project);
      router.push(`/signin?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
    if (!isProjectOpenForBids(project)) {
      toast.error(getListingClosedOfferMessage(project.status, 'project', project.isOpenForBids));
      return;
    }
    if (!project.slug) {
      toast.error('This project is not available for proposals yet.');
      return;
    }
    goToCheckout(getCheckoutHref('project', project.slug));
  }, [goToCheckout, project, user]);

  const handleSubmitProposalClick = useCallback(() => {
    if (hideSendProposal) return;
    openProposalCheckout();
  }, [hideSendProposal, openProposalCheckout]);

  useEffect(() => {
    if (hideSendProposal) return;
    if (typeof window === 'undefined' || window.location.hash !== `#${SEND_PROPOSAL_SECTION_ID}`) {
      return;
    }
    window.requestAnimationFrame(() => {
      openProposalCheckout();
    });
  }, [hideSendProposal, openProposalCheckout]);

  const handleProposalSubmitted = useCallback(() => {
    setProposalRefreshKey((key) => key + 1);
    onSubmitProposal?.();
  }, [onSubmitProposal]);

  return (
    <div className="select-none bg-white pb-8 pt-6 font-normal text-black antialiased sm:pb-12 sm:pt-8 dark:bg-neutral-950 dark:text-stone-100 [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_p]:font-normal [&_span]:font-normal [&_button]:font-normal [&_label]:font-normal">
      <div className={`mx-auto w-full max-w-7xl ${isOverlay ? 'px-4 py-2 sm:px-6' : 'px-4 sm:px-6 lg:px-8'}`}>
        {topSlot ? <div className="mb-4 sm:mb-5">{topSlot}</div> : null}

        <div className="mb-4 sm:mb-5">
          <TaskStatusTimeline status={project.status || 'open'} />
        </div>

        <ProjectProfileHero project={project} />

        <div className="mt-8 grid grid-cols-1 items-start gap-8 sm:mt-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            <ProjectAbout project={project} />

            <div className="mt-12">
              <ProjectSkillsRequired project={project} />
            </div>
            <ProjectAttachments project={project} />
            <ProjectGallery project={project} />
            <div className="mt-12">
              <TaskOffersQuestionsTabs
                project={project}
                listingKind="project"
                taskStatus={project.status}
                initialOfferCount={project.ownerReviews ?? 0}
                offerRefreshKey={offerRefreshKey}
                onOfferAccepted={handleProposalSubmitted}
                enableWalletGate={enableWalletGate}
              />
            </div>
            {!hideSendProposal && !useProposalModal ? (
              <div
                id={SEND_PROPOSAL_SECTION_ID}
                ref={sendProposalRef}
                className="mt-12 scroll-mt-28"
              >
                <ProjectSendProposal project={project} onSubmitted={handleProposalSubmitted} />
              </div>
            ) : null}

            <TaskCancellationPolicy listingLabel="project" />

            <div className="mt-12 border-t border-neutral-200 pt-10 dark:border-neutral-800">
              <TaskReviewsSection
                task={projectToReviewTask(project)}
                listingKind="project"
                onReviewSubmitted={handleProposalSubmitted}
              />
            </div>
          </div>

          <ProjectSidebar
            project={project}
            onSubmitProposal={handleSubmitProposalClick}
            onContactBuyer={onContactBuyer}
            shareSave={
              !hideShareActions ? (
                <ProjectShareSaveActions
                  project={project}
                  className="justify-center sm:justify-center"
                />
              ) : null
            }
          />
        </div>

        {managementSlot ? <div className="mt-10 sm:mt-14">{managementSlot}</div> : null}

        {!hideDirectoryFooter ? (
          <div className="mt-10 flex flex-col gap-4 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
              {footerHint ??
                (isOverlay
                  ? 'Browse more projects on the project map.'
                  : 'Browse more opportunities on the full projects directory.')}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {isOverlay ? (
                <Link
                  href={getProjectDetailPath(project)}
                  className="inline-flex items-center gap-1.5 text-sm font-normal text-[#52C47F] transition-opacity hover:opacity-80"
                >
                  Open full page
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
              <Link
                href={backLink?.href ?? '/projects'}
                className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80 dark:text-stone-200"
              >
                {backLink?.label ?? 'Back to all projects'}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {showProfilePopup ? (
        <MakeOfferModal
          presentation="modal"
          profileGateOnly
          isOpen={showProfilePopup}
          onClose={cancelProfileGate}
          onProfileGateComplete={completeProfileGate}
          project={project}
        />
      ) : null}
    </div>
  );
}
