'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { 
  Bell, 
  Lock, 
  Shield, 
  Trash2, 
  Mail, 
  Smartphone,
  ChevronDown,
  AlertCircle,
  UserCheck,
  Upload,
  ExternalLink,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  CreditCard,
} from 'lucide-react';
import type { Badge } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services';
import { authService } from '@/services';
import { notificationService } from '@/services';
import { toast } from 'sonner';
import { USER_PROFILE_UPDATED, notifyUserProfileUpdated } from '@/lib/userProfileSync';

interface UserProfile {
  firstName: string;
  lastName: string;
  location: string;
  email: string;
  mobileNumber: string;
  birthday: string;
  about: string;
  goal: 'earn' | 'done';
  panNumber: string;
  profileImage: string;
}

type SettingsAppearance = 'tasker' | 'dashboard';

type SettingsProps = {
  appearance?: SettingsAppearance;
  defaultEmail?: string;
  defaultPhone?: string;
  showDeactivate?: boolean;
};

interface AccordionItemProps {
  title: string;
  icon: React.ElementType;
  description: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  appearance?: SettingsAppearance;
}

const AccordionItem = ({
  title,
  icon: Icon,
  description,
  children,
  isOpen,
  onToggle,
  appearance = 'tasker',
}: AccordionItemProps) => {
  const isDashboard = appearance === 'dashboard';

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isDashboard
          ? `mb-3 rounded-xl border ${
              isOpen
                ? 'border-[#52C47F]/40 bg-white shadow-sm'
                : 'border-neutral-200/90 bg-neutral-50/50 hover:border-neutral-300 hover:bg-white'
            }`
          : `mb-4 rounded-3xl border border-gray-100 bg-white ${
              isOpen ? 'border-emerald-100 shadow-xl shadow-brand-dark/5' : 'hover:border-emerald-200'
            }`
      }`}
    >
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between p-5 text-left outline-none sm:p-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className={`rounded-xl p-3 transition-colors ${
              isOpen
                ? isDashboard
                  ? 'bg-[#52C47F] text-white'
                  : 'bg-brand-emerald text-white'
                : isDashboard
                  ? 'bg-neutral-100 text-neutral-400'
                  : 'bg-surface-low text-gray-400'
            }`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3
              className={`text-base font-semibold sm:text-lg ${
                isDashboard ? 'text-neutral-900' : 'font-bold text-brand-dark'
              }`}
            >
              {title}
            </h3>
            <p className={`text-sm ${isDashboard ? 'text-neutral-500' : 'font-medium text-gray-500'}`}>
              {description}
            </p>
          </div>
        </div>
        <div
          className={`rounded-lg p-2 transition-transform duration-300 ${
            isOpen
              ? isDashboard
                ? 'rotate-180 bg-emerald-50 text-[#52C47F]'
                : 'rotate-180 bg-emerald-50 text-brand-emerald'
              : isDashboard
                ? 'bg-neutral-50 text-neutral-400'
                : 'bg-gray-50 text-gray-400'
          }`}
        >
          <ChevronDown className="h-5 w-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={`border-t p-5 pt-0 sm:p-6 ${isDashboard ? 'border-neutral-100' : 'border-gray-50'}`}>
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const DASHBOARD_CARD_CLASS =
  'mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8';

export default function Settings({
  appearance = 'tasker',
  defaultEmail = '',
  defaultPhone = '',
  showDeactivate = true,
}: SettingsProps) {
  const isDashboard = appearance === 'dashboard';
  const { user, setUser, refreshUser } = useAuthStore();
  const searchParams = useSearchParams();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsUploading, setDocumentsUploading] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<Record<string, any>>({});
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [paymentBadgeSubmitting, setPaymentBadgeSubmitting] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notificationPrefsLoading, setNotificationPrefsLoading] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<any[]>([]);
  const [channelToggles, setChannelToggles] = useState({
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
  });
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertKeywords, setAlertKeywords] = useState<any[]>([]);
  const [newAlertKeyword, setNewAlertKeyword] = useState('');

  useEffect(() => {
    setEmail(user?.email || defaultEmail || '');
    setPhoneNumber(user?.phone_number || defaultPhone || '');
  }, [user, defaultEmail, defaultPhone]);

  const displayEmail = user?.email || email || defaultEmail || 'Not set';
  const displayPhone = user?.phone_number || phoneNumber || defaultPhone || 'Not set';

  useEffect(() => {
    const onProfileUpdated = () => {
      refreshUser();
    };
    window.addEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
    return () => window.removeEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
  }, [refreshUser]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setOpenSection(tab);
    }
  }, [searchParams]);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await userService.getDocuments();
      if (response.success && Array.isArray(response.data)) {
        const map: Record<string, any> = {};
        response.data.forEach((d: any) => {
          map[(d.document_type || '').toLowerCase()] = d;
        });
        setDocuments(map);
      }
    } catch (error: any) {
      console.error('Failed to load documents:', error);
      toast.error(error.message || 'Failed to load verification documents');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      setBadgesLoading(true);
      const response = await userService.getBadges();
      if (response.success && Array.isArray(response.data)) {
        setBadges(response.data);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load verification badges';
      console.error('Failed to load badges:', error);
      toast.error(message);
    } finally {
      setBadgesLoading(false);
    }
  };

  useEffect(() => {
    if (openSection === 'verify') {
      void fetchDocuments();
      void fetchBadges();
    }
  }, [openSection]);

  const refreshNotificationPrefs = async () => {
    try {
      setNotificationPrefsLoading(true);
      let res = await notificationService.getPreferences();
      if (res.success && Array.isArray(res.data) && res.data.length === 0) {
        await notificationService.resetPreferencesToDefaults();
        res = await notificationService.getPreferences();
      }
      const prefs = Array.isArray(res.data) ? res.data : [];
      setNotificationPrefs(prefs);

      // Compute aggregate toggles (enabled if all rows enabled)
      const allPush = prefs.length ? prefs.every((p) => p.push_enabled !== false) : true;
      const allEmail = prefs.length ? prefs.every((p) => p.email_enabled !== false) : true;
      const allSms = prefs.length ? prefs.every((p) => p.sms_enabled === true) : false;
      setChannelToggles({
        push_enabled: allPush,
        email_enabled: allEmail,
        sms_enabled: allSms,
      });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load notification settings');
    } finally {
      setNotificationPrefsLoading(false);
    }
  };

  useEffect(() => {
    if (openSection === 'notifications') {
      refreshNotificationPrefs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSection]);

  const refreshAlertKeywords = async () => {
    try {
      setAlertsLoading(true);
      const res = await notificationService.getTaskAlertKeywords();
      setAlertKeywords(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load task alerts');
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    if (openSection === 'alerts') {
      refreshAlertKeywords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSection]);

  const addAlertKeyword = async () => {
    const kw = newAlertKeyword.trim();
    if (!kw) return;
    try {
      setAlertsLoading(true);
      await notificationService.addTaskAlertKeyword(kw);
      setNewAlertKeyword('');
      toast.success('Alert keyword added');
      await refreshAlertKeywords();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add keyword');
    } finally {
      setAlertsLoading(false);
    }
  };

  const removeAlertKeyword = async (id: string) => {
    try {
      setAlertsLoading(true);
      await notificationService.deleteTaskAlertKeyword(id);
      toast.success('Alert keyword removed');
      await refreshAlertKeywords();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to remove keyword');
    } finally {
      setAlertsLoading(false);
    }
  };

  const setChannelForAll = async (key: 'push_enabled' | 'email_enabled' | 'sms_enabled', value: boolean) => {
    if (!notificationPrefs.length) {
      toast.error('No notification preferences found.');
      return;
    }
    try {
      setNotificationPrefsLoading(true);
      await Promise.all(
        notificationPrefs.map((pref) =>
          notificationService.updatePreference(String(pref.id), { [key]: value } as any)
        )
      );
      toast.success('Notification settings updated');
      await refreshNotificationPrefs();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update notification settings');
    } finally {
      setNotificationPrefsLoading(false);
    }
  };

  const resetNotificationPrefs = async () => {
    try {
      setNotificationPrefsLoading(true);
      await notificationService.resetPreferencesToDefaults();
      toast.success('Notification settings reset');
      await refreshNotificationPrefs();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reset notification settings');
    } finally {
      setNotificationPrefsLoading(false);
    }
  };

  const uploadDoc = async (opts: {
    document_type: string;
    file: File;
    document_number?: string;
  }) => {
    const key = opts.document_type.toLowerCase();
    try {
      setDocumentsUploading((p) => ({ ...p, [key]: true }));
      const response = await userService.uploadDocument(
        opts.file,
        { document_type: opts.document_type as any, document_number: opts.document_number },
      );
      if (response.success && response.data) {
        setDocuments((p) => ({ ...p, [key]: response.data }));
        toast.success('Document uploaded. Pending admin review.');
        refreshUser();
      }
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setDocumentsUploading((p) => ({ ...p, [key]: false }));
    }
  };

  const DocumentCard = ({
    title,
    description,
    documentType,
    accept = '.jpg,.jpeg,.png,.pdf',
  }: {
    title: string;
    description: string;
    documentType: string;
    accept?: string;
  }) => {
    const doc = documents[documentType.toLowerCase()];
    const status = doc?.status || 'pending';
    const uploading = !!documentsUploading[documentType.toLowerCase()];

    const badge =
      status === 'approved' ? (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest border border-green-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified
        </div>
      ) : status === 'rejected' ? (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-xl font-black text-[10px] uppercase tracking-widest border border-amber-100">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </div>
      );

    return (
      <div
        className={`space-y-4 rounded-xl border p-5 md:p-6 ${
          isDashboard
            ? 'border-neutral-200/90 bg-neutral-50/40'
            : 'rounded-3xl border-outline-variant bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p
              className={`tracking-tight ${
                isDashboard ? 'text-[15px] font-semibold text-neutral-900' : 'font-black text-brand-dark'
              }`}
            >
              {title}
            </p>
            <p className={`text-sm ${isDashboard ? 'text-neutral-500' : 'font-medium text-gray-500'}`}>
              {description}
            </p>
          </div>
          {badge}
        </div>

        {status === 'rejected' && doc?.rejection_reason ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {doc.rejection_reason}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={`flex items-center gap-3 text-sm ${
              isDashboard ? 'font-medium text-neutral-500' : 'font-semibold text-gray-500'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{doc?.uploaded_at ? 'Uploaded' : 'No upload yet'}</span>
          </div>

          <div className="flex items-center gap-3">
            {doc?.document_url ? (
              <a
                href={doc.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                  isDashboard
                    ? 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'rounded-2xl border-outline-variant font-black text-xs uppercase tracking-widest hover:bg-surface-low'
                }`}
              >
                <ExternalLink className="h-4 w-4" />
                View
              </a>
            ) : null}

            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all ${
                isDashboard
                  ? 'bg-[#52C47F] hover:bg-[#43b06c]'
                  : 'rounded-2xl bg-brand-emerald font-black text-xs uppercase tracking-widest hover:opacity-90'
              }`}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading…' : doc?.document_url ? 'Replace' : 'Upload'}
              <input
                type="file"
                className="hidden"
                accept={accept}
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadDoc({ document_type: documentType, file });
                  e.currentTarget.value = '';
                }}
              />
            </label>
          </div>
        </div>
      </div>
    );
  };

  const paymentBadge = badges.find((b) => b.badge_type === 'payment_verified');
  const hasLinkedPaymentMethod = !!user?.has_payment_method;

  const handleActivatePaymentBadge = async () => {
    if (!hasLinkedPaymentMethod) {
      toast.message('Link a payment method first', {
        description: 'Add eSewa or a bank account under Payment Methods.',
      });
      return;
    }

    try {
      setPaymentBadgeSubmitting(true);
      const response = await userService.addBadge({ badge_type: 'payment_verified' });
      if (response.success && response.data) {
        await fetchBadges();
        if (response.data.is_verified) {
          toast.success('Payment method verified');
        } else {
          toast.success('Verification submitted — we will review it shortly');
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to verify payment method';
      toast.error(message);
    } finally {
      setPaymentBadgeSubmitting(false);
    }
  };

  const PaymentMethodVerificationCard = () => {
    const status = paymentBadge?.is_verified
      ? 'approved'
      : paymentBadge || hasLinkedPaymentMethod
        ? 'pending'
        : 'none';

    const badge =
      status === 'approved' ? (
        <div className="inline-flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified
        </div>
      ) : status === 'pending' ? (
        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-800">
          <Clock className="h-3.5 w-3.5" />
          Pending
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
          Not linked
        </div>
      );

    return (
      <div
        className={`space-y-4 rounded-xl border p-5 md:p-6 ${
          isDashboard
            ? 'border-neutral-200/90 bg-neutral-50/40'
            : 'rounded-3xl border-outline-variant bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-xl p-2.5 ${
                isDashboard ? 'bg-white text-[#52C47F] shadow-sm' : 'bg-surface-low text-brand-emerald'
              }`}
            >
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p
                className={`tracking-tight ${
                  isDashboard ? 'text-[15px] font-semibold text-neutral-900' : 'font-black text-brand-dark'
                }`}
              >
                Payment method verified
              </p>
              <p className={`text-sm ${isDashboard ? 'text-neutral-500' : 'font-medium text-gray-500'}`}>
                Make payments with ease by having your payment method verified.
              </p>
            </div>
          </div>
          {badge}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {paymentBadge?.is_verified ? (
            <Link
              href="/tasker-dashboard/methods"
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                isDashboard
                  ? 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  : 'border-outline-variant hover:bg-surface-low'
              }`}
            >
              Manage methods
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/tasker-dashboard/methods"
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                  isDashboard
                    ? 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'border-outline-variant hover:bg-surface-low'
                }`}
              >
                Link payment method
                <ExternalLink className="h-4 w-4" />
              </Link>
              {hasLinkedPaymentMethod && !paymentBadge?.is_verified ? (
                <button
                  type="button"
                  onClick={() => void handleActivatePaymentBadge()}
                  disabled={paymentBadgeSubmitting}
                  className={
                    isDashboard
                      ? primaryButtonClass
                      : 'rounded-2xl bg-brand-emerald px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
                  }
                >
                  {paymentBadgeSubmitting ? 'Submitting…' : 'Request verification'}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    );
  };

  const handleUpdateEmail = async () => {
    if (!email || email === user?.email) {
      toast.error('Please enter a new email address');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.updateEmail(email);
      
      if (response.success && response.data) {
        setUser(response.data);
        notifyUserProfileUpdated();
        toast.success('Email updated successfully. Please verify your new email.');
      }
    } catch (error: any) {
      console.error('Failed to update email:', error);
      toast.error(error.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!phoneNumber || phoneNumber === user?.phone_number) {
      toast.error('Please enter a new phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.updatePhoneNumber(phoneNumber);
      
      if (response.success && response.data) {
        setUser(response.data);
        notifyUserProfileUpdated();
        toast.success('Phone number updated successfully');
      }
    } catch (error: any) {
      console.error('Failed to update phone:', error);
      toast.error(error.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      
      if (response.success) {
        setCurrentPassword('');
        setNewPassword('');
        toast.success('Password changed successfully');
      }
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    const password = window.prompt('Please enter your password to confirm:');
    if (!password) return;

    try {
      setLoading(true);
      const response = await userService.deleteAccount(password);
      
      if (response.success) {
        toast.success('Account deleted successfully');
        await authService.logout();
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = isDashboard
    ? 'w-full rounded-xl border border-neutral-200/90 bg-white px-4 py-3.5 text-sm font-medium text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:ring-2 focus:ring-[#52C47F]'
    : 'w-full rounded-2xl border border-outline-variant bg-gray-50 p-4 font-semibold outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand-emerald';

  const primaryButtonClass = isDashboard
    ? 'flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
    : 'rounded-2xl bg-brand-emerald px-8 py-3 font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

  const labelClass = isDashboard
    ? 'block text-[15px] font-semibold leading-tight text-neutral-900'
    : 'px-1 text-xs font-bold uppercase tracking-widest text-gray-400';

  const dashboardToggleClass = (enabled: boolean) =>
    `relative h-6 w-12 rounded-full transition-colors ${enabled ? 'bg-[#52C47F]' : 'bg-neutral-200'}`;

  const settingsSections = (
    <>
        <AccordionItem
          title="Email Address"
          icon={Mail}
          description={displayEmail}
          isOpen={openSection === 'email'}
          onToggle={() => toggleSection('email')}
          appearance={appearance}
        >
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className={labelClass}>Update Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="New email address"
                className={inputClass}
              />
            </div>
            <button type="button" onClick={handleUpdateEmail} disabled={loading} className={primaryButtonClass}>
              {loading ? 'Updating...' : 'Verify & Update'}
              {isDashboard && !loading ? <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} /> : null}
            </button>
          </div>
        </AccordionItem>

        <AccordionItem
          title="Mobile Number"
          icon={Smartphone}
          description={displayPhone}
          isOpen={openSection === 'mobile'}
          onToggle={() => toggleSection('mobile')}
          appearance={appearance}
        >
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className={labelClass}>New Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="98989898"
                className={inputClass}
              />
            </div>
            <button type="button" onClick={handleUpdatePhone} disabled={loading} className={primaryButtonClass}>
              {loading ? 'Updating...' : 'Send SMS Code'}
              {isDashboard && !loading ? <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} /> : null}
            </button>
          </div>
        </AccordionItem>

        <AccordionItem
          title="Verify Account"
          icon={UserCheck}
          description="Government identity check"
          isOpen={openSection === 'verify'}
          onToggle={() => toggleSection('verify')}
          appearance={appearance}
        >
          <div className="space-y-6">
            <div
              className={`flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 md:p-6 ${
                isDashboard ? 'rounded-xl' : ''
              }`}
            >
              <div
                className={`shrink-0 rounded-full bg-white shadow-sm ${
                  isDashboard ? 'p-3.5 text-[#52C47F]' : 'p-4 text-brand-emerald'
                }`}
              >
                <Shield className={isDashboard ? 'h-8 w-8' : 'h-10 w-10'} />
              </div>
              <div>
                <h4
                  className={`tracking-tight ${
                    isDashboard ? 'text-[15px] font-semibold text-neutral-900' : 'font-black text-brand-dark'
                  }`}
                >
                  Identity Trust Program
                </h4>
                <p
                  className={`mt-1 text-sm ${
                    isDashboard ? 'font-normal text-neutral-500' : 'font-medium text-gray-600'
                  }`}
                >
                  Upload your documents here. Our admins review them and update your verification status.
                </p>
              </div>
            </div>

            {documentsLoading || badgesLoading ? (
              <div className="text-sm font-semibold text-gray-500">Loading verification status…</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <DocumentCard
                  title="ID document"
                  description="Upload a government ID (ID card, passport, or driver license)."
                  documentType="id_card"
                />
                <DocumentCard
                  title="Proof of address"
                  description="Upload a recent utility bill or official address document."
                  documentType="proof_of_address"
                />
                <DocumentCard
                  title="Police check"
                  description="Upload a valid police clearance or background check certificate."
                  documentType="police_check"
                />
                <PaymentMethodVerificationCard />
              </div>
            )}

            <div
              className={`flex items-start gap-4 p-5 ${
                isDashboard
                  ? 'rounded-xl border border-neutral-200/90 bg-neutral-50/60'
                  : 'rounded-3xl border border-outline-variant bg-surface-low'
              }`}
            >
              <AlertCircle
                className={`mt-0.5 h-5 w-5 shrink-0 ${isDashboard ? 'text-[#52C47F]' : 'text-brand-emerald'}`}
              />
              <p
                className={`text-sm leading-relaxed ${
                  isDashboard ? 'font-normal text-neutral-600' : 'font-medium text-gray-600'
                }`}
              >
                Accepted formats:{' '}
                <span className={isDashboard ? 'font-semibold text-neutral-900' : 'font-black text-brand-dark'}>
                  JPG/PNG/PDF
                </span>
                , max{' '}
                <span className={isDashboard ? 'font-semibold text-neutral-900' : 'font-black text-brand-dark'}>
                  5MB
                </span>
                . If a document is rejected, you’ll see the rejection reason here and can re-upload a corrected file.
              </p>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          title="Change Password"
          icon={Lock}
          description="Secure your access with a fresh password"
          isOpen={openSection === 'password'}
          onToggle={() => toggleSection('password')}
          appearance={appearance}
        >
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className={inputClass}
              />
            </div>
            <button type="button" onClick={handleChangePassword} disabled={loading} className={primaryButtonClass}>
              {loading ? 'Updating...' : 'Update Security'}
              {isDashboard && !loading ? <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} /> : null}
            </button>
          </div>
        </AccordionItem>

        <AccordionItem
          title="Notification Settings"
          icon={Bell}
          description="Manage how we communicate with you"
          isOpen={openSection === 'notifications'}
          onToggle={() => toggleSection('notifications')}
          appearance={appearance}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={isDashboard ? 'text-[15px] font-semibold text-neutral-900' : 'font-bold text-brand-dark'}>
                  Global channel toggles
                </p>
                <p className={isDashboard ? 'text-sm text-neutral-500' : 'text-xs text-gray-500'}>
                  These apply to all notification types.
                </p>
              </div>
              <button
                type="button"
                onClick={resetNotificationPrefs}
                disabled={notificationPrefsLoading}
                className={
                  isDashboard
                    ? 'text-sm font-semibold text-[#52C47F] transition-colors hover:text-[#43b06c] disabled:opacity-50'
                    : 'text-xs font-black text-gray-500 transition-colors hover:text-brand-dark disabled:opacity-50'
                }
              >
                Reset
              </button>
            </div>

            {notificationPrefsLoading ? (
              <div
                className={`rounded-2xl border p-4 text-sm font-semibold ${
                  isDashboard
                    ? 'rounded-xl border-neutral-200/90 bg-neutral-50 font-medium text-neutral-500'
                    : 'border-outline-variant bg-gray-50 text-gray-500'
                }`}
              >
                Loading notification settings…
              </div>
            ) : (
              <div className={isDashboard ? 'divide-y divide-neutral-100' : 'space-y-1 divide-y divide-gray-50'}>
                {[
                  {
                    key: 'push_enabled' as const,
                    label: 'Push Notifications',
                    desc: 'Real-time updates on your phone',
                  },
                  {
                    key: 'email_enabled' as const,
                    label: 'Email Notifications',
                    desc: 'Updates to your email address',
                  },
                  {
                    key: 'sms_enabled' as const,
                    label: 'SMS Notifications',
                    desc: 'Critical alerts via text message',
                  },
                ].map((n) => {
                  const enabled = channelToggles[n.key];
                  return (
                    <div key={n.key} className={`flex items-center justify-between py-4 ${isDashboard ? '' : 'group'}`}>
                      <div>
                        <p
                          className={
                            isDashboard
                              ? 'text-[15px] font-semibold text-neutral-900'
                              : 'font-bold text-brand-dark transition-colors group-hover:text-brand-emerald'
                          }
                        >
                          {n.label}
                        </p>
                        <p className={isDashboard ? 'text-sm text-neutral-500' : 'text-xs text-gray-500'}>
                          {n.desc}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-pressed={enabled}
                        onClick={() => {
                          const next = !enabled;
                          setChannelToggles((p) => ({ ...p, [n.key]: next }));
                          void setChannelForAll(n.key, next);
                        }}
                        className={
                          isDashboard
                            ? dashboardToggleClass(enabled)
                            : `relative h-6 w-12 rounded-full transition-colors ${
                                enabled ? 'bg-brand-emerald' : 'bg-gray-200'
                              }`
                        }
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                            enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </AccordionItem>

        <AccordionItem
          title="Task Alerts"
          icon={AlertCircle}
          description="Instant notifications for matching jobs"
          isOpen={openSection === 'alerts'}
          onToggle={() => toggleSection('alerts')}
          appearance={appearance}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-2xl border border-orange-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">
                You have {alertKeywords.length} active keyword alert{alertKeywords.length === 1 ? '' : 's'}.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-outline-variant space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-brand-dark">Keyword alerts</p>
                <span className="text-xs font-bold text-gray-400">EVERY MATCH</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={newAlertKeyword}
                  onChange={(e) => setNewAlertKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void addAlertKeyword();
                  }}
                  placeholder="Add keyword (e.g. Moving, IKEA)"
                  className={isDashboard ? `flex-1 ${inputClass}` : 'flex-1 rounded-2xl border border-outline-variant bg-white p-4 font-semibold outline-none transition-all focus:ring-2 focus:ring-brand-emerald'}
                  disabled={alertsLoading}
                />
                <button
                  type="button"
                  onClick={addAlertKeyword}
                  disabled={alertsLoading || !newAlertKeyword.trim()}
                  className={
                    isDashboard
                      ? `${primaryButtonClass} shrink-0`
                      : 'rounded-2xl bg-brand-emerald px-6 py-3 font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
                  }
                >
                  Add
                  {isDashboard ? <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} /> : null}
                </button>
              </div>

              {alertsLoading ? (
                <div className="p-4 bg-white rounded-2xl border border-outline-variant text-sm font-semibold text-gray-500">
                  Loading alerts…
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {alertKeywords.length ? (
                    alertKeywords.map((k) => (
                      <button
                        key={String(k.id)}
                        type="button"
                        onClick={() => void removeAlertKeyword(String(k.id))}
                        className="px-3 py-1.5 bg-white rounded-xl border border-gray-200 text-xs font-bold text-brand-emerald hover:bg-emerald-50 transition-colors"
                        title="Remove keyword"
                      >
                        #{k.keyword} <span className="text-gray-400">×</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 font-semibold">
                      Add keywords to get notified when new tasks match.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </AccordionItem>
    </>
  );

  if (isDashboard) {
    return (
      <div className="animate-in fade-in relative -mx-4 -my-6 min-h-screen bg-[#f0efec] px-4 py-4 font-sans text-black duration-300 sm:-mx-6 sm:px-6 sm:py-4 md:-mx-8 md:px-8">
        <div className="mx-auto mb-8 max-w-7xl pl-1">
          <h1 className="text-[34px] font-semibold leading-none tracking-tight text-neutral-900">Settings</h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Manage your email, phone, verification, password, and notifications.
          </p>
        </div>
        <div className={`${DASHBOARD_CARD_CLASS} mb-8`}>
          <div className="space-y-0">{settingsSections}</div>
        </div>
      </div>
    );
  }

  const content = (
    <>
      <header className="mb-0">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-1 w-10 rounded-full bg-brand-emerald" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-emerald">
            Account Control
          </span>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-brand-dark sm:text-4xl">Settings</h1>
        <p className="mt-2 text-gray-500">
          Personalize your account security, notifications, and verification status.
        </p>
      </header>

      <div className="mt-10 space-y-2">{settingsSections}</div>

      {showDeactivate ? (
        <div className="flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-10 md:flex-row">
          <div>
            <h4 className="font-bold text-red-500">Deactivate Account</h4>
            <p className="text-sm text-gray-500">This will remove your public tasker profile.</p>
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 font-bold text-red-500 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
            Delete Account
          </button>
        </div>
      ) : null}
    </>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-10 pb-20">
      {content}
    </motion.div>
  );
}
