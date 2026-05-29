'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { useAuth } from '@/hooks/useAuth';

interface WalletPaymentProps {
  amount: number;
  taskId: number;
  taskTitle: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function WalletPayment({
  amount,
  taskId,
  taskTitle,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}: WalletPaymentProps) {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await paymentService.getWalletBalance();
      if (response.success && response.data) {
        setWalletBalance(response.data.available_balance ?? 0);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!user) {
      onError('Please login to continue');
      return;
    }

    if (walletBalance < amount) {
      onError('Insufficient wallet balance');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await paymentService.createPayment({
        task: taskId,
        amount,
        payment_method: 0, // Wallet payment method ID
        description: `Payment for task: ${taskTitle}`,
      });

      if (response.success && response.data) {
        // Process the payment
        const processResponse = await paymentService.processPayment(Number(response.data.id));
        
        if (processResponse.success) {
          onSuccess(processResponse.data);
        } else {
          throw new Error('Failed to process payment');
        }
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (error: any) {
      console.error('Wallet payment error:', error);
      onError(error.message || 'Failed to process wallet payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const hasSufficientBalance = walletBalance >= amount;

  return (
    <div className="space-y-4">
      {/* Wallet Balance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Your Wallet Balance</p>
              {isLoadingBalance ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-blue-900">
                  NPR {walletBalance.toLocaleString()}
                </p>
              )}
            </div>
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
          <span className="text-gray-600">Current Balance</span>
          <span className="font-medium">NPR {walletBalance.toLocaleString()}</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-semibold">Balance After Payment</span>
          <span className={`font-bold text-lg ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
            NPR {(walletBalance - amount).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Insufficient Balance Warning */}
      {!hasSufficientBalance && !isLoadingBalance && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Insufficient wallet balance. Please add funds to your wallet or use another payment method.
          </AlertDescription>
        </Alert>
      )}

      {/* Success Info */}
      {hasSufficientBalance && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Instant payment from your wallet</li>
              <li>Funds will be held in escrow until task completion</li>
              <li>No additional charges</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Pay Button */}
      <Button
        onClick={handleWalletPayment}
        disabled={isProcessing || !hasSufficientBalance || isLoadingBalance}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Pay NPR {amount.toLocaleString()} from Wallet
          </>
        )}
      </Button>

      {/* Add Funds Link */}
      {!hasSufficientBalance && !isLoadingBalance && (
        <div className="text-center">
          <Button variant="link" className="text-primary">
            Add Funds to Wallet
          </Button>
        </div>
      )}
    </div>
  );
}
