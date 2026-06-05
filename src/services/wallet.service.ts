/**
 * Wallet Service — /api/v1/wallets/
 */

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types';
import { paymentService } from './payment.service';

export type WalletBalance = {
  id: string;
  user_email: string;
  available_balance: number;
  withdrawable_balance?: number;
  pending_withdrawals_amount?: number;
  pending_balance: number;
  held_balance: number;
  total_balance: number;
  recharge_balance: number;
  earned_balance: number;
  total_earned: number;
  currency: string;
  is_frozen: boolean;
};

export type WalletTransaction = {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  reference_number: string;
  created_at: string;
};

export type WalletTransactionsPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: WalletTransaction[];
};

class WalletService {
  async getBalance(): Promise<ApiResponse<WalletBalance>> {
    return apiClient.get<WalletBalance>('/wallets/wallets/balance/');
  }

  async getRechargeSettings(): Promise<
    ApiResponse<{
      whatsapp_number: string;
      min_recharge_amount: number;
      max_recharge_amount: number;
    }>
  > {
    return apiClient.get('/wallets/wallets/recharge_settings/');
  }

  async getWithdrawalSettings(): Promise<
    ApiResponse<{
      min_withdrawal_amount: number;
      max_withdrawal_amount: number | null;
      currency: string;
    }>
  > {
    return apiClient.get('/wallets/wallets/withdrawal_settings/');
  }

  async getMyTransactions(filters?: {
    type?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<WalletTransactionsPage>> {
    return apiClient.get('/wallets/transactions/my_transactions/', { params: filters });
  }

  async getMyWithdrawals(filters?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<WalletTransactionsPage>> {
    return paymentService.getMyWithdrawals(filters);
  }

  async createWithdrawal(data: Parameters<typeof paymentService.createWithdrawalRequest>[0]) {
    return paymentService.createWithdrawalRequest(data);
  }

  async previewWithdrawalFee(data: { amount: number; withdrawal_method: string }) {
    return paymentService.previewWithdrawalFee(data);
  }

  /** Gateway top-up via eSewa (wallet recharge flow) */
  initiateESewaRecharge(data: {
    amount: number;
    transaction_id: string;
    product_name?: string;
    success_url: string;
    failure_url: string;
  }) {
    return paymentService.initiateESewaPayment({
      amount: data.amount,
      transaction_id: data.transaction_id,
      product_name: data.product_name ?? 'Wallet recharge',
      success_url: data.success_url,
      failure_url: data.failure_url,
    });
  }

  verifyESewaRecharge(data: {
    transaction_id: string;
    reference_id: string;
    amount: number;
  }) {
    return paymentService.verifyESewaPayment(data);
  }

  initiateKhaltiRecharge(data: Parameters<typeof paymentService.initiateKhaltiPayment>[0]) {
    return paymentService.initiateKhaltiPayment(data);
  }

  verifyKhaltiRecharge(data: Parameters<typeof paymentService.verifyKhaltiPayment>[0]) {
    return paymentService.verifyKhaltiPayment(data);
  }
}

export const walletService = new WalletService();
export default walletService;
