'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon,
  Mail,
  MapPin,
  Camera,
  ExternalLink,
  Trash2,
  Cake,
  Info,
  Target,
  CreditCard,
  CheckCircle,
  DollarSign,
  Loader2,
  AtSign,
  Lock,
  Check,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { userService } from '@/services';
import { toast } from 'sonner';
import {
  landingBody,
  landingBodyMuted,
  landingHeadline,
  landingHeadlineSm,
} from '@/components/LangingHome/landingTypography';

const PROFILE_TYPO = `${landingBody} [&_h1]:font-formula [&_h1]:font-black [&_h1]:tracking-tight [&_h2]:font-formula [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h3]:font-formula [&_h3]:font-bold [&_h3]:tracking-tight`;

type SectionId = 'identity' | 'about' | 'goal';

const SECTION_NAV: {
  id: SectionId;
  label: string;
  description: string;
  icon: typeof UserIcon;
}[] = [
  { id: 'identity', label: 'Identity', icon: UserIcon, description: 'Name, location & contact' },
  { id: 'about', label: 'About', icon: Info, description: 'Bio & introduction' },
  { id: 'goal', label: 'Your goal', icon: Target, description: 'How you use SajiloWork' },
];

const inputClass =
  'w-full rounded-2xl border border-outline-variant bg-white px-4 py-3.5 text-sm font-medium text-brand-dark outline-none transition focus:border-brand-emerald/40 focus:ring-2 focus:ring-brand-emerald/10';
const inputDisabledClass =
  'w-full cursor-not-allowed rounded-2xl border border-outline-variant bg-surface-low px-4 py-3.5 text-sm font-medium text-[#6a719a] outline-none';
const CITY_MAX_LENGTH = 100;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 150;
const USERNAME_PATTERN = /^[a-z0-9._]+$/;

function getProfileLocationFromUser(user: User): string {
  const city = user.city?.trim() || '';
  if (city) return city;
  return user.address?.trim() || '';
}
import { USER_PROFILE_UPDATED, notifyUserProfileUpdated } from '@/lib/userProfileSync';
import { devLog, devError } from '@/lib/devLog';
import type { User } from '@/types';

interface UserProfile {
  firstName: string;
  lastName: string;
  location: string;
  email: string;
  birthday: string;
  about: string;
  goal: 'earn' | 'done';
  panNumber: string;
  username: string;
  profileImage: string;
}

function profileFromUser(user: User): UserProfile {
  const location = getProfileLocationFromUser(user);

  return {
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    location,
    email: user.email || '',
    birthday: user.date_of_birth || '',
    about: user.bio || '',
    goal: 'done',
    panNumber: '',
    username: user.username?.trim() || '',
    profileImage:
      user.profile_image ||
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
  };
}

