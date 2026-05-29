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

export const Sidebar: React.FC<SidebarProps> = ({ activeStep }) => {
  return (
    <div className="w-60 flex-shrink-0 pt-16">
      <h2 className="text-[17px] font-bold text-gray-800 mb-10 px-4">Post a task</h2>
      <nav className="flex flex-col">
        {STEPS.map((step) => {
          const isActive = step.id === activeStep;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 py-3 px-4 relative transition-colors ${
                isActive
                  ? 'text-[#0066ff] font-bold'
                  : 'text-gray-400 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0066ff] rounded-r-full" />
              )}
              <span className="text-[15px]">{step.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};
