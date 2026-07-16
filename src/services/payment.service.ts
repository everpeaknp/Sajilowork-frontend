/**
 * Payment Service
 * 
 * Handles all payment-related API calls
 */

import { apiClient } from '@/lib/api/client';
import { ApiResponse, Payment, PaymentMethodData } from '@/types';

export interface CreatePaymentData {
  task: number;
  amount: number;
  payment_method: number;
  description?: string;
}

export interface PaymentFilters {
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  task?: number;
  from_date?: string;
  to_date?: string;
}

export type PaymentHistoryDirection = 'earned' | 'outgoing';

export interface PaymentHistoryItem {
  id: string;
  kind: 'payment' | 'wallet';
  title: string;
  subtitle: string;
  amount: number;
  gross_amount?: number | null;
  platform_fee?: number | null;
  net_amount?: number | null;
  currency: string;
  status: string;
  direction: PaymentHistoryDirection;
  created_at: string;
  task_id?: string | null;
  counterparty_name?: string;
  counterparty_email?: string;
  counterparty_location?: string;
}

export interface FeePreview {
  gross_amount: number;
  platform_fee: number;
  processing_fee: number;
  total_fees: number;
  net_amount: number;
  poster_total_held: number;
  tasker_commission_percent: number;
  fees_enabled: boolean;
  currency: string;
  commission?: number;
  escrow?: number;
  tax?: number;
  discount?: number;
  total_customer_pays?: number;
  worker_receives?: number;
  platform_profit?: number;
}

export interface PaymentHistoryResponse {
  direction: PaymentHistoryDirection;
  items: PaymentHistoryItem[];
  total_amount: number;
  count: number;
  currency: string;
}

class PaymentService {
  private readonly BASE_PATH = '/payments';
  private readonly PAYMENTS_PATH = '/payments/payments';

  /**
   * Get all payments for current user (payer or payee)
   */
  async getPayments(filters?: PaymentFilters): Promise<ApiResponse<Payment[]>> {
    return apiClient.get(`${this.PAYMENTS_PATH}/`, { params: filters });
  }

  /**
   * Task-related payment history for dashboard (earned vs outgoing)
   */
  async getPaymentHistory(
    direction: PaymentHistoryDirection
  ): Promise<ApiResponse<PaymentHistoryResponse>> {
    return apiClient.get(`${this.PAYMENTS_PATH}/payment_history/`, {
      params: { direction },
    });
  }

  /**
   * Admin-configured platform fee settings (read-only).
   */
  async getFeeSettings(): Promise<
    ApiResponse<{
      is_enabled: boolean;
      tasker_commission_percent: string;
      poster_service_fee_percent: string;
      min_platform_fee: string;
      max_platform_fee: string | null;
      currency: string;
    }>
  > {
    return apiClient.get(`${this.PAYMENTS_PATH}/fee_settings/`);
  }

  /**
   * Preview fees for a bid amount before accepting an offer.
   * Uses FeeRule rows (optionally scoped by listing_kind) via POST /fees/calculate/.
   */
  async getFeePreview(
    amount: number,
    paymentMethod: 'wallet' | 'card' = 'wallet',
    options?: {
      listing_kind?: 'task' | 'project' | 'service' | 'job';
      category_id?: string;
    }
  ): Promise<ApiResponse<FeePreview>> {
    const feesRes = await apiClient.post<FeePreview>('/fees/calculate/', {
      task_amount: amount,
      payment_method: paymentMethod,
      ...(options?.listing_kind ? { listing_kind: options.listing_kind } : {}),
      ...(options?.category_id ? { category_id: options.category_id } : {}),
    });
    if (feesRes.success && feesRes.data) {
      const d: any = feesRes.data;
      return {
        success: true,
        message: 'OK',
        data: {
          gross_amount: Number(d.task_amount ?? d.gross_amount ?? amount),
          platform_fee: Number(d.commission ?? d.platform_fee ?? 0),
          processing_fee: Number(d.processing_fee ?? 0),
          total_fees: Number(
            (d.commission ?? 0) + (d.escrow ?? 0) + (d.tax ?? 0)
          ),
          net_amount: Number(d.worker_receives ?? d.net_amount ?? amount),
          poster_total_held: Number(
            d.total_customer_pays ?? d.poster_total_held ?? amount
          ),
          tasker_commission_percent: Number(
            d.lines?.commission?.value ??
              d.tasker_commission_percent ??
              0
          ),
          fees_enabled: true,
          currency: d.currency ?? 'NPR',
          commission: Number(d.commission ?? 0),
          escrow: Number(d.escrow ?? 0),
          tax: Number(d.tax ?? 0),
          discount: Number(d.discount ?? 0),
          total_customer_pays: Number(d.total_customer_pays ?? amount),
          worker_receives: Number(d.worker_receives ?? amount),
          platform_profit: Number(d.platform_profit ?? 0),
        },
      };
    }
    return apiClient.get(`${this.PAYMENTS_PATH}/fee_preview/`, {
      params: { amount, payment_method: paymentMethod },
    });
  }

