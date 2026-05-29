'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Wallet } from 'lucide-react';
import ESewaPayment from './ESewaPayment';
import KhaltiPayment from './KhaltiPayment';
import WalletPayment from './WalletPayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  taskId: number;
  taskTitle: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  taskId,
  taskTitle,
  onSuccess,
  onError,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'esewa' | 'khalti' | 'wallet'>('esewa');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = (paymentData: any) => {
    setIsProcessing(false);
    onSuccess(paymentData);
    onClose();
  };

  const handlePaymentError = (error: string) => {
    setIsProcessing(false);
    onError(error);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Task</span>
              <span className="font-medium">{taskTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-2xl font-bold text-primary">NPR {amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <Tabs value={selectedMethod} onValueChange={(value: string) => setSelectedMethod(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="esewa">
                <img src="/images/esewa-logo.png" alt="eSewa" className="h-6 mr-2" />
                eSewa
              </TabsTrigger>
              <TabsTrigger value="khalti">
                <img src="/images/khalti-logo.png" alt="Khalti" className="h-6 mr-2" />
                Khalti
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="esewa" className="mt-4">
              <ESewaPayment
                amount={amount}
                taskId={taskId}
                taskTitle={taskTitle}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </TabsContent>

            <TabsContent value="khalti" className="mt-4">
              <KhaltiPayment
                amount={amount}
                taskId={taskId}
                taskTitle={taskTitle}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </TabsContent>

            <TabsContent value="wallet" className="mt-4">
              <WalletPayment
                amount={amount}
                taskId={taskId}
                taskTitle={taskTitle}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </TabsContent>
          </Tabs>

          {/* Security Notice */}
          <div className="text-xs text-gray-500 text-center">
            <p>🔒 Your payment is secure and encrypted</p>
            <p>Funds will be held in escrow until task completion</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
