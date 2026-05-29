'use client';

import {
  getSimplifiedTimelineStepState,
  getSimplifiedTimelineSteps,
  type SimplifiedStatusStepId,
  type TaskTimelineStepState,
} from '@/lib/taskStatusTimeline';

type TaskStatusTimelineProps = {
  status: string;
  className?: string;
};

function stepClass(state: TaskTimelineStepState, stepId: SimplifiedStatusStepId): string {
  const base =
    'text-[10px] uppercase tracking-[0.06em] whitespace-nowrap transition-colors leading-none';

  if (state === 'current') {
    if (stepId === 'cancelled') {
      return `${base} rounded-full bg-red-100 px-2 py-0.5 font-bold text-[#000d45]`;
    }
    return `${base} rounded-full bg-[#a3e397] px-2 py-0.5 font-bold text-[#000d45]`;
  }

  return `${base} font-medium text-[#9aa3b8]`;
}

export default function TaskStatusTimeline({ status, className = '' }: TaskStatusTimelineProps) {
  const steps = getSimplifiedTimelineSteps(status);

  return (
    <div
      className={`flex flex-wrap items-center gap-3 sm:gap-4 ${className}`}
      role="list"
      aria-label="Task status"
    >
      {steps.map((step) => {
        const state = getSimplifiedTimelineStepState(step.id, status);

        return (
          <span
            key={step.id}
            role="listitem"
            className={stepClass(state, step.id)}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            {step.label}
          </span>
        );
      })}
    </div>
  );
}
