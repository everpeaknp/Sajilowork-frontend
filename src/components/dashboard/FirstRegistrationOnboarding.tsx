'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Loader2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import AddressAutocompleteFields, {
  type AddressFieldValues,
} from '@/components/AddressAutocompleteFields';
import SiteBrand from '@/components/common/SiteBrand';
import {
  EMPLOYER_INDUSTRIES,
  EMPLOYER_TEAM_SIZES,
} from '@/components/employers/employerData';
import {
  DASHBOARD_ONBOARDING_DONE_EVENT,
  DASHBOARD_ONBOARDING_EVENT,
  consumeOnboardingSkipRoleStep,
  markDashboardOnboardingDone,
  markOnboardingForce,
  shouldShowDashboardOnboarding,
  type DashboardOnboardingEventDetail,
  type OnboardingRole,
} from '@/lib/dashboardOnboarding';
import { useSiteSettings } from '@/providers';
import { employerService } from '@/services/employer.service';
import { freelancerService } from '@/services/freelancer.service';
import { userService } from '@/services/user.service';
import { normalizeUserFromApi } from '@/lib/userProfileSync';
import {
  buildDashboardDesiredSkills,
  genderLabelFromApi,
  genderValueFromLabel,
  hourlyRateLabelFromApi,
  hourlyRateValueFromLabel,
  parseSkillsFromApi,
} from '@/lib/dashboardProfileSkills';
import {
  parseNepalAddressFromNominatim,
  reverseGeocodeNepal,
  STANDARD_HOURLY_RATE_OPTIONS,
} from '@/lib/nepalLocale';
import { syncUserSkills } from '@/lib/userSkillsSync';
import { useAuthStore } from '@/store/auth.store';
import { cn, getMediaUrl } from '@/lib/utils';
import type { DashboardSidebarRole } from '@/app/dashboard/dashboardTabs';

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const USERNAME_PATTERN = /^[a-z0-9._]+$/;
const panStorageKey = (userId: string | number) => `dashboard_profile_pan_${userId}`;

const SPECIALIZATION_OPTIONS = [
  'Web & App Design',
  'Frontend Development',
  'Backend Engineering',
  'UI/UX Prototyping',
  'Full-Stack Development',
] as const;

const PROFILE_TYPE_OPTIONS = ['Fixed', 'Hourly', 'Contract'] as const;

const SELECT_CHEVRON_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23111827' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.9rem center',
  backgroundSize: '1rem',
} as const;

function formatDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Latest birthday that still means the person is 18+. */
function maxAdultBirthdayDate() {
  const max = new Date();
  max.setFullYear(max.getFullYear() - 18);
  return max;
}

function isAtLeast18(dateOfBirth: string) {
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return false;
  return birth.getTime() <= maxAdultBirthdayDate().getTime();
}

type StepId = 'role' | 'verify' | 'profile' | 'review';

const ROLE_STEP = { id: 'role' as const, label: 'Your path' };

const EMPLOYER_STEPS: { id: StepId; label: string }[] = [
  ROLE_STEP,
  { id: 'verify', label: 'Basic details' },
  { id: 'profile', label: 'Business profile' },
  { id: 'review', label: 'Review & finish' },
];

const FREELANCER_STEPS: { id: StepId; label: string }[] = [
  ROLE_STEP,
  { id: 'verify', label: 'Basic details' },
  { id: 'profile', label: 'Professional details' },
  { id: 'review', label: 'Review & finish' },
];

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#52C47F] focus:ring-4 focus:ring-[#52C47F]/15 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:placeholder:text-neutral-500';

const labelClass = 'mb-2 block text-sm font-semibold text-neutral-800 dark:text-stone-100';

