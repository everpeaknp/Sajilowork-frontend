'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import MakeOfferModal from '@/components/task/modals/MakeOfferModal';
import { useAuth } from '@/hooks/useAuth';
import { getJobDetailPath, getJobEditHref, isJobOwner } from './jobSlug';
import JobAbout from './JobAbout';
import JobKeyResponsibilities from './JobKeyResponsibilities';
import JobSkillsRequired from './JobSkillsRequired';
import JobProfileHero from './JobProfileHero';
import JobRelatedJobs from './JobRelatedJobs';
import JobSendApplication from './JobSendApplication';
import JobShareSaveActions from './JobShareSaveActions';
import JobWorkExperience from './JobWorkExperience';
import type { Job } from './jobListData';

export const APPLY_JOB_SECTION_ID = 'apply-for-job';

interface SingleJobPageProps {
  job: Job;
  relatedJobs?: Job[];
  /** Full-page job detail: open wallet-gated apply modal instead of inline form. */
  applicationPresentation?: 'inline' | 'modal';
  hideApplication?: boolean;
}

export default function SingleJobPage({
  job,
  relatedJobs,
  applicationPresentation = 'inline',
  hideApplication = false,
}: SingleJobPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const useApplicationModal = applicationPresentation === 'modal';
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const applySectionRef = useRef<HTMLDivElement>(null);
  const isOwner = isJobOwner(job, user?.id);
  const editHref = getJobEditHref(job);

  const scrollToApply = useCallback(() => {
    applySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const field = document.getElementById('job-offer-amount');
      if (field instanceof HTMLElement) {
        field.focus({ preventScroll: true });
      }
    }, 450);
  }, []);

  const openApplicationModal = useCallback(() => {
    if (!user) {
      toast.error('Please sign in to apply for this job.');
      const redirectPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : getJobDetailPath(job);
      router.push(`/signin?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    const isOwnerCheck = isJobOwner(job, user.id);
    if (isOwnerCheck) {
      router.push(getJobEditHref(job));
      return;
    }

    setShowApplicationModal(true);
  }, [job, router, user]);

  const handleApplyClick = useCallback(() => {
    if (isOwner) {
      router.push(editHref);
      return;
    }
    if (useApplicationModal) {
      openApplicationModal();
      return;
    }
    scrollToApply();
  }, [editHref, isOwner, openApplicationModal, router, scrollToApply, useApplicationModal]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== `#${APPLY_JOB_SECTION_ID}`) {
      return;
    }
    window.requestAnimationFrame(() => {
      if (useApplicationModal) {
        openApplicationModal();
        return;
      }
      scrollToApply();
    });
  }, [openApplicationModal, scrollToApply, useApplicationModal]);

  return (
    <div className="select-none bg-white pb-8 pt-6 font-normal text-black antialiased sm:pb-12 sm:pt-8 [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end sm:mb-5">
          <JobShareSaveActions job={job} />
        </div>

        <JobProfileHero job={job} onApply={handleApplyClick} isOwner={isOwner} editHref={editHref} />

        <div className="mx-auto w-full max-w-3xl">
          <JobAbout job={job} />
          <div className="mt-10 sm:mt-12">
            <JobSkillsRequired job={job} />
          </div>
          <JobKeyResponsibilities job={job} />
          <JobWorkExperience job={job} onApply={handleApplyClick} isOwner={isOwner} editHref={editHref} />
          {!hideApplication && !useApplicationModal ? (
            <div
              id={APPLY_JOB_SECTION_ID}
              ref={applySectionRef}
              className="mt-12 scroll-mt-28"
            >
              <JobSendApplication job={job} />
            </div>
          ) : null}
          <JobRelatedJobs job={job} relatedJobs={relatedJobs} />

          <div className="mt-10 flex flex-col items-center gap-4 text-center sm:mt-14 sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm font-normal text-neutral-500">
              Browse more opportunities on the full jobs directory.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
            >
              Back to all jobs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {useApplicationModal && !hideApplication ? (
        <MakeOfferModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          job={job}
        />
      ) : null}
    </div>
  );
}
