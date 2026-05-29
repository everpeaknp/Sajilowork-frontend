'use client';

import { useState, useEffect } from 'react';
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
  XCircle
} from 'lucide-react';
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

interface AccordionItemProps {
  title: string;
  icon: any;
  description: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({ title, icon: Icon, description, children, isOpen, onToggle }: AccordionItemProps) => {
  return (
    <div 
      className={`border border-gray-100 rounded-3xl transition-all duration-300 bg-white overflow-hidden mb-4 ${
        isOpen ? "shadow-xl shadow-blue-900/5 border-blue-100" : "hover:border-blue-200"
      }`}
    >
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left outline-none"
      >
        <div className="flex items-center gap-5">
          <div 
            className={`p-3 rounded-2xl transition-colors ${
              isOpen ? "bg-primary text-white" : "bg-surface-low text-gray-400"
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-blue-950">{title}</h3>
            <p className="text-sm text-gray-500 font-medium">{description}</p>
          </div>
        </div>
        <div 
          className={`p-2 rounded-xl bg-gray-50 text-gray-400 transition-transform duration-300 ${
            isOpen && "rotate-180 bg-blue-50 text-primary"
          }`}
        >
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6 pt-0 border-t border-gray-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Settings() {
  const { user, setUser, refreshUser } = useAuthStore();
  const searchParams = useSearchParams();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsUploading, setDocumentsUploading] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<Record<string, any>>({});
  
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
    if (user) {
      setEmail(user.email || '');
      setPhoneNumber(user.phone_number || '');
    }
  }, [user]);

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

  useEffect(() => {
    if (openSection === 'verify') {
      fetchDocuments();
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
          Approved
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
      <div className="bg-white p-6 rounded-3xl border border-outline-variant space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-black text-blue-950 tracking-tight">{title}</p>
            <p className="text-sm text-gray-500 font-medium">{description}</p>
          </div>
          {badge}
        </div>

        {status === 'rejected' && doc?.rejection_reason ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-semibold">
            {doc.rejection_reason}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500 font-semibold">
            <FileText className="w-4 h-4" />
            <span>{doc?.uploaded_at ? 'Uploaded' : 'No upload yet'}</span>
          </div>

          <div className="flex items-center gap-3">
            {doc?.document_url ? (
              <a
                href={doc.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-outline-variant hover:bg-surface-low transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View
              </a>
            ) : null}

            <label className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-white hover:opacity-90 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-10 pb-20"
    >
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 w-10 bg-primary rounded-full" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Account Control</span>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-950 sm:text-4xl">Settings</h1>
        <p className="text-gray-500 mt-2">Personalize your account security, notifications, and verification status.</p>
      </header>

      <div className="space-y-2">
        <AccordionItem 
          title="Email Address" 
          icon={Mail} 
          description={user?.email || 'Not set'}
          isOpen={openSection === 'email'}
          onToggle={() => toggleSection('email')}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Update Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="New email address"
                className="w-full p-4 rounded-2xl bg-gray-50 border border-outline-variant focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all font-semibold"
              />
            </div>
            <button 
              onClick={handleUpdateEmail}
              disabled={loading}
              className="bg-[#1161fe] text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Verify & Update'}
            </button>
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Mobile Number" 
          icon={Smartphone} 
          description={user?.phone_number || 'Not set'}
          isOpen={openSection === 'mobile'}
          onToggle={() => toggleSection('mobile')}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">New Phone Number</label>
              <input 
                type="tel" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full p-4 rounded-2xl bg-gray-50 border border-outline-variant focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all font-semibold"
              />
            </div>
            <button 
              onClick={handleUpdatePhone}
              disabled={loading}
              className="bg-[#1161fe] text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Send SMS Code'}
            </button>
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Verify Account" 
          icon={UserCheck} 
          description="Government identity check"
          isOpen={openSection === 'verify'}
          onToggle={() => toggleSection('verify')}
        >
          <div className="space-y-6">
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
              <div className="p-4 bg-white rounded-full shadow-sm text-primary shrink-0">
                <Shield className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-black text-blue-950 tracking-tight">Identity Trust Program</h4>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  Upload your documents here. Our admins review them in the dashboard and update your verification status.
                </p>
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
              </div>
            )}

            <div className="p-5 bg-surface-low rounded-3xl border border-outline-variant flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                Accepted formats: <span className="font-black text-blue-950">JPG/PNG/PDF</span>, max{' '}
                <span className="font-black text-blue-950">5MB</span>. If a document is rejected, you’ll see the rejection reason here and can re-upload a corrected file.
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
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password" 
                className="w-full p-4 rounded-2xl bg-gray-50 border border-outline-variant focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all font-semibold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters" 
                className="w-full p-4 rounded-2xl bg-gray-50 border border-outline-variant focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all font-semibold" 
              />
            </div>
            <button 
              onClick={handleChangePassword}
              disabled={loading}
              className="bg-[#1161fe] text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Security'}
            </button>
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Notification Settings" 
          icon={Bell} 
          description="Manage how we communicate with you"
          isOpen={openSection === 'notifications'}
          onToggle={() => toggleSection('notifications')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-blue-950">Global channel toggles</p>
                <p className="text-xs text-gray-500">
                  These apply to all notification types.
                </p>
              </div>
              <button
                type="button"
                onClick={resetNotificationPrefs}
                disabled={notificationPrefsLoading}
                className="text-xs font-black text-gray-500 hover:text-blue-950 transition-colors disabled:opacity-50"
              >
                Reset
              </button>
            </div>

            {notificationPrefsLoading ? (
              <div className="p-4 bg-gray-50 rounded-2xl border border-outline-variant text-sm font-semibold text-gray-500">
                Loading notification settings…
              </div>
            ) : (
              <div className="space-y-1 divide-y divide-gray-50">
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
                    <div key={n.key} className="flex items-center justify-between py-4 group">
                      <div>
                        <p className="font-bold text-blue-950 group-hover:text-primary transition-colors">
                          {n.label}
                        </p>
                        <p className="text-xs text-gray-500">{n.desc}</p>
                      </div>
                      <button
                        type="button"
                        aria-pressed={enabled}
                        onClick={() => {
                          const next = !enabled;
                          setChannelToggles((p) => ({ ...p, [n.key]: next }));
                          void setChannelForAll(n.key, next);
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          enabled ? 'bg-primary' : 'bg-gray-200'
                        }`}
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
                <p className="font-bold text-blue-950">Keyword alerts</p>
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
                  className="flex-1 p-4 rounded-2xl bg-white border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all font-semibold"
                  disabled={alertsLoading}
                />
                <button
                  type="button"
                  onClick={addAlertKeyword}
                  disabled={alertsLoading || !newAlertKeyword.trim()}
                  className="bg-[#1161fe] text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
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
                        className="px-3 py-1.5 bg-white rounded-xl border border-gray-200 text-xs font-bold text-primary hover:bg-blue-50 transition-colors"
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
      </div>

      <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="font-bold text-red-500">Deactivate Account</h4>
          <p className="text-sm text-gray-500">This will remove your public tasker profile.</p>
        </div>
        <button 
          onClick={handleDeleteAccount}
          disabled={loading}
          className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-6 py-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-5 h-5" />
          Delete Account
        </button>
      </div>
    </motion.div>
  );
}
