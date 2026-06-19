'use client';

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { Star, ArrowUpRight, ThumbsUp, ThumbsDown, Filter, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfileReviewActions } from '@/hooks/useProfileReviewActions';
import type { ProfileReviewRow } from '@/lib/profileReviewDisplay';

type StarFilter = 'All' | 5 | 4 | 3 | 2 | 1;
type SortParam = 'newest' | 'highest' | 'lowest';

export interface ReviewsFeedbackPanelProps {
  subtitle?: string;
  ratingLabel?: string;
  initialReviews?: ProfileReviewRow[];
  initialRating?: number;
  preferApiReviews?: boolean;
  revieweeUserId?: string | null;
  fixedTaskId?: string | null;
  defaultReviewerRole?: string;
  entityName?: string;
  showToast?: (message: string) => void;
  loading?: boolean;
  showSubmitForm?: boolean;
  submitHint?: string;
  onReviewSubmitted?: () => void;
}

const AVATAR_PALETTES = ['bg-[#E07A5F]', 'bg-[#3D5A80]', 'bg-[#45a874]', 'bg-[#193E32]', 'bg-[#F4A261]'];
const INITIAL_VISIBLE_REVIEWS = 2;

export default function ReviewsFeedbackPanel({
  subtitle = 'Verified outcomes and work experience ratings.',
  ratingLabel = 'Your rating',
  initialReviews = [],
  initialRating = 0,
  preferApiReviews = true,
  revieweeUserId,
  fixedTaskId,
  defaultReviewerRole = 'Client',
  entityName = 'this user',
  showToast = () => {},
  loading = false,
  showSubmitForm = true,
  submitHint,
  onReviewSubmitted,
}: ReviewsFeedbackPanelProps) {
  const [reviews, setReviews] = useState<ProfileReviewRow[]>(initialReviews);
  const [filterStar, setFilterStar] = useState<StarFilter>('All');
  const [sortParam, setSortParam] = useState<SortParam>('newest');
  const [userRating, setUserRating] = useState(1);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_REVIEWS);

  const handleReviewCreated = useCallback((review: ProfileReviewRow) => {
    setReviews((prev) => [review, ...prev]);
    onReviewSubmitted?.();
  }, [onReviewSubmitted]);

  const {
    eligibleTasks,
    selectedTaskId,
    setSelectedTaskId,
    loadingEligible,
    submitting,
    isAuthenticated,
    voteReview,
    reportReview,
    submitReview,
  } = useProfileReviewActions({
    revieweeUserId: preferApiReviews && !fixedTaskId ? revieweeUserId : null,
    fixedTaskId: preferApiReviews ? fixedTaskId : null,
    defaultReviewerRole,
    showToast,
    onReviewCreated: handleReviewCreated,
  });

  useEffect(() => {
    setReviews(initialReviews);
    setUserRating(1);
    setReviewComment('');
    setFilterStar('All');
    setSortParam('newest');
    setVisibleCount(INITIAL_VISIBLE_REVIEWS);
  }, [initialReviews]);

  const calculatedCount = reviews.length;
  const calculatedAverage =
    calculatedCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / calculatedCount
      : initialRating;

  const getPercent = (count: number) => {
    if (reviews.length === 0) return 0;
    return Math.round((count / reviews.length) * 100);
  };

  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!preferApiReviews || !showSubmitForm) return;

    const ok = await submitReview(userRating, reviewComment);
    if (ok) {
      setUserRating(1);
      setReviewComment('');
    }
  };

  const handleVote = (reviewId: string, type: 'like' | 'dislike') => {
    if (!preferApiReviews) return;
    const current = reviews.find((r) => r.id === reviewId);
    void voteReview(reviewId, type, setReviews, current?.userVoted);
  };

  const handleFlagReview = (reviewId: string) => {
    if (!preferApiReviews) return;
    const current = reviews.find((r) => r.id === reviewId);
    if (current?.isFlagged) return;
    void reportReview(reviewId, setReviews);
  };

  const filteredReviews = reviews.filter((r) => (filterStar === 'All' ? true : r.rating === filterStar));

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortParam === 'highest') return b.rating - a.rating;
    if (sortParam === 'lowest') return a.rating - b.rating;
    return b.id.localeCompare(a.id);
  });

  const displayedReviews = sortedReviews.slice(0, visibleCount);
  const hasMoreReviews = sortedReviews.length > visibleCount;

  const formDisabled =
    preferApiReviews &&
    (submitting || loadingEligible || (isAuthenticated && eligibleTasks.length === 0));

  return (
    <div className="space-y-6" id="reviews-feedback-section">
      <div className="pb-2">
        <h2 className="flex items-center gap-2 text-lg font-normal tracking-tight text-black sm:text-xl">
          <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
          <span>Reviews & Feedbacks</span>
        </h2>
        <p className="mt-1 select-none text-xs font-normal text-neutral-500">{subtitle}</p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-neutral-50 py-12 text-center text-sm text-neutral-500">
          Loading reviews…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 items-center gap-6 rounded-2xl bg-neutral-50/60 p-6 md:grid-cols-12">
            <div className="space-y-2 pb-5 text-center md:col-span-4 md:pb-0 md:pr-4">
              <div className="select-none font-sans text-4xl font-normal tracking-tight text-black sm:text-5xl">
                {calculatedAverage.toFixed(2)}
              </div>
              <div className="flex items-center justify-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => {
                  const diff = calculatedAverage - star + 1;
                  const fillValue =
                    diff >= 1
                      ? 'fill-amber-400'
                      : diff > 0
                        ? 'fill-amber-400 opacity-50'
                        : 'text-neutral-200 stroke-[1.5]';
                  return <Star key={star} className={`h-4 w-4 ${fillValue}`} />;
                })}
              </div>
              <p className="select-none font-mono text-xs font-normal uppercase tracking-widest text-neutral-400">
                {calculatedCount} Total Reviews
              </p>
            </div>

            <div className="select-none space-y-2 text-[11px] font-normal text-black md:col-span-8">
              {([5, 4, 3, 2, 1] as const).map((stars) => (
                <div
                  key={stars}
                  onClick={() => setFilterStar(filterStar === stars ? 'All' : stars)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setFilterStar(filterStar === stars ? 'All' : stars);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`group flex cursor-pointer items-center gap-3 rounded-lg p-1 transition-colors hover:bg-[#FAF9F6] ${filterStar === stars ? 'bg-[#FAF9F6]' : ''}`}
                >
                  <span className="w-12 shrink-0 font-normal text-black">{stars} Stars</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{
                        width: `${getPercent(reviews.filter((r) => r.rating === stars).length)}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono leading-none text-neutral-400 group-hover:text-black">
                    {getPercent(reviews.filter((r) => r.rating === stars).length)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 py-2 pb-2 text-xs select-none sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 font-normal text-neutral-400">
              <Filter className="h-4 w-4 text-neutral-400" />
              <span>
                Showing <span className="font-normal text-black">{filteredReviews.length}</span> ratings
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-normal text-neutral-400">Sort Ratings</span>
              <select
                value={sortParam}
                onChange={(e) => setSortParam(e.target.value as SortParam)}
                className="cursor-pointer rounded-lg bg-[#FAF9F6] px-2.5 py-1.5 text-xs font-normal text-black outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="newest">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {sortedReviews.length === 0 ? (
              <div className="rounded-2xl bg-neutral-50 py-12 text-center text-xs font-normal text-neutral-400">
                No reviews yet. Be the first to share feedback after this work is completed.
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {displayedReviews.map((rev, idx) => {
                  const initials = rev.reviewerName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();
                  const palette = AVATAR_PALETTES[idx % AVATAR_PALETTES.length];

                  return (
                    <motion.div
                      key={rev.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`rounded-2xl p-5 transition-all duration-200 ${rev.isFlagged ? 'bg-red-50/50 opacity-60' : 'bg-white hover:shadow-sm'}`}
                    >
                      <div className="flex flex-col justify-between gap-3 pb-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                          <div
                            className={`${palette} flex h-11 w-11 select-none items-center justify-center rounded-full text-xs font-normal uppercase text-white shadow-sm`}
                          >
                            {initials}
                          </div>
                          <div className="select-none space-y-0.5 text-left">
                            <h4 className="text-xs font-normal leading-tight text-black sm:text-sm">
                              {rev.reviewerName}
                            </h4>
                            <p className="font-mono text-[10px] font-normal uppercase tracking-wider text-neutral-400">
                              {rev.reviewerRole}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${star <= rev.rating ? 'fill-amber-400' : 'text-neutral-200 stroke-[1.2]'}`}
                              />
                            ))}
                          </div>
                          <span className="font-mono text-[11px] font-normal text-neutral-400">{rev.date}</span>
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-line text-left text-xs font-normal leading-relaxed text-black">
                        {rev.comment}
                      </p>

                      {preferApiReviews ? (
                        <div className="mt-5 flex select-none items-center justify-between pt-3.5 text-[10px] font-normal text-neutral-400">
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="tracking-wider text-neutral-400">Was this review helpful?</span>
                            <button
                              type="button"
                              onClick={() => handleVote(rev.id, 'like')}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all ${rev.userVoted === 'like' ? 'scale-105 bg-emerald-50 text-emerald-700' : 'cursor-pointer bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-black'}`}
                            >
                              <ThumbsUp className="h-3.5 w-3.5 stroke-[2]" />
                              <span className="font-mono">{rev.likes}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVote(rev.id, 'dislike')}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all ${rev.userVoted === 'dislike' ? 'scale-105 bg-rose-50 text-rose-700' : 'cursor-pointer bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-black'}`}
                            >
                              <ThumbsDown className="h-3.5 w-3.5 stroke-[2]" />
                              <span className="font-mono">{rev.dislikes}</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFlagReview(rev.id)}
                            className={`inline-flex items-center gap-1 rounded-lg p-1.5 transition-colors hover:bg-neutral-100 hover:text-neutral-800 ${rev.isFlagged ? 'animate-pulse bg-red-50 text-red-600' : 'cursor-pointer text-neutral-400'}`}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{rev.isFlagged ? 'Flagged' : 'Report'}</span>
                          </button>
                        </div>
                      ) : null}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {sortedReviews.length > 0 && (hasMoreReviews || visibleCount > INITIAL_VISIBLE_REVIEWS) ? (
            <div className="flex justify-center pt-2">
              {hasMoreReviews ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount(sortedReviews.length)}
                  className="cursor-pointer rounded-xl bg-neutral-100 px-6 py-2.5 text-xs font-normal text-black transition-all hover:bg-neutral-200"
                >
                  See more
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setVisibleCount(INITIAL_VISIBLE_REVIEWS)}
                  className="cursor-pointer rounded-xl bg-neutral-100 px-6 py-2.5 text-xs font-normal text-black transition-all hover:bg-neutral-200"
                >
                  Show less
                </button>
              )}
            </div>
          ) : null}

          {showSubmitForm ? (
            <form onSubmit={handleAddReview} className="space-y-6 border-t border-neutral-100 pt-6">
              <div className="space-y-2">
                <h3 className="text-xl font-normal tracking-tight text-black">Add a Review</h3>
                <p className="text-sm font-normal text-neutral-600">
                  {submitHint ??
                    'Verified reviews are published after the task is marked completed.'}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-normal text-black">{ratingLabel}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isLit = hoverRating !== null ? starVal <= hoverRating : starVal <= userRating;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setUserRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="cursor-pointer p-0.5 transition-transform hover:scale-105"
                        aria-label={`Rate ${starVal} stars`}
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${isLit ? 'fill-amber-400 text-amber-400' : 'fill-none text-neutral-300'}`}
                          strokeWidth={1.5}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="task-review-comment" className="block text-sm font-normal text-black">
                  Comment
                </label>
                <textarea
                  id="task-review-comment"
                  required
                  rows={6}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience working on this task…"
                  className="w-full resize-y rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-normal text-black outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {!isAuthenticated ? (
                <p className="text-sm text-neutral-600">
                  Sign in to leave a verified review for {entityName}.
                </p>
              ) : loadingEligible ? (
                <p className="text-sm text-neutral-500">Checking review eligibility…</p>
              ) : eligibleTasks.length === 0 ? (
                <p className="text-sm text-neutral-600">
                  You can review {entityName} once this task is completed and you were part of the work.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={formDisabled}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#5BBB7B] px-6 py-3 text-sm font-normal text-white transition-colors hover:bg-[#4da86c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{submitting ? 'Sending…' : 'Send'}</span>
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}
