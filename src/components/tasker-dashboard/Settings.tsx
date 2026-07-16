'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import {
  DASHBOARD_CARD,
  DASHBOARD_HEADING,
  DASHBOARD_PAGE_ROOT,
} from '@/app/dashboard/dashboardResponsive';
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
  Camera,
  User as UserIcon,
  CreditCard,
} from 'lucide-react';
import LinkedPaymentMethods from '@/components/tasker-dashboard/LinkedPaymentMethods';
import AddressAutocompleteFields, {
  type AddressFieldValues,
} from '@/components/AddressAutocompleteFields';
import { DEFAULT_COUNTRY } from '@/lib/nepalLocale';
import { genderLabelFromApi, genderValueFromLabel } from '@/lib/dashboardProfileSkills';

const SELECT_CHEVRON_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  paddingRight: '2.5rem',
} as const;
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services';
import { authService } from '@/services';
import { notificationService } from '@/services';
import { toast } from 'sonner';
import type { UserKYC } from '@/types';
import { getMediaUrl } from '@/lib/utils';
import { USER_PROFILE_UPDATED, notifyUserProfileUpdated } from '@/lib/userProfileSync';

const DEFAULT_PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&h=300&fit=crop';

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
                ? 'border-[#52C47F]/40 bg-[var(--elevated)] shadow-sm dark:border-[#52C47F]/35 dark:shadow-none'
                : 'border-neutral-200/90 bg-neutral-50/50 hover:border-neutral-300 hover:bg-[var(--elevated)] dark:border-neutral-700/80 dark:bg-neutral-900/50 dark:hover:border-neutral-600'
            }`
          : `mb-4 rounded-3xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${
              isOpen
                ? 'border-emerald-100 shadow-xl shadow-brand-dark/5 dark:border-emerald-900/40 dark:shadow-none'
                : 'hover:border-emerald-200 dark:hover:border-emerald-800/60'
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
                  ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-400'
                  : 'bg-surface-low text-gray-400 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3
              className={`text-base font-semibold sm:text-lg ${
                isDashboard
                  ? 'text-neutral-900 dark:text-stone-100'
                  : 'font-bold text-brand-dark dark:text-stone-100'
              }`}
            >
              {title}
            </h3>
            <p
              className={`text-sm ${
                isDashboard
                  ? 'text-neutral-500 dark:text-neutral-400'
                  : 'font-medium text-gray-500 dark:text-neutral-400'
              }`}
            >
              {description}
            </p>
          </div>
        </div>
        <div
          className={`rounded-lg p-2 transition-transform duration-300 ${
            isOpen
              ? isDashboard
                ? 'rotate-180 bg-emerald-50 text-[#52C47F] dark:bg-emerald-950/50 dark:text-[#52C47F]'
                : 'rotate-180 bg-emerald-50 text-brand-emerald dark:bg-emerald-950/50'
              : isDashboard
                ? 'bg-neutral-50 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-400'
                : 'bg-gray-50 text-gray-400 dark:bg-neutral-800 dark:text-neutral-400'
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
            <div
              className={`border-t p-5 pt-0 sm:p-6 ${
                isDashboard
                  ? 'border-neutral-100 dark:border-neutral-800'
                  : 'border-gray-50 dark:border-neutral-800'
              }`}
            >
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const DASHBOARD_CARD_CLASS = DASHBOARD_CARD.replace('border-neutral-100', 'border-neutral-200/60');

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
  const [kyc, setKyc] = useState<UserKYC | null>(null);
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressLatitude, setAddressLatitude] = useState<number | undefined>();
  const [addressLongitude, setAddressLongitude] = useState<number | undefined>();
  const [gender, setGender] = useState('Select');
  const [birthday, setBirthday] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [verifySaving, setVerifySaving] = useState(false);
  const [resendVerificationLoading, setResendVerificationLoading] = useState(false);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
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
    const first = user?.first_name?.trim() || '';
    const last = user?.last_name?.trim() || '';
    setFullName([first, last].filter(Boolean).join(' '));
    setEmail(user?.email || defaultEmail || '');
    setPhoneNumber(user?.phone_number || defaultPhone || '');
    setAddress(user?.address || '');
    setCity(user?.city || '');
    setState(user?.state || '');
    setCountry(user?.country || DEFAULT_COUNTRY);
    setPostalCode(user?.postal_code || '');
    setAddressLatitude(user?.latitude);
    setAddressLongitude(user?.longitude);
    setBirthday(user?.date_of_birth || '');
    setGender(genderLabelFromApi(user?.gender));
  }, [user, defaultEmail, defaultPhone]);

  const handleAddressFieldsChange = (updates: Partial<AddressFieldValues>) => {
    if (updates.address !== undefined) setAddress(updates.address);
    if (updates.city !== undefined) setCity(updates.city);
    if (updates.state !== undefined) setState(updates.state);
    if (updates.country !== undefined) setCountry(updates.country);
    if (updates.postalCode !== undefined) setPostalCode(updates.postalCode);
    if ('latitude' in updates) setAddressLatitude(updates.latitude);
    if ('longitude' in updates) setAddressLongitude(updates.longitude);
  };

  const profileImageSrc =
    getMediaUrl(user?.profile_image) || DEFAULT_PROFILE_IMAGE;

  const displayEmail = user?.email || email || defaultEmail || 'Not set';
  const displayPhone = user?.phone_number || phoneNumber || defaultPhone || 'Not set';
  const emailVerified = Boolean(user?.is_email_verified);

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

  const fetchKyc = async () => {
    try {
      const response = await userService.getKyc();
      if (response.success && response.data) {
        setKyc(response.data);
        if (response.data.pan_number) {
          setPanNumber(response.data.pan_number);
        }
      }
    } catch (error: unknown) {
      console.error('Failed to load KYC:', error);
    }
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

  useEffect(() => {
    if (openSection === 'verify') {
      void fetchDocuments();
      void fetchKyc();
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

      if (key === 'push_enabled') {
        if (value) {
          const { subscribeWebPush } = await import('@/lib/webPush');
          const result = await subscribeWebPush();
          if (!result.ok) {
            toast.error(result.reason || 'Could not enable browser push notifications.');
            // Keep preference on — in-app still works; push will retry on next login if granted later.
          } else {
            toast.success('Browser push notifications enabled');
          }
        } else {
          const { unsubscribeWebPush } = await import('@/lib/webPush');
          await unsubscribeWebPush();
          toast.success('Browser push notifications disabled');
        }
      } else {
        toast.success('Notification settings updated');
      }
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
        void fetchKyc();
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
            ? 'border-neutral-200/90 bg-neutral-50/40 dark:border-neutral-700/80 dark:bg-neutral-950/60'
            : 'rounded-3xl border-outline-variant bg-white dark:border-neutral-800 dark:bg-neutral-900'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p
              className={`tracking-tight ${
                isDashboard ? 'text-[15px] font-semibold text-neutral-900 dark:text-stone-100' : 'font-black text-brand-dark dark:text-stone-100'
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

  const parseFullName = (value: string) => {
    const trimmed = value.trim();
    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex === -1) {
      return { first_name: trimmed, last_name: '' };
    }
    return {
      first_name: trimmed.slice(0, spaceIndex).trim(),
      last_name: trimmed.slice(spaceIndex + 1).trim(),
    };
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, or GIF)');
      return;
    }

    try {
      setProfileImageUploading(true);
      toast.info('Uploading profile picture…');
      const response = await userService.uploadProfileImage(file);
      if (response.success && response.data) {
        setUser(response.data);
        notifyUserProfileUpdated();
        toast.success('Profile picture updated');
      } else {
        toast.error(response.message || 'Failed to upload profile picture');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload profile picture';
      toast.error(message);
    } finally {
      setProfileImageUploading(false);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    }
  };

  const handleSaveVerificationDetails = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedName) {
      toast.error('Please enter your full name');
      return;
    }
    if (!trimmedPhone) {
      toast.error('Please enter your mobile number');
      return;
    }
    if (!trimmedEmail) {
      toast.error('Please enter your email address');
      return;
    }

    const emailChanged = trimmedEmail !== (user?.email || '').trim();
    if (emailChanged && !emailVerified) {
      toast.error('Verify your current email before changing it.');
      setEmail(user?.email || defaultEmail || '');
      return;
    }

    try {
      setVerifySaving(true);
      const { first_name, last_name } = parseFullName(trimmedName);
      const genderValue = genderValueFromLabel(gender);
      const profileResponse = await userService.updateProfile({
        first_name,
        last_name,
        phone: trimmedPhone,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        ...(addressLatitude !== undefined ? { latitude: addressLatitude } : {}),
        ...(addressLongitude !== undefined ? { longitude: addressLongitude } : {}),
        ...(genderValue ? { gender: genderValue } : {}),
        ...(birthday.trim() ? { date_of_birth: birthday.trim() } : {}),
      });

      if (!profileResponse.success || !profileResponse.data) {
        toast.error(profileResponse.message || 'Failed to save personal details');
        return;
      }

      let nextUser = profileResponse.data;

      if (emailChanged && emailVerified) {
        const emailResponse = await userService.updateEmail(trimmedEmail);
        if (emailResponse.success && emailResponse.data) {
          nextUser = emailResponse.data;
        } else {
          toast.error(emailResponse.message || 'Failed to update email');
          return;
        }
      }

      if (nextUser.id) {
        const normalizedPan = panNumber.trim().toUpperCase();
        const kycResponse = await userService.updateKyc({
          pan_number: normalizedPan,
        });
        if (kycResponse.success && kycResponse.data) {
          setKyc(kycResponse.data);
        }
      }

      setUser(nextUser);
      notifyUserProfileUpdated();
      toast.success('Personal details saved');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save personal details';
      toast.error(message);
    } finally {
      setVerifySaving(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    const targetEmail = (user?.email || email || '').trim();
    if (!targetEmail) {
      toast.error('No email address on file');
      return;
    }

    try {
      setResendVerificationLoading(true);
      const response = await authService.resendVerificationEmail(targetEmail);
      if (response.success) {
        toast.success('Verification email sent. Check your inbox.');
      } else {
        toast.error(response.message || 'Could not send verification email');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not send verification email';
      toast.error(message);
    } finally {
      setResendVerificationLoading(false);
    }
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
    ? 'w-full rounded-xl border border-neutral-200/90 bg-white px-4 py-3.5 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:ring-2 focus:ring-[#52C47F] dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:placeholder:text-neutral-400'
    : 'w-full rounded-2xl border border-outline-variant bg-gray-50 p-4 font-semibold outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand-emerald dark:bg-neutral-900 dark:text-stone-100 dark:focus:bg-neutral-950';

  const inputDisabledClass = isDashboard
    ? 'cursor-not-allowed bg-neutral-100 text-neutral-500 focus:ring-0 dark:bg-neutral-800 dark:text-neutral-400'
    : 'cursor-not-allowed bg-gray-100 text-gray-500 focus:ring-0 dark:bg-neutral-900 dark:text-neutral-400';

  const primaryButtonClass = isDashboard
    ? 'flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
    : 'rounded-2xl bg-brand-emerald px-8 py-3 font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

  const labelClass = isDashboard
    ? 'block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100'
    : 'px-1 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500';

  const selectClass = isDashboard
    ? `${inputClass} cursor-pointer appearance-none`
    : `${inputClass} cursor-pointer appearance-none`;

  const dashboardToggleClass = (enabled: boolean) =>
    `relative h-6 w-12 rounded-full transition-colors ${enabled ? 'bg-[#52C47F]' : 'bg-neutral-200 dark:bg-neutral-700'}`;

  const settingsSections = (
    <>
        {!isDashboard ? (
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
                </button>
              </div>
            </AccordionItem>
          </>
        ) : null}

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
              className={`flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 md:p-6 dark:border-emerald-900/50 dark:bg-emerald-950/30 ${
                isDashboard ? 'rounded-xl' : ''
              }`}
            >
              <div
                className={`shrink-0 rounded-full bg-white shadow-sm dark:bg-neutral-900 ${
                  isDashboard ? 'p-3.5 text-[#52C47F]' : 'p-4 text-brand-emerald'
                }`}
              >
                <Shield className={isDashboard ? 'h-8 w-8' : 'h-10 w-10'} />
              </div>
              <div>
                <h4
                  className={`tracking-tight ${
                    isDashboard ? 'text-[15px] font-semibold text-neutral-900 dark:text-stone-100' : 'font-black text-brand-dark dark:text-stone-100'
                  }`}
                >
                  Identity Trust Program
                </h4>
                <p
                  className={`mt-1 text-sm ${
                    isDashboard ? 'font-normal text-neutral-500 dark:text-neutral-400' : 'font-medium text-gray-600 dark:text-neutral-400'
                  }`}
                >
                  Upload your documents here. Our admins review them and update your verification status.
                </p>
                {kyc?.status && kyc.status !== 'not_started' ? (
                  <p className={`mt-2 text-xs font-semibold uppercase tracking-wide ${
                    kyc.status === 'approved'
                      ? 'text-green-700 dark:text-emerald-400'
                      : kyc.status === 'rejected'
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    Verification status: {kyc.status_display || kyc.status.replace('_', ' ')}
                  </p>
                ) : null}
                {kyc?.status === 'rejected' && kyc.rejection_reason ? (
                  <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">{kyc.rejection_reason}</p>
                ) : null}
              </div>
            </div>

            <div
              className={`space-y-4 rounded-xl border p-5 md:p-6 ${
                isDashboard
                  ? 'border-neutral-200/90 bg-neutral-50/40 dark:border-neutral-700/80 dark:bg-neutral-950/60'
                  : 'rounded-3xl border-outline-variant bg-white'
              }`}
            >
              <div className="space-y-1">
                <p
                  className={`tracking-tight ${
                    isDashboard ? 'text-[15px] font-semibold text-neutral-900 dark:text-stone-100' : 'font-black text-brand-dark dark:text-stone-100'
                  }`}
                >
                  Personal details
                </p>
                <p className={`text-sm ${isDashboard ? 'text-neutral-500 dark:text-neutral-400' : 'font-medium text-gray-500'}`}>
                  Use the same profile photo, name, contact details, and address as on your identity documents.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative shrink-0 self-start">
                  <div
                    className={`h-24 w-24 overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-neutral-900 ${
                      isDashboard ? 'border-neutral-200 dark:border-neutral-700' : 'border-outline-variant'
                    }`}
                  >
                    <img
                      src={profileImageSrc}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleProfileImageChange(e)}
                  />
                  <button
                    type="button"
                    onClick={() => profileImageInputRef.current?.click()}
                    disabled={profileImageUploading}
                    className={`absolute -bottom-2 -right-2 rounded-xl p-2.5 text-white shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-50 ${
                      isDashboard ? 'bg-[#52C47F]' : 'bg-brand-emerald'
                    }`}
                    aria-label="Change profile picture"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className={labelClass}>Profile picture</p>
                  <p className={`text-sm ${isDashboard ? 'text-neutral-500' : 'font-medium text-gray-500'}`}>
                    Upload a clear photo of your face. JPG or PNG, up to 5MB.
                  </p>
                  <button
                    type="button"
                    onClick={() => profileImageInputRef.current?.click()}
                    disabled={profileImageUploading}
                    className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold transition disabled:opacity-50 ${
                      isDashboard ? 'text-[#52C47F] hover:text-[#45a86d]' : 'text-brand-emerald hover:text-brand-emerald/80'
                    }`}
                  >
                    <UserIcon className="h-4 w-4" />
                    {profileImageUploading ? 'Uploading…' : user?.profile_image ? 'Change photo' : 'Upload photo'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClass}>Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="First and last name"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={selectClass}
                    style={SELECT_CHEVRON_STYLE}
                  >
                    <option value="Select">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className={labelClass}>Mobile</label>
                    {user?.is_phone_verified ? (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98989898"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className={labelClass}>Email</label>
                    {emailVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        <AlertCircle className="h-3 w-3" />
                        Unverified
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    readOnly={!emailVerified}
                    disabled={!emailVerified}
                    aria-readonly={!emailVerified}
                    className={`${inputClass}${!emailVerified ? ` ${inputDisabledClass}` : ''}`}
                  />
                  {!emailVerified ? (
                    <div className="space-y-2 pt-1">
                      <p className={`text-xs ${isDashboard ? 'text-neutral-500' : 'font-medium text-gray-500'}`}>
                        Verify your current email before you can change it.
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleResendVerificationEmail()}
                        disabled={resendVerificationLoading}
                        className={`inline-flex items-center gap-1.5 text-sm font-semibold transition disabled:opacity-50 ${
                          isDashboard ? 'text-[#52C47F] hover:text-[#45a86d]' : 'text-brand-emerald hover:text-brand-emerald/80'
                        }`}
                      >
                        <Mail className="h-4 w-4" />
                        {resendVerificationLoading ? 'Sending…' : 'Resend verification email'}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Birthday</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>PAN number</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="Enter your PAN number"
                    autoComplete="off"
                    className={`${inputClass} uppercase`}
                  />
                </div>

                <AddressAutocompleteFields
                  variant={isDashboard ? 'dashboard' : 'default'}
                  values={{
                    address,
                    city,
                    state,
                    country,
                    postalCode,
                    latitude: addressLatitude,
                    longitude: addressLongitude,
                  }}
                  onChange={handleAddressFieldsChange}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleSaveVerificationDetails()}
                  disabled={verifySaving}
                  className={primaryButtonClass}
                >
                  {verifySaving ? 'Saving…' : 'Save personal details'}
                  {isDashboard && !verifySaving ? <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} /> : null}
                </button>
              </div>
            </div>

            {documentsLoading ? (
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
              </div>
            )}

            <div
              className={`flex items-start gap-4 p-5 ${
                isDashboard
                  ? 'rounded-xl border border-neutral-200/90 bg-neutral-50/60 dark:border-neutral-700/80 dark:bg-neutral-950/60'
                  : 'rounded-3xl border border-outline-variant bg-surface-low'
              }`}
            >
              <AlertCircle
                className={`mt-0.5 h-5 w-5 shrink-0 ${isDashboard ? 'text-[#52C47F]' : 'text-brand-emerald'}`}
              />
              <p
                className={`text-sm leading-relaxed ${
                  isDashboard
                    ? 'font-normal text-neutral-600 dark:text-neutral-400'
                    : 'font-medium text-gray-600'
                }`}
              >
                Accepted formats:{' '}
                <span
                  className={
                    isDashboard
                      ? 'font-semibold text-neutral-900 dark:text-stone-100'
                      : 'font-black text-brand-dark'
                  }
                >
                  JPG/PNG/PDF
                </span>
                , max{' '}
                <span
                  className={
                    isDashboard
                      ? 'font-semibold text-neutral-900 dark:text-stone-100'
                      : 'font-black text-brand-dark'
                  }
                >
                  5MB
                </span>
                . If a document is rejected, you’ll see the rejection reason here and can re-upload a corrected file.
              </p>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          title="Linked Payment Methods"
          icon={CreditCard}
          description="Link eSewa for wallet top-ups and withdrawals"
          isOpen={openSection === 'payment-methods'}
          onToggle={() => toggleSection('payment-methods')}
          appearance={appearance}
        >
          <LinkedPaymentMethods />
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
                <p className={isDashboard ? 'text-[15px] font-semibold text-neutral-900 dark:text-stone-100' : 'font-bold text-brand-dark'}>
                  Global channel toggles
                </p>
                <p className={isDashboard ? 'text-sm text-neutral-500 dark:text-neutral-400' : 'text-xs text-gray-500'}>
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
                    ? 'rounded-xl border-neutral-200/90 bg-neutral-50 font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
                    : 'border-outline-variant bg-gray-50 text-gray-500'
                }`}
              >
                Loading notification settings…
              </div>
            ) : (
              <div className={isDashboard ? '' : 'space-y-1'}>
                {[
                  {
                    key: 'push_enabled' as const,
                    label: 'Push Notifications',
                    desc: 'Browser alerts even when SajiloWork is in the background',
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
                              ? 'text-[15px] font-semibold text-neutral-900 dark:text-stone-100'
                              : 'font-bold text-brand-dark transition-colors group-hover:text-brand-emerald'
                          }
                        >
                          {n.label}
                        </p>
                        <p className={isDashboard ? 'text-sm text-neutral-500 dark:text-neutral-400' : 'text-xs text-gray-500'}>
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
            <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">
                You have {alertKeywords.length} active keyword alert{alertKeywords.length === 1 ? '' : 's'}.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-outline-variant bg-gray-50 p-6 dark:border-neutral-800 dark:bg-neutral-950/60">
              <div className="flex items-center justify-between">
                <p className="font-bold text-brand-dark dark:text-stone-100">Keyword alerts</p>
                <span className="text-xs font-bold text-gray-400 dark:text-neutral-500">EVERY MATCH</span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={newAlertKeyword}
                  onChange={(e) => setNewAlertKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void addAlertKeyword();
                  }}
                  placeholder="Add keyword (e.g. Moving, IKEA)"
                  className={isDashboard ? `flex-1 ${inputClass}` : 'flex-1 rounded-2xl border border-outline-variant bg-white p-4 font-semibold outline-none transition-all focus:ring-2 focus:ring-brand-emerald dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100'}
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
                <div className="rounded-2xl border border-outline-variant bg-white p-4 text-sm font-semibold text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
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
                        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-emerald transition-colors hover:bg-emerald-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                        title="Remove keyword"
                      >
                        #{k.keyword} <span className="text-gray-400 dark:text-neutral-500">×</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm font-semibold text-gray-500 dark:text-neutral-400">
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
      <div className={DASHBOARD_PAGE_ROOT}>
        <div className="mx-auto mb-6 max-w-7xl pl-1 sm:mb-8">
          <h1 className={DASHBOARD_HEADING}>Settings</h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500 dark:text-neutral-400">
            Manage your email, phone, verification, payment methods, password, and notifications.
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-10">
      {content}
    </motion.div>
  );
}
