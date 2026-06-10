'use client';

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent, type ElementType, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  type LucideIcon,
} from 'lucide-react';
import DashboardLicenceBadges from '@/app/dashboard/DashboardLicenceBadges';
import DeleteConfirmModal from '@/app/dashboard/DeleteConfirmModal';
import ProfileFormModal, {
  profileModalFieldLabelClass,
  profileModalInputClass,
  profileModalTextareaClass,
} from '@/app/dashboard/ProfileFormModal';

type ProfileDeleteTarget =
  | { kind: 'avatar' }
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
          ? 'border-[#52C47F]/40 bg-white shadow-sm'
          : 'border-neutral-200/90 bg-neutral-50/50 hover:border-neutral-300 hover:bg-white'
      }`}
    >
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between p-5 text-left outline-none sm:p-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className={`rounded-xl p-3 transition-colors ${
              isOpen ? 'bg-[#52C47F] text-white' : 'bg-neutral-100 text-neutral-400'
            }`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 sm:text-lg">{title}</h3>
            <p className="text-sm text-neutral-500">{description}</p>
          </div>
        </div>
        <div
          className={`rounded-lg p-2 transition-transform duration-300 ${
            isOpen ? 'rotate-180 bg-emerald-50 text-[#52C47F]' : 'bg-neutral-50 text-neutral-400'
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
            <div className="border-t border-neutral-100 p-5 pt-0 sm:p-6">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const STORAGE_KEY = 'freeio_user_profile_data';
const SKILLS_STORAGE_KEY = 'freeio_user_skills_data';
const EDUCATION_STORAGE_KEY = 'freeio_user_education_data';
const EXPERIENCE_STORAGE_KEY = 'freeio_user_experience_data';
const AWARDS_STORAGE_KEY = 'freeio_user_awards_data';

type EducationEntry = {
  id: string;
  yearRange: string;
  degree: string;
  institution: string;
  description: string;
};

const DEFAULT_EDUCATION: EducationEntry[] = [
  {
    id: 'edu-1',
    yearRange: '2012 – 2014',
    degree: 'Bachelors in Fine Arts',
    institution: 'Modern College',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
  },
  {
    id: 'edu-2',
    yearRange: '2012 – 2016',
    degree: 'Computer Science',
    institution: 'Harvard University',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum primis in faucibus.',
  },
];

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

const DEFAULT_EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'exp-1',
    yearRange: '2012 – 2014',
    title: 'UX Designer',
    company: 'Dropbox',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
  },
  {
    id: 'exp-2',
    yearRange: '2008 – 2012',
    title: 'Art Director',
    company: 'amazon',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
  },
];

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

const DEFAULT_AWARDS: AwardEntry[] = [
  {
    id: 'award-1',
    yearRange: '2012 – 2014',
    title: 'UI UX Design',
    issuer: 'Udemy',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
  },
  {
    id: 'award-2',
    yearRange: '2008 – 2012',
    title: 'App Design',
    issuer: 'Google',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
  },
];

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

const DEFAULT_SKILLS: SkillRow[] = [
  { skill: 'Designer', point: '80' },
  { skill: 'Developer', point: '70' },
  { skill: 'Video Editor', point: '75' },
];

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
  'w-full rounded-xl border border-neutral-200/90 bg-white px-4 py-3.5 text-sm font-medium text-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:ring-2 focus:ring-[#52C47F]';

const selectClass = `${inputClass} cursor-pointer appearance-none text-neutral-800`;

