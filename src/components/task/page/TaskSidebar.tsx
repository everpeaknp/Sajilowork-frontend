'use client';

import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { getProjectBuyerMeta, type Project } from '@/components/projects/projectListData';
import { getMediaUrl } from '@/lib/utils';
import { getTaskPosterProfileSlug } from '@/lib/taskUtils';
import type { ReactNode } from 'react';
import type { Task } from '@/types';

export type SidebarPrimaryAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

interface TaskSidebarProps {
  task: Task;
  project: Project;
  onMakeOffer?: () => void;
  /** Custom sidebar CTA; `null` hides the button; omit for default “Make an Offer”. */
  primaryAction?: SidebarPrimaryAction | null;
  /** Rendered below the “About the poster” card (e.g. More options). */
  belowPoster?: ReactNode;
}

export default function TaskSidebar({
  task,
  project,
  onMakeOffer,
  primaryAction,
  belowPoster,
}: TaskSidebarProps) {
  const buyer = getProjectBuyerMeta(project);
  const profileSlug = getTaskPosterProfileSlug(task);
  const profileHref = profileSlug ? `/users/${encodeURIComponent(profileSlug)}` : null;
  const posterName = project.companyName;
  const posterAvatar = project.ownerAvatarUrl || getMediaUrl(task.owner_image);

  const posterProfile = (
    <>
      <div className="relative shrink-0">
        <UserAvatar
          src={posterAvatar}
          alt={posterName}
          name={posterName}
          size="lg"
          verified={project.verified}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[17px] font-normal text-black hover:text-[#52C47F]">{posterName}</p>
        <p className="mt-1 text-[15px] font-normal text-neutral-500">{project.category}</p>
        {(buyer.rating > 0 || buyer.reviews > 0) && (
          <div className="mt-2 flex items-center gap-1.5 text-[15px] font-normal text-black">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{buyer.rating.toFixed(1)}</span>
            <span className="text-neutral-500">({buyer.reviews} reviews)</span>
          </div>
        )}
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
          <p className="mt-1.5 text-[15px] font-normal text-neutral-500">{project.type} budget</p>

          {primaryAction === null ? null : primaryAction ? (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              className="group/btn relative mt-6 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-md bg-[#52C47F] px-6 py-4 text-base font-normal text-white transition-colors hover:bg-[#49b071] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                {primaryAction.label}
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onMakeOffer}
              className="group/btn relative mt-6 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-md bg-[#52C47F] px-6 py-4 text-base font-normal text-white transition-colors hover:bg-[#49b071]"
            >
              <span className="flex items-center gap-2">
                Make an Offer
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </span>
            </button>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <h3 className="mb-5 text-xl font-normal tracking-tight text-black">About the poster</h3>

          {profileHref ? (
            <Link
              href={profileHref}
              className="flex items-start gap-3.5 transition-opacity hover:opacity-80"
            >
              {posterProfile}
            </Link>
          ) : (
            <div className="flex items-start gap-3.5">{posterProfile}</div>
          )}

          <div className="mt-6 border-t border-neutral-200 pt-5">
            <p className="text-xs font-normal text-neutral-400">Location</p>
            <p className="mt-1.5 text-sm font-normal text-black">{buyer.buyerLocation}</p>
          </div>

          {profileHref ? (
            <Link
              href={profileHref}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[#52C47F] bg-white px-6 py-3.5 text-[15px] font-normal text-[#52C47F] transition-colors hover:border-[#52C47F] hover:bg-[#52C47F] hover:text-white"
            >
              View profile
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
          ) : null}
        </div>

        {belowPoster ? (
          <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            {belowPoster}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
