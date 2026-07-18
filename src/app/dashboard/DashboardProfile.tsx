'use client';

import { useState, useEffect, useRef, useCallback, useMemo, type FormEvent, type ChangeEvent, type ElementType, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store';
import { freelancerService, userService } from '@/services';
import { notifyUserProfileUpdated, USER_PROFILE_UPDATED } from '@/lib/userProfileSync';
import {
  buildDashboardDesiredSkills,
  genderLabelFromApi,
  genderValueFromLabel,
  hourlyRateLabelFromApi,
  hourlyRateValueFromLabel,
  parseSkillsFromApi,
  workLocationModeFromLocationType,
  locationTypeFromWorkLocationMode,
  type LanguageRow,
  type ProfileLocationType,
} from '@/lib/dashboardProfileSkills';
import { languageNamesForSelect, loadLanguages } from '@/lib/dashboardListingApi';
import LocationFields from '@/components/post-task/LocationFields';
import { syncUserSkills } from '@/lib/userSkillsSync';
import type { UserSkill } from '@/types';
import {
  Trash2,
  ArrowUpRight,
  X,
  ChevronUp,
  ChevronDown,
  User,
  CheckCircle2,
  Plus,
  Pencil,
  Bike,
  Car,
  Monitor,
  Scooter,
  Truck,
  PersonStanding,
  BadgeCheck,
  Sparkles,
  GraduationCap,
  Briefcase,
  Award,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import DashboardLicenceBadges from '@/app/dashboard/DashboardLicenceBadges';
import DeleteConfirmModal from '@/app/dashboard/DeleteConfirmModal';
import ProfileFormModal, {
  profileModalFieldLabelClass,
  profileModalInputClass,
  profileModalTextareaClass,
} from '@/app/dashboard/ProfileFormModal';
import Link from 'next/link';
import { useDashboardSidebarRole } from '@/app/dashboard/DashboardRoleSwitchContext';
import { DASHBOARD_PAGE_ROOT } from '@/app/dashboard/dashboardResponsive';
import EmployerBusinessProfileForm from '@/app/dashboard/EmployerBusinessProfileForm';
import EmployerBusinessCardPreview from '@/app/dashboard/EmployerBusinessCardPreview';
import FreelancerCvPreview from '@/app/dashboard/FreelancerCvPreview';
import { getEmployerBusinessProfileHref } from '@/components/employers/employerSlug';
import { STANDARD_HOURLY_RATE_OPTIONS } from '@/lib/nepalLocale';

type ProfileDeleteTarget =
  | { kind: 'avatar' }
  | { kind: 'skill'; index: number }
  | { kind: 'education'; id: string }
  | { kind: 'experience'; id: string }
  | { kind: 'award'; id: string };

type ProfileAccordionItemProps = {
  title: string;
  icon: ElementType;
  description: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
};

function ProfileAccordionItem({
  title,
  icon: Icon,
  description,
  children,
  isOpen,
  onToggle,
}: ProfileAccordionItemProps) {
  return (
    <div
      className={`mb-3 overflow-hidden rounded-xl border transition-all duration-300 ${
        isOpen
          ? 'border-neutral-200/80 bg-[var(--elevated)] shadow-sm dark:border-neutral-700 dark:shadow-none'
          : 'border-transparent bg-neutral-50/50 hover:bg-[var(--elevated)] dark:bg-neutral-900/40'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-5 text-left outline-none sm:p-6"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <div
            className={`shrink-0 rounded-xl p-3 transition-colors ${
              isOpen
                ? 'bg-[#52C47F] text-white'
                : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-stone-100">
              {title}
            </h3>
            <p className="line-clamp-2 text-sm text-neutral-500 sm:line-clamp-none dark:text-neutral-400">
              {description}
            </p>
          </div>
        </div>
        <div
          className={`shrink-0 rounded-lg p-2 transition-transform duration-300 ${
            isOpen
              ? 'rotate-180 bg-emerald-50 text-[#52C47F] dark:bg-emerald-950/50'
              : 'bg-neutral-50 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-400'
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
            <div className="p-5 pt-0 sm:p-6">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 150;
const USERNAME_PATTERN = /^[a-z0-9._]+$/;

const panStorageKey = (userId: string | number) => `dashboard_profile_pan_${userId}`;
const CITY_MAX_LENGTH = 100;

function getLocationFromUser(profileUser: { city?: string; address?: string }): string {
  const city = profileUser.city?.trim() || '';
  if (city) return city;
  return profileUser.address?.trim() || '';
}

type EducationEntry = {
  id: string;
  yearRange: string;
  degree: string;
  institution: string;
  description: string;
};

const EMPTY_EDUCATION_FORM = {
  yearRange: '',
  degree: '',
  institution: '',
  description: '',
};

type ExperienceEntry = {
  id: string;
  yearRange: string;
  title: string;
  company: string;
  description: string;
};

const EMPTY_EXPERIENCE_FORM = {
  yearRange: '',
  title: '',
  company: '',
  description: '',
};

type AwardEntry = {
  id: string;
  yearRange: string;
  title: string;
  issuer: string;
  description: string;
};

const EMPTY_AWARD_FORM = {
  yearRange: '',
  title: '',
  issuer: '',
  description: '',
};

function getTimelineInitial(label: string): string {
  const trimmed = label.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'E';
}

type SkillRow = {
  skill: string;
  point: string;
};

const OTHER_SKILL_OPTION = 'Other…';

const SKILL_OPTIONS = [
  'Select',
  'Designer',
  'Developer',
  'Video Editor',
  'Photographer',
  'Writer',
  'Marketing',
  'SEO Specialist',
  OTHER_SKILL_OPTION,
];

const EMPTY_SKILL_ROW: SkillRow = { skill: 'Select', point: '70' };

const isPredefinedSkill = (skill: string) =>
  SKILL_OPTIONS.includes(skill) && skill !== 'Select' && skill !== OTHER_SKILL_OPTION;

function getSkillSelectOptions(row: SkillRow): string[] {
  const predefined = SKILL_OPTIONS.filter((option) => option !== 'Select');
  const custom =
    row.skill && !isPredefinedSkill(row.skill) && row.skill !== OTHER_SKILL_OPTION ? [row.skill] : [];
  return ['Select', ...predefined.filter((option) => option !== OTHER_SKILL_OPTION), ...custom, OTHER_SKILL_OPTION];
}

function getSkillSelectValue(row: SkillRow): string {
  if (!row.skill || row.skill === 'Select') return 'Select';
  if (isPredefinedSkill(row.skill) || row.skill === OTHER_SKILL_OPTION) return row.skill;
  return OTHER_SKILL_OPTION;
}

const POINT_OPTIONS = ['Select', '50', '60', '70', '75', '80', '85', '90', '95', '100'];

const FALLBACK_LANGUAGE_OPTIONS = ['Select', 'English', 'Nepali', 'Spanish', 'German', 'French'];
const LANGUAGE_LEVEL_OPTIONS = ['Select', 'Basic', 'Conversational', 'Fluent', 'Native / Bilingual'];
const EMPTY_LANGUAGE_ROW: LanguageRow = { language: 'Select', level: 'Select' };

type TransportOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const TRANSPORT_OPTIONS: TransportOption[] = [
  { id: 'Bicycle', label: 'Bicycle', icon: Bike },
  { id: 'Car', label: 'Car', icon: Car },
  { id: 'Online', label: 'Online', icon: Monitor },
  { id: 'Scooter', label: 'Scooter', icon: Scooter },
  { id: 'Truck', label: 'Truck', icon: Truck },
  { id: 'Walking', label: 'Walking', icon: PersonStanding },
];

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&h=300&fit=crop';

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&h=300&fit=crop';

const SELECT_CHEVRON_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23111827' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  backgroundSize: '1.2em',
} as const;

const inputClass =
  'w-full rounded-xl border-2 border-transparent bg-neutral-50/80 px-4 py-3.5 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:border-[#52C47F] focus:bg-neutral-50 focus:ring-2 focus:ring-[#52C47F]/25 dark:bg-neutral-900 dark:text-stone-100 dark:placeholder:text-neutral-400 dark:focus:bg-neutral-900 dark:focus:border-[#52C47F]';

const selectClass = `${inputClass} cursor-pointer appearance-none`;

const FREELANCER_ONLY_PROFILE_SECTIONS = new Set([
  'profile',
  'transport',
  'languages',
  'licences',
  'skills',
  'education',
  'experience',
  'awards',
]);

export default function DashboardProfile() {
  const { user, setUser, refreshUser } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [birthday, setBirthday] = useState('');
  const [email, setEmail] = useState('');
  const [tagline, setTagline] = useState('');
  const [hourlyRate, setHourlyRate] = useState('Select');
  const [gender, setGender] = useState('Select');
  const [specialization, setSpecialization] = useState('Select');
  const [profileType, setProfileType] = useState('Select');
  const [location, setLocation] = useState('');
  const [locationType, setLocationType] = useState<ProfileLocationType>('in-person');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [languages, setLanguages] = useState<LanguageRow[]>([]);
  const [profileLanguageOptions, setProfileLanguageOptions] = useState(FALLBACK_LANGUAGE_OPTIONS);
  const languageSelectOptions = useMemo(() => {
    const base = profileLanguageOptions.filter((option) => option !== 'Select');
    const saved = languages
      .map((row) => row.language)
      .filter((language) => language && language !== 'Select' && !base.includes(language));
    return ['Select', ...base, ...saved];
  }, [profileLanguageOptions, languages]);
  const [description, setDescription] = useState('');
  const [transport, setTransport] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationEntry | null>(null);
  const [educationForm, setEducationForm] = useState(EMPTY_EDUCATION_FORM);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceEntry | null>(null);
  const [experienceForm, setExperienceForm] = useState(EMPTY_EXPERIENCE_FORM);
  const [awards, setAwards] = useState<AwardEntry[]>([]);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<AwardEntry | null>(null);
  const [awardForm, setAwardForm] = useState(EMPTY_AWARD_FORM);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProfileDeleteTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingSkills, setExistingSkills] = useState<UserSkill[]>([]);
  const [employerProgress, setEmployerProgress] = useState({
    filled: 0,
    total: 10,
    percent: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const applyUserToForm = useCallback((profileUser: NonNullable<typeof user>) => {
    setFullName([profileUser.first_name, profileUser.last_name].filter(Boolean).join(' ').trim());
    setPhone(profileUser.phone_number?.trim() || '');
    setUsername(profileUser.username?.trim() || '');
    setBirthday(profileUser.date_of_birth || '');
    if (profileUser.id) {
      try {
        const storedPan = localStorage.getItem(panStorageKey(profileUser.id));
        setPanNumber(storedPan || '');
      } catch {
        setPanNumber('');
      }
    }
    setEmail(profileUser.email || '');
    setTagline(profileUser.tagline?.trim() || '');
    setHourlyRate(hourlyRateLabelFromApi(profileUser.hourly_rate));
    setGender(genderLabelFromApi(profileUser.gender));
    const locationValue = getLocationFromUser(profileUser);
    setLocation(locationValue);
    if (locationValue.toLowerCase() === 'remote') {
      setLocationType('remote');
    }
    setLatitude(profileUser.latitude);
    setLongitude(profileUser.longitude);
    setDescription(profileUser.bio?.trim() || '');
    setAvatar(profileUser.profile_image || DEFAULT_AVATAR);
  }, []);

  const loadSkillsFromApi = useCallback(async () => {
    const response = await userService.getSkills();
    if (!response.success || !Array.isArray(response.data)) {
      return;
    }

    setExistingSkills(response.data);
    const parsed = parseSkillsFromApi(response.data);
    setSkills(parsed.skillRows);
    setTransport(parsed.transport);
    setLanguages(parsed.languages);
    setEducation(parsed.education);
    setExperience(parsed.experience);
    setAwards(parsed.awards);
    setSpecialization(parsed.specialization || 'Select');
    setProfileType(parsed.profileType || 'Select');
    if (parsed.workLocationMode) {
      setLocationType(locationTypeFromWorkLocationMode(parsed.workLocationMode));
    }
  }, []);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const sidebarRole = useDashboardSidebarRole();
  const isEmployerMode = sidebarRole === 'customer';
  const savedUsername = (user?.username ?? '').trim().toLowerCase();
  const usernameCanChange = user?.username_can_change !== false;

  const freelancerProgress = useMemo(() => {
    const hasCustomAvatar = Boolean(avatar && avatar !== DEFAULT_AVATAR);
    const checks = [
      Boolean(fullName.trim()),
      Boolean(phone.trim()),
      Boolean(username.trim()),
      gender !== 'Select',
      Boolean(birthday.trim()),
      locationType === 'remote' || Boolean(location.trim()),
      hasCustomAvatar,
      Boolean(tagline.trim()),
      specialization !== 'Select',
      hourlyRate !== 'Select',
      profileType !== 'Select',
      Boolean(description.trim()),
      transport.length > 0,
      languages.some((row) => row.language && row.language !== 'Select'),
      skills.some((row) => row.skill && row.skill !== 'Select' && row.skill !== 'Other…'),
      education.length > 0,
      experience.length > 0,
      awards.length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    const total = checks.length;
    return {
      filled,
      total,
      percent: total === 0 ? 0 : Math.round((filled / total) * 100),
    };
  }, [
    avatar,
    awards.length,
    birthday,
    description,
    education.length,
    experience.length,
    fullName,
    gender,
    hourlyRate,
    languages,
    location,
    locationType,
    phone,
    profileType,
    skills,
    specialization,
    tagline,
    transport.length,
    username,
  ]);

  const profileProgress = isEmployerMode ? employerProgress : freelancerProgress;
  const handleEmployerProgressChange = useCallback(
    (progress: { filled: number; total: number; percent: number }) => {
      setEmployerProgress(progress);
    },
    [],
  );

  const persistAllSkills = useCallback(async () => {
    const latestResponse = await userService.getSkills();
    const currentSkills =
      latestResponse.success && Array.isArray(latestResponse.data)
        ? latestResponse.data
        : existingSkills;

    const desired = buildDashboardDesiredSkills(currentSkills, {
      skillRows: skills,
      transport,
      languages,
      education,
      experience,
      awards,
      specialization,
      profileType,
      workLocationMode: workLocationModeFromLocationType(locationType),
    });
    await syncUserSkills(currentSkills, desired);
    await loadSkillsFromApi();
  }, [
    awards,
    education,
    existingSkills,
    experience,
    languages,
    loadSkillsFromApi,
    locationType,
    profileType,
    skills,
    specialization,
    transport,
  ]);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      await refreshUser();
      const profileResponse = isEmployerMode
        ? await userService.getProfile()
        : await freelancerService.getMyFreelancerProfile();
      if (profileResponse.success && profileResponse.data) {
        applyUserToForm(profileResponse.data);
        setUser(profileResponse.data);
      } else {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          applyUserToForm(currentUser);
        }
      }
      await loadSkillsFromApi();
    } catch (error) {
      console.error('Failed to load profile', error);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        applyUserToForm(currentUser);
      }
      triggerToast('Could not load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [applyUserToForm, isEmployerMode, loadSkillsFromApi, refreshUser, setUser, triggerToast]);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    void loadLanguages('profile').then((langs) => {
      const names = languageNamesForSelect(langs);
      if (names.length) setProfileLanguageOptions(['Select', ...names]);
    });
  }, []);

  useEffect(() => {
    const onProfileUpdated = () => {
      void loadProfileData();
    };
    window.addEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
    return () => window.removeEventListener(USER_PROFILE_UPDATED, onProfileUpdated);
  }, [loadProfileData]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isEmployerMode) return;
    if (!openSection || FREELANCER_ONLY_PROFILE_SECTIONS.has(openSection)) {
      setOpenSection('business-profile');
    }
  }, [isEmployerMode, openSection]);

  const employerPublicProfilePath = getEmployerBusinessProfileHref(user);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const usernameValue = username.trim().toLowerCase();
    const usernameChanged = Boolean(usernameValue) && usernameValue !== savedUsername;

    if (usernameChanged) {
      if (!usernameCanChange) {
        triggerToast('You can only change your username once every 6 months.');
        return;
      }
      if (usernameValue.length < USERNAME_MIN_LENGTH) {
        triggerToast(`Username must be at least ${USERNAME_MIN_LENGTH} characters.`);
        return;
      }
      if (usernameValue.length > USERNAME_MAX_LENGTH) {
        triggerToast(`Username must not exceed ${USERNAME_MAX_LENGTH} characters.`);
        return;
      }
      if (!USERNAME_PATTERN.test(usernameValue)) {
        triggerToast('Username can only use letters, numbers, dots, and underscores.');
        return;
      }
    }

    try {
      setSaving(true);
      const trimmedFullName = fullName.trim();
      if (!trimmedFullName) {
        triggerToast('Please enter your full name.');
        return;
      }

      const nameParts = trimmedFullName.split(/\s+/);
      const updateData: Record<string, string | number | undefined> = {
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' '),
        bio: description.trim() || undefined,
        tagline: tagline.trim() || undefined,
      };

      if (usernameChanged) {
        updateData.username = usernameValue;
      }
      if (locationType === 'remote') {
        updateData.city = 'Remote';
      } else {
        const locationValue = location.trim();
        if (locationValue && locationValue.toLowerCase() !== 'remote') {
          if (locationValue.length > CITY_MAX_LENGTH) {
            updateData.address = locationValue;
          } else {
            updateData.city = locationValue;
          }
        }
        if (latitude !== undefined) {
          updateData.latitude = latitude;
        }
        if (longitude !== undefined) {
          updateData.longitude = longitude;
        }
      }
      const genderValue = genderValueFromLabel(gender);
      if (genderValue) {
        updateData.gender = genderValue;
      }
      const phoneValue = phone.trim();
      if (phoneValue) {
        updateData.phone = phoneValue;
      }
      const rate = hourlyRateValueFromLabel(hourlyRate);
      if (rate !== undefined) {
        updateData.hourly_rate = rate;
      }
      if (birthday.trim()) {
        updateData.date_of_birth = birthday.trim();
      }

      const wantsTaskerListing =
        Boolean(tagline.trim()) ||
        hourlyRateValueFromLabel(hourlyRate) !== undefined ||
        Boolean(description.trim()) ||
        skills.some((row) => row.skill && row.skill !== 'Select' && row.skill !== 'Other…') ||
        (specialization !== 'Select' && Boolean(specialization.trim()));

      if (wantsTaskerListing && user?.role !== 'tasker') {
        updateData.role = 'tasker';
      }

      const response = await freelancerService.updateMyFreelancerProfile(updateData);
      if (!response.success || !response.data) {
        triggerToast(response.message || 'Failed to save profile.');
        return;
      }

      setUser(response.data);
      applyUserToForm(response.data);
      if (response.data.id) {
        try {
          const normalizedPan = panNumber.trim().toUpperCase();
          if (normalizedPan) {
            localStorage.setItem(panStorageKey(response.data.id), normalizedPan);
          } else {
            localStorage.removeItem(panStorageKey(response.data.id));
          }
        } catch {
          // ignore localStorage errors
        }
      }
      await persistAllSkills();
      notifyUserProfileUpdated();
      triggerToast('Your profile updates have been saved successfully!');
    } catch (error) {
      console.error('Error saving profile', error);
      triggerToast('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkillsSave = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      await persistAllSkills();
      triggerToast('Your skills have been saved successfully!');
    } catch (error) {
      console.error('Error saving skills', error);
      triggerToast(error instanceof Error ? error.message : 'Failed to save skills.');
    } finally {
      setSaving(false);
    }
  };

  const handleTransportSave = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      await persistAllSkills();
      triggerToast('Your transport preferences have been saved successfully!');
    } catch (error) {
      console.error('Error saving transport', error);
      triggerToast(error instanceof Error ? error.message : 'Failed to save transport preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguagesSave = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const filledLanguages = languages.filter((row) => row.language && row.language !== 'Select');
    const duplicate = filledLanguages.find(
      (row, index) =>
        filledLanguages.findIndex(
          (other) => other.language.toLowerCase() === row.language.toLowerCase(),
        ) !== index,
    );
    if (duplicate) {
      triggerToast(`"${duplicate.language}" is listed more than once. Remove duplicates before saving.`);
      return;
    }

    const missingLevel = filledLanguages.find((row) => !row.level || row.level === 'Select');
    if (missingLevel) {
      triggerToast(`Select a proficiency level for ${missingLevel.language}.`);
      return;
    }

    try {
      setSaving(true);
      await persistAllSkills();
      triggerToast('Your languages have been saved successfully!');
    } catch (error) {
      console.error('Error saving languages', error);
      triggerToast(error instanceof Error ? error.message : 'Failed to save languages.');
    } finally {
      setSaving(false);
    }
  };

  const updateLanguageRow = (index: number, field: keyof LanguageRow, value: string) => {
    setLanguages((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addLanguageRow = () => {
    setLanguages((prev) => [...prev, { ...EMPTY_LANGUAGE_ROW }]);
  };

  const removeLanguageRow = (index: number) => {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSkillRow = (index: number, field: keyof SkillRow, value: string) => {
    setSkills((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addSkillRow = () => {
    setSkills((prev) => [...prev, { ...EMPTY_SKILL_ROW }]);
  };

  const removeSkillRow = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const requestDeleteSkill = (index: number) => {
    setDeleteTarget({ kind: 'skill', index });
  };

  const handleSkillSelectChange = (index: number, value: string) => {
    if (value === OTHER_SKILL_OPTION) {
      updateSkillRow(index, 'skill', OTHER_SKILL_OPTION);
      return;
    }
    updateSkillRow(index, 'skill', value);
  };

  const handleEducationSave = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      await persistAllSkills();
      triggerToast('Your education has been saved successfully!');
    } catch (error) {
      console.error('Error saving education', error);
      triggerToast(error instanceof Error ? error.message : 'Failed to save education.');
    } finally {
      setSaving(false);
    }
  };

  const openAddEducation = () => {
    setEditingEducation(null);
    setEducationForm(EMPTY_EDUCATION_FORM);
    setIsEducationModalOpen(true);
  };

  const openEditEducation = (entry: EducationEntry) => {
    setEditingEducation(entry);
    setEducationForm({
      yearRange: entry.yearRange,
      degree: entry.degree,
      institution: entry.institution,
      description: entry.description,
    });
    setIsEducationModalOpen(true);
  };

  const requestDeleteEducation = (id: string) => {
    setDeleteTarget({ kind: 'education', id });
  };

  const handleEducationFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!educationForm.degree.trim() || !educationForm.institution.trim()) return;

    const payload: EducationEntry = {
      id: editingEducation?.id ?? `edu-${Date.now()}`,
      yearRange: educationForm.yearRange.trim() || 'Year range',
      degree: educationForm.degree.trim(),
      institution: educationForm.institution.trim(),
      description: educationForm.description.trim(),
    };

    if (editingEducation) {
      setEducation((prev) => prev.map((entry) => (entry.id === editingEducation.id ? payload : entry)));
    } else {
      setEducation((prev) => [...prev, payload]);
    }

    setIsEducationModalOpen(false);
    setEditingEducation(null);
    setEducationForm(EMPTY_EDUCATION_FORM);
  };

  const handleExperienceSave = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      await persistAllSkills();
      triggerToast('Your work experience has been saved successfully!');
    } catch (error) {
      console.error('Error saving work experience', error);
      triggerToast(error instanceof Error ? error.message : 'Failed to save work experience.');
    } finally {
      setSaving(false);
    }
  };

  const openAddExperience = () => {
    setEditingExperience(null);
    setExperienceForm(EMPTY_EXPERIENCE_FORM);
    setIsExperienceModalOpen(true);
  };

  const openEditExperience = (entry: ExperienceEntry) => {
    setEditingExperience(entry);
    setExperienceForm({
      yearRange: entry.yearRange,
      title: entry.title,
      company: entry.company,
      description: entry.description,
    });
    setIsExperienceModalOpen(true);
  };

  const requestDeleteExperience = (id: string) => {
    setDeleteTarget({ kind: 'experience', id });
  };

  const handleExperienceFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!experienceForm.title.trim() || !experienceForm.company.trim()) return;

    const payload: ExperienceEntry = {
      id: editingExperience?.id ?? `exp-${Date.now()}`,
      yearRange: experienceForm.yearRange.trim() || 'Year range',
      title: experienceForm.title.trim(),
      company: experienceForm.company.trim(),
      description: experienceForm.description.trim(),
    };

    if (editingExperience) {
      setExperience((prev) => prev.map((entry) => (entry.id === editingExperience.id ? payload : entry)));
    } else {
      setExperience((prev) => [...prev, payload]);
    }

    setIsExperienceModalOpen(false);
    setEditingExperience(null);
    setExperienceForm(EMPTY_EXPERIENCE_FORM);
  };

  const handleAwardsSave = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      await persistAllSkills();
      triggerToast('Your awards have been saved successfully!');
    } catch (error) {
      console.error('Error saving awards', error);
      triggerToast(error instanceof Error ? error.message : 'Failed to save awards.');
    } finally {
      setSaving(false);
    }
  };

  const openAddAward = () => {
    setEditingAward(null);
    setAwardForm(EMPTY_AWARD_FORM);
    setIsAwardModalOpen(true);
  };

  const openEditAward = (entry: AwardEntry) => {
    setEditingAward(entry);
    setAwardForm({
      yearRange: entry.yearRange,
      title: entry.title,
      issuer: entry.issuer,
      description: entry.description,
    });
    setIsAwardModalOpen(true);
  };

  const requestDeleteAward = (id: string) => {
    setDeleteTarget({ kind: 'award', id });
  };

  const handleAwardFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!awardForm.title.trim() || !awardForm.issuer.trim()) return;

    const payload: AwardEntry = {
      id: editingAward?.id ?? `award-${Date.now()}`,
      yearRange: awardForm.yearRange.trim() || 'Year range',
      title: awardForm.title.trim(),
      issuer: awardForm.issuer.trim(),
      description: awardForm.description.trim(),
    };

    if (editingAward) {
      setAwards((prev) => prev.map((entry) => (entry.id === editingAward.id ? payload : entry)));
    } else {
      setAwards((prev) => [...prev, payload]);
    }

    setIsAwardModalOpen(false);
    setEditingAward(null);
    setAwardForm(EMPTY_AWARD_FORM);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    if (file.size > 1024 * 1024) {
      triggerToast('Error: Image exceeds maximum limit of 1MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      triggerToast('Please upload a JPG or PNG image.');
      return;
    }

    try {
      setSaving(true);
      const response = await userService.uploadProfileImage(file);
      if (response.success && response.data) {
        setUser(response.data);
        setAvatar(response.data.profile_image || DEFAULT_AVATAR);
        notifyUserProfileUpdated();
        triggerToast('Profile picture uploaded successfully!');
      } else {
        triggerToast('Failed to upload profile image.');
      }
    } catch (error) {
      console.error('Error uploading profile image', error);
      triggerToast('Failed to upload profile image.');
    } finally {
      setSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = () => {
    setAvatar(PLACEHOLDER_AVATAR);
    triggerToast('Profile picture deleted.');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.kind === 'avatar') {
      handleDeleteAvatar();
    } else if (deleteTarget.kind === 'skill') {
      removeSkillRow(deleteTarget.index);
      triggerToast('Skill entry deleted.');
    } else if (deleteTarget.kind === 'education') {
      setEducation((prev) => prev.filter((entry) => entry.id !== deleteTarget.id));
      triggerToast('Education entry deleted.');
    } else if (deleteTarget.kind === 'experience') {
      setExperience((prev) => prev.filter((entry) => entry.id !== deleteTarget.id));
      triggerToast('Work experience entry deleted.');
    } else if (deleteTarget.kind === 'award') {
      setAwards((prev) => prev.filter((entry) => entry.id !== deleteTarget.id));
      triggerToast('Award entry deleted.');
    }

    setDeleteTarget(null);
  };

  const deleteModalTitle =
    deleteTarget?.kind === 'avatar'
      ? 'Delete profile image?'
      : deleteTarget?.kind === 'skill'
        ? 'Delete skill entry?'
        : deleteTarget?.kind === 'education'
          ? 'Delete education entry?'
          : deleteTarget?.kind === 'experience'
            ? 'Delete work experience?'
            : deleteTarget?.kind === 'award'
              ? 'Delete award?'
              : 'Are you sure you want to delete?';

  const deleteModalDescription =
    deleteTarget?.kind === 'avatar'
      ? 'Do you really want to remove your profile image? This process cannot be undone.'
      : 'Do you really want to delete this record? This process cannot be undone.';

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const toggleTransport = (id: string) => {
    setTransport((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const freelancerCvData = useMemo(
    () => ({
      fullName,
      tagline,
      email,
      phone,
      location: locationType === 'remote' ? 'Remote' : location,
      avatar,
      description,
      hourlyRate,
      specialization,
      profileType,
      skills,
      languages,
      education,
      experience,
      awards,
    }),
    [
      avatar,
      awards,
      description,
      education,
      email,
      experience,
      fullName,
      hourlyRate,
      languages,
      location,
      locationType,
      phone,
      profileType,
      skills,
      specialization,
      tagline,
    ],
  );

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} relative`}>
      {toastMessage ? (
        <div className="animate-in slide-in-from-bottom-2 mx-auto mb-6 flex max-w-7xl items-center justify-between rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm duration-300">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#52C47F]" />
              {toastMessage}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div
        className={`mx-auto mb-8 max-w-7xl overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)] dark:border dark:border-neutral-800 dark:bg-neutral-900 ${
          loading || saving ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        <div className="sticky top-0 z-20 border-b border-neutral-100 bg-white/95 px-6 py-3.5 backdrop-blur-sm md:px-8 dark:border-neutral-800 dark:bg-neutral-900/95">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Profile {profileProgress.filled} of {profileProgress.total} complete
            </p>
            <span className="text-xs font-semibold text-[#2f7a52]">{profileProgress.percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2f7a52] to-[#52C47F] transition-all duration-300"
              style={{ width: `${profileProgress.percent}%` }}
              role="progressbar"
              aria-valuenow={profileProgress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
            />
          </div>
        </div>

        <div className="p-6 md:p-8">
        {!isEmployerMode ? (
        <ProfileAccordionItem
          title="Profile Details"
          icon={User}
          description={fullName || username || tagline || 'Update your public profile information'}
          isOpen={openSection === 'profile'}
          onToggle={() => toggleSection('profile')}
        >
        <form onSubmit={handleSave} className="space-y-8 pt-4">
          <div className="flex flex-col items-start gap-6 pb-2 sm:flex-row sm:items-center" id="avatar-section">
            <div className="relative">
              <div className="flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full bg-pink-50 shadow-sm">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Current profile avatar"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-neutral-400" />
                )}
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setDeleteTarget({ kind: 'avatar' })}
                  className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-3.5 text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                  title="Remove profile image"
                >
                  <Trash2 className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </button>

                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="cursor-pointer rounded-xl bg-[#FCF7F2] px-6 py-3 text-sm font-bold text-[#193e32] shadow-sm transition-all hover:bg-[#F7EFE8]"
                >
                  Upload Images
                </button>
              </div>

              <p className="whitespace-normal text-[13px] font-normal leading-normal tracking-tight text-neutral-400">
                Max file size is 1MB, Minimum dimension: 330x300 And Suitable files are .jpg & .png
              </p>
            </div>
          </div>

          <div className="space-y-10">
            <section className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">Basic Details</h4>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Full name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className={inputClass}
                    placeholder="e.g. +977 98XXXXXXXX"
                  />
                </div>

                {!isEmployerMode ? (
                  <div className="space-y-2">
                    <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      autoComplete="username"
                      maxLength={USERNAME_MAX_LENGTH}
                      disabled={!usernameCanChange}
                      readOnly={!usernameCanChange}
                      className={`${inputClass} lowercase ${!usernameCanChange ? 'cursor-not-allowed bg-neutral-50 dark:bg-neutral-800/80' : ''}`}
                      placeholder="yourname"
                    />
                    {!usernameCanChange ? (
                      <p className="text-xs font-medium text-amber-800">
                        Usernames can be changed once every 6 months.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Email</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={email}
                    className={`${inputClass} cursor-not-allowed bg-neutral-50 dark:bg-neutral-800/80`}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="relative space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Gender</label>
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

                <div className="space-y-3 md:col-span-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Location</label>
                  <LocationFields
                    variant="dashboard"
                    enableHybrid
                    showWorkModeHeading={false}
                    data={{
                      locationType,
                      location,
                      latitude,
                      longitude,
                    }}
                    onChange={(updates) => {
                      if (updates.locationType !== undefined) {
                        setLocationType(updates.locationType);
                      }
                      if (updates.location !== undefined) {
                        setLocation(updates.location);
                      }
                      if ('latitude' in updates) {
                        setLatitude(updates.latitude);
                      }
                      if ('longitude' in updates) {
                        setLongitude(updates.longitude);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">PAN number</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className={`${inputClass} uppercase`}
                    placeholder="Enter your PAN number"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Birthday</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">Profession Details</h4>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Tagline</label>
                  <input
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className={inputClass}
                    placeholder="Short headline for your profile"
                  />
                </div>

                <div className="relative space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className={selectClass}
                    style={SELECT_CHEVRON_STYLE}
                  >
                    <option value="Select">Select</option>
                    <option value="Web & App Design">Web & App Design</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Engineering">Backend Engineering</option>
                    <option value="UI/UX Prototyping">UI/UX Prototyping</option>
                    <option value="Full-Stack Development">Full-Stack Development</option>
                  </select>
                </div>

                <div className="relative space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Hourly Rate</label>
                  <select
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className={selectClass}
                    style={SELECT_CHEVRON_STYLE}
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

                <div className="relative space-y-2">
                  <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Type</label>
                  <select
                    value={profileType}
                    onChange={(e) => setProfileType(e.target.value)}
                    className={selectClass}
                    style={SELECT_CHEVRON_STYLE}
                  >
                    <option value="Select">Select</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Introduce Yourself</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={5}
                  className="min-h-[160px] w-full rounded-xl border-2 border-transparent bg-neutral-50/80 p-4 text-sm font-medium text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:border-[#52C47F] focus:bg-neutral-50 focus:ring-2 focus:ring-[#52C47F]/25 dark:bg-neutral-900 dark:text-stone-100 dark:placeholder:text-neutral-400 dark:focus:bg-neutral-900"
                />
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
            >
              <span>Save</span>
              <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </form>
        </ProfileAccordionItem>
        ) : null}

        {isEmployerMode ? (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7a52]">
                  Employer
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 dark:text-stone-100 sm:text-2xl">
                  Business profile
                </h2>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  Manage how your business appears to freelancers. Keep details clear and up to date.
                </p>
              </div>
              {employerPublicProfilePath ? (
                <Link
                  href={employerPublicProfilePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-[#52C47F]/30 bg-[#52C47F]/10 px-4 py-2.5 text-sm font-semibold text-[#2d8f57] transition hover:bg-[#52C47F]/20 sm:self-auto"
                >
                  View public page
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
              <div className="min-w-0">
                <EmployerBusinessProfileForm
                  onToast={triggerToast}
                  onProgressChange={handleEmployerProgressChange}
                />
              </div>
              <aside className="hidden xl:block">
                <div className="sticky top-24">
                  <EmployerBusinessCardPreview compact />
                </div>
              </aside>
            </div>
          </div>
        ) : null}

        {!isEmployerMode ? (
        <ProfileAccordionItem
          title="How do you get around?"
          icon={Car}
          description={
            transport.length > 0
              ? `${transport.length} option${transport.length === 1 ? '' : 's'} selected`
              : 'Select how you travel to tasks'
          }
          isOpen={openSection === 'transport'}
          onToggle={() => toggleSection('transport')}
        >
          <form onSubmit={handleTransportSave} className="space-y-6 pt-4">
            <p className="text-sm text-neutral-400">Select every option that applies to you.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {TRANSPORT_OPTIONS.map((option) => {
                const selected = transport.includes(option.id);
                const Icon = option.icon;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleTransport(option.id)}
                    aria-pressed={selected}
                    className={`flex min-h-[96px] flex-col items-center justify-center gap-2.5 rounded-xl px-3 py-4 transition-all duration-200 ${
                      selected
                        ? 'bg-emerald-50 text-[#1D3E35] shadow-md shadow-[#52C47F]/10 ring-2 ring-[#52C47F]/35'
                        : 'bg-neutral-50/80 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${selected ? 'text-[#52C47F]' : ''}`} strokeWidth={2} />
                    <span className="text-xs font-semibold tracking-wide">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-6">
              <button
                type="submit"
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
              >
                <span>Save</span>
                <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </ProfileAccordionItem>
        ) : null}

        {!isEmployerMode ? (
        <ProfileAccordionItem
          title="Languages"
          icon={Globe}
          description={
            languages.filter((row) => row.language && row.language !== 'Select').length > 0
              ? `${languages.filter((row) => row.language && row.language !== 'Select').length} language${
                  languages.filter((row) => row.language && row.language !== 'Select').length === 1 ? '' : 's'
                } added`
              : 'Add languages you speak or write'
          }
          isOpen={openSection === 'languages'}
          onToggle={() => toggleSection('languages')}
        >
          <form onSubmit={handleLanguagesSave} className="space-y-6 pt-4">
            <p className="text-sm text-neutral-400">
              Add each language with its proficiency level. You can list more than one.
            </p>
            {languages.length === 0 ? (
              <p className="pb-2 text-sm text-neutral-400">No languages yet. Click Add Language to get started.</p>
            ) : (
              languages.map((row, index) => (
                <div
                  key={`language-row-${index}`}
                  className="grid grid-cols-1 gap-x-8 gap-y-6 pb-6 last:pb-0 md:grid-cols-[1fr_1fr_auto]"
                >
                  <div className="relative space-y-2">
                    <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
                      Language {index + 1}
                    </label>
                    <select
                      value={row.language}
                      onChange={(e) => updateLanguageRow(index, 'language', e.target.value)}
                      className={selectClass}
                      style={SELECT_CHEVRON_STYLE}
                    >
                      {languageSelectOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative space-y-2">
                    <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
                      Language level
                    </label>
                    <select
                      value={row.level}
                      onChange={(e) => updateLanguageRow(index, 'level', e.target.value)}
                      className={selectClass}
                      style={SELECT_CHEVRON_STYLE}
                    >
                      {LANGUAGE_LEVEL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end pb-1 md:justify-end">
                    <button
                      type="button"
                      onClick={() => removeLanguageRow(index)}
                      className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                      title="Remove language"
                      aria-label={`Remove language ${index + 1}`}
                    >
                      <Trash2 className="h-[17px] w-[17px]" strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              ))
            )}

            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={addLanguageRow}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#52C47F] transition-colors hover:text-[#43b06c]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF5F4] text-[#F87171]">
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  Add Language
                </button>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
                >
                  <span>Save</span>
                  <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </form>
        </ProfileAccordionItem>
        ) : null}

        {!isEmployerMode ? (
        <ProfileAccordionItem
          title="Licence badges"
          icon={BadgeCheck}
          description="Upload trade licences and certifications"
          isOpen={openSection === 'licences'}
          onToggle={() => toggleSection('licences')}
        >
          <div className="pt-4">
            <DashboardLicenceBadges embedded />
          </div>
        </ProfileAccordionItem>
        ) : null}

        {!isEmployerMode ? (
        <ProfileAccordionItem
          title="Skills"
          icon={Sparkles}
          description={`${skills.length} skill ${skills.length === 1 ? 'entry' : 'entries'}`}
          isOpen={openSection === 'skills'}
          onToggle={() => toggleSection('skills')}
        >
        <form onSubmit={handleSkillsSave} className="space-y-6 pt-4">
          {skills.length === 0 ? (
            <p className="pb-2 text-sm text-neutral-400">No skills yet. Click Add Skill to get started.</p>
          ) : (
            skills.map((row, index) => {
              const showCustomSkillInput =
                getSkillSelectValue(row) === OTHER_SKILL_OPTION || (!isPredefinedSkill(row.skill) && row.skill !== 'Select');

              return (
                <div
                  key={`skill-row-${index}`}
                  className="grid grid-cols-1 gap-x-8 gap-y-6 pb-6 last:pb-0 md:grid-cols-[1fr_1fr_auto]"
                >
                  <div className="relative space-y-2">
                    <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
                      Skill {index + 1}
                    </label>
                    <select
                      value={getSkillSelectValue(row)}
                      onChange={(e) => handleSkillSelectChange(index, e.target.value)}
                      className={selectClass}
                      style={SELECT_CHEVRON_STYLE}
                    >
                      {getSkillSelectOptions(row).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {showCustomSkillInput ? (
                      <input
                        type="text"
                        value={row.skill === OTHER_SKILL_OPTION ? '' : row.skill}
                        onChange={(e) => updateSkillRow(index, 'skill', e.target.value)}
                        placeholder="Enter skill name"
                        className={inputClass}
                      />
                    ) : null}
                  </div>

                  <div className="relative space-y-2">
                    <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">Point</label>
                    <select
                      value={row.point}
                      onChange={(e) => updateSkillRow(index, 'point', e.target.value)}
                      className={selectClass}
                      style={SELECT_CHEVRON_STYLE}
                    >
                      {POINT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end pb-1 md:justify-end">
                    <button
                      type="button"
                      onClick={() => requestDeleteSkill(index)}
                      className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                      title="Remove skill"
                      aria-label={`Remove skill ${index + 1}`}
                    >
                      <Trash2 className="h-[17px] w-[17px]" strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={addSkillRow}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#52C47F] transition-colors hover:text-[#43b06c]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF5F4] text-[#F87171]">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
                Add Skill
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
              >
                <span>Save</span>
                <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </form>
        </ProfileAccordionItem>
        ) : null}

        {!isEmployerMode ? (
        <ProfileAccordionItem
          title="Education"
          icon={GraduationCap}
          description={`${education.length} education ${education.length === 1 ? 'entry' : 'entries'}`}
          isOpen={openSection === 'education'}
          onToggle={() => toggleSection('education')}
        >
        <form onSubmit={handleEducationSave} className="pt-4">
          {education.length === 0 ? (
            <p className="pb-6 text-sm text-neutral-400">No education entries yet. Click Add Education to get started.</p>
          ) : (
            <div className="space-y-0">
              {education.map((entry, index) => (
                <div key={entry.id} className="relative flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-[#52C47F]">
                      {getTimelineInitial(entry.institution)}
                    </div>
                    {index < education.length - 1 ? (
                      <div className="my-1 w-px flex-1 bg-neutral-200/60" />
                    ) : null}
                  </div>

                  <div className={`min-w-0 flex-1 ${index < education.length - 1 ? 'pb-10' : 'pb-4'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-3">
                        <span className="inline-block rounded-full bg-[#FFF5F4] px-4 py-1.5 text-xs font-medium text-neutral-700">
                          {entry.yearRange}
                        </span>

                        <div>
                          <h3 className="text-[17px] font-semibold tracking-tight text-neutral-900 dark:text-stone-100">{entry.degree}</h3>
                          <p className="mt-1 text-[15px] font-medium text-[#52C47F]">{entry.institution}</p>
                        </div>

                        <p className="max-w-3xl text-sm leading-relaxed text-neutral-400">{entry.description}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditEducation(entry)}
                          className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                          title="Edit education"
                        >
                          <Pencil className="h-[17px] w-[17px]" strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteEducation(entry.id)}
                          className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                          title="Delete education"
                        >
                          <Trash2 className="h-[17px] w-[17px]" strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={openAddEducation}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#52C47F] transition-colors hover:text-[#43b06c]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF5F4] text-[#F87171]">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
                Add Education
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
              >
                <span>Save</span>
                <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </form>
        </ProfileAccordionItem>
        ) : null}

        {!isEmployerMode ? (
        <ProfileAccordionItem
          title="Work & Experience"
          icon={Briefcase}
          description={`${experience.length} experience ${experience.length === 1 ? 'entry' : 'entries'}`}
          isOpen={openSection === 'experience'}
          onToggle={() => toggleSection('experience')}
        >
        <form onSubmit={handleExperienceSave} className="pt-4">
          {experience.length === 0 ? (
            <p className="pb-6 text-sm text-neutral-400">
              No experience entries yet. Click Add Experience to get started.
            </p>
          ) : (
            <div className="space-y-0">
              {experience.map((entry, index) => (
                <div key={entry.id} className="relative flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-[#52C47F]">
                      {getTimelineInitial(entry.company)}
                    </div>
                    {index < experience.length - 1 ? (
                      <div className="my-1 w-px flex-1 bg-neutral-200/60" />
                    ) : null}
                  </div>

                  <div className={`min-w-0 flex-1 ${index < experience.length - 1 ? 'pb-10' : 'pb-4'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-3">
                        <span className="inline-block rounded-full bg-[#FFF5F4] px-4 py-1.5 text-xs font-medium text-neutral-700">
                          {entry.yearRange}
                        </span>

                        <div>
                          <h3 className="text-[17px] font-semibold tracking-tight text-neutral-900 dark:text-stone-100">{entry.title}</h3>
                          <p className="mt-1 text-[15px] font-medium text-[#52C47F]">{entry.company}</p>
                        </div>

                        <p className="max-w-3xl text-sm leading-relaxed text-neutral-400">{entry.description}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditExperience(entry)}
                          className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                          title="Edit experience"
                        >
                          <Pencil className="h-[17px] w-[17px]" strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteExperience(entry.id)}
                          className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                          title="Delete experience"
                        >
                          <Trash2 className="h-[17px] w-[17px]" strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={openAddExperience}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#52C47F] transition-colors hover:text-[#43b06c]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF5F4] text-[#F87171]">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
                Add Experience
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
              >
                <span>Save</span>
                <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </form>
        </ProfileAccordionItem>
        ) : null}

        {!isEmployerMode ? (
        <ProfileAccordionItem
          title="Awards"
          icon={Award}
          description={`${awards.length} award ${awards.length === 1 ? 'entry' : 'entries'}`}
          isOpen={openSection === 'awards'}
          onToggle={() => toggleSection('awards')}
        >
        <form onSubmit={handleAwardsSave} className="pt-4">
          {awards.length === 0 ? (
            <p className="pb-6 text-sm text-neutral-400">No awards yet. Click Add Award to get started.</p>
          ) : (
            <div className="space-y-10">
              {awards.map((entry) => (
                <div key={entry.id} className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-block rounded-full bg-[#FFF5F4] px-4 py-1.5 text-xs font-medium text-neutral-700">
                      {entry.yearRange}
                    </span>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditAward(entry)}
                        className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                        title="Edit award"
                      >
                        <Pencil className="h-[17px] w-[17px]" strokeWidth={2.2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteAward(entry.id)}
                        className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                        title="Delete award"
                      >
                        <Trash2 className="h-[17px] w-[17px]" strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[17px] font-semibold tracking-tight text-neutral-900 dark:text-stone-100">{entry.title}</h3>
                    <p className="mt-1 text-[15px] font-medium text-[#52C47F]">{entry.issuer}</p>
                  </div>

                  <p className="max-w-3xl text-sm leading-relaxed text-neutral-400">{entry.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={openAddAward}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#52C47F] transition-colors hover:text-[#43b06c]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF5F4] text-[#F87171]">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
                Add Award
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
              >
                <span>Save</span>
                <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </form>
        </ProfileAccordionItem>
        ) : null}
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-7xl xl:hidden">
        {!isEmployerMode ? (
          <FreelancerCvPreview data={freelancerCvData} />
        ) : (
          <EmployerBusinessCardPreview />
        )}
      </div>

      {!isEmployerMode ? (
        <div className="mx-auto mb-8 hidden max-w-7xl xl:block">
          <FreelancerCvPreview data={freelancerCvData} />
        </div>
      ) : null}

      <ProfileFormModal
        open={isEducationModalOpen}
        title={editingEducation ? 'Edit Education' : 'Add Education'}
        description="Add schools, degrees, and study details to show clients your academic background."
        onClose={() => setIsEducationModalOpen(false)}
        onSubmit={handleEducationFormSubmit}
        submitLabel={editingEducation ? 'Save Changes' : 'Add Entry'}
      >
        <div>
          <label className={profileModalFieldLabelClass}>Year Range</label>
          <input
            value={educationForm.yearRange}
            onChange={(e) => setEducationForm((f) => ({ ...f, yearRange: e.target.value }))}
            placeholder="2012 – 2014"
            className={profileModalInputClass}
          />
        </div>

        <div>
          <label className={profileModalFieldLabelClass}>Degree</label>
          <input
            required
            value={educationForm.degree}
            onChange={(e) => setEducationForm((f) => ({ ...f, degree: e.target.value }))}
            placeholder="Bachelors in Fine Arts"
            className={profileModalInputClass}
          />
        </div>

        <div>
          <label className={profileModalFieldLabelClass}>Institution</label>
          <input
            required
            value={educationForm.institution}
            onChange={(e) => setEducationForm((f) => ({ ...f, institution: e.target.value }))}
            placeholder="Modern College"
            className={profileModalInputClass}
          />
        </div>

        <div>
          <label className={profileModalFieldLabelClass}>Description</label>
          <textarea
            value={educationForm.description}
            onChange={(e) => setEducationForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            rows={4}
            className={profileModalTextareaClass}
          />
        </div>
      </ProfileFormModal>

      <ProfileFormModal
        open={isExperienceModalOpen}
        title={editingExperience ? 'Edit Experience' : 'Add Experience'}
        description="Add roles, companies, and highlights from your professional work history."
        onClose={() => setIsExperienceModalOpen(false)}
        onSubmit={handleExperienceFormSubmit}
        submitLabel={editingExperience ? 'Save Changes' : 'Add Entry'}
      >
        <div>
          <label className={profileModalFieldLabelClass}>Year Range</label>
          <input
            value={experienceForm.yearRange}
            onChange={(e) => setExperienceForm((f) => ({ ...f, yearRange: e.target.value }))}
            placeholder="2012 – 2014"
            className={profileModalInputClass}
          />
        </div>

        <div>
          <label className={profileModalFieldLabelClass}>Job Title</label>
          <input
            required
            value={experienceForm.title}
            onChange={(e) => setExperienceForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="UX Designer"
            className={profileModalInputClass}
          />
        </div>

        <div>
          <label className={profileModalFieldLabelClass}>Company</label>
          <input
            required
            value={experienceForm.company}
            onChange={(e) => setExperienceForm((f) => ({ ...f, company: e.target.value }))}
            placeholder="Dropbox"
            className={profileModalInputClass}
          />
        </div>

        <div>
          <label className={profileModalFieldLabelClass}>Description</label>
          <textarea
            value={experienceForm.description}
            onChange={(e) => setExperienceForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            rows={4}
            className={profileModalTextareaClass}
          />
        </div>
      </ProfileFormModal>

      <ProfileFormModal
        open={isAwardModalOpen}
        title={editingAward ? 'Edit Award' : 'Add Award'}
        description="Add certifications, awards, and recognitions you have earned."
        onClose={() => setIsAwardModalOpen(false)}
        onSubmit={handleAwardFormSubmit}
        submitLabel={editingAward ? 'Save Changes' : 'Add Entry'}
      >
        <div>
          <label className={profileModalFieldLabelClass}>Year Range</label>
          <input
            value={awardForm.yearRange}
            onChange={(e) => setAwardForm((f) => ({ ...f, yearRange: e.target.value }))}
            placeholder="2012 – 2014"
            className={profileModalInputClass}
          />
        </div>

        <div>
          <label className={profileModalFieldLabelClass}>Award Title</label>
          <input
            required
            value={awardForm.title}
            onChange={(e) => setAwardForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="UI UX Design"
            className={profileModalInputClass}
          />
        </div>

        <div>
          <label className={profileModalFieldLabelClass}>Issuer</label>
          <input
            required
            value={awardForm.issuer}
            onChange={(e) => setAwardForm((f) => ({ ...f, issuer: e.target.value }))}
            placeholder="Udemy"
            className={profileModalInputClass}
          />
        </div>

        <div>
          <label className={profileModalFieldLabelClass}>Description</label>
          <textarea
            value={awardForm.description}
            onChange={(e) => setAwardForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            rows={4}
            className={profileModalTextareaClass}
          />
        </div>
      </ProfileFormModal>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={deleteModalTitle}
        description={deleteModalDescription}
      />

      {showScrollTop ? (
        <button
          type="button"
          onClick={scrollToTop}
          className="animate-in fade-in fixed bottom-6 right-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-600 shadow-lg transition-all hover:scale-105 hover:bg-neutral-200"
          title="Scroll to Top"
        >
          <ChevronUp className="h-5 w-5 text-neutral-800" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
}
