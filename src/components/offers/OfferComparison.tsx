'use client';

import { Bid } from '@/types';
import { X, CheckCircle, Clock, Calendar, Star, DollarSign } from 'lucide-react';

interface OfferComparisonProps {
  offers: Bid[];
  onClose: () => void;
  onAccept: (offer: Bid) => void;
}

export function OfferComparison({ offers, onClose, onAccept }: OfferComparisonProps) {
  if (offers.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border-2 border-primary p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Comparing {offers.length} Offer{offers.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="border border-gray-200 rounded-lg p-4 space-y-4"
          >
            {/* Tasker Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                {offer.tasker?.profile_image ? (
                  <img
                    src={offer.tasker.profile_image}
                    alt={offer.tasker.full_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-600">
                    {offer.tasker?.full_name?.charAt(0) || 'T'}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {offer.tasker?.full_name || 'Unknown'}
                </h4>
                {offer.tasker?.average_rating && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{offer.tasker.average_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Offer Amount</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${offer.amount}
              </div>
            </div>

            {/* Duration */}
            {offer.estimated_duration && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {offer.estimated_duration} hours
                </div>
              </div>
            )}

            {/* Completion Date */}
            {offer.estimated_completion_date && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Completion</span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {new Date(offer.estimated_completion_date).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Proposal Preview */}
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">
                Proposal
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">
                {offer.proposal}
              </p>
            </div>

            {/* Accept Button */}
            <button
              onClick={() => onAccept(offer)}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Accept This Offer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
