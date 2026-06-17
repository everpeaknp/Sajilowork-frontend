'use client';

import { Loader2 } from 'lucide-react';
import type { TaskTimelineStepState } from '@/lib/taskStatusTimeline';
import {
  canCancelMyTask,
  canConfirmWorkComplete,
  getCompletionStatusMessage,
  isTaskReadyToStart,
  resolveMyTaskRoles,
} from '@/lib/taskUtils';
import {
  isServiceOrderBid,
  canServiceOrderSellerStart,
  canServiceOrderPartyComplete,
  isServiceOrderBuyer,
} from '@/lib/proposalDetailUtils';
import { resolveBidListingKind } from '@/lib/buildFreelancerCvData';
import type { Bid, BidStatus, Task } from '@/types';

type ProposalWorkflowPanelProps = {
  bid: Bid;
  task: Task | null;
  taskLoading?: boolean;
  userId?: string;
  actionLoading?: boolean;
  embedded?: boolean;
  canManageWorkflow?: boolean;
  isServiceOrder?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
};

type TimelineStep = {
  id: string;
  label: string;
  date?: string;
};

type TimelineStepWithState = TimelineStep & {
  state: TaskTimelineStepState;
};

const TASK_CONTRACT_STEPS = [
  { id: 'opened', label: 'Opened' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
] as const;

type TaskContractStepId = (typeof TASK_CONTRACT_STEPS)[number]['id'];

const JOB_CONTRACT_STEPS = [
  { id: 'opened', label: 'Opened' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'hired', label: 'Hired' },
] as const;

type JobContractStepId = (typeof JOB_CONTRACT_STEPS)[number]['id'];

type ProposalReviewStepId = 'opened' | 'submitted' | 'review' | 'outcome';

const PROPOSAL_REVIEW_STEPS: { id: ProposalReviewStepId; label: string }[] = [
  { id: 'opened', label: 'Opened' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'review', label: 'Under review' },
  { id: 'outcome', label: 'Decision' },
];

function formatTimelineDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function resolveNestedTask(bid: Bid, task: Task | null): Partial<Task> {
  const nested =
    bid.task && typeof bid.task === 'object' ? (bid.task as Partial<Task>) : {};
  return { ...nested, ...(task ?? {}) };
}

function normalizeTaskStatus(status?: string): string {
  if (!status) return 'assigned';
  if (status === 'draft') return 'open';
  if (status === 'funded') return 'assigned';
  if (status === 'pending_approval' || status === 'disputed') return 'in_progress';
  return status;
}

function resolveTaskContractActiveIndex(task: Task | null, bid: Bid): number {
  const status = normalizeTaskStatus(task?.status);
  if (status === 'cancelled') {
    if (task?.start_date) return 3;
    if (bid.accepted_at) return 2;
    return 1;
  }
  if (status === 'completed') return 4;
  if (status === 'in_progress') return 3;
  if (status === 'assigned') return 2;
  if (bid.accepted_at) return 2;
  if (bid.created_at) return 1;
  return 0;
}

function resolveJobContractActiveIndex(task: Task | null, bid: Bid): number {
  const status = normalizeTaskStatus(task?.status);
  if (status === 'cancelled') {
    if (task?.start_date) return 3;
    if (bid.accepted_at) return 2;
    if (bid.created_at) return 1;
    return 0;
  }
  if (status === 'completed') return 3;
  if (status === 'assigned' || status === 'funded' || bid.accepted_at) return 2;
  if (bid.created_at) return 1;
  return 0;
}

function contractStepState(stepIndex: number, activeIndex: number): TaskTimelineStepState {
  if (stepIndex < activeIndex) return 'complete';
  if (stepIndex === activeIndex) return 'current';
  return 'upcoming';
}

function getTaskContractStepDate(
  stepId: TaskContractStepId,
  bid: Bid,
  taskInfo: Partial<Task>,
  stepIndex: number,
  activeIndex: number,
): string | undefined {
  if (stepIndex > activeIndex) return undefined;

  let raw: string | null | undefined;
  switch (stepId) {
    case 'opened':
      raw = taskInfo.published_at || taskInfo.created_at;
      break;
    case 'submitted':
      raw = bid.created_at;
      break;
    case 'assigned':
      raw = bid.accepted_at;
      break;
    case 'in_progress':
      raw = taskInfo.start_date;
      break;
    case 'completed':
      raw =
        normalizeTaskStatus(taskInfo.status) === 'cancelled'
          ? taskInfo.updated_at
          : taskInfo.completion_date;
      break;
    default:
      raw = undefined;
  }

  return formatTimelineDate(raw);
}

function getJobContractStepDate(
  stepId: JobContractStepId,
  bid: Bid,
  taskInfo: Partial<Task>,
  stepIndex: number,
  activeIndex: number,
): string | undefined {
  if (stepIndex > activeIndex) return undefined;

  let raw: string | null | undefined;
  switch (stepId) {
    case 'opened':
      raw = taskInfo.published_at || taskInfo.created_at;
      break;
    case 'submitted':
      raw = bid.created_at;
      break;
    case 'accepted':
      raw = bid.accepted_at;
      break;
    case 'hired':
      raw =
        normalizeTaskStatus(taskInfo.status) === 'cancelled'
          ? taskInfo.updated_at
          : taskInfo.completion_date || (taskInfo as any).completed_at;
      break;
    default:
      raw = undefined;
  }

  return formatTimelineDate(raw);
}

function buildTaskContractTimeline(bid: Bid, task: Task | null): TimelineStepWithState[] {
  const taskInfo = resolveNestedTask(bid, task);
  const activeIndex = resolveTaskContractActiveIndex(task, bid);
  const isCancelled = normalizeTaskStatus(task?.status) === 'cancelled';

  return TASK_CONTRACT_STEPS.map((step, index) => {
    const isCompletedStep = step.id === 'completed';
    return {
      id: step.id,
      label: isCancelled && isCompletedStep ? 'Cancelled' : step.label,
      date: getTaskContractStepDate(step.id, bid, taskInfo, index, activeIndex),
      state: contractStepState(index, activeIndex),
    };
  });
}

function buildJobContractTimeline(bid: Bid, task: Task | null): TimelineStepWithState[] {
  const taskInfo = resolveNestedTask(bid, task);
  const activeIndex = resolveJobContractActiveIndex(task, bid);
  const isCancelled = normalizeTaskStatus(task?.status) === 'cancelled';

  return JOB_CONTRACT_STEPS.map((step, index) => {
    const isHiredStep = step.id === 'hired';
    return {
      id: step.id,
      label: isCancelled && isHiredStep ? 'Cancelled' : step.label,
      date: getJobContractStepDate(step.id, bid, taskInfo, index, activeIndex),
      state: contractStepState(index, activeIndex),
    };
  });
}

function buildContractTimeline(bid: Bid, task: Task | null): TimelineStepWithState[] {
  if (resolveBidListingKind(bid) === 'job') {
    return buildJobContractTimeline(bid, task);
  }
  return buildTaskContractTimeline(bid, task);
}

function proposalReviewStepState(
  stepId: ProposalReviewStepId,
  status: BidStatus,
): TaskTimelineStepState {
  if (status === 'pending') {
    if (stepId === 'opened' || stepId === 'submitted') return 'complete';
    if (stepId === 'review') return 'current';
    return 'upcoming';
  }
  if (stepId === 'opened' || stepId === 'submitted' || stepId === 'review') return 'complete';
  return 'current';
}

function proposalOutcomeLabel(status: BidStatus): string {
  if (status === 'accepted') return 'Accepted';
  if (status === 'rejected') return 'Rejected';
  if (status === 'withdrawn') return 'Withdrawn';
  if (status === 'expired') return 'Expired';
  return 'Decision';
}

function getProposalReviewStepDate(
  stepId: ProposalReviewStepId,
  bid: Bid,
  taskInfo: Partial<Task>,
  status: BidStatus,
): string | undefined {
  switch (stepId) {
    case 'opened':
      return formatTimelineDate(taskInfo.published_at || taskInfo.created_at);
    case 'submitted':
      return formatTimelineDate(bid.created_at);
    case 'review':
      if (status === 'pending') return undefined;
      return formatTimelineDate(bid.updated_at || bid.created_at);
    case 'outcome':
      if (status === 'accepted') return formatTimelineDate(bid.accepted_at);
      if (status === 'rejected') return formatTimelineDate(bid.rejected_at);
      if (status === 'withdrawn') return formatTimelineDate(bid.withdrawn_at);
      return undefined;
    default:
      return undefined;
  }
}

function buildProposalReviewTimeline(bid: Bid, task: Task | null): TimelineStepWithState[] {
  const taskInfo = resolveNestedTask(bid, task);

  return PROPOSAL_REVIEW_STEPS.map((step) => {
    const label = step.id === 'outcome' ? proposalOutcomeLabel(bid.status) : step.label;
    return {
      id: step.id,
      label,
      date: getProposalReviewStepDate(step.id, bid, taskInfo, bid.status),
      state: proposalReviewStepState(step.id, bid.status),
    };
  });
}

function stepDotClass(state: TaskTimelineStepState): string {
  if (state === 'current') {
    return 'border-[#52C47F] bg-[#52C47F] ring-4 ring-[#52C47F]/15';
  }
  if (state === 'complete') {
    return 'border-[#52C47F] bg-[#52C47F]';
  }
  if (state === 'skipped') {
    return 'border-neutral-200 bg-neutral-100';
  }
  return 'border-neutral-200 bg-white';
}

function stepLabelClass(state: TaskTimelineStepState): string {
  if (state === 'current') return 'font-semibold text-neutral-900';
  if (state === 'complete') return 'font-medium text-neutral-700';
  if (state === 'skipped') return 'font-medium text-neutral-400 line-through';
  return 'font-medium text-neutral-400';
}

function WorkflowStepper({ steps }: { steps: TimelineStepWithState[] }) {
  const progress =
    steps.length > 1
      ? (() => {
          let lastActive = -1;
          steps.forEach((step, index) => {
            if (step.state === 'complete' || step.state === 'current') lastActive = index;
          });
          return lastActive <= 0 ? 0 : (lastActive / (steps.length - 1)) * 100;
        })()
      : 0;

  return (
    <div className="relative">
      <div
        className="absolute left-0 right-0 top-[11px] hidden h-0.5 bg-neutral-100 sm:block"
        aria-hidden
      >
        <div
          className="h-full bg-[#52C47F] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol
        className="relative grid gap-4 sm:grid-cols-[repeat(var(--steps),minmax(0,1fr))]"
        style={{ ['--steps' as string]: steps.length }}
      >
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center"
          >
            <span
              className={`relative z-[1] mt-0.5 h-[22px] w-[22px] shrink-0 rounded-full border-2 transition-colors ${stepDotClass(step.state)}`}
              aria-hidden
            />
            <div className="min-w-0">
              <p className={`text-sm ${stepLabelClass(step.state)}`}>{step.label}</p>
              {step.date ? (
                <p className="mt-0.5 text-xs text-neutral-500">{step.date}</p>
              ) : step.state === 'upcoming' ? null : (
                <p className="mt-0.5 text-xs text-neutral-400">Pending</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ContractActions({
  task,
  bid,
  userId,
  actionLoading,
  onStart,
  onComplete,
  onCancel,
  canManageWorkflow = true,
  isServiceOrder = false,
  isJobApplication = false,
}: {
  task: Task;
  bid: Bid;
  userId?: string;
  actionLoading?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  canManageWorkflow?: boolean;
  isServiceOrder?: boolean;
  isJobApplication?: boolean;
}) {
  if (!canManageWorkflow) {
    return null;
  }

  const { isOwner } = resolveMyTaskRoles(task, userId);
  const rawStatus = task.status;
  const isServiceOrderWorkflow =
    isServiceOrder || isServiceOrderBid(bid, task);
  const canStart =
    !isJobApplication &&
    Boolean(onStart) &&
    (isServiceOrderWorkflow
      ? canServiceOrderSellerStart(bid, task, userId)
      : isOwner && isTaskReadyToStart(rawStatus));
  const canHire =
    isJobApplication &&
    Boolean(onComplete) &&
    isOwner &&
    (rawStatus === 'assigned' || rawStatus === 'funded' || rawStatus === 'in_progress');
  const canComplete =
    !isJobApplication &&
    Boolean(onComplete) &&
    (isServiceOrderWorkflow
      ? canServiceOrderPartyComplete(bid, task, userId)
      : canConfirmWorkComplete(task, userId));
  const canCancel =
    Boolean(onCancel) &&
    (isJobApplication ? isOwner && canCancelMyTask(task, userId) : canCancelMyTask(task, userId));
  const completionMessage =
    isJobApplication && !isOwner ? null : getCompletionStatusMessage(task, userId);

  if (!canStart && !canHire && !canComplete && !canCancel && !completionMessage) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {canStart ? (
          <button
            type="button"
            disabled={actionLoading}
            onClick={onStart}
            className="rounded-lg bg-[#52C47F] px-4 py-2 text-sm text-white transition-colors hover:bg-[#49b071] disabled:opacity-60"
          >
            {actionLoading ? 'Processing…' : 'Start'}
          </button>
        ) : null}
        {canHire ? (
          <button
            type="button"
            disabled={actionLoading}
            onClick={onComplete}
            className="rounded-lg bg-[#52C47F] px-4 py-2 text-sm text-white transition-colors hover:bg-[#49b071] disabled:opacity-60"
          >
            {actionLoading ? 'Processing…' : 'Hire'}
          </button>
        ) : null}
        {canComplete ? (
          <button
            type="button"
            disabled={actionLoading}
            onClick={onComplete}
            className="rounded-lg bg-[#52C47F] px-4 py-2 text-sm text-white transition-colors hover:bg-[#49b071] disabled:opacity-60"
          >
            {actionLoading
              ? 'Processing…'
              : isServiceOrderWorkflow && isServiceOrderBuyer(bid, task, userId)
                ? 'Complete'
                : isOwner
                  ? 'Complete'
                  : 'Mark complete'}
          </button>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            disabled={actionLoading}
            onClick={onCancel}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
      </div>
      {completionMessage ? (
        <p className="max-w-xl text-sm text-neutral-600">{completionMessage}</p>
      ) : null}
    </div>
  );
}

function formatWorkflowStatusLabel(task: Task, bid: Bid): string {
  if (resolveBidListingKind(bid) === 'job') {
    switch (normalizeTaskStatus(task.status)) {
      case 'assigned':
      case 'funded':
        return 'Accepted';
      case 'in_progress':
      case 'pending_approval':
      case 'disputed':
        return 'Accepted';
      case 'completed':
        return 'Hired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return task.status.replace(/_/g, ' ');
    }
  }
  return task.status.replace(/_/g, ' ');
}

function WorkflowHeader({
  title,
  subtitle,
  taskLoading,
  task,
  bid,
}: {
  title: string;
  subtitle: string;
  taskLoading?: boolean;
  task?: Task | null;
  bid?: Bid;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52C47F]">
          {subtitle}
        </p>
        <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-neutral-900">{title}</h3>
      </div>
      {taskLoading ? (
        <span className="inline-flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Syncing status…
        </span>
      ) : task ? (
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-700">
          {bid ? formatWorkflowStatusLabel(task, bid) : task.status.replace(/_/g, ' ')}
        </span>
      ) : null}
    </div>
  );
}

function WorkflowBody({
  bid,
  task,
  taskLoading,
  userId,
  actionLoading,
  embedded,
  canManageWorkflow = true,
  isServiceOrder = false,
  onStart,
  onComplete,
  onCancel,
}: ProposalWorkflowPanelProps) {
  const isAcceptedContract = bid.status === 'accepted';
  const isJobApplication = resolveBidListingKind(bid) === 'job';
  const steps = isAcceptedContract
    ? buildContractTimeline(bid, task)
    : buildProposalReviewTimeline(bid, task);

  const content = (
    <>
      <WorkflowHeader
        title={isAcceptedContract ? 'Progress timeline' : 'Review timeline'}
        subtitle={
          isAcceptedContract
            ? isJobApplication
              ? 'Application workflow'
              : 'Contract workflow'
            : 'Proposal workflow'
        }
        taskLoading={taskLoading}
        task={isAcceptedContract ? task : null}
        bid={bid}
      />
      <WorkflowStepper steps={steps} />
      {isAcceptedContract && task ? (
        <ContractActions
          task={task}
          bid={bid}
          userId={userId}
          actionLoading={actionLoading}
          canManageWorkflow={canManageWorkflow}
          isServiceOrder={isServiceOrder}
          isJobApplication={isJobApplication}
          onStart={onStart}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      ) : null}
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      {content}
    </section>
  );
}

export default function ProposalWorkflowPanel(props: ProposalWorkflowPanelProps) {
  return <WorkflowBody {...props} />;
}
