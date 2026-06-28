'use client';

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { Star, ArrowUpRight, ThumbsUp, ThumbsDown, Filter, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfileReviewActions } from '@/hooks/useProfileReviewActions';
import { parseEmployerUserId } from '@/lib/profileReviewDisplay';

export interface SingleReview {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  dislikes: number;
  userVoted?: 'like' | 'dislike';
  isFlagged?: boolean;
}

type StarFilter = 'All' | 5 | 4 | 3 | 2 | 1;
type SortParam = 'newest' | 'highest' | 'lowest';

interface EmployerReviewsProps {
  employerId: string;
  employerName: string;
  initialRating: number;
  initialReviews?: SingleReview[];
  preferApiReviews?: boolean;
  revieweeUserId?: string | null;
  onReviewsUpdated?: (count: number, average: number) => void;
  showToast?: (message: string) => void;
}

const AVATAR_PALETTES = ['bg-[#E07A5F]', 'bg-[#3D5A80]', 'bg-[#45a874]', 'bg-[#193E32]', 'bg-[#F4A261]'];
const INITIAL_VISIBLE_REVIEWS = 2;

function formatReviewDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function EmployerReviews({
  employerId,
  employerName,
  initialRating,
  initialReviews,
  preferApiReviews = false,
  revieweeUserId,
  onReviewsUpdated,
  showToast = () => {},
}: EmployerReviewsProps) {
  const [reviews, setReviews] = useState<SingleReview[]>([]);
  const [filterStar, setFilterStar] = useState<StarFilter>('All');
  const [sortParam, setSortParam] = useState<SortParam>('newest');
  const [userRating, setUserRating] = useState(1);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_REVIEWS);

  const resolvedRevieweeId =
    revieweeUserId ?? (preferApiReviews ? parseEmployerUserId(employerId) : null);

  const handleReviewCreated = useCallback((review: SingleReview) => {
    setReviews((prev) => [review, ...prev]);
  }, []);

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
    revieweeUserId: preferApiReviews ? resolvedRevieweeId : null,
    defaultReviewerRole: 'Freelancer',
    showToast,
    onReviewCreated: handleReviewCreated,
  });

  useEffect(() => {
    setReviews(initialReviews ?? []);
    setUserRating(1);
    setReviewComment('');
    setFilterStar('All');
    setSortParam('newest');
    setVisibleCount(INITIAL_VISIBLE_REVIEWS);
  }, [employerId, employerName, initialReviews, preferApiReviews]);

  const calculatedCount = reviews.length;
  const calculatedAverage =
    calculatedCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / calculatedCount : initialRating;

  const lastNotifiedRef = useRef<{ count: number; average: number } | null>(null);

  useEffect(() => {
    const prev = lastNotifiedRef.current;
    if (prev?.count === calculatedCount && prev?.average === calculatedAverage) {
      return;
    }
    lastNotifiedRef.current = { count: calculatedCount, average: calculatedAverage };
    onReviewsUpdated?.(calculatedCount, calculatedAverage);
  }, [calculatedCount, calculatedAverage, onReviewsUpdated]);

  const getPercent = (count: number) => {
    if (reviews.length === 0) return 0;
    return Math.round((count / reviews.length) * 100);
  };

  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (preferApiReviews) {
      const ok = await submitReview(userRating, reviewComment);
      if (ok) {
        setUserRating(1);
        setReviewComment('');
      }
      return;
    }

    if (!reviewComment.trim()) {
      showToast('Please fill out the review comment field.');
      return;
    }

    const newReview: SingleReview = {
      id: `user-rev-${Date.now()}`,
      reviewerName: 'Guest',
      reviewerRole: 'Freelance Specialist',
      rating: userRating,
      date: formatReviewDate(new Date()),
      comment: reviewComment.trim(),
      likes: 0,
      dislikes: 0,
    };

    setReviews((prev) => [newReview, ...prev]);
    showToast('Thank you! Your feedback has been published successfully.');
    setUserRating(1);
    setReviewComment('');
  };

  const handleVote = (reviewId: string, type: 'like' | 'dislike') => {
    if (preferApiReviews) {
      const current = reviews.find((r) => r.id === reviewId);
      void voteReview(reviewId, type, setReviews, current?.userVoted);
      return;
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;

        if (r.userVoted === type) {
          return {
            ...r,
            likes: type === 'like' ? r.likes - 1 : r.likes,
            dislikes: type === 'dislike' ? r.dislikes - 1 : r.dislikes,
            userVoted: undefined,
          };
        }

        let newLikes = r.likes;
        let newDislikes = r.dislikes;
        if (r.userVoted === 'like') newLikes--;
        if (r.userVoted === 'dislike') newDislikes--;
        if (type === 'like') newLikes++;
        if (type === 'dislike') newDislikes++;

        return {
          ...r,
          likes: newLikes,
          dislikes: newDislikes,
          userVoted: type,
        };
      }),
    );
  };

  const handleFlagReview = (reviewId: string) => {
    if (preferApiReviews) {
      const current = reviews.find((r) => r.id === reviewId);
      if (current?.isFlagged) return;
      void reportReview(reviewId, setReviews);
      return;
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const flagState = !r.isFlagged;
        setTimeout(() => {
          showToast(
            flagState ? 'Feedback review flagged and sent to moderator queue.' : 'Review flag recalled.',
          );
        }, 50);
        return { ...r, isFlagged: flagState };
      }),
    );
  };

  const filteredReviews = reviews.filter((r) => (filterStar === 'All' ? true : r.rating === filterStar));

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortParam === 'highest') return b.rating - a.rating;
    if (sortParam === 'lowest') return a.rating - b.rating;
    const isAUser = a.id.startsWith('user-');
    const isBUser = b.id.startsWith('user-');
    if (isAUser && !isBUser) return -1;
    if (!isAUser && isBUser) return 1;
    return b.id.localeCompare(a.id);
  });

  const displayedReviews = sortedReviews.slice(0, visibleCount);
  const hasMoreReviews = sortedReviews.length > visibleCount;

  return (
    <div className="space-y-6" id="employer-reviews-section">
      <div className="pb-2">
        <h2 className="flex items-center gap-2 text-lg font-normal tracking-tight text-black sm:text-xl">
          <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
          <span>Reviews & Feedbacks</span>
        </h2>
        <p className="mt-1 select-none text-xs font-normal text-neutral-500">
          Verified client outcomes and service experience ratings on this template.
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 rounded-2xl bg-neutral-50/60 p-6 md:grid-cols-12">
        <div className="space-y-2 pb-5 text-center md:col-span-4 md:pb-0 md:pr-4">
          <div className="select-none font-sans text-4xl font-normal tracking-tight text-black sm:text-5xl">
            {calculatedAverage.toFixed(2)}
          </div>
          <div className="flex items-center justify-center gap-0.5 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => {
              const diff = calculatedAverage - star + 1;
              const fillValue =
                diff >= 1 ? 'fill-amber-400' : diff > 0 ? 'fill-amber-400 opacity-50' : 'text-neutral-200 stroke-[1.5]';
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
                if (e.key === 'Enter' || e.key === ' ') setFilterStar(filterStar === stars ? 'All' : stars);
              }}
              role="button"
              tabIndex={0}
              className={`group flex cursor-pointer items-center gap-3 rounded-lg p-1 transition-colors hover:bg-[#FAF9F6] ${filterStar === stars ? 'bg-[#FAF9F6]' : ''}`}
            >
              <span className="w-12 shrink-0 font-normal text-black">{stars} Stars</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${getPercent(reviews.filter((r) => r.rating === stars).length)}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono leading-none text-neutral-400 group-hover:text-black">
                {getPercent(reviews.filter((r) => r.rating === stars).length)}%
              </span>
            </div>
          ))}

          {filterStar !== 'All' ? (
            <div className="flex items-center justify-between pt-1.5 text-[10px]">
              <span className="font-mono font-normal text-amber-700">
                Filtering strictly showing {filterStar}★ feedback.
              </span>
              <button
                type="button"
                onClick={() => setFilterStar('All')}
                className="cursor-pointer font-normal text-[#45a874] hover:underline"
              >
                Clear Filter
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 py-2 pb-2 text-xs select-none sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 font-normal text-neutral-400">
          <Filter className="h-4 w-4 text-neutral-400" />
          <span>
            Showing <span className="text-black">{filteredReviews.length}</span> ratings
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
            No matching review ratings found here yet.
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

                  <p className="mt-4 whitespace-pre-line text-left text-xs font-normal leading-relaxed text-black/80">
                    {rev.comment}
                  </p>

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
                      title={rev.isFlagged ? 'Flagged for moderation' : 'Flag review for audit'}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{rev.isFlagged ? 'Flagged' : 'Report'}</span>
                    </button>
                  </div>
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

      <form onSubmit={handleAddReview} className="space-y-6 pt-6">
        <div className="space-y-2">
          <h3 className="text-xl font-normal tracking-tight text-black">Add a Review</h3>
          <p className="text-sm text-neutral-500">
            {preferApiReviews
              ? 'Verified reviews are published after you complete work together on the platform.'
              : 'Your email address will not be published. Required fields are marked '}
            {!preferApiReviews ? <span className="text-neutral-800">*</span> : null}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-normal text-black">Your rating of this product</p>
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
          <label htmlFor="review-comment" className="block text-sm font-normal text-black">
            Comment
          </label>
          <textarea
            id="review-comment"
            required
            rows={6}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable."
            className="w-full resize-y rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {preferApiReviews ? (
          <>
            {!isAuthenticated ? (
              <p className="text-sm text-neutral-600">
                Sign in to leave a verified review after completing a job with {employerName}.
              </p>
            ) : loadingEligible ? (
              <p className="text-sm text-neutral-500">Checking eligible completed work…</p>
            ) : eligibleTasks.length === 0 ? (
              <p className="text-sm text-neutral-600">
                You can review {employerName} once you have completed work together on the platform.
              </p>
            ) : eligibleTasks.length > 1 ? (
              <div className="space-y-2">
                <label htmlFor="review-task" className="block text-sm font-normal text-black">
                  Completed work
                </label>
                <select
                  id="review-task"
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {eligibleTasks.map((task) => (
                    <option key={task.taskId} value={task.taskId}>
                      {task.taskTitle}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </>
        ) : null}

        <button
          type="submit"
          disabled={
            preferApiReviews &&
            (submitting || loadingEligible || (isAuthenticated && eligibleTasks.length === 0))
          }
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#5BBB7B] px-6 py-3 text-sm font-normal text-white transition-colors hover:bg-[#4da86c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{submitting ? 'Sending…' : 'Send'}</span>
          <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
