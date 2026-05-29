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
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { userService } from '@/services';
import { toast } from 'sonner';
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
          console.log('Upload progress:', progress);
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
        console.error('Error uploading image:', error);
        
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
      console.error('Error updating profile:', error);
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
      console.error('Error deleting account:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete account. Please check your password.';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl space-y-12 pb-20"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-blue-950 uppercase tracking-tighter">Profile Settings</h1>
          <p className="text-gray-500 mt-2">Manage your personal information and public presence.</p>
        </div>
        {publicProfileHref ? (
          <Link
            href={publicProfileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary font-bold hover:underline transition-all"
          >
            View your public profile
            <ExternalLink className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() =>
              toast.info('Save a username below to get a shareable public profile link.')
            }
            className="flex items-center gap-2 font-bold text-gray-400 transition-all"
          >
            View your public profile
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Avatar */}
        <div className="lg:col-span-4 space-y-6 flex flex-col items-center lg:items-start">
          <div className="relative group">
            <div className="w-48 h-48 rounded-[40px] bg-gray-100 border-4 border-white shadow-2xl overflow-hidden">
              <img 
                src={profile.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
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
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-4 bg-primary text-white rounded-3xl shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h3 className="font-black text-blue-950 uppercase tracking-tight">Upload photo</h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase tracking-widest">
              JPG, PNG or GIF.<br />Max size 5MB.
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Identity Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 ml-1">First name*</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={profile.firstName} 
                  onChange={handleChange}
                  className="w-full p-4 bg-white border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary outline-none font-semibold transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 ml-1">Last name*</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={profile.lastName} 
                  onChange={handleChange}
                  className="w-full p-4 bg-white border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary outline-none font-semibold transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    name="location"
                    value={profile.location} 
                    onChange={handleChange}
                    maxLength={500}
                    placeholder="City or suburb"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary outline-none font-semibold transition-all" 
                  />
                </div>
                <p className="text-xs text-on-surface-variant ml-1">
                  City or suburb (max {CITY_MAX_LENGTH} characters). Longer text is saved as your street address.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 ml-1 flex items-center gap-2">
                  Email
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    <Lock className="h-3 w-3" />
                    Read only
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    readOnly
                    disabled
                    autoComplete="email"
                    className="w-full cursor-not-allowed bg-slate-50 pl-12 pr-4 py-4 border border-outline-variant rounded-2xl outline-none font-semibold text-slate-600 transition-all"
                  />
                </div>
                <p className="text-xs text-on-surface-variant ml-1">
                  To change your email, go to{' '}
                  <Link
                    href="/tasker-dashboard/settings?tab=email"
                    className="font-semibold text-primary hover:underline"
                  >
                    Settings → Email
                  </Link>
                  .
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 ml-1">PAN Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    name="panNumber"
                    value={profile.panNumber} 
                    onChange={handleChange}
                    placeholder="Enter your PAN number" 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary outline-none font-semibold transition-all uppercase" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-950 ml-1 flex items-center gap-2">
                  Username
                  {!usernameCanChange ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  ) : null}
                </label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    className={`w-full pl-12 pr-4 py-4 border border-outline-variant rounded-2xl outline-none font-semibold transition-all lowercase ${
                      usernameCanChange
                        ? 'bg-white focus:ring-2 focus:ring-primary'
                        : 'cursor-not-allowed bg-slate-50 text-slate-600'
                    }`}
                  />
                </div>
                {!usernameCanChange && usernameNextChangeLabel ? (
                  <p className="text-xs font-medium text-amber-800 ml-1">
                    Usernames can be changed once every 6 months. You can update yours again on{' '}
                    {usernameNextChangeLabel}.
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant ml-1">
                    You can change your username once every 6 months.
                  </p>
                )}
                <p className="text-xs text-on-surface-variant ml-1">
                  Public profile:{' '}
                  {profile.username.trim() ? (
                    <Link
                      href={`/users/${encodeURIComponent(profile.username.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      /users/{profile.username.trim()}
                    </Link>
                  ) : (
                    <span>set a username to get a shareable link</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-blue-950 ml-1 flex items-center gap-2">
                <Cake className="w-4 h-4 text-gray-400" />
                Birthday
              </label>
              <input 
                type="date" 
                name="birthday"
                value={profile.birthday}
                onChange={handleChange}
                className="w-full p-4 bg-white border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary outline-none font-semibold transition-all" 
              />
            </div>
          </section>

          <section className="space-y-6 pt-6 border-t border-gray-50">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Info className="w-4 h-4" />
              About me
            </h3>
            <textarea 
              name="about"
              value={profile.about}
              onChange={handleChange}
              placeholder="Tell other users about yourself..." 
              rows={4}
              className="w-full p-4 bg-white border border-outline-variant rounded-3xl focus:ring-2 focus:ring-primary outline-none font-medium transition-all"
            />
          </section>

          <section className="space-y-6 pt-6 border-t border-gray-50">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Target className="w-4 h-4" />
              What is your main goal on tasknepal?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'done', label: 'Get things done', icon: CheckCircle },
                { id: 'earn', label: 'Earn money', icon: DollarSign }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateProfile({ goal: option.id as any })}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                    profile.goal === option.id 
                      ? 'border-[#162556] bg-[#162556] text-white' 
                      : 'border-outline-variant bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <option.icon className={`w-8 h-8 ${profile.goal === option.id ? 'text-white' : 'text-gray-300'}`} />
                  <span className="font-black uppercase tracking-tight">{option.label}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-[#1161fe] text-white px-12 py-4 rounded-3xl font-black uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save profile'
              )}
            </button>
            <button 
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-6 py-3 rounded-2xl transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Delete my account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-blue-950 uppercase tracking-tight">
                Delete Account?
              </h3>
              <p className="text-gray-600">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-blue-950 ml-1">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-4 bg-gray-50 border border-outline-variant rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-semibold transition-all"
                disabled={deleting}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword('');
                }}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword.trim()}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
