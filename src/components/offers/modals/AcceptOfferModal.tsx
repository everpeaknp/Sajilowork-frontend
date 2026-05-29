'use client';

/**
 * AcceptOfferModal Component
 * 
 * Modal for accepting an offer with payment initiation
 * Features:
 * - Offer summary
 * - Payment method selection (eSewa/Khalti/Wallet)
 * - Fee breakdown
 * - Terms confirmation
 * - Payment initiation
 */

import { useState, useEffect } from 'react';
import { paymentService } from '@/services';
import type { FeePreview } from '@/services/payment.service';
import { formatNPR } from '@/lib/nepalLocale';
import { Bid, Task } from '@/types';
import { X, Check, AlertCircle, DollarSign, Clock, User } from 'lucide-react';
import PaymentModal from '@/components/payment/PaymentModal';

interface AcceptOfferModalProps {
  offer: Bid;
  task: Task;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AcceptOfferModal({
  offer,
  task,
  onConfirm,
  onCancel,
}: AcceptOfferModalProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feePreview, setFeePreview] = useState<FeePreview | null>(null);
  const [feeLoading, setFeeLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setFeeLoading(true);
        const res = await paymentService.getFeePreview(offer.amount, 'wallet');
        if (!cancelled && res.success && res.data) {
          setFeePreview(res.data);
        }
      } catch {
        if (!cancelled) setFeePreview(null);
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [offer.amount]);

  const platformFee = feePreview?.platform_fee ?? 0;
  const escrowFee = feePreview?.escrow ?? 0;
  const taxFee = feePreview?.tax ?? 0;
  const taskerReceives = feePreview?.net_amount ?? offer.amount;
  const commissionPercent = feePreview?.tasker_commission_percent ?? 10;
  const totalHeld = feePreview?.poster_total_held ?? offer.amount;

  const handleAccept = async () => {
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the parent confirm handler
      await onConfirm();
      
      setShowPaymentModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to accept offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Accept Offer</h2>
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

            {/* Task Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Task Details</h3>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Task:</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-xs">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm text-gray-900">
                    {task.address || task.city || 'Remote'}
                  </span>
                </div>
              </div>
            </div>

            {/* Provider Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Selected Provider</h3>
              <div className="flex items-start gap-4">
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
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {offer.tasker.first_name} {offer.tasker.last_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <span>⭐ {offer.tasker.average_rating?.toFixed(1) || 'New'}</span>
                    <span>•</span>
                    <span>{offer.tasker.completed_tasks || 0} tasks completed</span>
                  </div>
                  {offer.proposal && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {offer.proposal}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Offer Amount</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    NPR {offer.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Completion Time</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {offer.estimated_duration} days
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  {feeLoading ? (
                    <p className="text-sm text-gray-500">Loading fee breakdown…</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>
                          Platform commission ({commissionPercent}%)
                          {!feePreview?.fees_enabled ? ' — disabled' : ''}
                        </span>
                        <span>{formatNPR(platformFee)}</span>
                      </div>
                      {escrowFee > 0 && (
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Escrow / service fee</span>
                          <span>{formatNPR(escrowFee)}</span>
                        </div>
                      )}
                      {taxFee > 0 && (
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Tax</span>
                          <span>{formatNPR(taxFee)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Tasker receives on completion</span>
                        <span className="font-medium text-green-700">
                          {formatNPR(taskerReceives)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Held from your wallet
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatNPR(totalHeld)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Important</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Payment will be held in escrow until task completion</li>
                <li>• Funds will be released to provider after you approve the work</li>
                <li>• You can request revisions before approving</li>
                <li>• Disputes can be raised if work is unsatisfactory</li>
              </ul>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="accept-terms" className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and understand that payment will be held in escrow until task completion.
                I understand the platform fee ({commissionPercent}%) is deducted when the
                tasker is paid on completion.
              </label>
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
              onClick={handleAccept}
              disabled={!acceptTerms || loading}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={totalHeld}
          taskId={Number(task.id)}
          taskTitle={task.title}
          onSuccess={handlePaymentSuccess}
          onError={(error) => {
            console.error('Payment error:', error);
            setShowPaymentModal(false);
          }}
        />
      )}
    </>
  );
}
