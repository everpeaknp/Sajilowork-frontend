'use client';

import { useEffect, useState } from 'react';
import type { Project } from '@/components/projects/projectListData';
import {
  fetchListingQuestions,
  type ListingQuestionKind,
} from '@/lib/listingQuestions';
import TaskOffers from './TaskOffers';
import TaskQuestions from './TaskQuestions';

type TabId = 'offers' | 'questions';

interface TaskOffersQuestionsTabsProps {
  project: Project;
  listingKind?: ListingQuestionKind;
  taskStatus?: string;
  initialOfferCount?: number;
  offerRefreshKey?: number;
  onOfferAccepted?: () => void;
  enableWalletGate?: boolean;
}

export default function TaskOffersQuestionsTabs({
  project,
  listingKind = 'task',
  taskStatus,
  initialOfferCount = 0,
  offerRefreshKey = 0,
  onOfferAccepted,
  enableWalletGate = false,
}: TaskOffersQuestionsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('offers');
  const [offerCount, setOfferCount] = useState(initialOfferCount);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    if (!project.slug) {
      setQuestionCount(0);
      return;
    }

    let cancelled = false;
    void fetchListingQuestions(project.slug, listingKind).then((response) => {
      if (cancelled) return;
      if (response.success && response.data) {
        setQuestionCount(response.data.length);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [listingKind, project.slug]);

  const tabButtonClass = (tab: TabId) =>
    `flex-1 min-w-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all sm:px-8 sm:py-3 sm:text-base ${
      activeTab === tab
        ? 'bg-[#52C47F] text-white shadow-md'
        : 'bg-transparent text-neutral-600 hover:bg-[#52C47F]/10 hover:text-[#218F56] dark:text-neutral-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
    }`;

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <div className="mb-6 flex w-full max-w-full rounded-full bg-[#EBF9F1] p-1 dark:bg-emerald-950/40">
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
        <TaskQuestions
          project={project}
          listingKind={listingKind}
          embedded
          onCountChange={setQuestionCount}
        />
      )}
    </section>
  );
}
