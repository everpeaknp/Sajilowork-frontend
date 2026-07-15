'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { CreditCard, Plus, CheckCircle2, Wallet, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paymentService } from '@/services';
import { PaymentMethodData } from '@/types';
import { toast } from 'sonner';
import { USER_PROFILE_UPDATED, notifyUserProfileUpdated } from '@/lib/userProfileSync';
import DeleteConfirmModal from '@/app/dashboard/DeleteConfirmModal';

const fieldLabelClass = 'text-sm font-semibold text-gray-600 dark:text-neutral-400';
const fieldInputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-base font-semibold text-brand-dark outline-none transition-all placeholder:text-gray-400 focus:border-brand-emerald focus:bg-white focus:ring-2 focus:ring-brand-emerald/15 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-900';

export default function LinkedPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkESewaModal, setShowLinkESewaModal] = useState(false);
  const [esewaFormData, setEsewaFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [isLinkingESewa, setIsLinkingESewa] = useState(false);
  const [deletePaymentMethodId, setDeletePaymentMethodId] = useState<string | null>(null);

  const fetchPaymentMethods = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentMethods(forceRefresh);

      if (response.success && response.data) {
        setPaymentMethods(response.data);
      } else {
        setPaymentMethods([]);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load payment methods';
      console.error('Failed to fetch payment methods:', error);
      toast.error(message);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPaymentMethods();
  }, []);

  useEffect(() => {
    const onProfileUpdated = () => {
      void fetchPaymentMethods(true);
    };
    window.addEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
    return () => window.removeEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
  }, []);

  useEffect(() => {
    if (!showLinkESewaModal || typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showLinkESewaModal]);

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
      toast.success('Payment method deleted successfully');
      notifyUserProfileUpdated();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete payment method';
      toast.error(message);
    }
  };

  const deletePaymentMethodTarget = useMemo(
    () => paymentMethods.find((pm) => pm.id === deletePaymentMethodId) ?? null,
    [paymentMethods, deletePaymentMethodId],
  );

  const handleSetDefault = async (id: string) => {
    try {
      await paymentService.setDefaultPaymentMethod(id);
      setPaymentMethods(
        paymentMethods.map(
          (pm) =>
            ({
              ...pm,
              is_default: pm.id === id,
            }) as PaymentMethodData,
        ),
      );
      toast.success('Default payment method updated');
      notifyUserProfileUpdated();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to set default payment method';
      toast.error(message);
    }
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
        is_default: paymentMethods.length === 0,
      });

      if (response.success && response.data) {
        toast.success('Payment method linked successfully!');
        setShowLinkESewaModal(false);
        setEsewaFormData({ fullName: '', phoneNumber: '' });
        await fetchPaymentMethods(true);
        notifyUserProfileUpdated();
      } else {
        toast.error('Failed to link eSewa account');
      }
    } catch (error: unknown) {
      console.error('Failed to link eSewa account:', error);
      const err = error as { errors?: Record<string, string | string[]>; message?: string };
      if (err?.errors) {
        const errorMessages = Object.entries(err.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        toast.error(errorMessages);
      } else {
        toast.error(err.message || 'Failed to link eSewa account');
      }
    } finally {
      setIsLinkingESewa(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-neutral-400">Accounts for payouts, withdrawals, and wallet top-ups.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowLinkESewaModal(true)}
          className="shrink-0 rounded-xl bg-brand-emerald/10 px-4 py-2 text-sm font-semibold text-brand-emerald transition-colors hover:bg-brand-emerald/15"
        >
          Add
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-emerald border-t-transparent" />
          <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">Loading payment methods...</p>
        </div>
      ) : !paymentMethods.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setShowLinkESewaModal(true)}
            className="group flex flex-col items-center justify-center gap-4 rounded-[40px] border-2 border-dashed border-outline-variant p-8 text-gray-400 transition-all hover:border-brand-emerald hover:bg-brand-emerald/5 hover:text-brand-emerald dark:border-neutral-700 dark:text-neutral-500 dark:hover:border-brand-emerald dark:hover:text-brand-emerald"
          >
            <div className="rounded-full bg-surface-low p-4 transition-colors group-hover:bg-brand-emerald/10 dark:bg-neutral-800">
              <Plus className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="text-lg font-black uppercase tracking-tight dark:text-stone-100">Link eSewa</p>
              <p className="text-xs font-medium text-gray-400 dark:text-neutral-500">Add eSewa as a payment method</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={cn(
                'relative space-y-5 overflow-hidden rounded-[28px] border p-6 transition-all',
                method.is_default
                  ? 'border-brand-emerald/40 bg-brand-emerald/5 shadow-sm dark:border-brand-emerald/30 dark:bg-brand-emerald/[0.08]'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:shadow-none',
              )}
            >
              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={cn(
                    'rounded-2xl p-3 shadow-lg',
                    method.is_default
                      ? 'bg-brand-emerald'
                      : method.method_type === 'esewa'
                        ? 'bg-[#60bb46]'
                        : 'bg-gray-100 dark:bg-neutral-800',
                  )}
                >
                  {method.method_type === 'esewa' ? (
                    <Wallet className="h-8 w-8 text-white" />
                  ) : (
                    <CreditCard className={cn('h-8 w-8', method.is_default ? 'text-white' : 'text-gray-600 dark:text-neutral-300')} />
                  )}
                </div>
                {method.is_default && (
                  <div className="rounded-full bg-brand-emerald p-2">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="relative z-10">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500">
                  {method.method_type === 'card'
                    ? 'Card'
                    : method.method_type === 'esewa'
                      ? 'eSewa Account'
                      : 'Bank Account'}
                </p>
                {method.method_type === 'esewa' ? (
                  <>
                    <p className="text-2xl font-black tracking-tight text-brand-dark dark:text-stone-100">
                      {method.esewa_phone_number && method.esewa_phone_number.length >= 4
                        ? `${method.esewa_phone_number.substring(0, 5)}****${method.esewa_phone_number.substring(method.esewa_phone_number.length - 2)}`
                        : method.esewa_account_name}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-neutral-400">{method.esewa_account_name}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-black tracking-tight text-brand-dark dark:text-stone-100">****{method.last_four}</p>
                    {method.method_type === 'card' && method.expiry_date && (
                      <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-neutral-400">Card • Expires {method.expiry_date}</p>
                    )}
                  </>
                )}
              </div>
              <div className="relative z-10 flex items-center justify-between pt-2">
                {method.is_default ? (
                  <span className="text-xs font-black uppercase text-brand-emerald">Default Method</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(method.id)}
                    className="text-xs font-black text-brand-dark underline hover:text-brand-emerald dark:text-stone-100"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => requestDeletePaymentMethod(method.id)}
                  className="flex items-center gap-1 text-xs font-black text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setShowLinkESewaModal(true)}
            className="group flex flex-col items-center justify-center gap-4 rounded-[40px] border-2 border-dashed border-outline-variant p-8 text-gray-400 transition-all hover:border-brand-emerald hover:bg-brand-emerald/5 hover:text-brand-emerald dark:border-neutral-700 dark:text-neutral-500 dark:hover:border-brand-emerald dark:hover:text-brand-emerald"
          >
            <div className="rounded-full bg-surface-low p-4 transition-colors group-hover:bg-brand-emerald/10 dark:bg-neutral-800">
              <Plus className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="text-lg font-black uppercase tracking-tight dark:text-stone-100">Link eSewa</p>
              <p className="text-xs font-medium text-gray-400 dark:text-neutral-500">Add eSewa as a payment method</p>
            </div>
          </button>
        </div>
      )}

      {showLinkESewaModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[10050] bg-brand-dark/40 backdrop-blur-sm"
              onClick={() => setShowLinkESewaModal(false)}
              aria-hidden
            />
            <div className="pointer-events-none fixed inset-0 z-[10051] flex items-end justify-center p-0 sm:items-center sm:p-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-auto flex max-h-[min(92vh,calc(100dvh-1rem))] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-transparent bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 sm:rounded-[28px]"
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
                        <h3 className="text-xl font-bold text-brand-dark dark:text-stone-100">Link eSewa</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">For withdrawals and payouts</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLinkESewaModal(false)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 dark:hover:text-stone-100"
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
                    <p className="text-xs text-gray-400 dark:text-neutral-500">10 digits, starting with 97 or 98</p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-3 border-t border-gray-100 px-6 py-5 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowLinkESewaModal(false)}
                    className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-stone-200 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLinkESewaAccount}
                    disabled={isLinkingESewa}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#60bb46] py-3 text-sm font-bold text-white transition-all hover:bg-[#52a13c] disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-neutral-700"
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
          document.body,
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
              }? This cannot be undone.`
            : 'This linked account will be removed from payouts and withdrawals. This cannot be undone.'
        }
      />
    </div>
  );
}
