'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Star, Flag, CornerDownRight, Send, ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getEmployerBusinessProfileHref } from '@/components/employers/employerSlug';
import { getFreelancerBusinessProfileHref } from '@/components/freelancers/freelancerSlug';
import {
  defaultReviewsTabForRole,
  emptyReviewsMessage,
  fetchDashboardReviews,
  filterReviewsByTab,
  isReviewsTabAllowedForRole,
  mapReviewsToDashboardItems,
  REVIEWS_TABS_BY_ROLE,
  REVIEWS_TAB_LABELS,
  type DashboardReviewItem,
  type ReviewsSubTab,
} from '@/lib/dashboardReviews';
import { reviewService } from '@/services/review.service';
import UserAvatar from '@/components/common/UserAvatar';
import { useAuthStore } from '@/store';
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

export default function DashboardReviews() {
  const user = useAuthStore((state) => state.user);
  const sidebarRole = useDashboardSidebarRole();
  const dashboardRole = sidebarRole === 'customer' ? 'customer' : 'tasker';
  const visibleTabs = REVIEWS_TABS_BY_ROLE[dashboardRole];
  const publicProfileHref =
    dashboardRole === 'tasker'
      ? getFreelancerBusinessProfileHref(user)
      : getEmployerBusinessProfileHref(user);
  const [activeSubTab, setActiveSubTab] = useState<ReviewsSubTab>(() =>
    defaultReviewsTabForRole(dashboardRole),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<DashboardReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchDashboardReviews(dashboardRole, user?.username);
      setReviews(mapReviewsToDashboardItems(list));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load reviews';
      setLoadError(message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [dashboardRole, user?.username]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (!isReviewsTabAllowedForRole(activeSubTab, dashboardRole)) {
      setActiveSubTab(defaultReviewsTabForRole(dashboardRole));
      setCurrentPage(1);
      setActiveReplyId(null);
      setReplyText('');
    }
  }, [activeSubTab, dashboardRole]);

  const activeReviews = useMemo(() => {
    return filterReviewsByTab(reviews, activeSubTab).filter((review) =>
      matchesSearchQuery(
        searchQuery,
        review.authorName,
        review.content,
        review.taskTitle,
        review.response,
      ),
    );
  }, [reviews, activeSubTab, searchQuery]);

  const tabReviewsCount = useMemo(
    () => filterReviewsByTab(reviews, activeSubTab).length,
    [reviews, activeSubTab],
  );

  const totalPages = Math.max(1, Math.ceil(activeReviews.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedReviews = activeReviews.slice(indexOfFirstItem, indexOfLastItem);

  const handleTabChange = (tab: ReviewsSubTab) => {
    setActiveSubTab(tab);
    setCurrentPage(1);
    setActiveReplyId(null);
    setReplyText('');
  };

  const handleOpenReply = (id: string) => {
    setActiveReplyId(id);
    setReplyText('');
  };

  const handleSendReply = async (id: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    setSubmittingReplyId(id);
    try {
      const res = await reviewService.respondToReview(id, trimmed);
      if (!res.success) {
        throw new Error(res.message || 'Could not publish response');
      }

      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, response: trimmed, canRespond: false } : r,
        ),
      );
      setActiveReplyId(null);
      setReplyText('');
      toast.success('Response published');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not publish response');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleFlagReview = () => {
    toast.message('Thanks for the report. Our team will review flagged feedback.');
  };

  const subTabClass = (tab: ReviewsSubTab) => dashboardSubtabClass(activeSubTab === tab);
  const emptyMessage =
    searchQuery.trim() && tabReviewsCount > 0
      ? `No reviews match “${searchQuery.trim()}”.`
      : emptyReviewsMessage(activeSubTab, dashboardRole);

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} relative flex min-h-[calc(100dvh-7.5rem)] flex-col sm:min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-5.5rem)]`}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className={`${DASHBOARD_SUBTABS_WRAP} shrink-0 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
            {visibleTabs.length > 1 ? (
              <div className={`${DASHBOARD_SUBTABS_ROW} min-w-0 flex-1 overflow-x-auto`}>
                {visibleTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={subTabClass(tab)}
                  >
                    {REVIEWS_TAB_LABELS[tab]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="min-w-0 flex-1" />
            )}

            <div className="mb-3 flex w-full flex-col gap-2 sm:mb-3.5 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
              <div className="relative flex w-full items-center rounded-xl border border-neutral-200/80 bg-neutral-50 px-3 shadow-sm sm:w-[240px] md:w-[280px] dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                <Search className="mr-2 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search reviews…"
                  aria-label="Search reviews"
                  className="w-full border-0 bg-transparent py-2.5 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:placeholder:text-neutral-500"
                />
              </div>

              {publicProfileHref ? (
                <Link
                  href={publicProfileHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FCF0ED] px-4 py-2.5 text-sm font-medium text-[#218F56] transition-all hover:bg-[#FCE6E1]"
                >
                  View public profile
                  <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-6 sm:px-6 md:px-8 md:pb-8">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-20 text-center text-sm text-neutral-400">
              Loading reviews…
            </div>
          ) : loadError ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-neutral-500">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadReviews()}
                className="mt-4 cursor-pointer rounded-xl bg-[#FCF0ED] px-6 py-2.5 text-sm font-medium text-[#218F56] transition-all hover:bg-[#FCE6E1]"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col space-y-8">
              {activeReviews.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-20 text-center text-sm text-neutral-400">
                  {emptyMessage}
                </div>
              ) : (
                paginatedReviews.map((review) => (
                  <div key={review.id} className="border-b border-neutral-100 pb-8 last:border-0 last:pb-0 dark:border-neutral-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        {review.authorAvatar ? (
                          <UserAvatar
                            src={review.authorAvatar}
                            name={review.authorName}
                            size="lg"
                            verified={review.authorVerified}
                            className="h-[52px] w-[52px] shrink-0"
                          />
                        ) : (
                          <div
                            className={`${review.avatarBg} flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105`}
                          >
                            <span className="font-sans text-sm font-semibold tracking-wide text-white">
                              {review.authorInitials}
                            </span>
                          </div>
                        )}

                        <div className="space-y-1">
                          <h4 className="text-[15px] font-medium leading-tight tracking-tight text-neutral-900 dark:text-stone-100">
                            {review.authorName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 stroke-none" />
                              <span className="font-medium text-neutral-800">{review.rating.toFixed(2)}</span>
                            </div>
                            <span className="text-neutral-200">|</span>
                            <span className="font-normal text-neutral-400">{review.timeAgo}</span>
                            {review.taskTitle ? (
                              <>
                                <span className="text-neutral-200">|</span>
                                <span className="font-normal text-neutral-400">{review.taskTitle}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleFlagReview}
                        className="cursor-pointer rounded-lg p-2 text-neutral-400 transition-all hover:bg-neutral-50 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-stone-100"
                        title="Flag review for policy violation"
                      >
                        <Flag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      </button>
                    </div>

                    <p className="mt-5 max-w-[840px] font-sans text-sm font-normal leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {review.content}
                    </p>

                    {review.response ? (
                      <div className="animate-in fade-in mt-4 ml-6 max-w-[800px] rounded-r-xl border-l-2 border-[#52C47F]/40 bg-[#FAFBF9] p-4 duration-300 dark:bg-neutral-800/50">
                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#183B32] dark:text-[#52C47F]">
                          <CornerDownRight className="h-3.5 w-3.5 text-[#52C47F]" />
                          <span className="uppercase tracking-wider">Your Response</span>
                        </div>
                        <p className="text-sm font-normal italic text-neutral-600 dark:text-neutral-300">&quot;{review.response}&quot;</p>
                      </div>
                    ) : null}

                    {review.canRespond ? (
                      <div className="mt-5">
                        {activeReplyId === review.id ? (
                          <div className="animate-in slide-in-from-bottom-2 mt-4 max-w-[650px] space-y-3 rounded-xl border border-neutral-100 bg-[#FAFBF9] p-4 duration-300 dark:border-neutral-800 dark:bg-neutral-800/50">
                            <div className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                              Respond to {review.authorName}:
                            </div>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your professional response..."
                              disabled={submittingReplyId === review.id}
                              className="min-h-[90px] w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm font-normal text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#52C47F] disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:placeholder:text-neutral-500"
                            />
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                type="button"
                                onClick={() => setActiveReplyId(null)}
                                disabled={submittingReplyId === review.id}
                                className="cursor-pointer rounded-xl bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleSendReply(review.id)}
                                disabled={submittingReplyId === review.id || !replyText.trim()}
                                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#52C47F] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#43B26F] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <span>{submittingReplyId === review.id ? 'Publishing…' : 'Publish Response'}</span>
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReply(review.id)}
                            className="cursor-pointer rounded-xl bg-[#FCF0ED] px-7 py-3 text-sm font-medium text-[#218F56] transition-all hover:scale-[1.02] hover:bg-[#FCE6E1] active:scale-[0.98]"
                          >
                            Respond
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && !loadError && activeReviews.length > 0 ? (
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
                  {totalPages <= 6 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={dashboardPageButtonClass(activePage === page)}
                      >
                        {page}
                      </button>
                    ))
                  ) : (
                    <>
                      {[1, 2, 3, 4, 5].map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={dashboardPageButtonClass(activePage === page)}
                        >
                          {page}
                        </button>
                      ))}
                      <span className="pointer-events-none flex h-9 w-9 shrink-0 select-none items-center justify-center text-sm font-normal text-neutral-400 sm:h-[44px] sm:w-[44px]">
                        ...
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        className={dashboardPageButtonClass(activePage === totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
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
                {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, activeReviews.length)} of{' '}
                {activeReviews.length} reviews
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
