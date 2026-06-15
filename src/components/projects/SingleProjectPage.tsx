'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import MakeOfferModal from '@/components/task/modals/MakeOfferModal';
import { useAuth } from '@/hooks/useAuth';
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
import TaskStatusTimeline from '@/components/common/TaskStatusTimeline';
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
}

export default function SingleProjectPage({
  project,
  onSubmitProposal,
  onContactBuyer,
  proposalPresentation = 'inline',
  hideSendProposal = false,
}: SingleProjectPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const useProposalModal = proposalPresentation === 'modal';
  const [proposalRefreshKey, setProposalRefreshKey] = useState(0);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const sendProposalRef = useRef<HTMLDivElement>(null);

  const scrollToSendProposal = useCallback(() => {
    sendProposalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onSubmitProposal?.();
    window.setTimeout(() => {
      const field = document.getElementById('offer-amount');
      if (field instanceof HTMLElement) {
        field.focus({ preventScroll: true });
      }
    }, 450);
  }, [onSubmitProposal]);

  const openProposalModal = useCallback(() => {
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
    setShowProposalModal(true);
  }, [project, router, user]);

  const handleSubmitProposalClick = useCallback(() => {
    if (useProposalModal) {
      openProposalModal();
      return;
    }
    scrollToSendProposal();
  }, [openProposalModal, scrollToSendProposal, useProposalModal]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== `#${SEND_PROPOSAL_SECTION_ID}`) {
      return;
    }
    window.requestAnimationFrame(() => {
      if (useProposalModal) {
        openProposalModal();
        return;
      }
      scrollToSendProposal();
    });
  }, [openProposalModal, scrollToSendProposal, useProposalModal]);

  const handleProposalSubmitted = useCallback(() => {
    setProposalRefreshKey((key) => key + 1);
    onSubmitProposal?.();
  }, [onSubmitProposal]);

  return (
    <div className="select-none bg-white pb-8 pt-6 font-normal text-black antialiased sm:pb-12 sm:pt-8 [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_p]:font-normal [&_span]:font-normal [&_button]:font-normal [&_label]:font-normal">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <TaskStatusTimeline status={project.status || 'open'} />
          <ProjectShareSaveActions project={project} />
        </div>

        <ProjectProfileHero project={project} />

        <div className="mt-8 grid grid-cols-1 items-start gap-8 sm:mt-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
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
                offerRefreshKey={proposalRefreshKey}
                onOfferAccepted={handleProposalSubmitted}
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
          </div>

          <ProjectSidebar
            project={project}
            onSubmitProposal={handleSubmitProposalClick}
            onContactBuyer={onContactBuyer}
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm font-normal text-neutral-500">
            Browse more opportunities on the full projects directory.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
          >
            Back to all projects
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {useProposalModal && !hideSendProposal ? (
        <MakeOfferModal
          isOpen={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          project={project}
          onBidSuccess={handleProposalSubmitted}
        />
      ) : null}
    </div>
  );
}
