'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { reviewService } from '@/services/review.service';
import type { Review } from '@/types';
import { extractReviewList, formatProfileRating, formatReviewTimeAgo, reviewerDisplayName } from '@/lib/publicProfile';

export default function UserReviews({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reviewService
      .getUserReviews(userId)
      .then((res) => {
        if (cancelled || !res.success || !res.data) return;
        setAvg(res.data.statistics?.average_rating ?? null);
        setCount(res.data.count ?? 0);
        setReviews(Array.isArray(res.data.results) ? res.data.results : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const normalized = useMemo(() => extractReviewList(reviews), [reviews]);
  const avgDisplay = formatProfileRating(avg ?? 0);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-outline-variant/40">
        <p className="text-sm font-semibold text-gray-500">Loading reviews…</p>
      </div>
    );
  }

  return (
    <section className="space-y-4" id="reviews">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#000d45]">Reviews</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-[#000d45]">{avgDisplay}</span>
            <span>({count} {count === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>
      </div>

      {normalized.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-2xl border border-outline-variant">
          <p className="text-sm font-semibold text-gray-600">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {normalized.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-outline-variant/40 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#000d45]">{reviewerDisplayName(r.reviewer)}</p>
                  <p className="text-xs text-gray-500">{formatReviewTimeAgo(r.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm">{r.rating}</span>
                </div>
              </div>
              {r.comment ? (
                <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {r.comment}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

