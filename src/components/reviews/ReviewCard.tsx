'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  showTaskInfo?: boolean;
}

export default function ReviewCard({ review, showTaskInfo = false }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const hasDetailedRatings =
    review.communication_rating ||
    review.quality_rating ||
    review.professionalism_rating ||
    review.timeliness_rating;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={review.reviewer.profile_image || '/images/default-avatar.png'}
            alt={review.reviewer.full_name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h4 className="font-semibold">{review.reviewer.full_name}</h4>
            <p className="text-sm text-gray-500">
              {review.created_at && format(new Date(review.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="flex items-center space-x-2">
          {renderStars(review.rating)}
          <span className="font-semibold">{review.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Task Info */}
      {showTaskInfo && review.task && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Task:</p>
          <p className="font-medium">{typeof review.task === 'string' ? review.task : review.task}</p>
        </div>
      )}

      {/* Comment */}
      {review.comment && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      )}

      {/* Detailed Ratings */}
      {hasDetailedRatings && (
        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">Detailed Ratings</p>
          <div className="grid grid-cols-2 gap-3">
            {review.communication_rating && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Communication</span>
                <div className="flex items-center space-x-1">
                  {renderStars(review.communication_rating)}
                  <span className="text-sm font-medium ml-1">
                    {review.communication_rating}
                  </span>
                </div>
              </div>
            )}

            {review.quality_rating && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quality</span>
                <div className="flex items-center space-x-1">
                  {renderStars(review.quality_rating)}
                  <span className="text-sm font-medium ml-1">{review.quality_rating}</span>
                </div>
              </div>
            )}

            {review.professionalism_rating && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Professionalism</span>
                <div className="flex items-center space-x-1">
                  {renderStars(review.professionalism_rating)}
                  <span className="text-sm font-medium ml-1">
                    {review.professionalism_rating}
                  </span>
                </div>
              </div>
            )}

            {review.timeliness_rating && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Timeliness</span>
                <div className="flex items-center space-x-1">
                  {renderStars(review.timeliness_rating)}
                  <span className="text-sm font-medium ml-1">
                    {review.timeliness_rating}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
