'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { useAuth } from '@/hooks/useAuth';

interface ESewaPaymentProps {
  amount: number;
  taskId: number;
  taskTitle: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function ESewaPayment({
  amount,
  taskId,
  taskTitle,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}: ESewaPaymentProps) {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const generateTransactionId = () => {
    return `TN-${taskId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleESewaPayment = async () => {
    if (!user) {
      onError('Please login to continue');
      return;
    }

    setIsProcessing(true);

    try {
      const transactionId = generateTransactionId();
      const successUrl = `${window.location.origin}/payment/esewa/success?task_id=${taskId}`;
      const failureUrl = `${window.location.origin}/payment/esewa/failure?task_id=${taskId}`;

      const response = await paymentService.initiateESewaPayment({
        amount,
        transaction_id: transactionId,
        product_name: taskTitle,
        success_url: successUrl,
        failure_url: failureUrl,
      });

      if (response.success && response.data) {
        // Store transaction ID in localStorage for verification
        localStorage.setItem('esewa_transaction_id', transactionId);
        localStorage.setItem('esewa_task_id', taskId.toString());
        localStorage.setItem('esewa_amount', amount.toString());

        // Create and submit form
        const form = formRef.current;
        if (form) {
          // Clear existing form fields
          form.innerHTML = '';

          // Add form fields
          Object.entries(response.data.form_data).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          });

          // Set form action and submit
          form.action = response.data.payment_url;
          form.method = 'POST';
          form.submit();
        }
      } else {
        throw new Error('Failed to initiate eSewa payment');
      }
    } catch (error: any) {
      console.error('eSewa payment error:', error);
      onError(error.message || 'Failed to process eSewa payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* eSewa Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <img src="/images/esewa-logo.png" alt="eSewa" className="h-8 w-8" />
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900">Pay with eSewa</h4>
            <p className="text-sm text-purple-700 mt-1">
              Nepal's most trusted digital wallet. Fast, secure, and convenient.
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
            <li>You will be redirected to eSewa payment page</li>
            <li>Login with your eSewa credentials</li>
            <li>Confirm the payment</li>
            <li>You will be redirected back after payment</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Hidden Form for eSewa */}
      <form ref={formRef} style={{ display: 'none' }} />

      {/* Pay Button */}
      <Button
        onClick={handleESewaPayment}
        disabled={isProcessing}
        className="w-full bg-purple-600 hover:bg-purple-700"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Pay NPR {amount.toLocaleString()} with eSewa
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
            eSewa ID: 9806800001, 9806800002, 9806800003
            <br />
            MPIN: 1111, 1212, 1313
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
