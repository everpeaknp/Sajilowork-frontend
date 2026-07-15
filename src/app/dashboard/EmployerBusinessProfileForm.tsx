'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { employerService } from '@/services';
import { mapEmployerProfileDtoToBusinessProfile } from '@/lib/employerApi';
import { notifyUserProfileUpdated } from '@/lib/userProfileSync';
import { getEmployerBusinessProfileHref } from '@/components/employers/employerSlug';
import {
  EMPLOYER_INDUSTRIES,
  EMPLOYER_TEAM_SIZES,
} from '@/components/employers/employerData';
import {
  buildDefaultEmployerBusinessProfile,
  resolveEmployerBusinessProfile,
  type EmployerAccountType,
  type EmployerBusinessProfile,
  type EmployerGalleryImage,
} from '@/lib/employerBusinessProfile';

const USERNAME_MIN_LENGTH = 3;
const MAX_GALLERY_IMAGES = 10;
const MAX_GALLERY_FILE_BYTES = 1024 * 1024;
const MAX_LOGO_FILE_BYTES = 1024 * 1024;
const USERNAME_MAX_LENGTH = 30;
const USERNAME_PATTERN = /^[a-z0-9._]+$/;

const inputClass =
  'w-full rounded-xl border-2 border-transparent bg-neutral-50/80 px-4 py-3.5 text-sm font-medium text-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:border-[#52C47F] focus:bg-white focus:ring-2 focus:ring-[#52C47F]/25 dark:bg-neutral-900/80 dark:text-neutral-300 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-900 dark:focus:border-[#52C47F]';

const selectClass = `${inputClass} cursor-pointer appearance-none text-neutral-800 dark:text-stone-100`;

const SELECT_CHEVRON_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23111827' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  backgroundSize: '1.2em',
} as const;

type EmployerBusinessProfileFormProps = {
  onToast: (message: string) => void;
};