function splitName(fullName: string, first?: string, last?: string) {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { first_name: first?.trim() || '', last_name: last?.trim() || '' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: last?.trim() || '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

export default function FirstRegistrationOnboarding() {
  const settings = useSiteSettings();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const setUser = useAuthStore((s) => s.setUser);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingIdProof, setUploadingIdProof] = useState(false);
  const [idProofName, setIdProofName] = useState<string | null>(null);
  const [idProofUploaded, setIdProofUploaded] = useState(false);
  const [chosenRole, setChosenRole] = useState<DashboardSidebarRole>('customer');

  const isEmployer = chosenRole === 'customer';

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Select');
  const [birthday, setBirthday] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [address, setAddress] = useState<AddressFieldValues>({
    address: '',
    city: '',
    state: '',
    country: 'Nepal',
    postalCode: '',
  });

  const [companyName, setCompanyName] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');

  const [freelancerTagline, setFreelancerTagline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('Select');
  const [specialization, setSpecialization] = useState('Select');
  const [profileType, setProfileType] = useState('Select');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const idProofInputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);
  const steps = isEmployer ? EMPLOYER_STEPS : FREELANCER_STEPS;
  const totalSteps = steps.length;
  const currentStep = steps[stepIndex]?.id ?? 'role';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const hydrateFromUser = useCallback(() => {
    if (!user) return;
    const name =
      user.full_name?.trim() ||
      [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    setFullName(name);
    setUsername(user.username?.trim().toLowerCase() || '');
    setPhone(user.phone_number || '');
    setGender(genderLabelFromApi(user.gender));
    const dob = user.date_of_birth || '';
    setBirthday(dob && isAtLeast18(dob) ? dob : '');
    if (user.id) {
      try {
        setPanNumber(localStorage.getItem(panStorageKey(user.id)) || '');
      } catch {
        setPanNumber('');
      }
    } else {
      setPanNumber('');
    }
    setAddress({
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || 'Nepal',
      postalCode: user.postal_code || '',
      latitude: user.latitude,
      longitude: user.longitude,
    });
    setTagline(user.tagline || '');
    setFreelancerTagline(user.tagline || '');
    setBio(user.bio || '');
    setHourlyRate(hourlyRateLabelFromApi(user.hourly_rate));
    setCompanyName('');
    const preferred =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem('sajilowork-onboarding-preferred-role')
        : null;
    if (preferred === 'tasker' || preferred === 'customer') {
      setChosenRole(preferred);
    } else if (user.role === 'tasker' || user.role === 'customer') {
      setChosenRole(user.role);
    }
  }, [user]);

  const loadFreelancerProfessionMeta = useCallback(async () => {
    try {
      const response = await userService.getSkills();
      if (!response.success || !Array.isArray(response.data)) return;
      const parsed = parseSkillsFromApi(response.data);
      setSpecialization(parsed.specialization || 'Select');
      setProfileType(parsed.profileType || 'Select');
    } catch {
      /* ignore */
    }
  }, []);

  const openWizard = useCallback(
    (options?: { resetStep?: boolean; skipRoleStep?: boolean; role?: OnboardingRole }) => {
      hydrateFromUser();
      if (options?.role) {
        setChosenRole(options.role);
      } else {
        try {
          const preferred = window.sessionStorage.getItem('sajilowork-onboarding-preferred-role');
          if (preferred === 'tasker' || preferred === 'customer') {
            setChosenRole(preferred);
          }
        } catch {
          /* ignore */
        }
      }
      void loadFreelancerProfessionMeta();
      if (options?.resetStep !== false) {
        const skipRoleStep = Boolean(options?.skipRoleStep) || consumeOnboardingSkipRoleStep();
        setStepIndex(skipRoleStep ? 1 : 0);
      }
      setOpen(true);
      openRef.current = true;
      document.body.style.overflow = 'hidden';
    },
    [hydrateFromUser, loadFreelancerProfessionMeta],
  );

  // Auto-open for first registration or first time on a role (e.g. after role switch).
  useEffect(() => {
    if (!mounted || !isAuthenticated || !user?.id) return;
    if (openRef.current) return;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('onboarding') === '1') {
        markOnboardingForce();
        openWizard();
        params.delete('onboarding');
        const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
        window.history.replaceState({}, '', next);
        return;
      }
    }

    if (!shouldShowDashboardOnboarding(user, user.role)) return;

    const timer = window.setTimeout(() => {
      if (openRef.current) return;
      openWizard({
        role: user.role === 'tasker' ? 'tasker' : 'customer',
      });
    }, 450);
    return () => window.clearTimeout(timer);
    // Re-check when role changes (first switch to employer/freelancer).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- openWizard identity would restart mid-wizard
  }, [mounted, isAuthenticated, user?.id, user?.role]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onForce = (event: Event) => {
      const detail = (event as CustomEvent<DashboardOnboardingEventDetail>).detail;
      openWizard({
        resetStep: true,
        skipRoleStep: Boolean(detail?.skipRoleStep),
        role: detail?.role,
      });
    };
    window.addEventListener(DASHBOARD_ONBOARDING_EVENT, onForce);
    return () => window.removeEventListener(DASHBOARD_ONBOARDING_EVENT, onForce);
  }, [mounted, openWizard]);

  useEffect(() => {
    if (!open || !isEmployer || !user?.id) return;
    let cancelled = false;
    void employerService.getMyEmployerProfile().then((res) => {
      if (cancelled || !res.success || !res.data) return;
      const p = res.data;
      setCompanyName(p.company_name || '');
      setAccountType(p.account_type === 'company' ? 'company' : 'individual');
      setIndustry(p.industry || '');
      setTeamSize(p.team_size || '');
      setTagline(p.tagline || '');
      setDescription(p.description || '');
      setWebsite(p.website || '');
      if (p.company_name) setCompanyName(p.company_name);
    });
    return () => {
      cancelled = true;
    };
  }, [open, isEmployer, user?.id]);

  const finish = useCallback(
    (startTour: boolean) => {
      markDashboardOnboardingDone(user?.id, chosenRole);
      openRef.current = false;
      setOpen(false);
      document.body.style.overflow = '';
      window.dispatchEvent(
        new CustomEvent(DASHBOARD_ONBOARDING_DONE_EVENT, { detail: { startTour } }),
      );
    },
    [chosenRole, user?.id],
  );

  const validateStep = (): boolean => {
    if (currentStep === 'verify') {
      if (!fullName.trim()) {
        toast.error('Please enter your full name.');
        return false;
      }
      if (!phone.trim()) {
        toast.error('Please enter your phone number.');
        return false;
      }
      if (birthday && !isAtLeast18(birthday)) {
        toast.error('You must be at least 18 years old.');
        return false;
      }
      if (!isEmployer) {
        const usernameValue = username.trim().toLowerCase();
        if (usernameValue) {
          if (usernameValue.length < USERNAME_MIN_LENGTH) {
            toast.error(`Username must be at least ${USERNAME_MIN_LENGTH} characters.`);
            return false;
          }
          if (!USERNAME_PATTERN.test(usernameValue)) {
            toast.error('Username can only use lowercase letters, numbers, dots, and underscores.');
            return false;
          }
        }
      }
    }
    if (currentStep === 'profile' && isEmployer && accountType === 'company' && !companyName.trim()) {
      toast.error('Enter your company name.');
      return false;
    }
    if (currentStep === 'profile' && !isEmployer && !freelancerTagline.trim() && !bio.trim()) {
      toast.error('Add a short tagline or bio so employers know what you do.');
      return false;
    }
    return true;
  };

  const saveVerifyStep = async () => {
    const { first_name, last_name } = splitName(fullName, user?.first_name, user?.last_name);
    const genderValue = genderValueFromLabel(gender);
    const usernameValue = username.trim().toLowerCase();
    const savedUsername = (user?.username ?? '').trim().toLowerCase();
    const usernameCanChange = user?.username_can_change !== false;
    const usernameChanged =
      !isEmployer && Boolean(usernameValue) && usernameValue !== savedUsername;

    if (usernameChanged && !usernameCanChange) {
      throw new Error('Usernames can be changed once every 6 months.');
    }

    let resolved = address;
    if (
      address.latitude != null &&
      address.longitude != null &&
      (!address.city.trim() || !address.state.trim() || !address.postalCode.trim())
    ) {
      try {
        const geo = await reverseGeocodeNepal(address.latitude, address.longitude);
        const parsed = parseNepalAddressFromNominatim(geo.address);
        resolved = {
          ...address,
          city: address.city.trim() || parsed.city || '',
          state: address.state.trim() || parsed.state || '',
          country: address.country.trim() || parsed.country || 'Nepal',
          postalCode: address.postalCode.trim() || parsed.postcode || '',
          address: address.address.trim() || parsed.streetAddress || address.address,
        };
        setAddress(resolved);
      } catch {
        // Keep typed street address; city/state may stay empty if geocode fails.
      }
    }

    const profileRes = await userService.updateProfile({
      first_name,
      last_name,
      phone_number: phone.trim(),
      gender: genderValue,
      date_of_birth: birthday || undefined,
      address: resolved.address.trim() || undefined,
      city: resolved.city.trim() || undefined,
      state: resolved.state.trim() || undefined,
      country: resolved.country.trim() || undefined,
      postal_code: resolved.postalCode.trim() || undefined,
      ...(resolved.latitude != null ? { latitude: resolved.latitude } : {}),
      ...(resolved.longitude != null ? { longitude: resolved.longitude } : {}),
      ...(usernameChanged ? { username: usernameValue } : {}),
    });

    if (!profileRes.success) {
      throw new Error(profileRes.message || 'Could not save verification details.');
    }

    if (profileRes.data) {
      setUser(normalizeUserFromApi(profileRes.data as unknown as Record<string, unknown>));
    }

    const pan = panNumber.trim().toUpperCase();
    if (pan) {
      await userService.updateKyc({ pan_number: pan }).catch(() => undefined);
    }
    if (user?.id) {
      try {
        if (pan) {
          localStorage.setItem(panStorageKey(user.id), pan);
        } else {
          localStorage.removeItem(panStorageKey(user.id));
        }
      } catch {
        // ignore localStorage errors
      }
    }
  };

  const saveProfileStep = async () => {
    if (isEmployer) {
      const displayName =
        accountType === 'company' ? companyName.trim() : fullName.trim() || companyName.trim();
      const slugBase =
        (user?.username || displayName || 'employer')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9._]+/g, '.')
          .replace(/^\.+|\.+$/g, '')
          .slice(0, 30) || 'employer';

      const locationFromVerify = [address.city, address.state, address.country]
        .filter(Boolean)
        .join(', ');

      const res = await employerService.updateMyEmployerProfile({
        slug: slugBase,
        account_type: accountType,
        company_name: displayName,
        tagline: tagline.trim(),
        industry: industry.trim(),
        team_size: accountType === 'company' ? teamSize.trim() : '',
        location: locationFromVerify,
        description: description.trim(),
        website: website.trim(),
        contact_email: user?.email || '',
        contact_phone: phone.trim(),
      });
      if (!res.success) {
        throw new Error(res.message || 'Could not save business profile.');
      }
    } else {
      const rate = hourlyRateValueFromLabel(hourlyRate);
      const updateData: Record<string, string | number | undefined> = {
        tagline: freelancerTagline.trim() || undefined,
        bio: bio.trim() || undefined,
      };
      if (rate !== undefined) {
        updateData.hourly_rate = rate;
      }
      if (user?.role !== 'tasker') {
        updateData.role = 'tasker';
      }

      const res = await freelancerService.updateMyFreelancerProfile(updateData);
      if (!res.success) {
        throw new Error(res.message || 'Could not save profile.');
      }
      if (res.data) {
        setUser(normalizeUserFromApi(res.data as unknown as Record<string, unknown>));
      }

      const skillsRes = await userService.getSkills();
      const existing =
        skillsRes.success && Array.isArray(skillsRes.data) ? skillsRes.data : [];
      const parsed = parseSkillsFromApi(existing);
      const desired = buildDashboardDesiredSkills(existing, {
        skillRows: parsed.skillRows,
        transport: parsed.transport,
        languages: parsed.languages,
        education: parsed.education,
        experience: parsed.experience,
        awards: parsed.awards,
        specialization,
        profileType,
        workLocationMode: parsed.workLocationMode,
      });
      await syncUserSkills(existing, desired);
    }
  };

  const saveRoleStep = async () => {
    if (!user || user.role === chosenRole) return;
    const res = await userService.updateProfile({ role: chosenRole });
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Could not update your account type.');
    }
    setUser(normalizeUserFromApi(res.data as unknown as Record<string, unknown>));
    try {
      window.sessionStorage.setItem('sajilowork-onboarding-preferred-role', chosenRole);
    } catch {
      /* ignore */
    }
  };

  const goNext = async () => {
    if (!validateStep()) return;

    if (stepIndex < totalSteps - 1) {
      if (currentStep === 'role') {
        setSaving(true);
        try {
          await saveRoleStep();
          setStepIndex((i) => i + 1);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Could not save your path.');
        } finally {
          setSaving(false);
        }
        return;
      }
      setStepIndex((i) => i + 1);
      return;
    }

    setSaving(true);
    try {
      await saveRoleStep();
      await saveVerifyStep();
      await saveProfileStep();
      await refreshUser().catch(() => undefined);
      toast.success('You are all set!');
      finish(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const handleSkip = () => {
    toast.message('Skip setup for now?', {
      description: 'You can finish verification and profile anytime from Settings and Profile.',
      duration: 10000,
      action: {
        label: 'Skip',
        onClick: () => finish(true),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => undefined,
      },
    });
  };

  const handlePhotoChange = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a JPG or PNG image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const res = await userService.uploadProfileImage(file);
      if (!res.success) throw new Error(res.message || 'Upload failed');
      await refreshUser();
      toast.success('Photo updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleIdProofChange = async (file: File | null) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type) && !/\.(jpe?g|png|pdf)$/i.test(file.name)) {
      toast.error('Upload a JPG, PNG, or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ID document must be 10MB or smaller.');
      return;
    }
    setUploadingIdProof(true);
    try {
      const res = await userService.uploadDocument(file, { document_type: 'id_card' });
      if (!res.success) throw new Error(res.message || 'Upload failed');
      setIdProofName(file.name);
      setIdProofUploaded(true);
      toast.success('ID document uploaded. Pending admin review.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload ID document');
    } finally {
      setUploadingIdProof(false);
      if (idProofInputRef.current) idProofInputRef.current.value = '';
    }
  };

  const progressPct = ((stepIndex + 1) / totalSteps) * 100;
  const profileImageSrc =
    getMediaUrl(user?.profile_image) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=52C47F&color=fff`;

  const sideCopy = isEmployer
    ? 'Choose how you use Sajilo Work, verify your identity, and set up your employer profile.'
    : 'Choose how you use Sajilo Work, verify your identity, and complete your freelancer profile.';

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-[#193E32]/55 p-0 backdrop-blur-[2px] sm:p-5 md:p-7">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden bg-white shadow-[0_24px_80px_rgba(25,62,50,0.28)] sm:h-auto sm:max-h-[min(720px,92dvh)] sm:rounded-3xl dark:bg-neutral-950"
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_1fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#193E32] via-[#2f7a52] to-[#52C47F] px-7 py-8 text-white lg:flex lg:flex-col">
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="relative z-[1] mb-10">
              <SiteBrand
                displayName={settings.display_name || settings.site_name || 'Sajilo Work'}
                logoUrl={settings.logo_url}
                href="/dashboard"
                textClassName="!text-white [&_span]:!text-white"
                className="pointer-events-none"
              />
            </div>
            <h1 id="onboarding-title" className="relative z-[1] font-formula text-2xl font-semibold leading-tight tracking-tight">
              Set up your account in minutes
            </h1>
            <p className="relative z-[1] mt-3 text-sm leading-relaxed text-white/80">{sideCopy}</p>

            <div className="relative z-[1] mt-10 flex flex-col gap-4">
              {steps.map((step, index) => {
                const done = index < stepIndex;
                const active = index === stepIndex;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-3 transition',
                      active || done ? 'opacity-100' : 'opacity-55',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold',
                        done && 'border-transparent bg-emerald-100 text-emerald-800',
                        active && !done && 'border-transparent bg-white text-[#193E32]',
                        !active && !done && 'border-white/30 bg-white/15 text-white',
                      )}
                    >
                      {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : index + 1}
                    </div>
                    <span className="text-sm font-semibold tracking-tight">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 sm:px-6 sm:py-4 dark:border-neutral-800">
              <div className="min-w-0 flex-1">
                <p className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Step {stepIndex + 1} of {totalSteps}
                  <span className="ml-2 font-semibold text-neutral-800 lg:hidden dark:text-stone-100">
                    · {steps[stepIndex]?.label}
                  </span>
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2f7a52] to-[#52C47F] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="shrink-0 cursor-pointer px-2 py-1 text-sm font-semibold text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-stone-100"
              >
                Skip setup
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 md:px-8">
              {currentStep === 'role' ? (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2f7a52]">
                    Your path
                  </p>
                  <h2 className="font-formula text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-stone-100">
                    How will you use Sajilo Work?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    You can switch between employer and freelancer later from the dashboard.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        {
                          value: 'customer' as const,
                          title: 'I want to hire',
                          desc: 'Post jobs, projects, tasks, and hire freelancers.',
                          icon: Building2,
                        },
                        {
                          value: 'tasker' as const,
                          title: 'I want to work',
                          desc: 'Find work, submit proposals, and earn as a freelancer.',
                          icon: UserRound,
                        },
                      ] as const
                    ).map((choice) => {
                      const Icon = choice.icon;
                      const selected = chosenRole === choice.value;
                      return (
                        <button
                          key={choice.value}
                          type="button"
                          onClick={() => setChosenRole(choice.value)}
                          className={cn(
                            'cursor-pointer rounded-2xl border p-5 text-left transition',
                            selected
                              ? 'border-[#52C47F] bg-[#F4F8F6] ring-2 ring-[#52C47F]/25 dark:bg-[#52C47F]/10'
                              : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700',
                          )}
                        >
                          <Icon className="mb-3 h-7 w-7 text-[#52C47F]" />
                          <p className="text-sm font-semibold text-neutral-900 dark:text-stone-100">
                            {choice.title}
                          </p>
                          <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{choice.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {currentStep === 'verify' ? (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2f7a52]">
                    Basic details
                  </p>
                  <h2 className="font-formula text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-stone-100">
                    Confirm who you are
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Same basic details as your dashboard profile. Use the name and address that match your
                    identity documents. Photo ID is optional.
                  </p>

                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative shrink-0 self-start">
                      <div className="h-24 w-24 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
                        <img src={profileImageSrc} alt="" className="h-full w-full object-cover" />
                      </div>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handlePhotoChange(e.target.files?.[0] ?? null)}
                      />
                      <button
                        type="button"
                        disabled={uploadingPhoto}
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute -right-2 -bottom-2 cursor-pointer rounded-xl bg-[#52C47F] p-2.5 text-white shadow-md transition hover:bg-[#43B26F] disabled:opacity-60"
                        aria-label="Upload profile photo"
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      <p className="font-semibold text-neutral-800 dark:text-stone-100">Profile photo</p>
                      <p className="mt-1">Clear face photo · JPG or PNG · up to 5MB</p>
                      {user?.is_email_verified ? (
                        <p className="mt-2 text-xs font-medium text-[#2f7a52]">Email verified</p>
                      ) : (
                        <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                          Email not verified yet — check your inbox or Settings.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">
                      Basic Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="ob-fullname">
                          Full name *
                        </label>
                        <input
                          id="ob-fullname"
                          className={inputClass}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="ob-phone">
                          Phone *
                        </label>
                        <input
                          id="ob-phone"
                          type="tel"
                          className={inputClass}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +977 98XXXXXXXX"
                          autoComplete="tel"
                        />
                      </div>
                      {!isEmployer ? (
                        <div>
                          <label className={labelClass} htmlFor="ob-username">
                            Username
                          </label>
                          <input
                            id="ob-username"
                            className={cn(inputClass, 'lowercase')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            placeholder="yourname"
                            autoComplete="username"
                            maxLength={USERNAME_MAX_LENGTH}
                            disabled={user?.username_can_change === false}
                            readOnly={user?.username_can_change === false}
                          />
                          {user?.username_can_change === false ? (
                            <p className="mt-1 text-xs font-medium text-amber-800 dark:text-amber-400">
                              Usernames can be changed once every 6 months.
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      <div>
                        <label className={labelClass} htmlFor="ob-gender">
                          Gender
                        </label>
                        <select
                          id="ob-gender"
                          className={inputClass}
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="Select">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="ob-dob">
                          Birthday
                        </label>
                        <input
                          id="ob-dob"
                          type="date"
                          className={inputClass}
                          value={birthday}
                          max={formatDateInputValue(maxAdultBirthdayDate())}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (next && !isAtLeast18(next)) {
                              toast.error('You must be at least 18 years old.');
                              setBirthday('');
                              return;
                            }
                            setBirthday(next);
                          }}
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="ob-pan">
                          PAN number
                        </label>
                        <input
                          id="ob-pan"
                          className={cn(inputClass, 'uppercase')}
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          placeholder="Enter your PAN number"
                          autoComplete="off"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <AddressAutocompleteFields
                          variant="dashboard"
                          streetOnly
                          values={address}
                          onChange={(updates) => setAddress((prev) => ({ ...prev, ...updates }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-700 dark:bg-neutral-900/60">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#52C47F]/15 text-[#2f7a52]">
                          <FileImage className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-stone-100">
                            Photo ID proof
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            Government ID card, passport, or driver license · JPG, PNG, or PDF · optional
                          </p>
                          {idProofUploaded ? (
                            <p className="mt-1.5 truncate text-xs font-medium text-[#2f7a52]">
                              Uploaded{idProofName ? `: ${idProofName}` : ''} · pending review
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <input
                          ref={idProofInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                          className="hidden"
                          onChange={(e) => void handleIdProofChange(e.target.files?.[0] ?? null)}
                        />
                        <button
                          type="button"
                          disabled={uploadingIdProof}
                          onClick={() => idProofInputRef.current?.click()}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-[#52C47F] hover:text-[#2f7a52] disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100"
                        >
                          {uploadingIdProof ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading…
                            </>
                          ) : idProofUploaded ? (
                            'Replace file'
                          ) : (
                            'Upload ID'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 'profile' && isEmployer ? (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2f7a52]">
                    Business profile
                  </p>
                  <h2 className="font-formula text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-stone-100">
                    Tell freelancers about you
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Location comes from your verify step. You can refine this anytime under Profile.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        {
                          value: 'individual' as const,
                          title: 'Individual',
                          desc: 'Hiring as yourself',
                          icon: UserRound,
                        },
                        {
                          value: 'company' as const,
                          title: 'Company',
                          desc: 'Hiring as a business',
                          icon: Building2,
                        },
                      ] as const
                    ).map((choice) => {
                      const Icon = choice.icon;
                      const selected = accountType === choice.value;
                      return (
                        <button
                          key={choice.value}
                          type="button"
                          onClick={() => {
                            setAccountType(choice.value);
                            if (choice.value === 'individual') setTeamSize('');
                          }}
                          className={cn(
                            'cursor-pointer rounded-2xl border p-4 text-left transition',
                            selected
                              ? 'border-[#52C47F] bg-[#F4F8F6] ring-2 ring-[#52C47F]/25 dark:bg-[#52C47F]/10'
                              : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700',
                          )}
                        >
                          <Icon className="mb-2 h-6 w-6 text-[#52C47F]" />
                          <p className="text-sm font-semibold text-neutral-900 dark:text-stone-100">
                            {choice.title}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">{choice.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {accountType === 'company' ? (
                      <div className="sm:col-span-2">
                        <label className={labelClass} htmlFor="ob-company">
                          Company name *
                        </label>
                        <input
                          id="ob-company"
                          className={inputClass}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Pvt. Ltd."
                        />
                      </div>
                    ) : null}
                    <div className={accountType === 'company' ? '' : 'sm:col-span-2'}>
                      <label className={labelClass} htmlFor="ob-industry">
                        Industry
                      </label>
                      <select
                        id="ob-industry"
                        className={inputClass}
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      >
                        <option value="">Select industry</option>
                        {EMPLOYER_INDUSTRIES.filter((item) => item !== 'Category').map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    {accountType === 'company' ? (
                      <div>
                        <label className={labelClass} htmlFor="ob-team">
                          Team size
                        </label>
                        <select
                          id="ob-team"
                          className={inputClass}
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                        >
                          <option value="">Select size</option>
                          {EMPLOYER_TEAM_SIZES.filter((item) => item !== 'No of Employees').map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    <div className="sm:col-span-2">
                      <label className={labelClass} htmlFor="ob-website">
                        Website
                      </label>
                      <input
                        id="ob-website"
                        className={inputClass}
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass} htmlFor="ob-tagline">
                        Tagline
                      </label>
                      <input
                        id="ob-tagline"
                        className={inputClass}
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="What you hire for in one line"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass} htmlFor="ob-desc">
                        About
                      </label>
                      <textarea
                        id="ob-desc"
                        className={cn(inputClass, 'min-h-[96px] resize-y')}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe your business or hiring needs"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 'profile' && !isEmployer ? (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2f7a52]">
                    Professional details
                  </p>
                  <h2 className="font-formula text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-stone-100">
                    Show what you offer
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Same profession details as your dashboard profile. You can add skills, languages, and
                    more later.
                  </p>

                  <div className="mt-6 space-y-4">
                    <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">
                      Profession Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="ob-f-tagline">
                          Tagline
                        </label>
                        <input
                          id="ob-f-tagline"
                          className={inputClass}
                          value={freelancerTagline}
                          onChange={(e) => setFreelancerTagline(e.target.value)}
                          placeholder="Short headline for your profile"
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="ob-f-specialization">
                          Specialization
                        </label>
                        <select
                          id="ob-f-specialization"
                          className={cn(inputClass, 'cursor-pointer appearance-none')}
                          style={SELECT_CHEVRON_STYLE}
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                        >
                          <option value="Select">Select</option>
                          {SPECIALIZATION_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                          {specialization !== 'Select' &&
                          !SPECIALIZATION_OPTIONS.includes(
                            specialization as (typeof SPECIALIZATION_OPTIONS)[number],
                          ) ? (
                            <option value={specialization}>{specialization}</option>
                          ) : null}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="ob-rate">
                          Hourly Rate
                        </label>
                        <select
                          id="ob-rate"
                          className={cn(inputClass, 'cursor-pointer appearance-none')}
                          style={SELECT_CHEVRON_STYLE}
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                        >
                          <option value="Select">Select</option>
                          {STANDARD_HOURLY_RATE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                          {hourlyRate !== 'Select' &&
                          !STANDARD_HOURLY_RATE_OPTIONS.some((option) => option.value === hourlyRate) ? (
                            <option value={hourlyRate}>{hourlyRate}</option>
                          ) : null}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="ob-f-type">
                          Type
                        </label>
                        <select
                          id="ob-f-type"
                          className={cn(inputClass, 'cursor-pointer appearance-none')}
                          style={SELECT_CHEVRON_STYLE}
                          value={profileType}
                          onChange={(e) => setProfileType(e.target.value)}
                        >
                          <option value="Select">Select</option>
                          {PROFILE_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass} htmlFor="ob-bio">
                          Introduce Yourself
                        </label>
                        <textarea
                          id="ob-bio"
                          className={cn(inputClass, 'min-h-[160px] resize-y')}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Description"
                          rows={5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 'review' ? (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2f7a52]">
                    Almost done
                  </p>
                  <h2 className="font-formula text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-stone-100">
                    Review your setup
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    After finishing, a short product tour will highlight the main dashboard areas.
                  </p>

                  <div className="mt-6 rounded-2xl border border-neutral-100 bg-[#FAFBF9] p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    {[
                      {
                        label: 'Path',
                        value: isEmployer ? 'Employer (hire)' : 'Freelancer (work)',
                      },
                      { label: 'Name', value: fullName || '—' },
                      ...(!isEmployer
                        ? [{ label: 'Username', value: username || '—' }]
                        : []),
                      { label: 'Phone', value: phone || '—' },
                      { label: 'Gender', value: gender !== 'Select' ? gender : '—' },
                      { label: 'Birthday', value: birthday || '—' },
                      {
                        label: 'Location',
                        value:
                          address.address.trim() ||
                          [address.city, address.state, address.country].filter(Boolean).join(', ') ||
                          '—',
                      },
                      { label: 'PAN', value: panNumber || '—' },
                      {
                        label: 'Photo ID',
                        value: idProofUploaded ? 'Uploaded (pending review)' : 'Not uploaded',
                      },
                      ...(isEmployer
                        ? [
                            {
                              label: 'Account type',
                              value: accountType === 'company' ? 'Company' : 'Individual',
                            },
                            ...(accountType === 'company'
                              ? [{ label: 'Company', value: companyName || '—' }]
                              : []),
                            { label: 'Industry', value: industry || '—' },
                          ]
                        : [
                            { label: 'Tagline', value: freelancerTagline || '—' },
                            {
                              label: 'Specialization',
                              value: specialization !== 'Select' ? specialization : '—',
                            },
                            {
                              label: 'Hourly rate',
                              value: hourlyRate !== 'Select' ? hourlyRate : '—',
                            },
                            {
                              label: 'Type',
                              value: profileType !== 'Select' ? profileType : '—',
                            },
                          ]),
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-start justify-between gap-4 border-b border-dashed border-neutral-200 py-3 last:border-0 dark:border-neutral-800"
                      >
                        <span className="text-sm text-neutral-500">{row.label}</span>
                        <strong className="max-w-[60%] text-right text-sm font-semibold text-neutral-900 dark:text-stone-100">
                          {row.value}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-stone-100">
                      Your workspace is ready
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                      Finish to open the dashboard. You can update details anytime in Settings and Profile.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-100 px-4 py-4 sm:px-6 dark:border-neutral-800">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0 || saving}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-200 disabled:invisible dark:bg-neutral-800 dark:text-stone-100 dark:hover:bg-neutral-700',
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => void goNext()}
                disabled={saving || uploadingPhoto || uploadingIdProof}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2f7a52] to-[#52C47F] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(82,196,127,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    {stepIndex === totalSteps - 1 ? 'Finish setup' : 'Continue'}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
