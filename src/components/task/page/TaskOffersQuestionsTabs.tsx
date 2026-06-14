'use client';

import { useState } from 'react';
import type { Project } from '@/components/projects/projectListData';
import TaskOffers from './TaskOffers';
import TaskQuestions from './TaskQuestions';

type TabId = 'offers' | 'questions';

interface TaskOffersQuestionsTabsProps {
  project: Project;
  taskStatus?: string;
  initialOfferCount?: number;
  offerRefreshKey?: number;
  onOfferAccepted?: () => void;
  enableWalletGate?: boolean;
}

export default function TaskOffersQuestionsTabs({
  project,
  taskStatus,
  initialOfferCount = 0,
  offerRefreshKey = 0,
  onOfferAccepted,
  enableWalletGate = false,
}: TaskOffersQuestionsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('offers');
  const [offerCount, setOfferCount] = useState(initialOfferCount);
  const [questionCount, setQuestionCount] = useState(project.questions?.length ?? 0);

  const tabButtonClass = (tab: TabId) =>
    `flex-1 min-w-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all sm:px-8 sm:py-3 sm:text-base ${
      activeTab === tab
        ? 'bg-[#000d45] text-white shadow-md'
        : 'bg-transparent text-[#000d45]/70 hover:bg-[#fff3bf] hover:text-[#000d45]'
    }`;

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10">
      <div className="mb-6 flex w-full max-w-full rounded-full bg-[#fff9db] p-1">
        <button type="button" onClick={() => setActiveTab('offers')} className={tabButtonClass('offers')}>
          Offers
          <span className={activeTab === 'offers' ? 'ml-1.5 opacity-80' : 'ml-1.5 opacity-50'}>
            ({offerCount})
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`${tabButtonClass('questions')} flex items-center justify-center gap-1.5`}
        >
          Questions
          <span className={activeTab === 'questions' ? 'opacity-80' : 'opacity-50'}>
            ({questionCount})
          </span>
        </button>
      </div>

      {activeTab === 'offers' ? (
        <TaskOffers
          project={project}
          taskStatus={taskStatus}
          initialOfferCount={initialOfferCount}
          refreshKey={offerRefreshKey}
          onOfferAccepted={onOfferAccepted}
          enableWalletGate={enableWalletGate}
          embedded
          onCountChange={setOfferCount}
        />
      ) : (
        <TaskQuestions project={project} embedded onCountChange={setQuestionCount} />
      )}
    </section>
  );
}
