'use client';

/**
 * eSewa Payment Failure Page
 * 
 * Handles eSewa payment failure callback
 */

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ESewaFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your eSewa payment was not completed. No amount has been deducted from your account.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-2">Common reasons for failure:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Insufficient balance in eSewa account</li>
            <li>• Payment cancelled by user</li>
            <li>• Network connection issues</li>
            <li>• Session timeout</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          
          <button
            onClick={() => router.push('/my-tasks')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to My Tasks
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Need help? <a href="/support" className="text-primary hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
