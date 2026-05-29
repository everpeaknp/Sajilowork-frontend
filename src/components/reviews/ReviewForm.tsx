'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ReviewFormProps {
  taskId: number;
  revieweeId: number;
  revieweeName: string;
  revieweeImage?: string;
  onSubmit: (reviewData: ReviewData) => Promise<void>;
  onCancel: () => void;
}

export interface ReviewData {
  rating: number;
  comment: string;
  communication_rating: number;
  quality_rating: number;
  professionalism_rating: number;
  timeliness_rating: number;
}

export default function ReviewForm({
  taskId,
  revieweeId,
  revieweeName,
  revieweeImage,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [communicationRating, setCommunicationRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        rating,
        comment,
        communication_rating: communicationRating,
        quality_rating: qualityRating,
        professionalism_rating: professionalismRating,
        timeliness_rating: timelinessRating,
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (rating: number) => void;
    label: string;
  }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hover || value)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {value > 0 ? `${value} star${value > 1 ? 's' : ''}` : 'Not rated'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reviewee Info */}
        <div className="flex items-center space-x-4 pb-4 border-b">
          <img
            src={revieweeImage || '/images/default-avatar.png'}
            alt={revieweeName}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold">Review {revieweeName}</h3>
            <p className="text-sm text-gray-600">Share your experience</p>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="space-y-2">
          <Label className="text-lg">Overall Rating *</Label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Very Good'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </p>
          )}
        </div>

        {/* Detailed Ratings */}
        <div className="space-y-4">
          <h4 className="font-semibold">Detailed Ratings</h4>
          
          <StarRating
            value={communicationRating}
            onChange={setCommunicationRating}
            label="Communication"
          />

          <StarRating
            value={qualityRating}
            onChange={setQualityRating}
            label="Quality of Work"
          />

          <StarRating
            value={professionalismRating}
            onChange={setProfessionalismRating}
            label="Professionalism"
          />

          <StarRating
            value={timelinessRating}
            onChange={setTimelinessRating}
            label="Timeliness"
          />
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment">Your Review</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience working with this person..."
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || rating === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
