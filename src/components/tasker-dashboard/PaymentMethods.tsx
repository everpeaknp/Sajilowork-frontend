'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Wallet, ArrowRight, ArrowDownLeft, ArrowUpRight, Zap, TrendingUp, MessageCircle, X } from 'lucide-react';
import DashboardPayouts, { type Payout, type PayoutStatus } from '@/app/dashboard/DashboardPayouts';
import DashboardRecharges, { type Recharge } from '@/app/dashboard/DashboardRecharges';

const fieldLabelClass = 'text-sm font-semibold text-gray-600';
const fieldInputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-base font-semibold text-brand-dark outline-none transition-all placeholder:text-gray-400 focus:border-brand-emerald focus:bg-white focus:ring-2 focus:ring-brand-emerald/15';
import { cn } from '@/lib/utils';
import { paymentService } from '@/services';
import { PaymentMethodData } from '@/types';
import { toast } from 'sonner';
import { formatNPR } from '@/lib/nepalLocale';
import {
  getWalletRechargeMethodLabel,
  isWalletRechargeTransaction,
} from '@/lib/walletRecharge';
import { USER_PROFILE_UPDATED } from '@/lib/userProfileSync';
import { useAuthStore } from '@/store/auth.store';

interface WalletData {
  id: string;
  user_email?: string;
  available_balance: number;
  withdrawable_balance?: number;
  pending_withdrawals_amount?: number;
  pending_balance: number;
  held_balance: number;
  total_balance: number;
  recharge_balance: number;
  earned_balance: number;
  total_earned?: number;
  currency: string;
  is_frozen: boolean;
}

interface WalletTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  reference_number: string;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

function validateWithdrawAmountInput(
  raw: string,
  available: number,
  minAmount: number,
  maxAmount: number | null
): { amount: number | null; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { amount: null, error: null };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { amount: null, error: 'Enter a valid amount' };
  }
  if (value < minAmount) {
    return { amount: null, error: `Minimum withdrawal is ${formatNPR(minAmount)}` };
  }
  if (maxAmount !== null && value > maxAmount) {
    return { amount: null, error: `Maximum withdrawal is ${formatNPR(maxAmount)}` };
  }
  if (value > available) {
    return { amount: null, error: `Maximum available is ${formatNPR(available)}` };
  }
  return { amount: Math.round(value * 100) / 100, error: null };
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  currency: string;
  net_amount: number;
  withdrawal_method: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

type PaymentMethodsTab = 'wallet' | 'recharges' | 'payouts';

function mapTransactionStatus(status: string, index: number): PayoutStatus {
  switch (status) {
    case 'completed':
    case 'approved':
      return 'Approved';
    case 'processing':
      return 'Processing';
    case 'pending':
      return index % 2 === 0 ? 'Pending Orange' : 'Pending Blue';
    default:
      return 'Processing';
  }
}

function mapWithdrawalStatus(status: string, index: number): PayoutStatus {
  switch (status) {
    case 'completed':
    case 'approved':
      return 'Approved';
    case 'processing':
      return 'Processing';
    case 'pending':
      return index % 2 === 0 ? 'Pending Orange' : 'Pending Blue';
    default:
      return 'Processing';
  }
}

interface PaymentMethodsProps {
  initialTab?: PaymentMethodsTab;
}