export default function Profile() {
  const { user, setUser, logout, refreshUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    location: '',
    email: '',
    birthday: '',
    about: '',
    goal: 'done',
    panNumber: '',
    username: '',
    profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('identity');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyUserToProfile = useCallback(() => {
    if (!user) return;
    setProfile(profileFromUser(user));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    applyUserToProfile();
  }, [applyUserToProfile]);

  useEffect(() => {
    const onProfileUpdated = () => {
      refreshUser();
    };
    window.addEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
    return () => window.removeEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
  }, [refreshUser]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const savedUsername = (user?.username ?? '').trim().toLowerCase();
  const usernameCanChange = user?.username_can_change !== false;
  const usernameNextChangeAt = user?.username_next_change_at ?? null;
  const usernameNextChangeLabel = usernameNextChangeAt
    ? format(new Date(usernameNextChangeAt), 'dd MMM yyyy')
    : null;

  const publicProfileSlug = useMemo(() => {
    const username = savedUsername || (user?.username ?? '').trim();
    if (username) return username;
    if (user?.id) return String(user.id);
    return null;
  }, [savedUsername, user?.username, user?.id]);

  const publicProfileHref = publicProfileSlug
    ? `/users/${encodeURIComponent(publicProfileSlug)}`
    : null;

  const profileCompletion = useMemo(() => {
    const checks = [
      profile.firstName.trim(),
      profile.lastName.trim(),
      profile.location.trim(),
      profile.username.trim(),
      profile.about.trim(),
      profile.birthday,
      profile.profileImage && !profile.profileImage.includes('unsplash.com')
        ? profile.profileImage
        : '',
    ];
    const filled = checks.filter(Boolean).length;
    return {
      filled,
      total: checks.length,
      percent: Math.round((filled / checks.length) * 100),
    };
  }, [profile]);

  const sectionCounts = useMemo(
    () => ({
      identity: [
        profile.firstName.trim(),
        profile.lastName.trim(),
        profile.location.trim(),
        profile.username.trim(),
        profile.birthday,
      ].filter(Boolean).length,
      about: profile.about.trim() ? 1 : 0,
      goal: 1,
    }),
    [profile],
  );

  const scrollToSection = useCallback((id: SectionId) => {
    setActiveSection(id);
    document.getElementById(`profile-section-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    const sectionIds = SECTION_NAV.map((s) => `profile-section-${s.id}`);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          const id = visible[0].target.id.replace('profile-section-', '') as SectionId;
          setActiveSection(id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPG, PNG, or GIF)');
        return;
      }

      try {
        setSaving(true);
        toast.info('Uploading image...');

        // Upload to backend
        const response = await userService.uploadProfileImage(file, (progress) => {
          devLog('Upload progress:', progress);
        });

        if (response.success && response.data) {
          // Update auth store with new user data
          setUser(response.data);
          
          // Update local profile state
          updateProfile({ profileImage: response.data.profile_image || '' });
          
          // Force a small delay to ensure state updates propagate
          await new Promise(resolve => setTimeout(resolve, 100));
          
          toast.success('Profile image updated successfully');
          notifyUserProfileUpdated();
        } else {
          toast.error('Failed to upload image');
        }
      } catch (error: any) {
        devError('Error uploading image:', error);
        
        // Extract error message from normalized ApiError
        let errorMessage = 'Failed to upload image';
        
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.status === 0) {
          errorMessage = 'Network error. Please check if the backend server is running.';
        } else if (error?.status) {
          errorMessage = `Server error (${error.status}). Please try again.`;
        }
        
        toast.error(errorMessage);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      return;
    }
    if (name === 'username') {
      const next = value.toLowerCase().replace(/\s+/g, '');
      if (!usernameCanChange && next !== savedUsername) {
        toast.error(
          usernameNextChangeLabel
            ? `You can only change your username once every 6 months. Next change: ${usernameNextChangeLabel}.`
            : 'You can only change your username once every 6 months.',
        );
        return;
      }
      updateProfile({ username: next });
      return;
    }
    updateProfile({ [name]: value });
  };

  const handleSave = async () => {
    // Validate required fields
    if (!profile.firstName.trim()) {
      toast.error('First name is required');
      return;
    }

    if (!profile.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }

    const locationValue = profile.location.trim();
    const usernameValue = profile.username.trim().toLowerCase();
    const usernameChanged = Boolean(usernameValue) && usernameValue !== savedUsername;

    if (usernameChanged) {
      if (!usernameCanChange) {
        toast.error(
          usernameNextChangeLabel
            ? `You can only change your username once every 6 months. Next change: ${usernameNextChangeLabel}.`
            : 'You can only change your username once every 6 months.',
        );
        return;
      }
      if (usernameValue.length < USERNAME_MIN_LENGTH) {
        toast.error(`Username must be at least ${USERNAME_MIN_LENGTH} characters`);
        return;
      }
      if (usernameValue.length > USERNAME_MAX_LENGTH) {
        toast.error(`Username must not exceed ${USERNAME_MAX_LENGTH} characters`);
        return;
      }
      if (!USERNAME_PATTERN.test(usernameValue)) {
        toast.error('Username can only use letters, numbers, dots, and underscores');
        return;
      }
    }

    try {
      setSaving(true);
      
      const updateData: Record<string, string | undefined> = {
        first_name: profile.firstName.trim(),
        last_name: profile.lastName.trim(),
        bio: profile.about.trim() || undefined,
      };

      if (usernameChanged) {
        updateData.username = usernameValue;
      }
      if (locationValue) {
        if (locationValue.length > CITY_MAX_LENGTH) {
          updateData.address = locationValue;
        } else {
          updateData.city = locationValue;
        }
      }

      if (profile.birthday) {
        updateData.date_of_birth = profile.birthday;
      }

      // Note: Email updates might require verification, so we skip it here
      // PAN number and goal are not in the backend model, so we skip them

      const response = await userService.updateProfile(updateData);
      
      if (response.success && response.data) {
        setUser(response.data);
        notifyUserProfileUpdated();
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      devError('Error updating profile:', error);
      const fieldErrors = error?.errors
        ? Object.values(error.errors).flat().filter(Boolean)
        : [];
      const errorMessage =
        fieldErrors[0] ||
        error?.message ||
        error.response?.data?.message ||
        'Failed to update profile';
      toast.error(
        locationValue.length > CITY_MAX_LENGTH && fieldErrors.some((m) => String(m).includes('city'))
          ? `Location is too long for city (${CITY_MAX_LENGTH} characters max). Use a shorter city or suburb name.`
          : errorMessage
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    try {
      setDeleting(true);
      const response = await userService.deleteAccount(deletePassword);
      
      if (response.success) {
        toast.success('Account deleted successfully');
        logout();
        window.location.href = '/';
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error: any) {
      devError('Error deleting account:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete account. Please check your password.';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={cn(PROFILE_TYPO, 'max-w-5xl space-y-8 pb-20')}>
        <div className="h-24 rounded-[28px] bg-surface-low" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div className="h-72 rounded-[28px] bg-surface-low" />
            <div className="h-56 rounded-[28px] bg-surface-low" />
          </div>
          <div className="space-y-6 lg:col-span-8">
            <div className="h-96 rounded-[32px] bg-surface-low" />
            <div className="h-48 rounded-[32px] bg-surface-low" />
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your profile';

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(PROFILE_TYPO, 'max-w-5xl space-y-8 pb-20')}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className={cn(
              landingHeadlineSm,
              'mb-2 text-[10px] uppercase tracking-[0.3em] text-brand-emerald',
            )}
          >
            Public presence
          </p>
          <h1 className={cn(landingHeadline, 'text-2xl text-brand-dark sm:text-4xl')}>
            Your profile
          </h1>
          <p className={cn(landingBodyMuted, 'mt-2 max-w-xl text-sm leading-relaxed')}>
            Manage how you appear to other members. A complete profile builds trust and helps you
            win more tasks.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          {publicProfileHref ? (
            <Link
              href={publicProfileHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                landingHeadlineSm,
                'inline-flex items-center gap-2 text-sm text-brand-emerald transition hover:opacity-80',
              )}
            >
              View public profile
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() =>
                toast.info('Save a username below to get a shareable public profile link.')
              }
              className={cn(
                landingBodyMuted,
                'inline-flex items-center gap-2 text-sm transition hover:text-brand-dark',
              )}
            >
              View public profile
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              landingBody,
              'inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-emerald/25 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save profile
              </>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-outline-variant bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="h-28 w-28 overflow-hidden rounded-[24px] border-4 border-white bg-surface-low shadow-md sm:h-32 sm:w-32">
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                    className="absolute -bottom-2 -right-2 rounded-2xl bg-brand-emerald p-3 text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
                <h2 className={cn(landingHeadline, 'mt-4 text-lg text-brand-dark')}>
                  {displayName}
                </h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>{profile.email}</p>
                {profile.location ? (
                  <p className={cn(landingBody, 'mt-1 flex items-center justify-center gap-1 text-xs text-brand-dark')}>
                    <MapPin className="h-3.5 w-3.5 text-brand-emerald" />
                    {profile.location}
                  </p>
                ) : null}
                <p className={cn(landingBodyMuted, 'mt-4 text-xs leading-relaxed')}>
                  JPG, PNG or GIF · max 5MB
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-outline-variant bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p
                    className={cn(
                      landingHeadlineSm,
                      'text-[10px] uppercase tracking-[0.2em] text-[#6a719a]',
                    )}
                  >
                    Profile strength
                  </p>
                  <p className={cn(landingHeadline, 'mt-1 text-2xl text-brand-dark')}>
                    {profileCompletion.percent}%
                  </p>
                </div>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald"
                  aria-hidden
                >
                  <UserIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-low">
                <div
                  className="h-full rounded-full bg-brand-emerald transition-all duration-500"
                  style={{ width: `${profileCompletion.percent}%` }}
                />
              </div>
              <p className={cn(landingBodyMuted, 'mt-3 text-xs')}>
                {profileCompletion.filled} of {profileCompletion.total} fields completed
              </p>
            </div>

            <nav
              className="rounded-[28px] border border-outline-variant bg-white p-3 shadow-sm"
              aria-label="Profile sections"
            >
              <ul className="space-y-1">
                {SECTION_NAV.map((item) => {
                  const Icon = item.icon;
                  const count = sectionCounts[item.id];
                  const max = item.id === 'identity' ? 5 : 1;
                  const isActive = activeSection === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          'flex w-full min-h-[48px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all',
                          isActive
                            ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/20'
                            : 'text-brand-dark hover:bg-surface-low',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isActive ? 'text-white' : 'text-brand-emerald',
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className={cn(landingHeadlineSm, 'block text-sm')}>
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              landingBody,
                              'block text-xs font-medium',
                              isActive ? 'text-white/80' : 'text-[#6a719a]',
                            )}
                          >
                            {item.description}
                          </span>
                        </span>
                        <span
                          className={cn(
                            landingHeadlineSm,
                            'rounded-full px-2 py-0.5 text-xs',
                            isActive ? 'bg-white/20 text-white' : 'bg-surface-low text-[#6a719a]',
                          )}
                        >
                          {count}/{max}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          <section
            id="profile-section-identity"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-brand-emerald/10 p-3 text-brand-emerald">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>Identity details</h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  Your name, location, and how members can find you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>
                  First name <span className="text-brand-emerald">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>
                  Last name <span className="text-brand-emerald">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a719a]" />
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    maxLength={500}
                    placeholder="City or suburb"
                    className={cn(inputClass, 'pl-11')}
                  />
                </div>
                <p className={cn(landingBodyMuted, 'text-xs')}>
                  City or suburb (max {CITY_MAX_LENGTH} characters). Longer text is saved as your
                  street address.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className={cn(landingHeadlineSm, 'flex items-center gap-2 text-sm text-brand-dark')}
                >
                  Email
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-low px-2 py-0.5 text-[10px] font-medium text-[#6a719a]">
                    <Lock className="h-3 w-3" />
                    Read only
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a719a]" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    readOnly
                    disabled
                    autoComplete="email"
                    className={cn(inputDisabledClass, 'pl-11')}
                  />
                </div>
                <p className={cn(landingBodyMuted, 'text-xs')}>
                  To change your email, go to{' '}
                  <Link
                    href="/tasker-dashboard/settings?tab=email"
                    className="font-semibold text-brand-emerald hover:underline"
                  >
                    Settings → Email
                  </Link>
                  .
                </p>
              </div>

              <div className="space-y-2">
                <label className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>PAN number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a719a]" />
                  <input
                    type="text"
                    name="panNumber"
                    value={profile.panNumber}
                    onChange={handleChange}
                    placeholder="Enter your PAN number"
                    className={cn(inputClass, 'pl-11 uppercase')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className={cn(landingHeadlineSm, 'flex items-center gap-2 text-sm text-brand-dark')}
                >
                  Username
                  {!usernameCanChange ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  ) : null}
                </label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a719a]" />
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    autoComplete="username"
                    maxLength={USERNAME_MAX_LENGTH}
                    placeholder="yourname"
                    disabled={!usernameCanChange}
                    readOnly={!usernameCanChange}
                    className={cn(
                      usernameCanChange ? inputClass : inputDisabledClass,
                      'pl-11 lowercase',
                    )}
                  />
                </div>
                {!usernameCanChange && usernameNextChangeLabel ? (
                  <p className="text-xs font-medium text-amber-800">
                    Usernames can be changed once every 6 months. Next change:{' '}
                    {usernameNextChangeLabel}.
                  </p>
                ) : (
                  <p className={cn(landingBodyMuted, 'text-xs')}>
                    You can change your username once every 6 months.
                  </p>
                )}
                <p className={cn(landingBodyMuted, 'text-xs')}>
                  Public profile:{' '}
                  {profile.username.trim() ? (
                    <Link
                      href={`/users/${encodeURIComponent(profile.username.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-emerald hover:underline"
                    >
                      /users/{profile.username.trim()}
                    </Link>
                  ) : (
                    <span>set a username to get a shareable link</span>
                  )}
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  className={cn(landingHeadlineSm, 'flex items-center gap-2 text-sm text-brand-dark')}
                >
                  <Cake className="h-4 w-4 text-brand-emerald" />
                  Birthday
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={profile.birthday}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section
            id="profile-section-about"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-brand-emerald/10 p-3 text-brand-emerald">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>About me</h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  A short bio helps customers understand your experience and style.
                </p>
              </div>
            </div>
            <textarea
              name="about"
              value={profile.about}
              onChange={handleChange}
              placeholder="Tell other users about yourself, your experience, and what you're great at…"
              rows={5}
              className={cn(inputClass, 'resize-y min-h-[120px]')}
            />
          </section>

          <section
            id="profile-section-goal"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-brand-emerald/10 p-3 text-brand-emerald">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>Your goal</h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  What brings you to SajiloWork?
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { id: 'done', label: 'Get things done', icon: CheckCircle },
                { id: 'earn', label: 'Earn money', icon: DollarSign },
              ].map((option) => {
                const selected = profile.goal === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateProfile({ goal: option.id as UserProfile['goal'] })}
                    className={cn(
                      'flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all',
                      selected
                        ? 'border-[#162556] bg-[#162556] text-white'
                        : 'border-outline-variant bg-white text-gray-400 hover:border-gray-300',
                    )}
                  >
                    <option.icon
                      className={cn('h-8 w-8', selected ? 'text-white' : 'text-gray-300')}
                    />
                    <span className={cn(landingHeadlineSm, 'text-sm')}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="flex flex-col items-stretch justify-between gap-4 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={cn(
                landingBody,
                'inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-emerald/25 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save profile
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className={cn(
                landingHeadlineSm,
                'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm text-red-600 transition hover:bg-red-50',
              )}
            >
              <Trash2 className="h-4 w-4" />
              Delete my account
            </button>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-6 rounded-[28px] border border-outline-variant bg-white p-8 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Trash2 className="h-7 w-7" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword('');
                }}
                className="rounded-lg p-1 text-[#6a719a] transition hover:bg-surface-low"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <h3 className={cn(landingHeadline, 'text-xl text-brand-dark')}>Delete account?</h3>
              <p className={cn(landingBodyMuted, 'text-sm leading-relaxed')}>
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            <div className="space-y-2">
              <label className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password"
                className={cn(inputClass, 'focus:ring-red-500/20 focus:border-red-300')}
                disabled={deleting}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword('');
                }}
                disabled={deleting}
                className={cn(
                  landingHeadlineSm,
                  'flex-1 rounded-2xl bg-surface-low px-6 py-3 text-sm text-brand-dark transition hover:bg-outline-variant/30 disabled:opacity-50',
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword.trim()}
                className={cn(
                  landingHeadlineSm,
                  'flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-3 text-sm text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete account'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
