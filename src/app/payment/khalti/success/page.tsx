'use client';

/**
 * Khalti Payment Success Page
 * 
 * Handles Khalti payment success callback and verification
 * Query params from Khalti:
 * - pidx: Payment index
 * - transaction_id: Khalti transaction ID
 * - amount: Amount in paisa
 * - purchase_order_id: Our order ID
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentService } from '@/services/payment.service';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

function KhaltiSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get query parameters from Khalti callback
      const pidx = searchParams.get('pidx');
      const transactionId = searchParams.get('transaction_id');
      const amount = searchParams.get('amount');
      const purchaseOrderId = searchParams.get('purchase_order_id');

      if (!pidx) {
        throw new Error('Missing payment index');
      }

      // Verify payment with backend
      const response = await paymentService.verifyKhaltiPayment({
        pidx,
        transaction_id: transactionId || '',
      });

      if (response.success) {
        setPaymentDetails(response.data);
        setStatus('success');

        // Redirect to task page after 3 seconds
        setTimeout(() => {
          // Use task_slug if available, otherwise use task_id
          const taskIdentifier = (response.data as any)?.task_slug || (response.data as any)?.task_id;
          if (taskIdentifier) {
            router.push(`/task/${taskIdentifier}`);
          } else {
            router.push('/my-tasks');
          }
        }, 3000);
      } else {
        throw new Error((response as any).error || 'Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setError(err.message || 'Failed to verify payment');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your payment with Khalti...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment has been confirmed and the task has been assigned.
            </p>

            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium text-gray-900">
                      {paymentDetails.transaction_id || searchParams.get('transaction_id')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">
                      NPR {paymentDetails.amount?.toLocaleString() || 
                        (searchParams.get('amount') ? (parseInt(searchParams.get('amount')!) / 100).toLocaleString() : 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">Khalti</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  const taskIdentifier = (paymentDetails as any)?.task_slug || (paymentDetails as any)?.task_id;
                  router.push(taskIdentifier ? `/task/${taskIdentifier}` : '/my-tasks');
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                View Task
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push('/my-tasks')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Go to My Tasks
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'We could not verify your payment. Please contact support.'}
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-yellow-900 mb-2">What to do next:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Check if the amount was deducted from your Khalti account</li>
                <li>• Contact our support team with your transaction details</li>
                <li>• We'll manually verify and process your payment</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/support')}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </button>
              <button
                onClick={() => router.push('/my-tasks')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Go to My Tasks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KhaltiSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
            <p className="text-gray-600">Please wait while we confirm your payment with Khalti...</p>
          </div>
        </div>
      }
    >
      <KhaltiSuccessContent />
    </Suspense>
  );
}
