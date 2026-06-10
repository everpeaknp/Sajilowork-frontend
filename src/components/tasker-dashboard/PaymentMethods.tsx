'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { CreditCard, Plus, CheckCircle2, Wallet, ArrowRight, ArrowDownLeft, History, Zap, TrendingUp, Trash2, MessageCircle, X } from 'lucide-react';

const fieldLabelClass = 'text-sm font-semibold text-gray-600';
const fieldInputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-base font-semibold text-brand-dark outline-none transition-all placeholder:text-gray-400 focus:border-brand-emerald focus:bg-white focus:ring-2 focus:ring-brand-emerald/15';
import { cn } from '@/lib/utils';
import { paymentService } from '@/services';
import { PaymentMethodData } from '@/types';
import { toast } from 'sonner';
import { formatNPR } from '@/lib/nepalLocale';
import { USER_PROFILE_UPDATED, notifyUserProfileUpdated } from '@/lib/userProfileSync';
import { useAuthStore } from '@/store/auth.store';
import DeleteConfirmModal from '@/app/dashboard/DeleteConfirmModal';

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

const isRechargeTransaction = (tx: WalletTransaction) => {
  const desc = (tx.description || '').toLowerCase();
  return (
    desc.includes('wallet recharge') ||
    desc.includes('manual wallet recharge') ||
    desc.includes('recharge')
  );
};