export default function EmployerBusinessProfileForm({ onToast }: EmployerBusinessProfileFormProps) {
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const [accountType, setAccountType] = useState<EmployerAccountType>('individual');
  const [slug, setSlug] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [costRange, setCostRange] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [galleryImages, setGalleryImages] = useState<EmployerGalleryImage[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState(() =>
    typeof window !== 'undefined' ? window.location.origin : '',
  );

  const savedUsername = (user?.username ?? '').trim().toLowerCase();
  const usernameCanChange = user?.username_can_change !== false;
  const profilePath = getEmployerBusinessProfileHref({ username: slug.trim() || null });
  const profilePrefix = '/employers/';
  const fullPublicUrl = slug.trim()
    ? `${siteOrigin || 'http://localhost:3000'}${profilePrefix}${slug.trim().toLowerCase()}`
    : '';

  useEffect(() => {
    if (window.location.origin) {
      setSiteOrigin(window.location.origin);
    }
  }, []);

  const applyProfileToForm = (profile: EmployerBusinessProfile) => {
    setAccountType(profile.accountType ?? 'individual');
    setSlug(profile.slug || user?.username?.trim().toLowerCase() || '');
    setCompanyName(profile.companyName);
    setTagline(profile.tagline);
    setIndustry(profile.industry);
    setTeamSize(profile.teamSize);
    setLocation(profile.location);
    setWebsite(profile.website);
    setCostRange(profile.costRange);
    setDescription(profile.description);
    setLogoUrl(profile.logoUrl || user?.profile_image?.trim() || '');
    setContactEmail(profile.contactEmail || user?.email?.trim() || '');
    setContactPhone(profile.contactPhone || user?.phone_number?.trim() || '');
    setGalleryImages(profile.galleryImages ?? []);
  };

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await employerService.getMyEmployerProfile();
        if (cancelled) return;

        if (response.success && response.data) {
          applyProfileToForm(mapEmployerProfileDtoToBusinessProfile(response.data));
          return;
        }

        const fallback =
          resolveEmployerBusinessProfile(user) ?? buildDefaultEmployerBusinessProfile(user);
        applyProfileToForm(fallback);
      } catch (error) {
        console.error('Failed to load employer profile', error);
        if (!cancelled) {
          const fallback =
            resolveEmployerBusinessProfile(user) ?? buildDefaultEmployerBusinessProfile(user);
          applyProfileToForm(fallback);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onGallerySelected = async (list: FileList | null) => {
    if (!list?.length) return;

    const remaining = MAX_GALLERY_IMAGES - galleryImages.length;
    if (remaining <= 0) {
      onToast(`You can add up to ${MAX_GALLERY_IMAGES} gallery images.`);
      return;
    }

    const files = Array.from(list).slice(0, remaining);
    setUploadingGallery(true);

    try {
      for (const file of files) {
        if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
          onToast('Gallery images must be JPG, PNG, or WEBP.');
          continue;
        }
        if (file.size > MAX_GALLERY_FILE_BYTES) {
          onToast('Each gallery image must be 1MB or smaller.');
          continue;
        }

        const alt = `${companyName.trim() || 'Company'} gallery image`;
        const response = await employerService.uploadGalleryImage(file, alt);
        if (!response.success || !response.data) {
          onToast(response.message || 'Could not upload one of the gallery images.');
          continue;
        }

        const uploaded = response.data;
        setGalleryImages((prev) => [
          ...prev,
          {
            id: uploaded.id,
            url: uploaded.url,
            alt: uploaded.alt_text?.trim() || alt,
          },
        ]);
      }
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (id: string) => {
    const isPersistedId = /^[0-9a-f-]{36}$/i.test(id);
    if (isPersistedId) {
      const response = await employerService.deleteGalleryImage(id);
      if (!response.success) {
        onToast(response.message || 'Could not remove gallery image.');
        return;
      }
    }
    setGalleryImages((prev) => prev.filter((item) => item.id !== id));
  };

  const onLogoSelected = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;

    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
      onToast('Company logo must be JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > MAX_LOGO_FILE_BYTES) {
      onToast('Company logo must be 1MB or smaller.');
      return;
    }

    setUploadingLogo(true);
    try {
      const preview = await readFileAsDataUrl(file);
      setLogoUrl(preview);

      const response = await employerService.uploadLogo(file);
      if (response.success && response.data?.logo_url) {
        setLogoUrl(response.data.logo_url);
        onToast('Logo uploaded.');
        return;
      }
      onToast(response.message || 'Could not upload logo.');
    } catch {
      onToast('Could not read the selected logo image.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const industryOptions = useMemo(
    () => EMPLOYER_INDUSTRIES.filter((item) => item !== 'Category'),
    [],
  );

  const teamSizeOptions = useMemo(
    () => EMPLOYER_TEAM_SIZES.filter((item) => item !== 'No of Employees'),
    [],
  );

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || !user) return;

    const slugValue = slug.trim().toLowerCase();
    const companyValue = companyName.trim();

    if (!slugValue) {
      onToast('Set a profile slug for your public employer page.');
      return;
    }
    if (!companyValue) {
      onToast(
        accountType === 'company'
          ? 'Please enter your company name.'
          : 'Please enter your display name.',
      );
      return;
    }
    if (slugValue.length < USERNAME_MIN_LENGTH) {
      onToast(`Profile slug must be at least ${USERNAME_MIN_LENGTH} characters.`);
      return;
    }
    if (slugValue.length > USERNAME_MAX_LENGTH) {
      onToast(`Profile slug must not exceed ${USERNAME_MAX_LENGTH} characters.`);
      return;
    }
    if (!USERNAME_PATTERN.test(slugValue)) {
      onToast('Slug can only use letters, numbers, dots, and underscores.');
      return;
    }

    const slugChanged = slugValue !== savedUsername;
    if (slugChanged && !usernameCanChange) {
      onToast('Profile URLs can be changed once every 6 months.');
      return;
    }

    setSaving(true);
    try {
      const response = await employerService.updateMyEmployerProfile({
        slug: slugValue,
        account_type: accountType,
        company_name: companyValue,
        tagline: tagline.trim(),
        industry: industry.trim(),
        team_size: teamSize.trim(),
        location: location.trim(),
        description: description.trim(),
        website: website.trim(),
        cost_range: costRange.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
      });

      if (!response.success || !response.data) {
        onToast(response.message || 'Could not save business profile. Please try again.');
        return;
      }

      applyProfileToForm(mapEmployerProfileDtoToBusinessProfile(response.data));
      await refreshUser();
      notifyUserProfileUpdated();

      onToast('Business profile saved. Your public page is updated.');
    } catch (error) {
      console.error('Failed to save employer business profile', error);
      onToast('Could not save business profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isCompany = accountType === 'company';
  const displayNameLabel = isCompany ? 'Company name' : 'Your name';
  const logoLabel = isCompany ? 'Company logo' : 'Profile photo';
  const detailsHeading = isCompany ? 'Company details' : 'Profile details';

  if (loading) {
    return (
      <p className="text-sm text-neutral-500" aria-live="polite">
        Loading business profile…
      </p>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <section className="space-y-3 border-b border-neutral-100 pb-8 dark:border-neutral-800">
        <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
          Account type
        </label>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Choose whether you post work as an individual or on behalf of a company. Both can publish
          jobs and projects.
        </p>
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as EmployerAccountType)}
          className={`${selectClass} max-w-md`}
          style={SELECT_CHEVRON_STYLE}
        >
          <option value="individual">Individual</option>
          <option value="company">Company</option>
        </select>
      </section>

      <section className="flex flex-col gap-6 border-b border-neutral-100 pb-8 dark:border-neutral-800 lg:flex-row lg:items-start dark:border-neutral-800">
        <div className="shrink-0 space-y-3">
          <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
            {logoLabel}
          </label>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-start">
            <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-100 bg-neutral-50 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt="Company logo preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-10 w-10 text-neutral-300" />
              )}
            </div>
            <div className="space-y-3">
              <input
                ref={logoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  void onLogoSelected(e.target.files);
                  e.target.value = '';
                }}
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="cursor-pointer rounded-xl bg-[#FCF7F2] px-6 py-3 text-sm font-bold text-[#193e32] shadow-sm transition-all hover:bg-[#F7EFE8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingLogo ? 'Uploading…' : 'Upload logo'}
                </button>
                {logoUrl ? (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] px-4 py-3 text-sm font-semibold text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <p className="max-w-xs text-xs font-normal leading-relaxed text-neutral-500">
                JPG or PNG, max 1MB.
              </p>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
              {displayNameLabel}
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
              placeholder={isCompany ? 'Your company name' : 'Your full name'}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={inputClass}
              placeholder="Short headline for your business"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 border-b border-neutral-100 pb-8 dark:border-neutral-800">
        <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">Public profile URL</h3>
        <div className="flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-stretch">
          <div
            className={`flex min-w-0 flex-1 items-stretch overflow-hidden rounded-xl border-2 border-transparent bg-neutral-50/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#52C47F] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#52C47F]/25 dark:bg-neutral-900/80 dark:focus-within:bg-neutral-900 ${
              !usernameCanChange ? 'bg-neutral-50 dark:bg-neutral-800/80' : ''
            }`}
          >
            <span className="flex shrink-0 items-center border-r border-neutral-200/80 bg-neutral-100/70 px-3 py-3.5 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              {profilePrefix}
            </span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              disabled={!usernameCanChange}
              readOnly={!usernameCanChange}
              maxLength={USERNAME_MAX_LENGTH}
              className={`min-w-0 flex-1 border-0 bg-transparent px-3 py-3.5 text-sm font-medium lowercase text-neutral-800 outline-none placeholder:text-neutral-400 sm:px-4 dark:text-stone-100 dark:placeholder:text-neutral-500 ${
                !usernameCanChange ? 'cursor-not-allowed text-neutral-500 dark:text-neutral-400' : ''
              }`}
              placeholder="your-company-slug"
            />
          </div>
        </div>
        {fullPublicUrl ? (
          <p className="break-all text-xs text-neutral-500">
            Live URL:{' '}
            <Link
              href={profilePath ?? fullPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#2d8f57] hover:underline"
            >
              {fullPublicUrl}
            </Link>
          </p>
        ) : null}
        {!usernameCanChange ? (
          <p className="text-xs font-medium text-amber-800">
            Profile URLs can be changed once every 6 months.
          </p>
        ) : null}
      </section>

      <section className="space-y-6 border-b border-neutral-100 pb-8 dark:border-neutral-800">
        <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">{detailsHeading}</h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        {isCompany ? (
          <div className="relative space-y-2">
            <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
              Industry
            </label>
            <select
              value={industry || 'Select'}
              onChange={(e) => setIndustry(e.target.value === 'Select' ? '' : e.target.value)}
              className={selectClass}
              style={SELECT_CHEVRON_STYLE}
            >
              <option value="Select">Select</option>
              {industryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {isCompany ? (
          <div className="relative space-y-2">
            <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
              Company size
            </label>
            <select
              value={teamSize || 'Select'}
              onChange={(e) => setTeamSize(e.target.value === 'Select' ? '' : e.target.value)}
              className={selectClass}
              style={SELECT_CHEVRON_STYLE}
            >
              <option value="Select">Select</option>
              {teamSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
            placeholder="City, Country"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
            Cost range
          </label>
          <input
            type="text"
            value={costRange}
            onChange={(e) => setCostRange(e.target.value)}
            className={inputClass}
            placeholder="e.g. Rs. 2,500 – 4,500 / hr"
          />
        </div>

        {isCompany ? (
          <div className="space-y-2 md:col-span-2">
            <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={inputClass}
              placeholder="https://yourcompany.com"
            />
          </div>
        ) : null}
        </div>
      </section>

      <section className="space-y-6 border-b border-neutral-100 pb-8 dark:border-neutral-800">
        <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">Contact</h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
            Contact email
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className={inputClass}
            placeholder="contact@yourcompany.com"
          />
          {user?.email ? (
            <p className="text-xs text-neutral-500">
              Account email: <span className="font-medium text-neutral-700">{user.email}</span>
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-[15px] font-semibold leading-tight text-neutral-900 dark:text-stone-100">
            Contact phone
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className={inputClass}
            placeholder="e.g. +977 98XXXXXXXX"
          />
        </div>
        </div>
      </section>

      <section className="space-y-6 border-b border-neutral-100 pb-8 dark:border-neutral-800">
        <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">
          {isCompany ? 'About company' : 'About you'}
        </h3>
        <div className="space-y-2">
          <label className="sr-only" htmlFor="employer-about-company">
            {isCompany ? 'About company' : 'About you'}
          </label>
          <textarea
            id="employer-about-company"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="min-h-[160px] w-full rounded-xl border-2 border-transparent bg-neutral-50/80 p-4 text-sm font-medium text-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-neutral-400 focus:border-[#52C47F] focus:bg-white focus:ring-2 focus:ring-[#52C47F]/25 dark:bg-neutral-900/80 dark:text-stone-200 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-900"
            placeholder={
              isCompany
                ? 'Describe your company, services, and what makes you unique.'
                : 'Describe yourself, the work you hire for, and what collaborators should know.'
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">
            {isCompany ? 'Company gallery' : 'Photo gallery'}
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {isCompany
              ? `Images shown on your public employer page. Upload up to ${MAX_GALLERY_IMAGES} images (JPG or PNG, max 1MB each).`
              : `Photos shown on your public profile. Upload up to ${MAX_GALLERY_IMAGES} images (JPG or PNG, max 1MB each).`}
          </p>
        </div>
        <div className="space-y-3">
          <input
            ref={galleryInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) => {
              void onGallerySelected(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="flex flex-wrap gap-3">
            {galleryImages.map((item) => (
              <div
                key={item.id}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    void removeGalleryImage(item.id);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black"
                  aria-label="Remove gallery image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {galleryImages.length < MAX_GALLERY_IMAGES ? (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-200 bg-[#fff5f2] text-xs font-normal text-neutral-600 transition-colors hover:bg-[#ffede8] disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <ImageIcon className="h-5 w-5 text-neutral-400" />
                {uploadingGallery ? 'Uploading…' : 'Upload'}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <button
          type="submit"
          disabled={saving}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#52C47F] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#52C47F]/10 transition-all hover:-translate-y-px hover:bg-[#43b06c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{saving ? 'Saving…' : 'Save business profile'}</span>
          <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}
