import type { Employer, EmployerGalleryImage } from '@/components/employers/employerData';
import type { User } from '@/types';

export type { EmployerGalleryImage };

export type EmployerAccountType = 'individual' | 'company';

export type EmployerPostingContext = {
  accountType: EmployerAccountType;
  displayName: string;
  slug: string;
  logoUrl: string;
  location: string;
  industry: string;
};

export type EmployerBusinessProfile = {
  userId: string;
  slug: string;
  accountType: EmployerAccountType;
  companyName: string;
  tagline: string;
  industry: string;
  teamSize: string;
  location: string;
  description: string;
  website: string;
  costRange: string;
  logoColor: string;
  logoText: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  galleryImages: EmployerGalleryImage[];
  updatedAt: string;
};

function normalizeEmployerBusinessProfile(
  raw: Partial<EmployerBusinessProfile> & Pick<EmployerBusinessProfile, 'userId'>,
): EmployerBusinessProfile {
  const accountType: EmployerAccountType =
    raw.accountType === 'company' ? 'company' : 'individual';

  return {
    userId: raw.userId,
    slug: (raw.slug ?? '').trim().toLowerCase(),
    accountType,
    companyName: raw.companyName ?? '',
    tagline: raw.tagline ?? '',
    industry: raw.industry ?? '',
    teamSize: raw.teamSize ?? '',
    location: raw.location ?? '',
    description: raw.description ?? '',
    website: raw.website ?? '',
    costRange: raw.costRange ?? '',
    logoColor: raw.logoColor ?? 'serif-m',
    logoText: raw.logoText ?? 'CO',
    logoUrl: raw.logoUrl ?? '',
    contactEmail: raw.contactEmail ?? '',
    contactPhone: raw.contactPhone ?? '',
    galleryImages: Array.isArray(raw.galleryImages) ? raw.galleryImages : [],
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

const PROFILE_PREFIX = 'employer-business-profile:';
const SLUG_INDEX_KEY = 'employer-business-profile-slugs';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function readEmployerSlugIndex(): Record<string, string> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(SLUG_INDEX_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeEmployerSlugIndex(index: Record<string, string>): void {
  if (!isBrowser()) return;
  localStorage.setItem(SLUG_INDEX_KEY, JSON.stringify(index));
}

export function loadEmployerBusinessProfile(userId: string): EmployerBusinessProfile | null {
  if (!isBrowser() || !userId) return null;
  try {
    const raw = localStorage.getItem(`${PROFILE_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EmployerBusinessProfile> & { userId: string };
    return normalizeEmployerBusinessProfile(parsed);
  } catch {
    return null;
  }
}

export function saveEmployerBusinessProfile(profile: EmployerBusinessProfile): void {
  if (!isBrowser() || !profile.userId) return;

  const slug = profile.slug.trim().toLowerCase();
  if (!slug) return;

  const existing = loadEmployerBusinessProfile(profile.userId);
  const index = readEmployerSlugIndex();

  if (existing?.slug && existing.slug.toLowerCase() !== slug) {
    delete index[existing.slug.toLowerCase()];
  }

  index[slug] = profile.userId;
  writeEmployerSlugIndex(index);
  localStorage.setItem(
    `${PROFILE_PREFIX}${profile.userId}`,
    JSON.stringify({ ...profile, slug, updatedAt: new Date().toISOString() }),
  );
}

export function buildDefaultEmployerBusinessProfile(user: User): EmployerBusinessProfile {
  const companyName =
    user.full_name?.trim() ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  const location = user.city?.trim() || user.address?.trim() || '';
  const initials =
    companyName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'CO';

  return {
    userId: user.id,
    slug: (user.username ?? '').trim().toLowerCase(),
    accountType: 'individual',
    companyName,
    tagline: user.tagline?.trim() || '',
    industry: '',
    teamSize: '',
    location,
    description: user.bio?.trim() || '',
    website: '',
    costRange: '',
    logoColor: 'serif-m',
    logoText: initials,
    logoUrl: user.profile_image?.trim() || '',
    contactEmail: user.email?.trim() || '',
    contactPhone: user.phone_number?.trim() || '',
    galleryImages: [],
    updatedAt: new Date().toISOString(),
  };
}

export function resolveEmployerBusinessProfile(user: User | null): EmployerBusinessProfile | null {
  if (!user?.id) return null;
  const stored = loadEmployerBusinessProfile(user.id);
  if (stored) return stored;
  if (!user.username?.trim()) return null;
  return buildDefaultEmployerBusinessProfile(user);
}

export function getEmployerPostingContext(user: User | null): EmployerPostingContext | null {
  const profile = resolveEmployerBusinessProfile(user);
  if (!profile) return null;

  return {
    accountType: profile.accountType,
    displayName: profile.companyName.trim() || profile.slug,
    slug: profile.slug,
    logoUrl: profile.logoUrl,
    location: profile.location,
    industry: profile.industry,
  };
}

export function buildJobFormDefaultsFromProfile(
  user: User | null,
): { companyName: string; city: string } | null {
  const ctx = getEmployerPostingContext(user);
  if (!ctx) return null;
  return {
    companyName: ctx.displayName,
    city: ctx.location,
  };
}

export function employerFromBusinessProfile(profile: EmployerBusinessProfile): Employer {
  return {
    id: `emp-user-${profile.userId}`,
    accountType: profile.accountType,
    name: profile.companyName || profile.slug,
    tagline: profile.tagline || 'Add a tagline on your business profile.',
    industry:
      profile.accountType === 'individual'
        ? 'Individual'
        : profile.industry || 'Not specified',
    rating: 0,
    reviewCount: 0,
    location: profile.location || 'Not specified',
    costRange: profile.costRange || '—',
    openJobs: 0,
    logoColor: profile.logoColor || 'serif-m',
    logoText: profile.logoText || 'CO',
    logoUrl: profile.logoUrl || undefined,
    description: profile.description || '',
    website: profile.website || '',
    teamSize:
      profile.accountType === 'individual' ? '—' : profile.teamSize || 'Not specified',
    contactEmail: profile.contactEmail || undefined,
    contactPhone: profile.contactPhone || undefined,
    galleryImages:
      profile.galleryImages.length > 0 ? profile.galleryImages : undefined,
  };
}

export function findStoredEmployerByCompanyName(companyName: string): Employer | undefined {
  const normalized = companyName.trim().toLowerCase();
  if (!normalized || !isBrowser()) return undefined;

  const index = readEmployerSlugIndex();
  for (const userId of Object.values(index)) {
    const profile = loadEmployerBusinessProfile(userId);
    if (!profile) continue;
    if (profile.companyName.trim().toLowerCase() === normalized) {
      return employerFromBusinessProfile(profile);
    }
  }
  return undefined;
}

export function findStoredEmployerBySlug(slug: string): Employer | undefined {
  const normalized = slug.trim().toLowerCase();
  if (!normalized || !isBrowser()) return undefined;

  const userId = readEmployerSlugIndex()[normalized];
  if (!userId) return undefined;

  const profile = loadEmployerBusinessProfile(userId);
  if (!profile || profile.slug.toLowerCase() !== normalized) return undefined;

  return employerFromBusinessProfile(profile);
}
