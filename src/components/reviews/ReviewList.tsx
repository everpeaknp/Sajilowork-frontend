'use client';

/**
 * ReviewList Component
 * 
 * Displays a list of reviews with filtering, sorting, and pagination
 * Features:
 * - Filter by rating
 * - Sort by date/rating
 * - Pagination
 * - Responsive grid layout
 */

import { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import { Loader2, Star, Filter, SortAsc } from 'lucide-react';
import { Review } from '@/types';
import { reviewService } from '@/services/review.service';

interface ReviewListProps {
  userId?: string;
  taskId?: string;
  reviewType?: 'given' | 'received';
  limit?: number;
  showFilters?: boolean;
}

export function ReviewList({
  userId,
  taskId,
  reviewType = 'received',
  limit,
  showFilters = true,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = limit || 10;

  useEffect(() => {
    fetchReviews();
  }, [userId, taskId, reviewType, filterRating, sortBy, sortOrder, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      if (taskId) {
        const res = await reviewService.getTaskReviews(taskId);
        if (!res.success || !res.data) {
          throw new Error(res.message || 'Failed to fetch reviews');
        }
        let list = res.data.results ?? [];
        if (filterRating) {
          list = list.filter((r) => r.rating >= filterRating);
        }
        list = [...list].sort((a, b) => {
          const field = sortBy === 'date' ? 'created_at' : 'rating';
          const av = (a as Record<string, unknown>)[field] as string | number;
          const bv = (b as Record<string, unknown>)[field] as string | number;
          const cmp = av > bv ? 1 : av < bv ? -1 : 0;
          return sortOrder === 'desc' ? -cmp : cmp;
        });
        setReviews(list);
        setTotalCount(list.length);
        setTotalPages(Math.max(1, Math.ceil(list.length / pageSize)));
        return;
      }

      if (userId) {
        const res = await reviewService.getUserReviews(userId);
        if (!res.success || !res.data) {
          throw new Error(res.message || 'Failed to fetch reviews');
        }
        let list = res.data.results ?? [];
        if (filterRating) {
          list = list.filter((r) => r.rating >= filterRating);
        }
        setReviews(list.slice((page - 1) * pageSize, page * pageSize));
        setTotalCount(list.length);
        setTotalPages(Math.max(1, Math.ceil(list.length / pageSize)));
        return;
      }

      setReviews([]);
      setTotalCount(0);
      setTotalPages(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterRating = (rating: number | null) => {
    setFilterRating(rating);
    setPage(1); // Reset to first page
  };

  const handleSort = (field: 'date' | 'rating') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {reviewType === 'received' ? 'Reviews Received' : 'Reviews Given'}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="text-lg font-semibold text-gray-900">
                {calculateAverageRating()}
              </span>
              <span className="text-sm text-gray-600">
                ({totalCount} review{totalCount !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleFilterRating(null)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterRating === null
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFilterRating(rating)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                      filterRating === rating
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rating}
                    <Star className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <button
                onClick={() => handleSort('date')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'date'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('rating')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'rating'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rating {sortBy === 'rating' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No reviews yet</p>
          <p className="text-sm text-gray-500 mt-2">
            {reviewType === 'received'
              ? 'Reviews from clients will appear here'
              : 'Reviews you give will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-primary text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && page > 1 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