export default function PaymentMethods({ initialTab = 'wallet' }: PaymentMethodsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDashboardWallet = pathname.startsWith('/dashboard/wallet');
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<PaymentMethodsTab>(initialTab);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRecord[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [isRecharging, setIsRecharging] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [customRechargeAmount, setCustomRechargeAmount] = useState<string>('500');
  const [rechargeAmountError, setRechargeAmountError] = useState<string | null>(null);
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = useState('');
  const [rechargeMinAmount, setRechargeMinAmount] = useState(100);
  const [rechargeMaxAmount, setRechargeMaxAmount] = useState(10000);
  const [withdrawMinAmount, setWithdrawMinAmount] = useState(10);
  const [withdrawMaxAmount, setWithdrawMaxAmount] = useState<number | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [customWithdrawAmount, setCustomWithdrawAmount] = useState<string>('');
  const [withdrawAmountError, setWithdrawAmountError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'esewa' | 'bank_transfer'>('esewa');
  const [selectedEsewaMethodId, setSelectedEsewaMethodId] = useState<string>('');
  const [withdrawFee, setWithdrawFee] = useState<number | null>(null);
  const [withdrawNetAmount, setWithdrawNetAmount] = useState<number | null>(null);
  const [bankWithdrawDetails, setBankWithdrawDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    void fetchWalletData();
  }, []);

  const selectTab = useCallback(
    (tab: PaymentMethodsTab) => {
      setActiveTab(tab);
      if (!isDashboardWallet) return;

      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'wallet') {
        params.delete('section');
      } else {
        params.set('section', tab);
      }
      const query = params.toString();
      router.replace(query ? `/dashboard/wallet?${query}` : '/dashboard/wallet', { scroll: false });
    },
    [isDashboardWallet, router, searchParams]
  );

  useEffect(() => {
    const modalOpen = showWithdrawModal || showRechargeModal;
    if (!modalOpen || typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showWithdrawModal, showRechargeModal]);

  useEffect(() => {
    const onProfileUpdated = () => {
      fetchPaymentMethods(true);
    };
    window.addEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
    return () => window.removeEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
  }, []);

  const fetchPaymentMethods = async (forceRefresh = false) => {
    try {
      const response = await paymentService.getPaymentMethods(forceRefresh);
      if (response.success && response.data) {
        setPaymentMethods(Array.isArray(response.data) ? response.data : []);
      } else {
        setPaymentMethods([]);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch payment methods:', error);
      setPaymentMethods([]);
    }
  };

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      
      const [balanceResponse, settingsResponse] = await Promise.all([
        paymentService.getWalletBalance(),
        paymentService.getWalletRechargeSettings(),
      ]);

      if (balanceResponse.success && balanceResponse.data) {
        setWalletData(balanceResponse.data);
      }

      if (settingsResponse.success && settingsResponse.data) {
        setAdminWhatsAppNumber(
          String(settingsResponse.data.whatsapp_number || '').replace(/[^\d]/g, '')
        );
        setRechargeMinAmount(settingsResponse.data.min_recharge_amount ?? 100);
        setRechargeMaxAmount(settingsResponse.data.max_recharge_amount ?? 10000);
      }

      try {
        const withdrawalSettings = await paymentService.getWalletWithdrawalSettings();
        if (withdrawalSettings.success && withdrawalSettings.data) {
          setWithdrawMinAmount(withdrawalSettings.data.min_withdrawal_amount ?? 10);
          setWithdrawMaxAmount(withdrawalSettings.data.max_withdrawal_amount ?? null);
        }
      } catch {
        // fallback to defaults
      }
      
      const [transactionsResponse, withdrawalsResponse, paymentMethodsResponse] = await Promise.all([
        paymentService.getWalletTransactions({ page_size: 50, purpose: 'recharge' }),
        paymentService.getMyWithdrawals({ page_size: 20 }),
        paymentService.getPaymentMethods(),
      ]);

      if (paymentMethodsResponse.success && paymentMethodsResponse.data) {
        setPaymentMethods(
          Array.isArray(paymentMethodsResponse.data) ? paymentMethodsResponse.data : []
        );
      }

      if (transactionsResponse.success && transactionsResponse.data) {
        const all = transactionsResponse.data.results ?? [];
        setWalletTransactions(
          all.filter((tx) => isWalletRechargeTransaction(tx)).slice(0, 50)
        );
      } else {
        setWalletTransactions([]);
      }

      if (withdrawalsResponse.success && withdrawalsResponse.data) {
        setWithdrawalHistory(withdrawalsResponse.data.results ?? []);
      } else {
        setWithdrawalHistory([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch wallet data:', error);
      toast.error(error.message || 'Failed to load wallet data');
      setWalletTransactions([]);
      setWithdrawalHistory([]);
    } finally {
      setWalletLoading(false);
    }
  };

  const getWithdrawalMethodLabel = (method: string) => {
    switch (method) {
      case 'esewa':
        return 'eSewa';
      case 'khalti':
        return 'Khalti';
      case 'bank_transfer':
        return 'Bank transfer';
      case 'paypal':
        return 'PayPal';
      default:
        return method.replace(/_/g, ' ');
    }
  };

  const handleRechargeViaESewa = async () => {
    if (!selectedAmount || selectedAmount <= 0) {
      toast.error('Please select a valid amount');
      return;
    }

    try {
      setIsRecharging(true);

      const transactionId = `WALLET-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const response = await paymentService.initiateESewaPayment({
        amount: selectedAmount,
        transaction_id: transactionId,
        product_name: 'Wallet Recharge',
        success_url: `${window.location.origin}/payment/esewa/success`,
        failure_url: `${window.location.origin}/payment/esewa/failure`
      });

      console.log('eSewa API Full Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        const paymentData = response.data || response;
        const { payment_url, form_data, transaction_id } = paymentData;
        
        console.log('Payment URL:', payment_url);
        console.log('Form Data:', form_data);
        console.log('Transaction ID:', transaction_id);
        
        if (!payment_url) {
          console.error('Missing payment_url in response:', paymentData);
          toast.error('Invalid payment response: missing payment URL');
          return;
        }

        if (!form_data) {
          console.error('Missing form_data in response:', paymentData);
          toast.error('Invalid payment response: missing form data');
          return;
        }

        localStorage.setItem('esewa_wallet_transaction_id', transaction_id);
        localStorage.setItem('esewa_wallet_amount', selectedAmount.toString());

        toast.success('Redirecting to eSewa payment page...');
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payment_url;

        Object.entries(form_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        console.log('Submitting form to:', payment_url);
        console.log('Form data being submitted:', form_data);
        form.submit();
      } else {
        console.error('Payment initiation failed:', response);
        toast.error('Failed to initiate eSewa payment');
      }
    } catch (error: any) {
      console.error('eSewa payment error:', error);
      
      if (error?.status === 404) {
        toast.error('Payment endpoint not found. Check backend server.');
      } else if (error?.status === 401) {
        toast.error('Authentication required. Please sign in again.');
      } else if (error?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.message || 'Failed to initiate payment');
      }
    } finally {
      setIsRecharging(false);
    }
  };

  const handleRechargeViaWhatsApp = async () => {
    if (!selectedAmount || selectedAmount <= 0) {
      toast.error('Please select a valid amount');
      return;
    }

    const userEmail =
      walletData?.user_email?.trim() ||
      user?.email?.trim() ||
      'UNKNOWN_EMAIL';
    const requestId = `WA-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const message = [
      'Hello Admin, I want to recharge my wallet.',
      `Amount: NPR ${selectedAmount}`,
      `User Email: ${userEmail}`,
      `Request ID: ${requestId}`,
      '',
      'Please confirm and recharge manually. Thank you.',
    ].join('\n');

    let whatsappNumber = adminWhatsAppNumber;
    try {
      const settingsResponse = await paymentService.getWalletRechargeSettings();
      if (settingsResponse.success && settingsResponse.data?.whatsapp_number) {
        whatsappNumber = String(settingsResponse.data.whatsapp_number).replace(/[^\d]/g, '');
        setAdminWhatsAppNumber(whatsappNumber);
      }
    } catch {
      // use last known number from wallet tab load
    }

    if (!whatsappNumber) {
      toast.error(
        'Admin WhatsApp number is not configured. Set RECHARGE_WHATSAPP_NUMBER in backend/.env and restart the API server.'
      );
      return;
    }

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    toast.success('Opening WhatsApp…');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openRechargeModal = () => {
    setRechargeAmountError(null);
    setCustomRechargeAmount(String(selectedAmount || 500));
    setShowRechargeModal(true);
  };

  const parseAndValidateRechargeAmount = (): number | null => {
    const raw = customRechargeAmount.trim();
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      setRechargeAmountError('Enter a valid amount');
      return null;
    }
    if (value < rechargeMinAmount) {
      setRechargeAmountError(`Minimum amount is Rs. ${rechargeMinAmount.toLocaleString()}`);
      return null;
    }
    if (value > rechargeMaxAmount) {
      setRechargeAmountError(`Maximum amount is Rs. ${rechargeMaxAmount.toLocaleString()}`);
      return null;
    }
    setRechargeAmountError(null);
    return Math.round(value);
  };

  const proceedRechargeViaESewaFromModal = async () => {
    const amount = parseAndValidateRechargeAmount();
    if (!amount) return;
    setSelectedAmount(amount);
    setShowRechargeModal(false);
    await handleRechargeViaESewa();
  };

  const esewaPaymentMethods = paymentMethods.filter(
    (pm) => pm.method_type === 'esewa' && pm.esewa_phone_number
  );

  const refreshWithdrawFeePreview = async (amount: number, method: string) => {
    try {
      const res = await paymentService.previewWithdrawalFee({
        amount,
        withdrawal_method: method,
      });
      if (res.success && res.data) {
        setWithdrawFee(Number(res.data.withdrawal_fee));
        setWithdrawNetAmount(Number(res.data.net_amount));
      }
    } catch {
      setWithdrawFee(null);
      setWithdrawNetAmount(null);
    }
  };

  const availableBalance = Number(walletData?.available_balance ?? 0);
  const pendingWithdrawalsAmount = Number(walletData?.pending_withdrawals_amount ?? 0);
  const withdrawableBalance = Number(
    walletData?.withdrawable_balance ?? availableBalance - pendingWithdrawalsAmount
  );

  const withdrawAmountValidation = useMemo(
    () =>
      validateWithdrawAmountInput(
        customWithdrawAmount,
        withdrawableBalance,
        withdrawMinAmount,
        withdrawMaxAmount
      ),
    [customWithdrawAmount, withdrawableBalance, withdrawMinAmount, withdrawMaxAmount]
  );

  const parseAndValidateWithdrawAmount = (): number | null => {
    const { amount, error } = validateWithdrawAmountInput(
      customWithdrawAmount,
      withdrawableBalance,
      withdrawMinAmount,
      withdrawMaxAmount
    );
    setWithdrawAmountError(error);
    return amount;
  };

  const openWithdrawModal = async () => {
    if (walletData?.is_frozen) {
      toast.error('Wallet is frozen. Withdrawals are disabled.');
      return;
    }
    if (withdrawableBalance < withdrawMinAmount) {
      toast.error(
        pendingWithdrawalsAmount > 0
          ? `Your remaining withdrawable balance is below ${formatNPR(withdrawMinAmount)} after pending withdrawal requests.`
          : `You need at least ${formatNPR(withdrawMinAmount)} available to withdraw.`
      );
      return;
    }

    setWithdrawAmountError(null);
    setCustomWithdrawAmount(String(Math.min(withdrawableBalance, 500)));
    setWithdrawFee(null);
    setWithdrawNetAmount(null);

    try {
      const pmRes = await paymentService.getPaymentMethods();
      if (pmRes.success && pmRes.data) {
        const methods = Array.isArray(pmRes.data) ? pmRes.data : [];
        setPaymentMethods(methods);
        const esewa = methods.filter(
          (m: PaymentMethodData) => m.method_type === 'esewa' && m.esewa_phone_number
        );
        let methodForFee: 'esewa' | 'bank_transfer' = 'bank_transfer';
        if (esewa.length > 0) {
          const defaultMethod = esewa.find((m: PaymentMethodData) => m.is_default) || esewa[0];
          setSelectedEsewaMethodId(defaultMethod.id);
          setWithdrawMethod('esewa');
          methodForFee = 'esewa';
        } else {
          setWithdrawMethod('bank_transfer');
        }
        setShowWithdrawModal(true);
        const initialAmount = Math.min(withdrawableBalance, 500);
        void refreshWithdrawFeePreview(initialAmount, methodForFee);
        return;
      }
    } catch {
      if (esewaPaymentMethods.length > 0) {
        setSelectedEsewaMethodId(
          esewaPaymentMethods.find((m) => m.is_default)?.id || esewaPaymentMethods[0].id
        );
        setWithdrawMethod('esewa');
      } else {
        setWithdrawMethod('bank_transfer');
      }
    }

    setShowWithdrawModal(true);
    const initialAmount = Math.min(withdrawableBalance, 500);
    const methodForFee =
      esewaPaymentMethods.length > 0 ? 'esewa' : withdrawMethod;
    void refreshWithdrawFeePreview(initialAmount, methodForFee);
  };

  const handleWithdrawAmountChange = (value: string) => {
    setCustomWithdrawAmount(value);
    const { amount, error } = validateWithdrawAmountInput(
      value,
      withdrawableBalance,
      withdrawMinAmount,
      withdrawMaxAmount
    );
    setWithdrawAmountError(error);
    if (amount !== null) {
      void refreshWithdrawFeePreview(amount, withdrawMethod);
    } else {
      setWithdrawFee(null);
      setWithdrawNetAmount(null);
    }
  };

  const submitWithdrawRequest = async () => {
    const amount = parseAndValidateWithdrawAmount();
    if (!amount) return;

    if (withdrawMethod === 'esewa') {
      const linked = esewaPaymentMethods.find((m) => m.id === selectedEsewaMethodId);
      if (!linked?.esewa_phone_number) {
        toast.error('Link a payment method in Settings first.');
        return;
      }
    } else {
      if (!bankWithdrawDetails.accountName.trim() || !bankWithdrawDetails.accountNumber.trim() || !bankWithdrawDetails.bankName.trim()) {
        toast.error('Enter your full bank account details.');
        return;
      }
    }

    try {
      setIsWithdrawing(true);
      const payload =
        withdrawMethod === 'esewa'
          ? (() => {
              const linked = esewaPaymentMethods.find((m) => m.id === selectedEsewaMethodId)!;
              return {
                amount,
                withdrawal_method: 'esewa' as const,
                bank_account_name: linked.esewa_account_name || linked.esewa_phone_number || 'eSewa',
                bank_account_number: linked.esewa_phone_number!,
                bank_name: 'eSewa',
                notes: 'Withdraw to linked eSewa account',
              };
            })()
          : {
              amount,
              withdrawal_method: 'bank_transfer' as const,
              bank_account_name: bankWithdrawDetails.accountName.trim(),
              bank_account_number: bankWithdrawDetails.accountNumber.trim(),
              bank_name: bankWithdrawDetails.bankName.trim(),
              notes: 'Bank transfer withdrawal',
            };

      const response = await paymentService.createWithdrawalRequest(payload);
      if (response.success) {
        toast.success('Withdrawal request submitted. Admin will process it shortly.');
        setShowWithdrawModal(false);
        await fetchWalletData();
      } else {
        toast.error('Failed to submit withdrawal request');
      }
    } catch (error: any) {
      const msg =
        error?.errors?.amount?.[0] ||
        error?.errors?.non_field_errors?.[0] ||
        error?.errors?.withdrawal_method?.[0] ||
        error?.message ||
        'Failed to submit withdrawal request';
      toast.error(msg);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const proceedRechargeViaWhatsAppFromModal = async () => {
    const amount = parseAndValidateRechargeAmount();
    if (!amount) return;
    setSelectedAmount(amount);
    setShowRechargeModal(false);
    await handleRechargeViaWhatsApp();
  };

  const rechargeRows = useMemo<Recharge[]>(
    () =>
      walletTransactions.map((transaction, index) => ({
        id: transaction.id,
        amount: formatNPR(transaction.amount ?? 0),
        amountVal: Number(transaction.amount ?? 0),
        date: new Date(transaction.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        rechargeMethod: getWalletRechargeMethodLabel(transaction.description),
        status: mapTransactionStatus(transaction.status, index),
      })),
    [walletTransactions]
  );

  const payoutRows = useMemo<Payout[]>(
    () =>
      withdrawalHistory.map((withdrawal, index) => ({
        id: withdrawal.id,
        amount: formatNPR(withdrawal.amount ?? 0),
        amountVal: Number(withdrawal.amount ?? 0),
        date: new Date(withdrawal.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        payoutMethod: getWithdrawalMethodLabel(withdrawal.withdrawal_method),
        status: mapWithdrawalStatus(withdrawal.status, index),
      })),
    [withdrawalHistory]
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'min-w-0 space-y-10 pb-20',
        activeTab === 'payouts' || activeTab === 'recharges' ? 'max-w-7xl' : 'max-w-4xl'
      )}
    >
      <header className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-10 bg-brand-emerald rounded-full" />
            <span className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.3em]">Financials</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-brand-dark sm:text-4xl">Payments</h1>
          <p className="text-gray-500 mt-2">Manage your funding sources and digital wallet.</p>
        </div>

        {/* Custom Tabs */}
        <div className="w-full max-w-full overflow-x-auto">
          <div className="inline-flex min-w-max gap-1 rounded-2xl bg-neutral-100 p-1.5">
            <button
              type="button"
              onClick={() => selectTab('wallet')}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all sm:px-8',
                activeTab === 'wallet'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-gray-600 hover:text-brand-dark'
              )}
            >
              <Wallet className="h-4 w-4" />
              My Wallet
            </button>
            <button
              type="button"
              onClick={() => selectTab('recharges')}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all sm:px-8',
                activeTab === 'recharges'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-gray-600 hover:text-brand-dark'
              )}
            >
              <Zap className="h-4 w-4" />
              Recharges
            </button>
            <button
              type="button"
              onClick={() => selectTab('payouts')}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all sm:px-8',
                activeTab === 'payouts'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-gray-600 hover:text-brand-dark'
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
              Payouts
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'wallet' ? (
        <div className="space-y-8">
          {walletLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Loading wallet data...</p>
            </div>
          ) : (
            <>
              {/* Wallet Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative overflow-hidden bg-brand-dark rounded-3xl p-5 text-white shadow-2xl shadow-brand-dark/40 sm:rounded-[40px] sm:p-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                        <Wallet className="w-8 h-8 text-brand-emerald" />
                      </div>
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-200/60 uppercase tracking-widest mb-1">Available Balance</p>
                      <p className="text-3xl font-black tracking-tighter sm:text-5xl">
                        {formatNPR(walletData?.available_balance ?? 0)}
                      </p>
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200/50">Recharge Balance</p>
                          <p className="mt-1 text-xl font-black text-white">
                            {formatNPR(walletData?.recharge_balance ?? 0)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-emerald-200/40">Total topped up</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200/50">Earned Balance</p>
                          <p className="mt-1 text-xl font-black text-emerald-300">
                            {formatNPR(walletData?.earned_balance ?? 0)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-emerald-200/40">From completed tasks</p>
                        </div>
                      </div>
                      {walletData &&
                        (Number(walletData.pending_balance ?? 0) > 0 ||
                          Number(walletData.held_balance ?? 0) > 0 ||
                          pendingWithdrawalsAmount > 0) && (
                        <div className="mt-3 space-y-1">
                          {pendingWithdrawalsAmount > 0 && (
                            <p className="text-xs text-amber-200/80">
                              Pending withdrawals: {formatNPR(pendingWithdrawalsAmount)} (not deducted until approved)
                            </p>
                          )}
                          {Number(walletData.pending_balance ?? 0) > 0 && (
                            <p className="text-xs text-emerald-200/60">
                              Pending: {formatNPR(walletData.pending_balance ?? 0)}
                            </p>
                          )}
                          {Number(walletData.held_balance ?? 0) > 0 && (
                            <p className="text-xs text-emerald-200/60">
                              Held: {formatNPR(walletData.held_balance ?? 0)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-200/40">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        walletData?.is_frozen ? "bg-red-400" : "bg-green-400 animate-pulse"
                      )} />
                      {walletData?.user_email || user?.email || 'Loading...'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-3 rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:rounded-[32px] sm:p-8">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-brand-dark">Quick actions</h3>
                    <p className="text-sm text-gray-500">Recharge or withdraw from your wallet.</p>
                  </div>
                  <button
                    type="button"
                    onClick={openRechargeModal}
                    disabled={isRecharging || walletData?.is_frozen}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-emerald py-3.5 text-base font-bold text-white shadow-lg shadow-brand-emerald/20 transition-all hover:bg-brand-emerald/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                  >
                    {isRecharging ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        Recharge
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={openWithdrawModal}
                    disabled={
                      isWithdrawing ||
                      walletData?.is_frozen ||
                      withdrawableBalance < 10
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 py-3.5 text-base font-semibold text-brand-dark transition-all hover:bg-gray-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    {isWithdrawing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-5 h-5" />
                        Withdraw
                      </>
                    )}
                  </button>
                  {withdrawableBalance < 10 && !walletData?.is_frozen && (
                    <p className="text-xs text-gray-500 font-medium text-center">
                      Minimum Rs. 10 available balance required to withdraw.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : activeTab === 'recharges' ? (
        <DashboardRecharges
          embedded
          recharges={rechargeRows}
          loading={walletLoading}
          onCreateRecharge={openRechargeModal}
        />
      ) : activeTab === 'payouts' ? (
        <DashboardPayouts
          embedded
          payouts={payoutRows}
          loading={walletLoading}
          onCreatePayout={openWithdrawModal}
        />
      ) : null}

      {showWithdrawModal &&
        typeof document !== 'undefined' &&
        createPortal(
        <>
          <div
            className="fixed inset-0 z-[10050] bg-brand-dark/40 backdrop-blur-sm"
            onClick={() => setShowWithdrawModal(false)}
            aria-hidden
          />
          <div
            className="fixed inset-0 z-[10051] flex items-end justify-center p-0 sm:items-center sm:p-6 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-modal-title"
          >
            <div
              className="pointer-events-auto flex w-full max-w-lg max-h-[min(92vh,calc(100dvh-1rem))] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-6 pb-5 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 id="withdraw-modal-title" className="text-xl font-bold text-brand-dark">
                        Withdraw
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Transfer balance to your linked account
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-500">Available to withdraw</span>
                  <span className="text-lg font-bold text-brand-dark">
                    {formatNPR(withdrawableBalance)}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 pb-2">
                <div className="space-y-2">
                  <label className={fieldLabelClass}>Amount</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min={withdrawMinAmount}
                      max={withdrawableBalance >= withdrawMinAmount ? withdrawableBalance : undefined}
                      step="0.01"
                      value={customWithdrawAmount}
                      onChange={(e) => handleWithdrawAmountChange(e.target.value)}
                      inputMode="decimal"
                      className={cn(
                        fieldInputClass,
                        'pl-12 text-lg',
                        withdrawAmountError && 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      )}
                      placeholder="500"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Minimum {formatNPR(withdrawMinAmount)} · you can request up to {formatNPR(withdrawableBalance)} now
                    {pendingWithdrawalsAmount > 0 && (
                      <> ({formatNPR(pendingWithdrawalsAmount)} already in pending requests)</>
                    )}
                  </p>
                  {withdrawAmountError && (
                    <p className="text-sm font-medium text-red-600">{withdrawAmountError}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className={fieldLabelClass}>Withdrawal method</label>
                  <div className="flex rounded-2xl bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawMethod('esewa');
                        const parsed = Number(customWithdrawAmount.trim());
                        if (Number.isFinite(parsed) && parsed >= withdrawMinAmount) {
                          void refreshWithdrawFeePreview(parsed, 'esewa');
                        }
                      }}
                      disabled={esewaPaymentMethods.length === 0}
                      className={cn(
                        'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all',
                        withdrawMethod === 'esewa'
                          ? 'bg-white text-brand-dark shadow-sm'
                          : 'text-gray-500 hover:text-gray-700',
                        esewaPaymentMethods.length === 0 && 'cursor-not-allowed opacity-40'
                      )}
                    >
                      eSewa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawMethod('bank_transfer');
                        const parsed = Number(customWithdrawAmount.trim());
                        if (Number.isFinite(parsed) && parsed >= withdrawMinAmount) {
                          void refreshWithdrawFeePreview(parsed, 'bank_transfer');
                        }
                      }}
                      className={cn(
                        'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all',
                        withdrawMethod === 'bank_transfer'
                          ? 'bg-white text-brand-dark shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      Bank transfer
                    </button>
                  </div>
                </div>

                {withdrawMethod === 'esewa' ? (
                  <div className="space-y-2">
                    <label className={fieldLabelClass}>eSewa account</label>
                    {esewaPaymentMethods.length === 0 ? (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <Link
                          href="/dashboard/settings?tab=payment-methods"
                          className="font-semibold underline hover:text-amber-950"
                        >
                          Link an eSewa account in Settings
                        </Link>{' '}
                        under Linked Payment Methods first.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {esewaPaymentMethods.map((pm) => (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setSelectedEsewaMethodId(pm.id)}
                            className={cn(
                              'w-full rounded-xl border px-4 py-3 text-left transition-all',
                              selectedEsewaMethodId === pm.id
                                ? 'border-brand-emerald bg-brand-emerald/5 ring-1 ring-brand-emerald/20'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            )}
                          >
                            <p className="font-semibold text-brand-dark">
                              {pm.esewa_account_name || 'eSewa account'}
                            </p>
                            <p className="mt-0.5 text-sm text-gray-500">{pm.esewa_phone_number}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className={fieldLabelClass}>Bank details</label>
                    <input
                      value={bankWithdrawDetails.accountName}
                      onChange={(e) =>
                        setBankWithdrawDetails((prev) => ({ ...prev, accountName: e.target.value }))
                      }
                      placeholder="Account holder name"
                      className={fieldInputClass}
                    />
                    <input
                      value={bankWithdrawDetails.accountNumber}
                      onChange={(e) =>
                        setBankWithdrawDetails((prev) => ({ ...prev, accountNumber: e.target.value }))
                      }
                      placeholder="Account number"
                      className={fieldInputClass}
                    />
                    <input
                      value={bankWithdrawDetails.bankName}
                      onChange={(e) =>
                        setBankWithdrawDetails((prev) => ({ ...prev, bankName: e.target.value }))
                      }
                      placeholder="Bank name"
                      className={fieldInputClass}
                    />
                  </div>
                )}

                {withdrawFee !== null && withdrawNetAmount !== null && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Processing fee</span>
                      <span>{formatNPR(withdrawFee)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                      <span className="font-semibold text-brand-dark">You receive</span>
                      <span className="text-lg font-bold text-brand-emerald">
                        {formatNPR(withdrawNetAmount)}
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-center text-xs text-gray-400">
                  Withdrawal requests are reviewed by admin before transfer.
                </p>
              </div>

              <div className="shrink-0 px-6 pb-6 pt-4">
                <button
                  type="button"
                  onClick={submitWithdrawRequest}
                  disabled={
                    isWithdrawing ||
                    withdrawAmountValidation.amount === null ||
                    withdrawAmountValidation.error !== null
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-emerald py-3.5 text-base font-bold text-white shadow-lg shadow-brand-emerald/25 transition-all hover:bg-brand-emerald/90 active:scale-[0.99] disabled:bg-gray-300 disabled:shadow-none"
                >
                  {isWithdrawing ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    'Withdraw'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {showRechargeModal &&
        typeof document !== 'undefined' &&
        createPortal(
        <>
          <div
            className="fixed inset-0 z-[10050] bg-brand-dark/40 backdrop-blur-sm"
            onClick={() => setShowRechargeModal(false)}
            aria-hidden
          />
          <div className="fixed inset-0 z-[10051] flex items-end justify-center p-0 sm:items-center sm:p-6 pointer-events-none">
            <div
              className="pointer-events-auto flex w-full max-w-lg max-h-[min(92vh,calc(100dvh-1rem))] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-6 pb-5 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-dark">Recharge wallet</h3>
                      <p className="mt-1 text-sm text-gray-500">Add funds to your balance</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRechargeModal(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 pb-6">
                <div className="space-y-2">
                  <label className={fieldLabelClass}>Amount</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      Rs.
                    </span>
                    <input
                      value={customRechargeAmount}
                      onChange={(e) => setCustomRechargeAmount(e.target.value)}
                      inputMode="numeric"
                      className={cn(
                        fieldInputClass,
                        'pl-12 text-lg',
                        rechargeAmountError && 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      )}
                      placeholder="500"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Rs. {rechargeMinAmount.toLocaleString()} – Rs. {rechargeMaxAmount.toLocaleString()}
                  </p>
                  {rechargeAmountError && (
                    <p className="text-sm font-medium text-red-600">{rechargeAmountError}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={proceedRechargeViaESewaFromModal}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#60bb46] py-3.5 text-base font-bold text-white transition-all hover:bg-[#52a13c] active:scale-[0.99]"
                  >
                    <img
                      src="https://esewa.com.np/common/images/esewa-logo.png"
                      alt="eSewa"
                      className="h-5 brightness-0 invert"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    Pay with eSewa
                  </button>

                  <button
                    type="button"
                    onClick={proceedRechargeViaWhatsAppFromModal}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-base font-semibold text-brand-dark transition-all hover:bg-gray-50 active:scale-[0.99]"
                  >
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    Request via WhatsApp
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    {adminWhatsAppNumber
                      ? `Admin: +${adminWhatsAppNumber} · manual confirmation required`
                      : 'Manual recharge requires admin confirmation'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

    </motion.div>
  );
}
