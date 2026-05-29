"use client";
import React from 'react';

export type StepId = 'title-date' | 'location' | 'details' | 'budget';

export interface Step {
  id: StepId;
  label: string;
}

export const STEPS: Step[] = [
  { id: 'title-date', label: 'Title & Date' },
  { id: 'location', label: 'Location' },
  { id: 'details', label: 'Details' },
  { id: 'budget', label: 'Budget' },
];

interface SidebarProps {
  activeStep: StepId;
}

export const MobileStepProgress: React.FC<SidebarProps> = ({ activeStep }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === activeStep);
  const current = STEPS[currentIndex];

  return (
    <div className="shrink-0 border-b border-outline-variant/60 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
          Post a task
        </p>
        <p className="text-xs font-semibold text-gray-400">
          {currentIndex + 1} / {STEPS.length}
        </p>
      </div>
      <div className="flex gap-1.5" aria-hidden>
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index <= currentIndex ? 'bg-[#0066ff]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {current && (
        <p className="mt-2 truncate text-sm font-bold text-[#0066ff]">{current.label}</p>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeStep }) => {
  const activeIndex = STEPS.findIndex((s) => s.id === activeStep);

  return (
    <aside className="hidden w-56 shrink-0 border-r border-gray-100 bg-gray-50/50 lg:block xl:w-64">
      <div className="sticky top-0 px-5 py-8 xl:px-6 xl:py-10">
        <h2 className="mb-8 text-[17px] font-bold text-gray-800 xl:mb-10">Post a task</h2>
        <nav className="flex flex-col gap-1" aria-label="Post task steps">
          {STEPS.map((step, index) => {
            const isActive = step.id === activeStep;
            const isComplete = index < activeIndex;
            return (
              <div
                key={step.id}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-3 transition-colors xl:px-4 xl:py-3.5 ${
                  isActive
                    ? 'bg-white font-bold text-[#0066ff] shadow-sm'
                    : isComplete
                      ? 'font-semibold text-gray-600'
                      : 'font-medium text-gray-400'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#0066ff]" />
                )}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-[#0066ff] text-white'
                      : isComplete
                        ? 'bg-[#0066ff]/15 text-[#0066ff]'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-[15px] leading-tight">{step.label}</span>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
