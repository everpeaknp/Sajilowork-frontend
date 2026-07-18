'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ChevronRight, CornerDownRight, ExternalLink, Filter, Search, Send } from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from '@/components/common/UserAvatar';
import { taskService } from '@/services/task.service';
import {
  dashboardQuestionsViewForRole,
  extractDashboardQuestions,
  listingQuestionDetailPath,
  type DashboardQuestionItem,
} from '@/lib/dashboardQuestions';
import {
  answerListingQuestion,
  LISTING_QUESTIONS_CHANGED_EVENT,
  notifyListingQuestionsChanged,
  resolveListingQuestionKind,
} from '@/lib/listingQuestions';
import { useDashboardSidebarRole } from './DashboardRoleSwitchContext';
import { matchesSearchQuery } from './dashboardListSearch';
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_PAGINATION_ARROW_PLAIN,
  DASHBOARD_PAGINATION_INNER,
  DASHBOARD_PAGINATION_OUTER,
  DASHBOARD_SUBTABS_ROW,
  DASHBOARD_SUBTABS_WRAP,
  dashboardPageButtonClass,
  dashboardSubtabClass,
} from './dashboardResponsive';

type QuestionListingType = 'job' | 'service' | 'project' | 'task';
type QuestionTypeFilter = 'all' | QuestionListingType;
type QuestionStatusFilter = 'all' | 'open' | 'answered';

const QUESTION_TYPE_TABS: { key: QuestionTypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'job', label: 'Jobs' },
  { key: 'service', label: 'Services' },
  { key: 'project', label: 'Projects' },
  { key: 'task', label: 'Tasks' },
];

const QUESTION_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Awaiting reply' },
  { value: 'answered', label: 'Answered' },
];

function resolveQuestionListingType(kind?: string | null): QuestionListingType {
  if (kind === 'job') return 'job';
  if (kind === 'service') return 'service';
  if (kind === 'project') return 'project';
  return 'task';
}

function matchesQuestionTypeFilter(
  kind: string | null | undefined,
  filter: QuestionTypeFilter,
): boolean {
  if (filter === 'all') return true;
  return resolveQuestionListingType(kind) === filter;
}

function matchesQuestionStatusFilter(
  item: DashboardQuestionItem,
  filter: QuestionStatusFilter,
): boolean {
  if (filter === 'all') return true;
  const answered = Boolean(item.answer?.trim());
  if (filter === 'answered') return answered;
  return !answered;
}

function formatRelativeTime(iso?: string | null): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

