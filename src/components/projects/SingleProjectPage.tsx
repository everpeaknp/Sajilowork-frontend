'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ProjectProfileHero from './ProjectProfileHero';
import ProjectAbout from './ProjectAbout';
import ProjectSidebar from './ProjectSidebar';
import ProjectSkillsRequired from './ProjectSkillsRequired';
import ProjectAttachments from './ProjectAttachments';
import ProjectGallery from './ProjectGallery';
import ProjectProposals from './ProjectProposals';
import ProjectSendProposal from './ProjectSendProposal';
import ProjectQuestions from './ProjectQuestions';
import ProjectShareSaveActions from './ProjectShareSaveActions';
import type { Project } from './projectListData';

export const SEND_PROPOSAL_SECTION_ID = 'send-your-proposal';

interface SingleProjectPageProps {
  project: Project;
  onSubmitProposal?: () => void;
  onContactBuyer?: () => void;
}

export default function SingleProjectPage({
  project,
  onSubmitProposal,
  onContactBuyer,
}: SingleProjectPageProps) {
  const [proposalRefreshKey, setProposalRefreshKey] = useState(0);
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

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== `#${SEND_PROPOSAL_SECTION_ID}`) {
      return;
    }
    window.requestAnimationFrame(() => {
      scrollToSendProposal();
    });
  }, [scrollToSendProposal]);

  return (
    <div className="select-none bg-white pb-12 pt-8 font-normal text-black antialiased [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_p]:font-normal [&_span]:font-normal [&_button]:font-normal [&_label]:font-normal">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex justify-end">
          <ProjectShareSaveActions project={project} />
        </div>

        <ProjectProfileHero project={project} />

        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <ProjectAbout project={project} />

            <div className="mt-12">
              <ProjectSkillsRequired project={project} />
            </div>
            <ProjectAttachments project={project} />
            <ProjectGallery project={project} />
            <div className="mt-12">
              <ProjectProposals project={project} refreshKey={proposalRefreshKey} />
            </div>
            <div
              id={SEND_PROPOSAL_SECTION_ID}
              ref={sendProposalRef}
              className="mt-12 scroll-mt-28"
            >
              <ProjectSendProposal
                project={project}
                onSubmitted={() => {
                  setProposalRefreshKey((key) => key + 1);
                  onSubmitProposal?.();
                }}
              />
            </div>
            <ProjectQuestions project={project} />
          </div>

          <ProjectSidebar
            project={project}
            onSubmitProposal={scrollToSendProposal}
            onContactBuyer={onContactBuyer}
          />
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4">
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
    </div>
  );
}