  /**
   * Preview cancellation / early-withdraw fee from FeeRule (CANCELLATION_FEE).
   */
  async getCancellationFeePreview(data: {
    task_amount: number;
    stage: 'BEFORE_ACCEPT' | 'AFTER_ACCEPT' | 'IN_PROGRESS';
    listing_kind?: 'task' | 'project' | 'service' | 'job';
    category_id?: string;
  }): Promise<
    ApiResponse<{
      cancellation_fee: number;
      stage: string;
      rule_id?: string | null;
      rule_name?: string;
    }>
  > {
    return apiClient.post(`/fees/cancellation/`, {
      task_amount: data.task_amount,
      stage: data.stage,
      ...(data.listing_kind ? { listing_kind: data.listing_kind } : {}),
      ...(data.category_id ? { category_id: data.category_id } : {}),
    });
  }

  /**
   * Get payment by ID
   */
  async getPayment(id: number): Promise<ApiResponse<Payment>> {
    return apiClient.get(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Create a new payment
   */
  async createPayment(data: CreatePaymentData): Promise<ApiResponse<Payment>> {
    return apiClient.post(`${this.BASE_PATH}/`, data);
  }

  /**
   * Process payment (complete the transaction)
   */
  async processPayment(id: number): Promise<ApiResponse<Payment>> {
    return apiClient.post(`${this.BASE_PATH}/${id}/process/`);
  }

  /**
   * Refund a payment
   */
  async refundPayment(id: number, reason?: string): Promise<ApiResponse<Payment>> {
    return apiClient.post(`${this.BASE_PATH}/${id}/refund/`, { reason });
  }

  /**
   * Get payment methods for current user
   */
  async getPaymentMethods(forceRefresh = false): Promise<ApiResponse<PaymentMethodData[]>> {
    const url = forceRefresh
      ? `${this.BASE_PATH}/payment-methods/?_t=${Date.now()}`
      : `${this.BASE_PATH}/payment-methods/`;
    const response = await apiClient.get<PaymentMethodData[] | { results: PaymentMethodData[] }>(url);
    if (!response.success) {
      return response as ApiResponse<PaymentMethodData[]>;
    }
    const raw = response.data;
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as { results?: PaymentMethodData[] }).results)
        ? (raw as { results: PaymentMethodData[] }).results
        : [];
    return { ...response, data: list };
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(data: {
    method_type: 'card' | 'bank_account' | 'esewa';
    stripe_payment_method_id?: string;
    is_default?: boolean;
    // eSewa fields
    esewa_account_name?: string;
    esewa_phone_number?: string;
  }): Promise<ApiResponse<PaymentMethodData>> {
    return apiClient.post(`${this.BASE_PATH}/payment-methods/`, data);
  }

  /**
   * Link eSewa account
   */
  async linkESewaAccount(data: {
    esewa_account_name: string;
    esewa_phone_number: string;
    is_default?: boolean;
  }): Promise<ApiResponse<PaymentMethodData>> {
    return apiClient.post(`${this.BASE_PATH}/payment-methods/`, {
      method_type: 'esewa',
      esewa_account_name: data.esewa_account_name,
      esewa_phone_number: data.esewa_phone_number,
      is_default: data.is_default || false
    });
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE_PATH}/payment-methods/${id}/`);
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(id: string): Promise<ApiResponse<PaymentMethodData>> {
    return apiClient.post(`${this.BASE_PATH}/payment-methods/${id}/set_default/`);
  }

  /**
   * Initiate eSewa payment
   */
  async initiateESewaPayment(data: {
    amount: number;
    transaction_id: string;
    product_name: string;
    success_url: string;
    failure_url: string;
  }): Promise<ApiResponse<{
    payment_url: string;
    form_data: Record<string, string>;
    transaction_id: string;
  }>> {
    return apiClient.post(`${this.BASE_PATH}/payments/esewa/initiate/`, data);
  }

  /**
   * Verify eSewa payment
   */
  async verifyESewaPayment(data: {
    transaction_id: string;
    reference_id: string;
    amount: number;
  }): Promise<ApiResponse<{
    verified: boolean;
    status: string;
    transaction_id: string;
  }>> {
    return apiClient.post(`${this.BASE_PATH}/payments/esewa/verify/`, data);
  }

  /**
   * Initiate Khalti payment
   */
  async initiateKhaltiPayment(data: {
    amount: number;
    transaction_id: string;
    product_name: string;
    customer_info: {
      name: string;
      email: string;
      phone: string;
    };
    success_url: string;
    failure_url: string;
  }): Promise<ApiResponse<{
    payment_url: string;
    pidx: string;
    transaction_id: string;
    expires_at: string;
  }>> {
    return apiClient.post(`${this.BASE_PATH}/payments/khalti/initiate/`, data);
  }

  /**
   * Verify Khalti payment
   */
  async verifyKhaltiPayment(data: {
    transaction_id: string;
    pidx: string;
  }): Promise<ApiResponse<{
    verified: boolean;
    status: string;
    transaction_id: string;
    amount: number;
  }>> {
    return apiClient.post(`${this.BASE_PATH}/payments/khalti/verify/`, data);
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<ApiResponse<{
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
  }>> {
    return apiClient.get(`/wallets/wallets/balance/`);
  }

  /**
   * Wallet recharge settings (admin WhatsApp, amount limits) from backend env
   */
  async getWalletRechargeSettings(): Promise<ApiResponse<{
    whatsapp_number: string;
    min_recharge_amount: number;
    max_recharge_amount: number;
  }>> {
    return apiClient.get(`/wallets/wallets/recharge_settings/`);
  }

  async getWalletWithdrawalSettings(): Promise<ApiResponse<{
    min_withdrawal_amount: number;
    max_withdrawal_amount: number | null;
    currency: string;
  }>> {
    return apiClient.get(`/wallets/wallets/withdrawal_settings/`);
  }

  /**
   * Get wallet transactions (recharge history)
   */
  async getWalletTransactions(filters?: {
    type?: string;
    status?: string;
    purpose?: 'recharge';
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<{
      id: string;
      transaction_type: string;
      amount: number;
      currency: string;
      status: string;
      description: string;
      reference_number: string;
      created_at: string;
      metadata?: Record<string, unknown> | null;
    }>;
  }>> {
    const response = await apiClient.get<
      | Array<{
          id: string;
          transaction_type: string;
          amount: number;
          currency: string;
          status: string;
          description: string;
          reference_number: string;
          created_at: string;
          metadata?: Record<string, unknown> | null;
        }>
      | {
          count: number;
          next: string | null;
          previous: string | null;
          results: Array<{
            id: string;
            transaction_type: string;
            amount: number;
            currency: string;
            status: string;
            description: string;
            reference_number: string;
            created_at: string;
            metadata?: Record<string, unknown> | null;
          }>;
        }
    >(`/wallets/transactions/my_transactions/`, { params: filters });

    if (!response.success) {
      return response as ApiResponse<{
        count: number;
        next: string | null;
        previous: string | null;
        results: Array<{
          id: string;
          transaction_type: string;
          amount: number;
          currency: string;
          status: string;
          description: string;
          reference_number: string;
          created_at: string;
        }>;
      }>;
    }

    const raw = response.data;
    if (Array.isArray(raw)) {
      return {
        ...response,
        data: {
          count: raw.length,
          next: null,
          previous: null,
          results: raw,
        },
      };
    }

    const results = raw?.results ?? [];
    return {
      ...response,
      data: {
        count: raw?.count ?? results.length,
        next: raw?.next ?? null,
        previous: raw?.previous ?? null,
        results,
      },
    };
  }

  /**
   * Get current user's withdrawal requests
   */
  async getMyWithdrawals(filters?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<{
      id: string;
      amount: number;
      currency: string;
      net_amount: number;
      withdrawal_method: string;
      status: string;
      created_at: string;
      completed_at: string | null;
    }>;
  }>> {
    const response = await apiClient.get<
      | Array<{
          id: string;
          amount: number;
          currency: string;
          net_amount: number;
          withdrawal_method: string;
          status: string;
          created_at: string;
          completed_at: string | null;
        }>
      | {
          count: number;
          next: string | null;
          previous: string | null;
          results: Array<{
            id: string;
            amount: number;
            currency: string;
            net_amount: number;
            withdrawal_method: string;
            status: string;
            created_at: string;
            completed_at: string | null;
          }>;
        }
    >(`/wallets/withdrawals/my_withdrawals/`, { params: filters });

    if (!response.success) {
      return response as ApiResponse<{
        count: number;
        next: string | null;
        previous: string | null;
        results: Array<{
          id: string;
          amount: number;
          currency: string;
          net_amount: number;
          withdrawal_method: string;
          status: string;
          created_at: string;
          completed_at: string | null;
        }>;
      }>;
    }

    const raw = response.data;
    if (Array.isArray(raw)) {
      return {
        ...response,
        data: {
          count: raw.length,
          next: null,
          previous: null,
          results: raw,
        },
      };
    }

    const results = raw?.results ?? [];
    return {
      ...response,
      data: {
        count: raw?.count ?? results.length,
        next: raw?.next ?? null,
        previous: raw?.previous ?? null,
        results,
      },
    };
  }

  /**
   * Add funds to wallet
   */
  async addFundsToWallet(data: {
    amount: number;
    payment_method: 'esewa' | 'khalti' | 'card';
  }): Promise<ApiResponse<Payment>> {
    return apiClient.post(`/wallets/add-funds/`, data);
  }

  /**
   * Preview withdrawal fee (admin-configurable rules)
   */
  async previewWithdrawalFee(data: {
    amount: number;
    withdrawal_method: string;
  }): Promise<ApiResponse<{
    withdrawal_fee: number;
    net_amount: number;
    rule_id?: string;
    rule_name?: string;
  }>> {
    return apiClient.post(`/fees/withdrawal/`, data);
  }

  /**
   * Request a wallet withdrawal (pending admin approval)
   */
  async createWithdrawalRequest(data: {
    amount: number;
    withdrawal_method: 'bank_transfer' | 'esewa' | 'khalti' | 'paypal';
    bank_account_name?: string;
    bank_account_number?: string;
    bank_name?: string;
    bank_routing_number?: string;
    paypal_email?: string;
    notes?: string;
  }): Promise<ApiResponse<{
    id: string;
    amount: number;
    net_amount: number;
    withdrawal_method: string;
    status: string;
    currency: string;
    created_at: string;
  }>> {
    return apiClient.post(`/wallets/withdrawals/`, data);
  }

  /** Cancel a pending or in-progress withdrawal request */
  async cancelWithdrawalRequest(withdrawalId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/wallets/withdrawals/${withdrawalId}/cancel/`, {});
  }
}

export const paymentService = new PaymentService();
export default paymentService;