export default function DashboardQuestions() {
  const sidebarRole = useDashboardSidebarRole();
  const dashboardRole = sidebarRole === 'customer' ? 'customer' : 'tasker';
  const view = dashboardQuestionsViewForRole(dashboardRole);

  const [questions, setQuestions] = useState<DashboardQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<QuestionTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<QuestionStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submittingAnswerId, setSubmittingAnswerId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await taskService.getDashboardQuestions(view);
      if (!response.success) {
        throw new Error(response.message || 'Could not load questions');
      }
      setQuestions(extractDashboardQuestions(response.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load questions';
      setLoadError(message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    const refresh = () => {
      void loadQuestions();
    };
    window.addEventListener(LISTING_QUESTIONS_CHANGED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(LISTING_QUESTIONS_CHANGED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loadQuestions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((item) => {
      if (!matchesQuestionTypeFilter(item.task_listing_kind, typeFilter)) return false;
      if (!matchesQuestionStatusFilter(item, statusFilter)) return false;
      return matchesSearchQuery(
        searchQuery,
        item.task_title,
        item.asked_by_name,
        item.question,
        item.answer,
        item.task_slug,
      );
    });
  }, [questions, searchQuery, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const unansweredCount = useMemo(
    () => filteredQuestions.filter((item) => !item.answer?.trim()).length,
    [filteredQuestions],
  );

  const handleAnswer = async (item: DashboardQuestionItem) => {
    const trimmed = (answerDrafts[item.id] || '').trim();
    if (!trimmed || !item.task_slug) return;

    const listingKind = resolveListingQuestionKind(item.task_listing_kind);

    setSubmittingAnswerId(item.id);
    try {
      const response = await answerListingQuestion(
        item.task_slug,
        item.id,
        trimmed,
        listingKind,
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Could not publish reply');
      }

      setQuestions((prev) =>
        prev.map((question) =>
          question.id === item.id
            ? {
                ...question,
                answer: response.data?.answer || trimmed,
                answered_at: response.data?.answered_at || new Date().toISOString(),
                is_answered: true,
                can_answer: false,
              }
            : question,
        ),
      );
      setAnswerDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      toast.success('Reply published');
      notifyListingQuestionsChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not publish reply');
    } finally {
      setSubmittingAnswerId(null);
    }
  };

  const emptyMessage =
    questions.length === 0
      ? dashboardRole === 'customer'
        ? 'No questions on your listings yet.'
        : 'You have not asked any listing questions yet.'
      : 'No questions match your filters.';

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} relative flex min-h-[calc(100dvh-7.5rem)] flex-col sm:min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-5.5rem)]`}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className={`${DASHBOARD_SUBTABS_WRAP} shrink-0 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
            <div className={`${DASHBOARD_SUBTABS_ROW} min-w-0 flex-1 overflow-x-auto`}>
              {QUESTION_TYPE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setTypeFilter(tab.key);
                    setCurrentPage(1);
                  }}
                  className={dashboardSubtabClass(typeFilter === tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mb-3 flex w-full flex-col gap-2 sm:mb-3.5 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
              {dashboardRole === 'customer' && unansweredCount > 0 ? (
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:mr-1">
                  {unansweredCount} open
                </span>
              ) : null}

              <div className="relative flex w-full items-center rounded-xl border border-neutral-200/80 bg-neutral-50 px-3 shadow-sm sm:w-[240px] md:w-[280px] dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                <Search className="mr-2 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search questions…"
                  aria-label="Search questions"
                  className="w-full border-0 bg-transparent py-2.5 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:placeholder:text-neutral-500"
                />
              </div>

              <div className="flex w-full items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50 px-3 py-2 shadow-sm sm:w-auto dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                <Filter className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                <span className="shrink-0 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as QuestionStatusFilter);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by status"
                  className="max-w-[220px] flex-1 cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-neutral-800 outline-none focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:[color-scheme:dark]"
                >
                  {QUESTION_STATUS_FILTER_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-white text-neutral-800 dark:bg-neutral-900 dark:text-stone-100"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-6 sm:px-6 md:px-8 md:pb-8">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-20 text-center text-sm text-neutral-400">
              Loading questions…
            </div>
          ) : loadError ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-neutral-500">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadQuestions()}
                className="mt-4 cursor-pointer rounded-xl bg-[#FCF0ED] px-6 py-2.5 text-sm font-medium text-[#218F56] transition-all hover:bg-[#FCE6E1]"
              >
                Try again
              </button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-20 text-center text-sm text-neutral-400">
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-8">
              {paginatedQuestions.map((item) => {
                const listingHref = item.task_slug
                  ? listingQuestionDetailPath(item.task_slug, item.task_listing_kind)
                  : null;
                const hasAnswer = Boolean(item.answer?.trim());
                const canAnswer = Boolean(item.can_answer && !hasAnswer && item.task_slug);
                const listingType = resolveQuestionListingType(item.task_listing_kind);

                return (
                  <div key={item.id} className="border-b border-neutral-100 pb-8 last:border-0 last:pb-0 dark:border-neutral-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                        <UserAvatar
                          src={item.asked_by_image}
                          name={item.asked_by_name || 'User'}
                          size="lg"
                          className="h-[52px] w-[52px] shrink-0"
                        />
                        <div className="min-w-0 space-y-1">
                          <h4 className="text-[15px] font-medium leading-tight tracking-tight text-neutral-900 dark:text-stone-100">
                            {item.asked_by_name || 'User'}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-500">
                            <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium capitalize text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                              {listingType}
                            </span>
                            {item.created_at ? (
                              <span className="font-normal text-neutral-400">
                                {formatRelativeTime(item.created_at)}
                              </span>
                            ) : null}
                            {item.task_title ? (
                              <>
                                <span className="text-neutral-200">|</span>
                                <span className="font-normal text-neutral-400">{item.task_title}</span>
                              </>
                            ) : null}
                            {!hasAnswer && dashboardRole === 'customer' ? (
                              <>
                                <span className="text-neutral-200">|</span>
                                <span className="rounded-full bg-[#FCF0ED] px-2.5 py-0.5 text-[11px] font-medium text-[#218F56]">
                                  Awaiting reply
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {listingHref ? (
                        <Link
                          href={listingHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-[#FCF0ED] px-4 py-2.5 text-sm font-medium text-[#218F56] transition-all hover:bg-[#FCE6E1]"
                        >
                          View listing
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </div>

                    <p className="mt-5 max-w-[840px] font-sans text-sm font-normal leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {item.question}
                    </p>

                    {hasAnswer ? (
                      <div className="animate-in fade-in mt-4 ml-6 max-w-[800px] rounded-r-xl border-l-2 border-[#52C47F]/40 bg-[#FAFBF9] p-4 duration-300 dark:bg-neutral-800/50">
                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#183B32] dark:text-[#52C47F]">
                          <CornerDownRight className="h-3.5 w-3.5 text-[#52C47F]" />
                          <span className="uppercase tracking-wider">
                            {dashboardRole === 'customer' ? 'Your Response' : 'Listing Owner Response'}
                          </span>
                        </div>
                        <p className="text-sm font-normal italic text-neutral-600 dark:text-neutral-300">
                          &quot;{item.answer}&quot;
                        </p>
                        {item.answered_at ? (
                          <p className="mt-2 text-xs text-neutral-400">
                            {formatRelativeTime(item.answered_at)}
                          </p>
                        ) : null}
                      </div>
                    ) : canAnswer ? (
                      <div className="animate-in slide-in-from-bottom-2 mt-5 max-w-[650px] space-y-3 rounded-xl border border-neutral-100 bg-[#FAFBF9] p-4 duration-300 dark:border-neutral-800 dark:bg-neutral-800/50">
                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Your reply</div>
                        <textarea
                          value={answerDrafts[item.id] ?? ''}
                          onChange={(e) =>
                            setAnswerDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Write your answer..."
                          disabled={submittingAnswerId === item.id}
                          className="min-h-[90px] w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm font-normal text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#52C47F] disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:placeholder:text-neutral-500"
                        />
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => void handleAnswer(item)}
                            disabled={submittingAnswerId === item.id || !(answerDrafts[item.id] || '').trim()}
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#52C47F] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#43B26F] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span>{submittingAnswerId === item.id ? 'Publishing…' : 'Publish Reply'}</span>
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : !hasAnswer && dashboardRole === 'tasker' ? (
                      <p className="mt-4 text-sm font-normal italic text-neutral-500">
                        Waiting for the listing owner to reply.
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !loadError && filteredQuestions.length > 0 ? (
            <div className={DASHBOARD_PAGINATION_OUTER}>
              <div className={DASHBOARD_PAGINATION_INNER}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={activePage === 1}
                  className={DASHBOARD_PAGINATION_ARROW_PLAIN}
                >
                  <ChevronLeft className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={dashboardPageButtonClass(activePage === page)}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={activePage === totalPages}
                  className={DASHBOARD_PAGINATION_ARROW_PLAIN}
                >
                  <ChevronRight className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
                </button>
              </div>

              <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800 dark:text-neutral-300">
                {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, filteredQuestions.length)} of{' '}
                {filteredQuestions.length} questions
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
