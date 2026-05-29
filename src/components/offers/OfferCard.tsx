'use client';

/**
 * OfferCard Component
 * 
 * Displays individual offer with provider details and actions
 * Features:
 * - Provider profile summary
 * - Offer details (amount, timeline, description)
 * - Rating and reviews
 * - Accept/Reject/Message actions
 * - Compare mode selection
 */

import { Bid, Task } from '@/types';
import { Star, Clock, MessageCircle, Check, X, User, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OfferCardProps {
  offer: Bid;
  task: Task;
  compareMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onAccept: () => void;
  onReject: () => void;
  onMessage: () => void;
}

export function OfferCard({
  offer,
  task,
  compareMode = false,
  isSelected = false,
  onToggleSelect,
  onAccept,
  onReject,
  onMessage,
}: OfferCardProps) {
  const isPending = offer.status === 'pending';
  const isAccepted = offer.status === 'accepted';
  const isRejected = offer.status === 'rejected';

  const getStatusBadge = () => {
    if (isAccepted) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4" />
          Accepted
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <X className="h-4 w-4" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-4 w-4" />
        Pending
      </span>
    );
  };

  return (
    <div
      className={`bg-white border rounded-lg p-6 transition-all ${
        compareMode && isSelected
          ? 'border-primary border-2 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Provider Avatar */}
          <div className="relative">
            {offer.tasker.profile_image ? (
              <img
                src={offer.tasker.profile_image}
                alt={`${offer.tasker.first_name} ${offer.tasker.last_name}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            {offer.tasker.is_verified_tasker && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Provider Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {offer.tasker.first_name} {offer.tasker.last_name}
              </h3>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-gray-900">
                  {offer.tasker.average_rating?.toFixed(1) || 'New'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({offer.tasker.total_reviews || 0} reviews)
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {offer.tasker.completed_tasks || 0} tasks completed
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge()}
          {compareMode && isPending && (
            <button
              onClick={onToggleSelect}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          )}
        </div>
      </div>

      {/* Offer Details */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Amount */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Offer Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              NPR {offer.amount.toLocaleString()}
            </p>
            {task.budget_amount && (
              <p className="text-xs text-gray-500 mt-1">
                Budget: NPR {task.budget_amount.toLocaleString()}
                {offer.amount < task.budget_amount && (
                  <span className="text-green-600 ml-1">
                    (NPR {(task.budget_amount - offer.amount).toLocaleString()} less)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Completion Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {offer.estimated_duration} days
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Submitted {offer.created_at ? formatDistanceToNow(new Date(offer.created_at), { addSuffix: true }) : 'recently'}
            </p>
          </div>
        </div>

        {/* Description */}
        {offer.proposal && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Proposal</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {offer.proposal}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && !compareMode && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Check className="h-4 w-4" />
            Accept Offer
          </button>
          <button
            onClick={onMessage}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </button>
          <button
            onClick={onReject}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}

      {isAccepted && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onMessage}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Message Provider
          </button>
        </div>
      )}
    </div>
  );
}
