'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUpRight, Building2, ImageIcon, Link2, Mail, MapPin, Phone, UserRound, X } from 'lucide-react';
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
import { cn, getMediaUrl } from '@/lib/utils';

const USERNAME_MIN_LENGTH = 3;
const MAX_GALLERY_IMAGES = 10;
const MAX_GALLERY_FILE_BYTES = 1024 * 1024;
const MAX_LOGO_FILE_BYTES = 1024 * 1024;
const USERNAME_MAX_LENGTH = 30;
const USERNAME_PATTERN = /^[a-z0-9._]+$/;

const inputClass =
  'w-full rounded-xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-medium text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#52C47F] focus:ring-2 focus:ring-[#52C47F]/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-neutral-500';

const selectClass = `${inputClass} cursor-pointer appearance-none`;

const labelClass =
  'mb-1.5 block text-sm font-semibold text-neutral-800 dark:text-stone-100';

const SELECT_CHEVRON_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23111827' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.9rem center',
  backgroundSize: '1rem',
} as const;

type EmployerBusinessProfileFormProps = {
  onToast: (message: string) => void;
  onProgressChange?: (progress: { filled: number; total: number; percent: number }) => void;
};

function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-5', className)}>
      <div>
        <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-stone-100">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function EmployerBusinessProfileForm({
  onToast,
  onProgressChange,
}: EmployerBusinessProfileFormProps) {
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

  const profileProgress = useMemo(() => {
    const checks = [
      Boolean(slug.trim()),
      Boolean(companyName.trim()),
      Boolean(tagline.trim()),
      Boolean(industry.trim()) || accountType === 'individual',
      accountType === 'individual' || Boolean(teamSize.trim()),
      Boolean(location.trim()),
      Boolean(description.trim()),
      Boolean(contactEmail.trim() || user?.email?.trim()),
      Boolean(contactPhone.trim() || user?.phone_number?.trim()),
      Boolean(logoUrl.trim()),
    ];
    const filled = checks.filter(Boolean).length;
    const total = checks.length;
    return {
      filled,
      total,
      percent: total === 0 ? 0 : Math.round((filled / total) * 100),
    };
  }, [
    accountType,
    companyName,
    contactEmail,
    contactPhone,
    description,
    industry,
    location,
    logoUrl,
    slug,
    tagline,
    teamSize,
    user?.email,
    user?.phone_number,
  ]);

  useEffect(() => {
    onProgressChange?.(profileProgress);
  }, [onProgressChange, profileProgress]);

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
      onToast(`You can upload up to ${MAX_GALLERY_IMAGES} gallery images.`);
      return;
    }

    const files = Array.from(list).slice(0, remaining);
    setUploadingGallery(true);
    try {
      const added: EmployerGalleryImage[] = [];
      for (const file of files) {
        if (!/\.(jpe?g|png)$/i.test(file.name)) {
          onToast('Gallery images must be JPG or PNG.');
          continue;
        }
        if (file.size > MAX_GALLERY_FILE_BYTES) {
          onToast('Each gallery image must be 1MB or smaller.');
          continue;
        }
        const response = await employerService.uploadGalleryImage(file);
        if (response.success && response.data) {
          added.push({
            id: response.data.id,
            url: getMediaUrl(response.data.url) || response.data.url,
            alt: response.data.alt_text?.trim() || 'Gallery image',
          });
        } else {
          onToast(response.message || 'Could not upload gallery image.');
        }
      }
      if (added.length > 0) {
        setGalleryImages((prev) => [...prev, ...added].slice(0, MAX_GALLERY_IMAGES));
      }
    } catch {
      onToast('Could not upload gallery images.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (id: string) => {
    const previous = galleryImages;
    setGalleryImages((prev) => prev.filter((item) => item.id !== id));
    try {
      const response = await employerService.deleteGalleryImage(id);
      if (!response.success) {
        setGalleryImages(previous);
        onToast(response.message || 'Could not remove image.');
      }
    } catch {
      setGalleryImages(previous);
      onToast('Could not remove image.');
    }
  };

  const onLogoSelected = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;

    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
      onToast('Logo must be JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > MAX_LOGO_FILE_BYTES) {
      onToast('Logo must be 1MB or smaller.');
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
  const displayNameLabel = isCompany ? 'Company name' : 'Display name';
  const logoLabel = isCompany ? 'Company logo' : 'Profile photo';

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/40">
        <p className="text-sm text-neutral-500" aria-live="polite">
          Loading business profile…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-0">
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        <Section
          title="Account type"
          description="Hire as yourself or on behalf of a company. You can change this later."
          className="pb-8"
        >
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-1.5 dark:border-neutral-700 dark:bg-neutral-950 sm:max-w-md">
            {(
              [
                { value: 'individual' as const, label: 'Individual', icon: UserRound },
                { value: 'company' as const, label: 'Company', icon: Building2 },
              ] as const
            ).map((option) => {
              const active = accountType === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAccountType(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                    active
                      ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-stone-100'
                      : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-stone-200',
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section
          title="Identity"
          description="This is how employers and freelancers recognize your brand."
          className="py-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="shrink-0 space-y-3">
              <p className={labelClass}>{logoLabel}</p>
              <div
                className={cn(
                  'relative flex h-28 w-28 items-center justify-center overflow-hidden border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950',
                  isCompany ? 'rounded-2xl' : 'rounded-full',
                )}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-9 w-9 text-neutral-300" />
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => {
                  void onLogoSelected(e.target.files);
                  e.target.value = '';
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="cursor-pointer rounded-xl bg-[#52C47F] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#43B26F] disabled:opacity-60"
                >
                  {uploadingLogo ? 'Uploading…' : 'Upload'}
                </button>
                {logoUrl ? (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="cursor-pointer rounded-xl bg-neutral-100 px-3.5 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <p className="max-w-[11rem] text-xs text-neutral-500">JPG, PNG or WEBP · max 1MB</p>
            </div>

            <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="employer-display-name">
                  {displayNameLabel}
                </label>
                <input
                  id="employer-display-name"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                  placeholder={isCompany ? 'Your company name' : 'Your full name'}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="employer-tagline">
                  Tagline
                </label>
                <input
                  id="employer-tagline"
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className={inputClass}
                  placeholder="Short headline for your business"
                />
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Public profile URL"
          description="Your public employer page lives at this address."
          className="py-8"
        >
          <div className="flex max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white focus-within:border-[#52C47F] focus-within:ring-2 focus-within:ring-[#52C47F]/20 dark:border-neutral-700 dark:bg-neutral-950">
            <span className="flex shrink-0 items-center gap-1.5 border-r border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              <Link2 className="h-3.5 w-3.5" />
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
              className={cn(
                'min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm font-medium lowercase text-neutral-800 outline-none placeholder:text-neutral-400 dark:text-stone-100',
                !usernameCanChange && 'cursor-not-allowed opacity-70',
              )}
              placeholder="your-company"
            />
          </div>
          {fullPublicUrl ? (
            <p className="mt-2 break-all text-xs text-neutral-500">
              Live at{' '}
              <Link
                href={profilePath ?? fullPublicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#2f7a52] hover:underline"
              >
                {fullPublicUrl}
              </Link>
            </p>
          ) : null}
          {!usernameCanChange ? (
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              Profile URLs can be changed once every 6 months.
            </p>
          ) : null}
        </Section>

        <Section
          title={isCompany ? 'Company details' : 'Profile details'}
          description="Help freelancers understand where you are and how you work."
          className="py-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isCompany ? (
              <>
                <div>
                  <label className={labelClass} htmlFor="employer-industry">
                    Industry
                  </label>
                  <select
                    id="employer-industry"
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
                <div>
                  <label className={labelClass} htmlFor="employer-size">
                    Company size
                  </label>
                  <select
                    id="employer-size"
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
              </>
            ) : null}

            <div>
              <label className={labelClass} htmlFor="employer-location">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  Location
                </span>
              </label>
              <input
                id="employer-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="employer-cost">
                Typical budget / rate
              </label>
              <input
                id="employer-cost"
                type="text"
                value={costRange}
                onChange={(e) => setCostRange(e.target.value)}
                className={inputClass}
                placeholder="e.g. Rs. 2,500 – 4,500 / hr"
              />
            </div>

            {isCompany ? (
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="employer-website">
                  Website
                </label>
                <input
                  id="employer-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass}
                  placeholder="https://yourcompany.com"
                />
              </div>
            ) : null}
          </div>
        </Section>

        <Section
          title="Contact"
          description="Shown on your public page so freelancers can reach you."
          className="py-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="employer-email">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-neutral-400" />
                  Contact email
                </span>
              </label>
              <input
                id="employer-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputClass}
                placeholder="contact@yourcompany.com"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="employer-phone">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-neutral-400" />
                  Contact phone
                </span>
              </label>
              <input
                id="employer-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={inputClass}
                placeholder="e.g. +977 98XXXXXXXX"
              />
            </div>
          </div>
        </Section>

        <Section
          title={isCompany ? 'About company' : 'About you'}
          description="A short introduction for your public employer page."
          className="py-8"
        >
          <textarea
            id="employer-about"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={cn(inputClass, 'min-h-[140px] resize-y')}
            placeholder={
              isCompany
                ? 'Describe your company, services, and what makes you unique.'
                : 'Describe yourself, the work you hire for, and what collaborators should know.'
            }
          />
        </Section>

        <Section
          title={isCompany ? 'Gallery' : 'Photo gallery'}
          description={`Optional images for your public page · up to ${MAX_GALLERY_IMAGES} · JPG or PNG · 1MB each.`}
          className="py-8"
        >
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
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.alt || ''} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    void removeGalleryImage(item.id);
                  }}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/65 p-1 text-white transition hover:bg-black"
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
                className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-xs font-medium text-neutral-500 transition hover:border-[#52C47F] hover:bg-[#52C47F]/5 hover:text-[#2f7a52] disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950"
              >
                <ImageIcon className="h-5 w-5" />
                {uploadingGallery ? '…' : 'Add'}
              </button>
            ) : null}
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 z-10 -mx-6 mt-2 border-t border-neutral-100 bg-white/95 px-6 py-4 backdrop-blur-sm md:-mx-8 md:px-8 dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Changes appear on your public employer page after you save.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-xl bg-[#52C47F] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#43B26F] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <span>{saving ? 'Saving…' : 'Save business profile'}</span>
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </form>
  );
}