export default function DashboardProfile() {
  const [username, setUsername] = useState('i will');
  const [email, setEmail] = useState('i will');
  const [phone, setPhone] = useState('i will');
  const [tagline, setTagline] = useState('i will');
  const [hourlyRate, setHourlyRate] = useState('Select');
  const [gender, setGender] = useState('Select');
  const [specialization, setSpecialization] = useState('Select');
  const [profileType, setProfileType] = useState('Select');
  const [country, setCountry] = useState('Select');
  const [city, setCity] = useState('Select');
  const [language, setLanguage] = useState('Select');
  const [languageLevel, setLanguageLevel] = useState('Select');
  const [description, setDescription] = useState('');
  const [transport, setTransport] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);
  const [skills, setSkills] = useState<SkillRow[]>(DEFAULT_SKILLS);
  const [education, setEducation] = useState<EducationEntry[]>(DEFAULT_EDUCATION);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationEntry | null>(null);
  const [educationForm, setEducationForm] = useState(EMPTY_EDUCATION_FORM);
  const [experience, setExperience] = useState<ExperienceEntry[]>(DEFAULT_EXPERIENCE);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceEntry | null>(null);
  const [experienceForm, setExperienceForm] = useState(EMPTY_EXPERIENCE_FORM);
  const [awards, setAwards] = useState<AwardEntry[]>(DEFAULT_AWARDS);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<AwardEntry | null>(null);
  const [awardForm, setAwardForm] = useState(EMPTY_AWARD_FORM);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProfileDeleteTarget | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as Record<string, string>;
      if (parsed.username !== undefined) setUsername(parsed.username);
      if (parsed.email !== undefined) setEmail(parsed.email);
      if (parsed.phone !== undefined) setPhone(parsed.phone);
      if (parsed.tagline !== undefined) setTagline(parsed.tagline);
      if (parsed.hourlyRate !== undefined) setHourlyRate(parsed.hourlyRate);
      if (parsed.gender !== undefined) setGender(parsed.gender);
      if (parsed.specialization !== undefined) setSpecialization(parsed.specialization);
      if (parsed.profileType !== undefined) setProfileType(parsed.profileType);
      if (parsed.country !== undefined) setCountry(parsed.country);
      if (parsed.city !== undefined) setCity(parsed.city);
      if (parsed.language !== undefined) setLanguage(parsed.language);
      if (parsed.languageLevel !== undefined) setLanguageLevel(parsed.languageLevel);
      if (parsed.description !== undefined) setDescription(parsed.description);
      if (parsed.avatar !== undefined) setAvatar(parsed.avatar);
      if (Array.isArray(parsed.transport)) {
        setTransport(parsed.transport.filter((item): item is string => typeof item === 'string'));
      }
    } catch (e) {
      console.warn('Could not load stored profile', e);
    }

    try {
      const savedSkills = localStorage.getItem(SKILLS_STORAGE_KEY);
      if (!savedSkills) return;

      const parsed = JSON.parse(savedSkills) as SkillRow[];
      if (Array.isArray(parsed) && parsed.length === 3) {
        setSkills(parsed);
      }
    } catch (e) {
      console.warn('Could not load stored skills', e);
    }

    try {
      const savedEducation = localStorage.getItem(EDUCATION_STORAGE_KEY);
      if (!savedEducation) return;

      const parsed = JSON.parse(savedEducation) as EducationEntry[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setEducation(parsed);
      }
    } catch (e) {
      console.warn('Could not load stored education', e);
    }

    try {
      const savedExperience = localStorage.getItem(EXPERIENCE_STORAGE_KEY);
      if (savedExperience) {
        const parsed = JSON.parse(savedExperience) as ExperienceEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExperience(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load stored experience', e);
    }

    try {
      const savedAwards = localStorage.getItem(AWARDS_STORAGE_KEY);
      if (savedAwards) {
        const parsed = JSON.parse(savedAwards) as AwardEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAwards(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load stored awards', e);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();

    const profileData = {
      username,
      email,
      phone,
      tagline,
      hourlyRate,
      gender,
      specialization,
      profileType,
      country,
      city,
      language,
      languageLevel,
      description,
      transport,
      avatar,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      triggerToast('Your profile updates have been saved successfully!');
    } catch (error) {
      console.error('Error storing profile data', error);
      triggerToast('Failed to save profile. Storage quota might be exceeded.');
    }
  };

  const handleSkillsSave = (e: FormEvent) => {
    e.preventDefault();

    try {
      localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skills));
      triggerToast('Your skills have been saved successfully!');
    } catch (error) {
      console.error('Error storing skills data', error);
      triggerToast('Failed to save skills. Storage quota might be exceeded.');
    }
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

  const handleSkillSelectChange = (index: number, value: string) => {
    if (value === OTHER_SKILL_OPTION) {
      updateSkillRow(index, 'skill', OTHER_SKILL_OPTION);
      return;
    }
    updateSkillRow(index, 'skill', value);
  };

  const handleEducationSave = (e: FormEvent) => {
    e.preventDefault();

    try {
      localStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(education));
      triggerToast('Your education has been saved successfully!');
    } catch (error) {
      console.error('Error storing education data', error);
      triggerToast('Failed to save education. Storage quota might be exceeded.');
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

  const handleExperienceSave = (e: FormEvent) => {
    e.preventDefault();

    try {
      localStorage.setItem(EXPERIENCE_STORAGE_KEY, JSON.stringify(experience));
      triggerToast('Your work experience has been saved successfully!');
    } catch (error) {
      console.error('Error storing experience data', error);
      triggerToast('Failed to save work experience. Storage quota might be exceeded.');
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

  const handleAwardsSave = (e: FormEvent) => {
    e.preventDefault();

    try {
      localStorage.setItem(AWARDS_STORAGE_KEY, JSON.stringify(awards));
      triggerToast('Your awards have been saved successfully!');
    } catch (error) {
      console.error('Error storing awards data', error);
      triggerToast('Failed to save awards. Storage quota might be exceeded.');
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    if (file.size > 1024 * 1024) {
      triggerToast('Error: Image exceeds maximum limit of 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        triggerToast('Profile picture uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = () => {
    setAvatar(PLACEHOLDER_AVATAR);
    triggerToast('Profile picture deleted.');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.kind === 'avatar') {
      handleDeleteAvatar();
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

  return (
    <div className="animate-in fade-in relative -mx-4 -my-6 min-h-screen bg-[#f0efec] px-4 py-4 font-sans text-black duration-300 sm:-mx-6 sm:px-6 sm:py-4 md:-mx-8 md:px-8">
      <div className="mx-auto mb-8 max-w-7xl pl-1">
        <h1 className="text-[34px] font-semibold leading-none tracking-tight text-neutral-900" id="profile-heading-id">
          My Profile
        </h1>
        <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
          Lorem ipsum dolor sit amet, consectetur.
        </p>
      </div>

      {toastMessage ? (
        <div className="animate-in slide-in-from-bottom-2 mx-auto mb-6 flex max-w-7xl items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm duration-300">
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

      <div className="mx-auto mb-8 max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <ProfileAccordionItem
          title="Profile Details"
          icon={User}
          description={username || tagline || 'Update your public profile information'}
          isOpen={openSection === 'profile'}
          onToggle={() => toggleSection('profile')}
        >
        <form onSubmit={handleSave} className="space-y-8 pt-4">
          <div className="flex flex-col items-start gap-6 pb-2 sm:flex-row sm:items-center" id="avatar-section">
            <div className="relative">
              <div className="flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border-2 border-pink-100 bg-pink-50 shadow-sm">
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
                  className="cursor-pointer rounded-xl border border-[#EBE3DE]/40 bg-[#FCF7F2] px-6 py-3 text-sm font-bold text-[#193e32] shadow-sm transition-all hover:bg-[#F7EFE8]"
                >
                  Upload Images
                </button>
              </div>

              <p className="whitespace-normal text-[13px] font-normal leading-normal tracking-tight text-neutral-400">
                Max file size is 1MB, Minimum dimension: 330x300 And Suitable files are .jpg & .png
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="i will"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Email Address</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="i will"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="i will"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Tagline</label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={inputClass}
                placeholder="i will"
              />
            </div>

            <div className="relative space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Hourly Rate</label>
              <select
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={selectClass}
                style={SELECT_CHEVRON_STYLE}
              >
                <option value="Select">Select</option>
                <option value="$25 / hr">$25 / hr</option>
                <option value="$45 / hr">$45 / hr</option>
                <option value="$65 / hr">$65 / hr</option>
                <option value="$85 / hr">$85 / hr</option>
                <option value="$120 / hr">$120 / hr</option>
              </select>
            </div>

            <div className="relative space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass} style={SELECT_CHEVRON_STYLE}>
                <option value="Select">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="relative space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Specialization</label>
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
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Type</label>
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

            <div className="relative space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass} style={SELECT_CHEVRON_STYLE}>
                <option value="Select">Select</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Nepal">Nepal</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            <div className="relative space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass} style={SELECT_CHEVRON_STYLE}>
                <option value="Select">Select</option>
                <option value="London">London</option>
                <option value="New York">New York</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Berlin">Berlin</option>
                <option value="Paris">Paris</option>
                <option value="Toronto">Toronto</option>
                <option value="Sydney">Sydney</option>
              </select>
            </div>

            <div className="relative space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass} style={SELECT_CHEVRON_STYLE}>
                <option value="Select">Select</option>
                <option value="English">English</option>
                <option value="Nepali">Nepali</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="French">French</option>
              </select>
            </div>

            <div className="relative space-y-2">
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Languages Level</label>
              <select
                value={languageLevel}
                onChange={(e) => setLanguageLevel(e.target.value)}
                className={selectClass}
                style={SELECT_CHEVRON_STYLE}
              >
                <option value="Select">Select</option>
                <option value="Basic">Basic</option>
                <option value="Conversational">Conversational</option>
                <option value="Fluent">Fluent</option>
                <option value="Native / Bilingual">Native / Bilingual</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 border-t border-neutral-100 pt-6">
            <div>
              <label className="block text-[15px] font-semibold leading-tight text-neutral-900">
                How do you get around?
              </label>
              <p className="mt-1 text-sm text-neutral-400">Select every option that applies to you.</p>
            </div>
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
                    className={`flex min-h-[96px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 px-3 py-4 transition-all duration-200 ${
                      selected
                        ? 'border-[#52C47F] bg-emerald-50 text-[#1D3E35] shadow-md shadow-[#52C47F]/10'
                        : 'border-neutral-200/90 bg-white text-neutral-400 hover:border-neutral-300 hover:text-neutral-600'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${selected ? 'text-[#52C47F]' : ''}`} strokeWidth={2} />
                    <span className="text-xs font-semibold tracking-wide">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 border-t border-neutral-100 pt-4">
            <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Introduce Yourself</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={5}
              className="min-h-[160px] w-full rounded-xl border border-neutral-200/90 bg-white p-4 text-sm font-medium text-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:ring-2 focus:ring-[#52C47F]"
            />
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
                  className="grid grid-cols-1 gap-x-8 gap-y-6 border-b border-neutral-100 pb-6 last:border-b-0 last:pb-0 md:grid-cols-[1fr_1fr_auto]"
                >
                  <div className="relative space-y-2">
                    <label className="block text-[15px] font-semibold leading-tight text-neutral-900">
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
                    <label className="block text-[15px] font-semibold leading-tight text-neutral-900">Point</label>
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
                      onClick={() => removeSkillRow(index)}
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

          <div className="space-y-4 border-t border-neutral-100 pt-6">
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
                      <div className="my-1 w-px flex-1 border-l-2 border-dashed border-neutral-200" />
                    ) : null}
                  </div>

                  <div className={`min-w-0 flex-1 ${index < education.length - 1 ? 'pb-10' : 'pb-4'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-3">
                        <span className="inline-block rounded-full bg-[#FFF5F4] px-4 py-1.5 text-xs font-medium text-neutral-700">
                          {entry.yearRange}
                        </span>

                        <div>
                          <h3 className="text-[17px] font-semibold tracking-tight text-neutral-900">{entry.degree}</h3>
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

          <div className="space-y-4 border-t border-neutral-100 pt-6">
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
                      <div className="my-1 w-px flex-1 border-l-2 border-dashed border-neutral-200" />
                    ) : null}
                  </div>

                  <div className={`min-w-0 flex-1 ${index < experience.length - 1 ? 'pb-10' : 'pb-4'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-3">
                        <span className="inline-block rounded-full bg-[#FFF5F4] px-4 py-1.5 text-xs font-medium text-neutral-700">
                          {entry.yearRange}
                        </span>

                        <div>
                          <h3 className="text-[17px] font-semibold tracking-tight text-neutral-900">{entry.title}</h3>
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

          <div className="space-y-4 border-t border-neutral-100 pt-6">
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
                    <h3 className="text-[17px] font-semibold tracking-tight text-neutral-900">{entry.title}</h3>
                    <p className="mt-1 text-[15px] font-medium text-[#52C47F]">{entry.issuer}</p>
                  </div>

                  <p className="max-w-3xl text-sm leading-relaxed text-neutral-400">{entry.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 border-t border-neutral-100 pt-6">
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
      </div>

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
          className="animate-in fade-in fixed bottom-6 right-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-neutral-100 text-neutral-600 shadow-lg transition-all hover:scale-105 hover:bg-neutral-200"
          title="Scroll to Top"
        >
          <ChevronUp className="h-5 w-5 text-neutral-800" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
}
