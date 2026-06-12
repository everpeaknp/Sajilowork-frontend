'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Star, Flag, CornerDownRight, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  filterReviewsByTab,
  mapReviewsToDashboardItems,
  type DashboardReviewItem,
  type ReviewsSubTab,
} from '@/lib/dashboardReviews';
import { reviewService } from '@/services/review.service';
import { useDashboardSidebarRole } from './DashboardRoleSwitchContext';

export default function DashboardReviews() {
  const sidebarRole = useDashboardSidebarRole();
  const [activeSubTab, setActiveSubTab] = useState<ReviewsSubTab>('jobs');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<DashboardReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await reviewService.getReceivedReviews();
      if (!res.success) {
        throw new Error(res.message || 'Could not load reviews');
      }
      const list = Array.isArray(res.data) ? res.data : [];
      setReviews(mapReviewsToDashboardItems(list));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load reviews';
      setLoadError(message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const activeReviews = useMemo(
    () => filterReviewsByTab(reviews, activeSubTab),
    [reviews, activeSubTab],
  );

  const totalPages = Math.max(1, Math.ceil(activeReviews.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedReviews = activeReviews.slice(indexOfFirstItem, indexOfLastItem);

  const subtitle =
    sidebarRole === 'customer'
      ? 'Reviews from freelancers on tasks you posted.'
      : 'Reviews from clients on work you completed.';

  const handleTabChange = (tab: ReviewsSubTab) => {
    setActiveSubTab(tab);
    setCurrentPage(1);
    setActiveReplyId(null);
    setReplyText('');
  };

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full border-0 text-sm font-normal outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 ${
      activePage === page
        ? 'bg-[#52C47F] font-medium text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

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

  const subTabClass = (tab: ReviewsSubTab) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mb-8 max-w-7xl pl-1">
        <h1 className="text-3xl font-normal leading-tight tracking-tight text-neutral-900">Reviews</h1>
        <p className="mt-1 text-[15px] font-normal tracking-tight text-neutral-500">{subtitle}</p>
      </div>

      <div className="mx-auto max-w-7xl rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-neutral-100">
          <div className="flex gap-8">
            <button type="button" onClick={() => handleTabChange('services')} className={subTabClass('services')}>
              Services
            </button>
            <button type="button" onClick={() => handleTabChange('project')} className={subTabClass('project')}>
              Project
            </button>
            <button type="button" onClick={() => handleTabChange('jobs')} className={subTabClass('jobs')}>
              Jobs
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-neutral-400">Loading reviews…</div>
        ) : loadError ? (
          <div className="py-20 text-center">
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
          <div className="space-y-8">
            {activeReviews.length === 0 ? (
              <div className="py-20 text-center text-sm text-neutral-400">
                No reviews on this tab yet. Completed tasks with public feedback appear here.
              </div>
            ) : (
              paginatedReviews.map((review) => (
                <div key={review.id} className="border-b border-neutral-100 pb-8 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`${review.avatarBg} flex h-[52px] w-[52px] items-center justify-center rounded-full transition-transform hover:scale-105`}
                      >
                        <span className="font-sans text-sm font-semibold tracking-wide text-white">
                          {review.authorInitials}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[15px] font-medium leading-tight tracking-tight text-neutral-900">
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
                      className="cursor-pointer rounded-lg p-2 text-neutral-400 transition-all hover:bg-neutral-50 hover:text-neutral-800"
                      title="Flag review for policy violation"
                    >
                      <Flag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </button>
                  </div>

                  <p className="mt-5 max-w-[840px] font-sans text-sm font-normal leading-relaxed text-neutral-600">
                    {review.content}
                  </p>

                  {review.response ? (
                    <div className="animate-in fade-in mt-4 ml-6 max-w-[800px] rounded-r-xl border-l-2 border-[#52C47F]/40 bg-[#FAFBF9] p-4 duration-300">
                      <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#183B32]">
                        <CornerDownRight className="h-3.5 w-3.5 text-[#52C47F]" />
                        <span className="uppercase tracking-wider">Your Response</span>
                      </div>
                      <p className="text-sm font-normal italic text-neutral-600">&quot;{review.response}&quot;</p>
                    </div>
                  ) : null}

                  {review.canRespond ? (
                    <div className="mt-5">
                      {activeReplyId === review.id ? (
                        <div className="animate-in slide-in-from-bottom-2 mt-4 max-w-[650px] space-y-3 rounded-xl border border-neutral-100 bg-[#FAFBF9] p-4 duration-300">
                          <div className="mb-1 text-xs font-medium text-neutral-500">
                            Respond to {review.authorName}:
                          </div>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your professional response..."
                            disabled={submittingReplyId === review.id}
                            className="min-h-[90px] w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm font-normal text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#52C47F] disabled:opacity-60"
                          />
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              type="button"
                              onClick={() => setActiveReplyId(null)}
                              disabled={submittingReplyId === review.id}
                              className="cursor-pointer rounded-xl bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="mt-10 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-12 font-sans">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>

              <div className="flex items-center gap-1">
                {totalPages <= 6 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={pageButtonClass(page)}
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
                        className={pageButtonClass(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="pointer-events-none flex h-[44px] w-[44px] select-none items-center justify-center text-sm font-normal text-neutral-400">
                      ...
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={pageButtonClass(totalPages)}
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
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>
            </div>

            <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, activeReviews.length)} of{' '}
              {activeReviews.length} reviews
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
