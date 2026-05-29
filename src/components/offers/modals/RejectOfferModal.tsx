'use client';

/**
 * RejectOfferModal Component
 * 
 * Modal for rejecting an offer with optional reason
 * Features:
 * - Offer summary
 * - Rejection reason selection
 * - Custom reason input
 * - Confirmation
 */

import { useState } from 'react';
import { Bid } from '@/types';
import { X, AlertCircle } from 'lucide-react';

interface RejectOfferModalProps {
  offer: Bid;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

const REJECTION_REASONS = [
  'Price is too high',
  'Timeline is too long',
  'Found a better offer',
  'Provider profile doesn\'t match requirements',
  'Changed my mind about the task',
  'Other (please specify)',
];

export function RejectOfferModal({
  offer,
  onConfirm,
  onCancel,
}: RejectOfferModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReject = async () => {
    if (!selectedReason) {
      setError('Please select a reason for rejection');
      return;
    }

    if (selectedReason === 'Other (please specify)' && !customReason.trim()) {
      setError('Please provide a custom reason');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const reason = selectedReason === 'Other (please specify)'
        ? customReason
        : selectedReason;

      await onConfirm(reason);
    } catch (err: any) {
      setError(err.message || 'Failed to reject offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Reject Offer</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Offer Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Offer Details</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Provider:</span>
                <span className="text-sm font-medium text-gray-900">
                  {offer.tasker.first_name} {offer.tasker.last_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  NPR {offer.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Timeline:</span>
                <span className="text-sm font-medium text-gray-900">
                  {offer.estimated_duration} days
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">⚠️ Note</h4>
            <p className="text-sm text-yellow-800">
              Rejecting this offer will notify the provider. They won't be able to
              submit another offer for this task unless you reopen it.
            </p>
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejection-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-0.5 h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-900">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'Other (please specify)' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify your reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter your reason for rejecting this offer..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters
              </p>
            </div>
          )}

          {/* Feedback Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Tip</h4>
            <p className="text-sm text-blue-800">
              Providing a clear reason helps providers improve their offers and
              understand your requirements better for future tasks.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={!selectedReason || loading}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Rejecting...' : 'Reject Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}
