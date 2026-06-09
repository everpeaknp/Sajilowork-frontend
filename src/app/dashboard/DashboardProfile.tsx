'use client';

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Trash2, ArrowUpRight, X, ChevronUp, User, CheckCircle2, Plus, Pencil } from 'lucide-react';
import { authService } from '@/services';

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

const SKILL_OPTIONS = [
  'Select',
  'Designer',
  'Developer',
  'Video Editor',
  'Photographer',
  'Writer',
  'Marketing',
  'SEO Specialist',
];

const POINT_OPTIONS = ['Select', '50', '60', '70', '75', '80', '85', '90', '95', '100'];

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
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDeleteEducation = (id: string) => {
    setEducation((prev) => prev.filter((entry) => entry.id !== id));
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

  const handleDeleteExperience = (id: string) => {
    setExperience((prev) => prev.filter((entry) => entry.id !== id));
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

  const handleDeleteAward = (id: string) => {
    setAwards((prev) => prev.filter((entry) => entry.id !== id));
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

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      triggerToast('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      triggerToast('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      triggerToast('New password and confirmation do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      triggerToast('New password must be different from your old password.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await authService.changePassword(oldPassword, newPassword);

      if (response.success) {
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        triggerToast('Your password has been changed successfully!');
      } else {
        triggerToast(response.message || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Failed to change password', error);
      const message = error instanceof Error ? error.message : 'Failed to change password. Please try again.';
      triggerToast(message);
    } finally {
      setIsChangingPassword(false);
    }
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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

      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 border-b border-neutral-100 pb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-neutral-900" id="profile-details-label">
            Profile Details
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
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
                  onClick={handleDeleteAvatar}
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
      </div>

      <div className="mx-auto mt-6 max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 border-b border-neutral-100 pb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-neutral-900" id="skills-section-label">
            Skills
          </h2>
        </div>

        <form onSubmit={handleSkillsSave} className="space-y-6">
          {skills.map((row, index) => (
            <div key={`skill-row-${index}`} className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <div className="relative space-y-2">
                <label className="block text-[15px] font-semibold leading-tight text-neutral-900">
                  Skills {index + 1}
                </label>
                <select
                  value={row.skill}
                  onChange={(e) => updateSkillRow(index, 'skill', e.target.value)}
                  className={selectClass}
                  style={SELECT_CHEVRON_STYLE}
                >
                  {SKILL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
            >
              <span>Save</span>
              <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>

      <div className="mx-auto mt-6 max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-neutral-100 pb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-neutral-900" id="education-section-label">
            Education
          </h2>
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

        <form onSubmit={handleEducationSave}>
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
                          onClick={() => handleDeleteEducation(entry.id)}
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

          <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
            <button
              type="submit"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
            >
              <span>Save</span>
              <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>

      {isEducationModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close education modal"
            onClick={() => setIsEducationModalOpen(false)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-bold text-neutral-900">
                {editingEducation ? 'Edit Education' : 'Add Education'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEducationModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEducationFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Year Range</label>
                <input
                  value={educationForm.yearRange}
                  onChange={(e) => setEducationForm((f) => ({ ...f, yearRange: e.target.value }))}
                  placeholder="2012 – 2014"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Degree</label>
                <input
                  required
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm((f) => ({ ...f, degree: e.target.value }))}
                  placeholder="Bachelors in Fine Arts"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Institution</label>
                <input
                  required
                  value={educationForm.institution}
                  onChange={(e) => setEducationForm((f) => ({ ...f, institution: e.target.value }))}
                  placeholder="Modern College"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Description</label>
                <textarea
                  value={educationForm.description}
                  onChange={(e) => setEducationForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                  rows={4}
                  className="min-h-[120px] w-full rounded-xl border border-neutral-200/90 bg-white p-4 text-sm font-medium text-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:ring-2 focus:ring-[#52C47F]"
                />
              </div>

              <div className="flex gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEducationModalOpen(false)}
                  className="flex-1 rounded-xl bg-neutral-100 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#222222] py-3 text-xs font-semibold text-white hover:bg-black"
                >
                  {editingEducation ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="mx-auto mt-6 max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-neutral-100 pb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-neutral-900" id="experience-section-label">
            Work &amp; Experience
          </h2>
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

        <form onSubmit={handleExperienceSave}>
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
                          onClick={() => handleDeleteExperience(entry.id)}
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

          <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
            <button
              type="submit"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
            >
              <span>Save</span>
              <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>

      {isExperienceModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close experience modal"
            onClick={() => setIsExperienceModalOpen(false)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-bold text-neutral-900">
                {editingExperience ? 'Edit Experience' : 'Add Experience'}
              </h3>
              <button
                type="button"
                onClick={() => setIsExperienceModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExperienceFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Year Range</label>
                <input
                  value={experienceForm.yearRange}
                  onChange={(e) => setExperienceForm((f) => ({ ...f, yearRange: e.target.value }))}
                  placeholder="2012 – 2014"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Job Title</label>
                <input
                  required
                  value={experienceForm.title}
                  onChange={(e) => setExperienceForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="UX Designer"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Company</label>
                <input
                  required
                  value={experienceForm.company}
                  onChange={(e) => setExperienceForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="Dropbox"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Description</label>
                <textarea
                  value={experienceForm.description}
                  onChange={(e) => setExperienceForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                  rows={4}
                  className="min-h-[120px] w-full rounded-xl border border-neutral-200/90 bg-white p-4 text-sm font-medium text-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:ring-2 focus:ring-[#52C47F]"
                />
              </div>

              <div className="flex gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsExperienceModalOpen(false)}
                  className="flex-1 rounded-xl bg-neutral-100 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#222222] py-3 text-xs font-semibold text-white hover:bg-black"
                >
                  {editingExperience ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="mx-auto mt-6 max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-neutral-100 pb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-neutral-900" id="awards-section-label">
            Awards
          </h2>
          <button
            type="button"
            onClick={openAddAward}
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#52C47F] transition-colors hover:text-[#43b06c]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF5F4] text-[#F87171]">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </span>
            Add Awards
          </button>
        </div>

        <form onSubmit={handleAwardsSave}>
          {awards.length === 0 ? (
            <p className="pb-6 text-sm text-neutral-400">No awards yet. Click Add Awards to get started.</p>
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
                        onClick={() => handleDeleteAward(entry.id)}
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

          <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
            <button
              type="submit"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655]"
            >
              <span>Save</span>
              <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>

      <div className="mx-auto mb-8 mt-6 max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 border-b border-neutral-100 pb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-neutral-900" id="change-password-section-label">
            Change password
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-8">
            <label
              htmlFor="old-password"
              className="shrink-0 text-[15px] font-semibold leading-tight text-neutral-900 sm:w-52"
            >
              Old Password
            </label>
            <input
              id="old-password"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="********"
              className={`${inputClass} w-full max-w-xs text-neutral-800`}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-8">
            <label
              htmlFor="new-password"
              className="shrink-0 text-[15px] font-semibold leading-tight text-neutral-900 sm:w-52"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="********"
              className={`${inputClass} w-full max-w-2xl text-neutral-800`}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-8">
            <label
              htmlFor="confirm-new-password"
              className="shrink-0 text-[15px] font-semibold leading-tight text-neutral-900 sm:w-52"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="********"
              className={`${inputClass} w-full max-w-2xl text-neutral-800`}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] active:translate-y-px active:bg-[#349655] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{isChangingPassword ? 'Changing...' : 'Change Password'}</span>
              <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>

      {isAwardModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close award modal"
            onClick={() => setIsAwardModalOpen(false)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-bold text-neutral-900">{editingAward ? 'Edit Award' : 'Add Award'}</h3>
              <button
                type="button"
                onClick={() => setIsAwardModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAwardFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Year Range</label>
                <input
                  value={awardForm.yearRange}
                  onChange={(e) => setAwardForm((f) => ({ ...f, yearRange: e.target.value }))}
                  placeholder="2012 – 2014"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Award Title</label>
                <input
                  required
                  value={awardForm.title}
                  onChange={(e) => setAwardForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="UI UX Design"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Issuer</label>
                <input
                  required
                  value={awardForm.issuer}
                  onChange={(e) => setAwardForm((f) => ({ ...f, issuer: e.target.value }))}
                  placeholder="Udemy"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Description</label>
                <textarea
                  value={awardForm.description}
                  onChange={(e) => setAwardForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                  rows={4}
                  className="min-h-[120px] w-full rounded-xl border border-neutral-200/90 bg-white p-4 text-sm font-medium text-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:ring-2 focus:ring-[#52C47F]"
                />
              </div>

              <div className="flex gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAwardModalOpen(false)}
                  className="flex-1 rounded-xl bg-neutral-100 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#222222] py-3 text-xs font-semibold text-white hover:bg-black"
                >
                  {editingAward ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
