'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { useAuth } from '@/hooks/useAuth';

interface KhaltiPaymentProps {
  amount: number;
  taskId: number;
  taskTitle: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function KhaltiPayment({
  amount,
  taskId,
  taskTitle,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}: KhaltiPaymentProps) {
  const { user } = useAuth();

  const generateTransactionId = () => {
    return `TN-${taskId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleKhaltiPayment = async () => {
    if (!user) {
      onError('Please login to continue');
      return;
    }

    setIsProcessing(true);

    try {
      const transactionId = generateTransactionId();
      const successUrl = `${window.location.origin}/payment/khalti/success?task_id=${taskId}`;
      const failureUrl = `${window.location.origin}/payment/khalti/failure?task_id=${taskId}`;

      const response = await paymentService.initiateKhaltiPayment({
        amount,
        transaction_id: transactionId,
        product_name: taskTitle,
        customer_info: {
          name: user.full_name || user.email,
          email: user.email,
          phone: user.phone_number || '',
        },
        success_url: successUrl,
        failure_url: failureUrl,
      });

      if (response.success && response.data) {
        // Store transaction data in localStorage for verification
        localStorage.setItem('khalti_transaction_id', transactionId);
        localStorage.setItem('khalti_pidx', response.data.pidx);
        localStorage.setItem('khalti_task_id', taskId.toString());
        localStorage.setItem('khalti_amount', amount.toString());

        // Redirect to Khalti payment page
        window.location.href = response.data.payment_url;
      } else {
        throw new Error('Failed to initiate Khalti payment');
      }
    } catch (error: any) {
      console.error('Khalti payment error:', error);
      onError(error.message || 'Failed to process Khalti payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Khalti Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <img src="/images/khalti-logo.png" alt="Khalti" className="h-8 w-8" />
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900">Pay with Khalti</h4>
            <p className="text-sm text-purple-700 mt-1">
              Simple, secure, and hassle-free digital wallet for Nepal.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Task Amount</span>
          <span className="font-medium">NPR {amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Service Charge</span>
          <span className="font-medium">NPR 0</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-semibold">Total Amount</span>
          <span className="font-bold text-lg text-primary">NPR {amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Instructions */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>You will be redirected to Khalti payment page</li>
            <li>Login with your Khalti account or mobile number</li>
            <li>Enter your MPIN to confirm payment</li>
            <li>You will be redirected back after payment</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Pay Button */}
      <Button
        onClick={handleKhaltiPayment}
        disabled={isProcessing}
        className="w-full bg-purple-600 hover:bg-purple-700"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting to Khalti...
          </>
        ) : (
          <>
            Pay NPR {amount.toLocaleString()} with Khalti
          </>
        )}
      </Button>

      {/* Test Credentials (for sandbox) */}
      {process.env.NODE_ENV === 'development' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Test Credentials:</strong>
            <br />
            Mobile: 9800000000, 9800000001, 9800000002
            <br />
            MPIN: 1111
            <br />
            OTP: 987654
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