export default function PaymentMethods() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'methods' | 'wallet'>('wallet');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRecord[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [isRecharging, setIsRecharging] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showLinkESewaModal, setShowLinkESewaModal] = useState(false);
  const [esewaFormData, setEsewaFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [isLinkingESewa, setIsLinkingESewa] = useState(false);
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
  const [deletePaymentMethodId, setDeletePaymentMethodId] = useState<string | null>(null);
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
    if (activeTab === 'methods') {
      fetchPaymentMethods();
    } else if (activeTab === 'wallet') {
      fetchWalletData();
    }
  }, [activeTab]);

  useEffect(() => {
    const modalOpen = showWithdrawModal || showRechargeModal || showLinkESewaModal;
    if (!modalOpen || typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showWithdrawModal, showRechargeModal, showLinkESewaModal]);

  useEffect(() => {
    const onProfileUpdated = () => {
      fetchPaymentMethods(true);
    };
    window.addEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
    return () => window.removeEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
  }, []);

  const fetchPaymentMethods = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentMethods(forceRefresh);
      
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      } else {
        setPaymentMethods([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch payment methods:', error);
      toast.error(error.message || 'Failed to load payment methods');
      setPaymentMethods([]);
    } finally {
      setLoading(false);
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
      
      const [transactionsResponse, withdrawalsResponse] = await Promise.all([
        paymentService.getWalletTransactions({ page_size: 50 }),
        paymentService.getMyWithdrawals({ page_size: 20 }),
      ]);

      if (transactionsResponse.success && transactionsResponse.data) {
        const all = Array.isArray(transactionsResponse.data.results)
          ? transactionsResponse.data.results
          : [];
        setWalletTransactions(
          all
            .filter(
              (tx) =>
                ['credit', 'bonus'].includes(tx.transaction_type) && isRechargeTransaction(tx)
            )
            .slice(0, 20)
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

  const requestDeletePaymentMethod = (id: string) => {
    setDeletePaymentMethodId(id);
  };

  const confirmDeletePaymentMethod = async () => {
    if (!deletePaymentMethodId) return;

    const id = deletePaymentMethodId;
    setDeletePaymentMethodId(null);

    try {
      await paymentService.deletePaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
      if (selectedEsewaMethodId === id) {
        setSelectedEsewaMethodId('');
      }
      toast.success('Payment method deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete payment method');
    }
  };

  const deletePaymentMethodTarget = useMemo(
    () => paymentMethods.find((pm) => pm.id === deletePaymentMethodId) ?? null,
    [paymentMethods, deletePaymentMethodId],
  );

  const handleSetDefault = async (id: string) => {
    try {
      await paymentService.setDefaultPaymentMethod(id);
      setPaymentMethods(paymentMethods.map(pm => ({
        ...pm,
        is_default: pm.id === id
      } as PaymentMethodData)));
      toast.success('Default payment method updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to set default payment method');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <Zap className="w-4 h-4" />;
      case 'debit':
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-emerald-50 text-emerald-700';
      case 'pending':
      case 'processing':
        return 'bg-amber-50 text-amber-700';
      case 'rejected':
      case 'failed':
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTransactionLabel = (description: string) => {
    // Extract provider from description or use default
    if (description.toLowerCase().includes('esewa')) return 'eSewa';
    if (description.toLowerCase().includes('khalti')) return 'Khalti';
    if (description.toLowerCase().includes('bank')) return 'Bank Transfer';
    return description || 'Wallet Recharge';
  };

  const handleLinkESewaAccount = async () => {
    if (!esewaFormData.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!esewaFormData.phoneNumber.trim()) {
      toast.error('Please enter your eSewa phone number');
      return;
    }

    const cleanedPhone = esewaFormData.phoneNumber.replace(/\s|-/g, '');
    if (!/^\d{10}$/.test(cleanedPhone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (!cleanedPhone.startsWith('97') && !cleanedPhone.startsWith('98')) {
      toast.error('eSewa phone number must start with 97 or 98');
      return;
    }

    try {
      setIsLinkingESewa(true);

      const response = await paymentService.linkESewaAccount({
        esewa_account_name: esewaFormData.fullName,
        esewa_phone_number: cleanedPhone,
        is_default: paymentMethods.length === 0
      });

      if (response.success && response.data) {
        toast.success('Payment method linked successfully!');
        
        setShowLinkESewaModal(false);
        setEsewaFormData({ fullName: '', phoneNumber: '' });
        
        setActiveTab('methods');
        await fetchPaymentMethods(true);
        notifyUserProfileUpdated();
      } else {
        toast.error('Failed to link eSewa account');
      }
    } catch (error: any) {
      console.error('Failed to link eSewa account:', error);
      
      if (error?.errors) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        toast.error(errorMessages);
      } else {
        toast.error(error.message || 'Failed to link eSewa account');
      }
    } finally {
      setIsLinkingESewa(false);
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
        toast.error('Link a payment method under Linked Payment Methods first.');
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-10 pb-20"
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
        <div className="inline-flex bg-surface-low p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('wallet')}
            className={cn(
              "px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === 'wallet' ? "bg-white text-brand-dark shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Wallet className="w-4 h-4" />
            My Wallet
          </button>
          <button 
            onClick={() => setActiveTab('methods')}
            className={cn(
              "px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === 'methods' ? "bg-white text-brand-dark shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <CreditCard className="w-4 h-4" />
            Linked Payment Methods
          </button>
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
                <div className="relative overflow-hidden bg-brand-dark rounded-[40px] p-8 text-white shadow-2xl shadow-brand-dark/40">
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

                <div className="flex flex-col justify-center gap-3 rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
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
                              <ArrowDownLeft className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 id="withdraw-modal-title" className="text-xl font-bold text-brand-dark">
                                Withdraw funds
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Transfer to your linked account
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
                          <span className="text-sm text-gray-500">Available balance</span>
                          <span className="text-lg font-bold text-brand-dark">
                            {formatNPR(walletData?.available_balance ?? 0)}
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
                              min={10}
                              max={withdrawableBalance >= 10 ? withdrawableBalance : undefined}
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
                            Minimum Rs. 10 · you can request up to {formatNPR(withdrawableBalance)} now
                            {pendingWithdrawalsAmount > 0 && (
                              <> ({formatNPR(pendingWithdrawalsAmount)} already in pending requests)</>
                            )}
                          </p>
                          {withdrawAmountError && (
                            <p className="text-sm font-medium text-red-600">{withdrawAmountError}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className={fieldLabelClass}>Payout method</label>
                          <div className="flex rounded-2xl bg-gray-100 p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setWithdrawMethod('esewa');
                                const parsed = Number(customWithdrawAmount.trim());
                                if (Number.isFinite(parsed) && parsed >= 10) {
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
                                if (Number.isFinite(parsed) && parsed >= 10) {
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
                                Link an eSewa account under Linked Payment Methods first.
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
                          Withdrawals are reviewed by admin before payout.
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
                            'Request withdrawal'
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

              {/* Recharge & withdrawal history */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-dark">Recharge history</h3>
                      <p className="text-xs text-gray-500">Wallet top-ups and credits</p>
                    </div>
                  </div>

                  {walletLoading ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
                      Loading…
                    </div>
                  ) : walletTransactions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                      <p className="text-sm font-medium text-gray-500">No recharges yet</p>
                      <p className="mt-1 text-xs text-gray-400">Completed top-ups will show here</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                      {walletTransactions.map((transaction) => (
                        <li
                          key={transaction.id}
                          className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50/80"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              {getTransactionIcon(transaction.transaction_type)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-brand-dark">
                                {getTransactionLabel(transaction.description)}
                              </p>
                              <p className="text-xs text-gray-400">{formatDate(transaction.created_at)}</p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-emerald-700">
                              +{formatNPR(transaction.amount ?? 0)}
                            </p>
                            <span
                              className={cn(
                                'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                                getStatusBadgeClass(transaction.status)
                              )}
                            >
                              {transaction.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-brand-emerald">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-dark">Withdrawal history</h3>
                      <p className="text-xs text-gray-500">Payout requests and status</p>
                    </div>
                  </div>

                  {walletLoading ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
                      Loading…
                    </div>
                  ) : withdrawalHistory.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                      <p className="text-sm font-medium text-gray-500">No withdrawals yet</p>
                      <p className="mt-1 text-xs text-gray-400">Requests you submit will appear here</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                      {withdrawalHistory.map((withdrawal) => (
                        <li
                          key={withdrawal.id}
                          className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50/80"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-brand-emerald">
                              <ArrowDownLeft className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-brand-dark">
                                {getWithdrawalMethodLabel(withdrawal.withdrawal_method)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(withdrawal.created_at)}
                                {Number(withdrawal.net_amount) < Number(withdrawal.amount) && (
                                  <span className="text-gray-400">
                                    {' '}
                                    · receive {formatNPR(withdrawal.net_amount)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-brand-dark">
                              {formatNPR(withdrawal.amount ?? 0)}
                            </p>
                            <span
                              className={cn(
                                'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                                getStatusBadgeClass(withdrawal.status)
                              )}
                            >
                              {withdrawal.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Loading payment methods...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-brand-dark">Linked payment methods</h3>
                  <p className="text-sm text-gray-500">Accounts for payouts and withdrawals</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkESewaModal(true)}
                  className="rounded-xl bg-brand-emerald/10 px-4 py-2 text-sm font-semibold text-brand-emerald transition-colors hover:bg-brand-emerald/15"
                >
                  Add
                </button>
              </div>

              {!paymentMethods.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setShowLinkESewaModal(true)}
                    className="p-8 rounded-[40px] border-2 border-dashed border-outline-variant hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-brand-emerald group"
                  >
                    <div className="p-4 rounded-full bg-surface-low group-hover:bg-brand-emerald/10 transition-colors">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-lg uppercase tracking-tight">Link eSewa</p>
                      <p className="text-xs font-medium text-gray-400">Add eSewa as a payment method</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className={cn(
                    "relative space-y-5 overflow-hidden rounded-[28px] border p-6 transition-all",
                    method.is_default 
                      ? "border-brand-emerald/40 bg-brand-emerald/5 shadow-sm" 
                      : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className={cn(
                      "p-3 rounded-2xl shadow-lg",
                      method.is_default ? "bg-brand-emerald" : method.method_type === 'esewa' ? "bg-[#60bb46]" : "bg-gray-100"
                    )}>
                      {method.method_type === 'esewa' ? (
                        <Wallet className={cn("w-8 h-8", method.is_default ? "text-white" : "text-white")} />
                      ) : (
                        <CreditCard className={cn("w-8 h-8", method.is_default ? "text-white" : "text-gray-600")} />
                      )}
                    </div>
                    {method.is_default && (
                      <div className="p-2 bg-brand-emerald rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">
                      {method.method_type === 'card' ? 'Card' : method.method_type === 'esewa' ? 'eSewa Account' : 'Bank Account'}
                    </p>
                    {method.method_type === 'esewa' ? (
                      <>
                        <p className="text-2xl font-black text-brand-dark tracking-tight">
                          {method.esewa_phone_number && method.esewa_phone_number.length >= 4
                            ? `${method.esewa_phone_number.substring(0, 5)}****${method.esewa_phone_number.substring(method.esewa_phone_number.length - 2)}`
                            : method.esewa_account_name}
                        </p>
                        <p className="text-xs font-semibold text-gray-500 mt-1">
                          {method.esewa_account_name}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-brand-dark tracking-tight">
                          ****{method.last_four}
                        </p>
                        {method.method_type === 'card' && method.expiry_date && (
                          <p className="text-xs font-semibold text-gray-500 mt-1">
                            Card • Expires {method.expiry_date}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="pt-2 flex items-center justify-between relative z-10">
                    {method.is_default ? (
                      <span className="text-xs font-black text-brand-emerald uppercase">Default Method</span>
                    ) : (
                      <button 
                        onClick={() => handleSetDefault(method.id)}
                        className="text-xs font-black text-brand-dark underline hover:text-brand-emerald"
                      >
                        Set as Default
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => requestDeletePaymentMethod(method.id)}
                      className="text-xs font-black text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
                  ))}

                  <button 
                    onClick={() => setShowLinkESewaModal(true)}
                    className="p-8 rounded-[40px] border-2 border-dashed border-outline-variant hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-brand-emerald group"
                  >
                    <div className="p-4 rounded-full bg-surface-low group-hover:bg-brand-emerald/10 transition-colors">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-lg uppercase tracking-tight">Link eSewa</p>
                      <p className="text-xs font-medium text-gray-400">Add eSewa as a payment method</p>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Link eSewa Account Modal */}
      {showLinkESewaModal &&
        typeof document !== 'undefined' &&
        createPortal(
        <>
          <div
            className="fixed inset-0 z-[10050] bg-brand-dark/40 backdrop-blur-sm"
            onClick={() => setShowLinkESewaModal(false)}
            aria-hidden
          />
          <div className="fixed inset-0 z-[10051] flex items-end justify-center p-0 sm:items-center sm:p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto flex w-full max-w-lg max-h-[min(92vh,calc(100dvh-1rem))] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-6 pb-5 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#60bb46]/15">
                    <img
                      src="https://esewa.com.np/common/images/esewa-logo.png"
                      alt=""
                      className="h-5"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">Link eSewa</h3>
                    <p className="mt-1 text-sm text-gray-500">For withdrawals and payouts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkESewaModal(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 pb-6">
              <div className="space-y-2">
                <label className={fieldLabelClass}>Full name</label>
                <input
                  type="text"
                  value={esewaFormData.fullName}
                  onChange={(e) => setEsewaFormData({ ...esewaFormData, fullName: e.target.value })}
                  placeholder="As on your eSewa account"
                  className={fieldInputClass}
                />
              </div>

              <div className="space-y-2">
                <label className={fieldLabelClass}>Phone number</label>
                <input
                  type="tel"
                  value={esewaFormData.phoneNumber}
                  onChange={(e) => setEsewaFormData({ ...esewaFormData, phoneNumber: e.target.value })}
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                  className={fieldInputClass}
                />
                <p className="text-xs text-gray-400">10 digits, starting with 98</p>
              </div>
            </div>

            <div className="shrink-0 flex gap-3 border-t border-gray-100 px-6 py-5">
              <button
                type="button"
                onClick={() => setShowLinkESewaModal(false)}
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkESewaAccount}
                disabled={isLinkingESewa}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#60bb46] py-3 text-sm font-bold text-white transition-all hover:bg-[#52a13c] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isLinkingESewa ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Linking…
                  </>
                ) : (
                  'Link account'
                )}
              </button>
            </div>
          </motion.div>
          </div>
        </>,
        document.body
      )}

      <DeleteConfirmModal
        open={deletePaymentMethodId !== null}
        onClose={() => setDeletePaymentMethodId(null)}
        onConfirm={confirmDeletePaymentMethod}
        title="Delete payment method?"
        description={
          deletePaymentMethodTarget
            ? `Remove ${
                deletePaymentMethodTarget.method_type === 'esewa'
                  ? deletePaymentMethodTarget.esewa_account_name ||
                    deletePaymentMethodTarget.esewa_phone_number ||
                    'this eSewa account'
                  : deletePaymentMethodTarget.method_type === 'card'
                    ? `card ending in ${deletePaymentMethodTarget.last_four || '****'}`
                    : 'this linked account'
              } from your wallet? This cannot be undone.`
            : 'This linked account will be removed from payouts and withdrawals. This cannot be undone.'
        }
      />
    </motion.div>
  );
}
