'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Banknote, Building2, UserRound } from 'lucide-react';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import UserAvatar from '@/components/common/UserAvatar';
import { ProposalFileLink, ProposalProse, ProposalStatusPill } from '@/components/proposals/ProposalDetailUi';
import ProposalWorkflowPanel from '@/components/proposals/ProposalWorkflowPanel';
import { formatNPR } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import { formatBidDisplayId } from '@/services/bid.service';
import type { Bid, Task } from '@/types';
import { MARKETPLACE_HERO_IMAGE } from '@/lib/placeholderImages';

const HERO_ILLUSTRATION = MARKETPLACE_HERO_IMAGE;

type ProposalDetailHeroCardProps = {
  bid: Bid;
  task: Task | null;
  taskTitle: string;
  counterpartyName: string;
  counterpartyAvatarSrc?: string;
  counterpartyAvatarBg?: string;
  counterpartyLabel?: string;
  counterpartyMode?: 'freelancer' | 'employer';
  offerLabel?: string;
  taskLoading?: boolean;
  userId?: string;
  workflowLoading?: boolean;
  canManageWorkflow?: boolean;
  isServiceOrder?: boolean;
  headerActions?: ReactNode;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
};

export default function ProposalDetailHeroCard({
  bid,
  task,
  taskTitle,
  counterpartyName,
  counterpartyAvatarSrc,
  counterpartyAvatarBg,
  counterpartyLabel = 'Freelancer',
  counterpartyMode = 'freelancer',
  offerLabel = 'Offer amount',
  taskLoading = false,
  userId,
  workflowLoading = false,
  canManageWorkflow = true,
  isServiceOrder = false,
  headerActions,
  onStart,
  onComplete,
  onCancel,
}: ProposalDetailHeroCardProps) {
  const amount = Number(bid.amount) || 0;
  const freelancerAvatarSrc =
    counterpartyMode === 'freelancer' && bid.tasker?.profile_image
      ? getMediaUrl(bid.tasker.profile_image)
      : undefined;
  const avatarSrc = counterpartyAvatarSrc || freelancerAvatarSrc;
  const proposalText = bid.proposal?.trim() || bid.cover_letter?.trim() || '';

  function attachmentLabel(url: string, index: number): string {
    try {
      const name = new URL(url, 'http://localhost').pathname.split('/').pop();
      if (name) return decodeURIComponent(name);
    } catch {
      // ignore
    }
    return `Attachment ${index + 1}`;
  }

  return (
    <section className="overflow-hidden rounded-[20px] border border-neutral-200/80 bg-[#fbf2ed] shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
      <div className="relative flex min-h-[150px] w-full items-stretch overflow-hidden bg-gradient-to-br from-[#fbf2ed] via-[#f7ebe3] to-[#f3e4d8] dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950 sm:min-h-[165px] md:min-h-[175px]">
        <div className="pointer-events-none absolute -left-12 -top-8 z-0 h-28 w-28 select-none rounded-full bg-[#fcd074]/80 dark:bg-amber-500/20 sm:-left-14 sm:-top-9 sm:h-36 sm:w-36" />

        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.2] mix-blend-overlay dark:opacity-[0.12]">
          <svg
            className="h-full w-full text-neutral-500 dark:text-neutral-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 800 400"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M-50,100 C150,150 250,50 450,180 C650,310 750,150 850,220" strokeWidth="1.5" />
            <path d="M-50,130 C150,180 250,80 450,210 C650,340 750,180 850,250" strokeWidth="1.5" />
            <path d="M-50,160 C150,210 250,110 450,240 C650,370 750,210 850,280" strokeWidth="1.5" />
            <path d="M-50,200 C200,280 300,180 500,290 C700,400 800,280 900,320" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative z-10 flex w-full flex-col gap-4 px-4 py-5 sm:px-8 sm:py-6 md:px-12 lg:px-16">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <ProposalStatusPill status={bid.status} />
              <span className="inline-flex items-center rounded-lg bg-white/70 px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300">
                {formatBidDisplayId(bid.id)}
              </span>
            </div>
            {headerActions ? <div className="flex flex-wrap gap-2">{headerActions}</div> : null}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="relative shrink-0">
              {counterpartyMode === 'employer' ? (
                <EmployerAvatarCircle
                  name={counterpartyName}
                  avatarUrl={avatarSrc}
                  avatarBg={counterpartyAvatarBg}
                  sizeClass="h-14 w-14 sm:h-16 sm:w-16"
                  textClass="text-base font-semibold sm:text-lg"
                />
              ) : (
                <UserAvatar
                  src={avatarSrc}
                  name={counterpartyName}
                  alt={counterpartyName}
                  size="xl"
                  className="!h-14 !w-14 ring-2 ring-white shadow-md dark:ring-neutral-800 sm:!h-16 sm:!w-16"
                />
              )}
            </div>

            <div className="min-w-0 flex-1 lg:pr-[min(36%,240px)]">
              <motion.h1
                className="max-w-3xl text-lg font-normal leading-snug tracking-tight text-black dark:text-stone-100 sm:text-2xl md:text-[28px] lg:text-[32px]"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                {taskTitle}
              </motion.h1>

              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-normal text-[#45a874] dark:text-emerald-400">
                {counterpartyMode === 'employer' ? (
                  <Building2 className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <UserRound className="h-4 w-4" strokeWidth={2} />
                )}
                {counterpartyName}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{counterpartyLabel}</p>

              <motion.div
                className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-normal text-black dark:text-stone-100"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
              >
                {amount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 shadow-sm dark:bg-neutral-800/90 dark:shadow-none">
                    <Banknote className="h-4 w-4 stroke-[2] text-neutral-400 dark:text-neutral-500" />
                    <span className="text-neutral-500 dark:text-neutral-400">{offerLabel}:</span>
                    <span className="font-semibold text-neutral-900 dark:text-stone-100">{formatNPR(amount)}</span>
                  </span>
                ) : null}
              </motion.div>
            </div>
          </div>
        </div>

        <motion.img
          src={HERO_ILLUSTRATION}
          alt=""
          className="pointer-events-none absolute bottom-0 right-2 z-10 hidden h-[135px] w-auto max-w-[min(38%,260px)] object-contain object-bottom opacity-95 dark:opacity-80 sm:right-4 sm:h-[145px] lg:block lg:right-6 lg:h-[158px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          referrerPolicy="no-referrer"
          draggable={false}
        />
      </div>

      {proposalText ? (
        <div className="border-t border-neutral-200/50 bg-white/75 px-4 py-5 dark:border-neutral-800 dark:bg-neutral-950/40 sm:px-8 md:px-12 lg:px-16">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-stone-100">Proposal</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Submitted with this offer</p>
          <div className="mt-4">
            <ProposalProse>{proposalText}</ProposalProse>
          </div>
        </div>
      ) : null}

      {bid.attachments && bid.attachments.length > 0 ? (
        <div className="border-t border-neutral-200/50 bg-white/60 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950/30 sm:px-8 md:px-12 lg:px-16">
          <p className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-stone-100">Attachments</p>
          <ul className="mt-3 space-y-2">
            {bid.attachments.map((url, index) => (
              <li key={url}>
                <ProposalFileLink
                  href={getMediaUrl(url)}
                  label={attachmentLabel(url, index)}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-t border-neutral-200/50 bg-white px-4 py-5 dark:border-neutral-800 dark:bg-neutral-900 sm:px-8 sm:py-6 md:px-12 lg:px-16">
        <ProposalWorkflowPanel
          bid={bid}
          task={task}
          taskLoading={taskLoading}
          userId={userId}
          actionLoading={workflowLoading}
          canManageWorkflow={canManageWorkflow}
          isServiceOrder={isServiceOrder}
          embedded
          onStart={onStart}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      </div>
    </section>
  );
}
