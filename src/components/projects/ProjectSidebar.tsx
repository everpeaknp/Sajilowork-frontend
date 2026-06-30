'use client';

import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isProjectOpenForBids } from '@/lib/taskUtils';
import { resolveEmployerProfileHref } from '@/components/employers/employerSlug';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import { getProjectBuyerMeta, type Project } from './projectListData';
import type { ReactNode } from 'react';

function CompanyLogo({
  type,
  className = 'h-6 w-6 text-white',
}: {
  type: Project['companyIconType'];
  className?: string;
}) {
  if (type === 'wave') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M2 10s3-3 5-3 5 3 7 3 5-3 7-3M2 17s3-3 5-3 5 3 7 3 5-3 7-3" />
      </svg>
    );
  }
  if (type === 'face') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="8" cy="9" r="1.5" fill="currentColor" />
        <circle cx="16" cy="9" r="1.5" fill="currentColor" />
        <path d="M8.5 14.5c1.5 2 4.5 2 6 0" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'in') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22v-3M9 19c-1.5 0-3-1.5-3-3s1.5-3 3-3 3 1.5 3 3-1.5 3-3 3zM15 19c1.5 0 3-1.5 3-3s-1.5-3-3-3-3 1.5-3 3 1.5 3 3 3zM12 2v3M9 5C7.5 5 6 6.5 6 8s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3zM15 5c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3z" />
    </svg>
  );
}

interface ProjectSidebarProps {
  project: Project;
  onSubmitProposal?: () => void;
  onContactBuyer?: () => void;
  /** Rendered below the “About Buyer” card (e.g. Share / Save on map overlay). */
  belowBuyer?: ReactNode;
}

export default function ProjectSidebar({
  project,
  onSubmitProposal,
  onContactBuyer,
  belowBuyer,
}: ProjectSidebarProps) {
  const { user } = useAuth();
  const buyer = getProjectBuyerMeta(project);
  const offersOpen = isProjectOpenForBids(project);
  const isOwner =
    Boolean(user?.id) && Boolean(project.ownerId) && String(user?.id) === String(project.ownerId);
  const employerHref = resolveEmployerProfileHref({
    employerSlug: project.employerSlug,
    companyName: project.companyName,
    allowDemoLookup: !project.slug,
  });

  const buyerProfile = (
    <>
      <div className="relative shrink-0">
        <EmployerAvatarCircle
          name={project.employerLogoText || project.companyName}
          avatarUrl={project.ownerAvatarUrl}
          avatarBg={project.companyLogoBg}
          verified={project.verified}
          sizeClass="h-14 w-14"
          textClass="text-base font-semibold"
          useDemoIcon={!project.slug}
          iconType={project.companyIconType}
          renderIcon={(type, className) => (
            <CompanyLogo type={type} className={className} />
          )}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[17px] font-normal text-black hover:text-[#52C47F]">{project.companyName}</p>
        <p className="mt-1 text-[15px] font-normal text-neutral-500">{project.category}</p>
        <div className="mt-2 flex items-center gap-1.5 text-[15px] font-normal text-black">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>{buyer.rating.toFixed(1)}</span>
          <span className="text-neutral-500">({buyer.reviews} reviews)</span>
        </div>
      </div>
    </>
  );

  return (
    <aside className="mx-auto w-full max-w-none sm:max-w-[20rem] lg:sticky lg:top-20 lg:col-span-4 lg:mx-0 lg:ml-auto lg:max-w-[19.5rem] lg:self-start">
      <div className="space-y-5">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <p className="text-[26px] font-normal tracking-tight text-black sm:text-[28px]">
            {project.budgetLabel}
          </p>
          <p className="mt-1.5 text-[15px] font-normal text-neutral-500">{project.type} Rate</p>

          {offersOpen && !isOwner ? (
            <button
              type="button"
              onClick={onSubmitProposal}
              className="group/btn relative mt-6 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-md bg-[#52C47F] px-6 py-4 text-base font-normal text-white transition-colors hover:bg-[#49b071]"
            >
              <span className="flex items-center gap-2">
                Submit a Proposal
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </span>
            </button>
          ) : null}
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <h3 className="mb-5 text-xl font-normal tracking-tight text-black">About Buyer</h3>

          {employerHref ? (
            <Link
              href={employerHref}
              className="flex items-start gap-3.5 transition-opacity hover:opacity-80"
            >
              {buyerProfile}
            </Link>
          ) : (
            <div className="flex items-start gap-3.5">{buyerProfile}</div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-5 text-center">
            <div>
              <p className="text-xs font-normal text-neutral-400">Location</p>
              <p className="mt-1.5 text-sm font-normal text-black">{buyer.buyerLocation}</p>
            </div>
            <div>
              <p className="text-xs font-normal text-neutral-400">Employees</p>
              <p className="mt-1.5 text-sm font-normal text-black">{buyer.employees}</p>
            </div>
            <div>
              <p className="text-xs font-normal text-neutral-400">Departments</p>
              <p className="mt-1.5 text-sm font-normal text-black">{buyer.department}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onContactBuyer}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[#52C47F] bg-white px-6 py-3.5 text-[15px] font-normal text-[#52C47F] transition-colors hover:border-[#52C47F] hover:bg-[#52C47F] hover:text-white"
          >
            Contact Buyer
            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {belowBuyer ? (
          <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            {belowBuyer}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
