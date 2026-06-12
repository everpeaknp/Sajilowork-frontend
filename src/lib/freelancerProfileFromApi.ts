import { format } from 'date-fns';
import {
  buildFreelancerHeadline,
  type Freelancer,
  type FreelancerAboutStats,
  type FreelancerAwardItem,
  type FreelancerEducationItem,
  type FreelancerExperienceItem,
  type FreelancerFeaturedServiceItem,
  type FreelancerLevel,
  type FreelancerReviewItem,
} from '@/components/freelancers/freelancerData';
import { genderLabelFromApi, parseSkillsFromApi, API_TO_DASHBOARD_TRANSPORT } from '@/lib/dashboardProfileSkills';
import { getVerifiedLicenceBadges } from '@/components/users/PublicLicenceBadges';
import { formatShortLocation, reviewerDisplayName } from '@/lib/publicProfile';
import { getMediaUrl } from '@/lib/utils';
import type { PortfolioItem, UserBadge } from '@/types';
import type { PublicProfileReview, PublicUserProfile } from '@/types/publicProfile';
import type { UserDirectoryEntry } from '@/services/user.service';

const RING_COLORS = [
  'bg-[#FBE4E7] border-[#F2B0BA]',
  'bg-[#FAF0E3] border-[#E8CBA3]',
  'bg-[#EBF7F2] border-[#A8DBCE]',
  'bg-[#EBF4FA] border-[#AFCBE3]',
] as const;

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150';

export interface FreelancerProfileExtras {
  userId: string;
  description: string[];
  aboutStats: Partial<FreelancerAboutStats>;
  education: FreelancerEducationItem[];
  experience: FreelancerExperienceItem[];
  awards: FreelancerAwardItem[];
  skills: string[];
  licenceBadges: UserBadge[];
  transportLabels: string[];
  featuredServices: FreelancerFeaturedServiceItem[];
  reviews: FreelancerReviewItem[];
}

export interface FreelancerProfileBundle {
  freelancer: Freelancer;
  extras: FreelancerProfileExtras;
}

function hashSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function formatMemberSince(dateJoined?: string): string {
  if (!dateJoined) return 'Member since —';
  const date = new Date(dateJoined);
  if (Number.isNaN(date.getTime())) return 'Member since —';
  return `Member since ${format(date, 'MMMM d, yyyy')}`;
}

function formatMemberSinceShort(dateJoined?: string): string {
  if (!dateJoined) return '—';
  const date = new Date(dateJoined);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'MMMM yyyy');
}

function deriveLevel(tasksCompleted: number, rating: number): FreelancerLevel {
  if (tasksCompleted >= 100 || rating >= 4.8) return 'Expert';
  if (tasksCompleted >= 30 || rating >= 4.5) return 'Senior';
  if (tasksCompleted >= 10) return 'Mid';
  return 'Entry';
}

function deriveRole(
  profile: Pick<PublicUserProfile, 'tagline' | 'specialization'>,
  primarySkill?: string,
): string {
  const specialization = profile.specialization?.trim();
  if (specialization) return specialization;
  if (primarySkill) return primarySkill;
  const tagline = profile.tagline?.trim();
  if (tagline) {
    const short = tagline.split(/[.,|–-]/)[0]?.trim();
    if (short && short.length <= 48) return short;
  }
  return 'Freelancer';
}

function buildDescription(bio?: string): string[] {
  const text = bio?.trim();
  if (!text) {
    return ['This freelancer has not added a description yet.'];
  }
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : [text];
}

function mapEducation(
  entries: ReturnType<typeof parseSkillsFromApi>['education'],
): FreelancerEducationItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    years: entry.yearRange,
    degree: entry.degree,
    institution: entry.institution,
    description: entry.description,
    badgeLetter: (entry.institution || entry.degree || '?').charAt(0).toUpperCase(),
  }));
}

function mapExperience(
  entries: ReturnType<typeof parseSkillsFromApi>['experience'],
): FreelancerExperienceItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    years: entry.yearRange,
    role: entry.title,
    company: entry.company,
    description: entry.description,
    badgeLetter: (entry.company || entry.title || '?').charAt(0).toUpperCase(),
  }));
}

function mapAwards(
  entries: ReturnType<typeof parseSkillsFromApi>['awards'],
): FreelancerAwardItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    years: entry.yearRange,
    title: entry.title,
    authority: entry.issuer,
    description: entry.description,
  }));
}

function mapReviews(reviews: PublicProfileReview[]): FreelancerReviewItem[] {
  return reviews.map((review) => ({
    id: review.id,
    reviewerName: reviewerDisplayName(review.reviewer),
    reviewerRole: review.task_title?.trim() || 'Client',
    rating: Number(review.rating) || 5,
    date: review.created_at
      ? format(new Date(review.created_at), 'MMMM d, yyyy')
      : '—',
    comment: review.comment?.trim() || '',
    likes: 0,
    dislikes: 0,
  }));
}

function mapPortfolioToFeatured(
  items: PortfolioItem[],
  freelancer: Freelancer,
): FreelancerFeaturedServiceItem[] {
  return items.slice(0, 6).map((item, index) => ({
    id: String(item.id),
    category: 'Portfolio',
    title: item.title,
    image: getMediaUrl(item.thumbnail || item.file) || DEFAULT_AVATAR,
    rating: freelancer.rating,
    reviews: freelancer.reviews,
    startingPrice: Math.max(
      freelancer.rate,
      Math.round(freelancer.rate * (2.5 + index * 0.25)),
    ),
    description: item.description?.trim() || 'Portfolio work by this freelancer.',
    details: [],
  }));
}

function pickEnglishLevel(languages: ReturnType<typeof parseSkillsFromApi>['languages']): string {
  const english = languages.find((row) => row.language.toLowerCase().includes('english'));
  if (english && english.level !== 'Select') return english.level;
  const first = languages.find((row) => row.level !== 'Select');
  return first?.level || '—';
}

export function buildFreelancerProfileBundle(
  profile: PublicUserProfile,
  reviews: PublicProfileReview[],
  portfolio: PortfolioItem[],
): FreelancerProfileBundle {
  const parsed = parseSkillsFromApi(profile.skills ?? []);
  const skillNames = parsed.skillRows.map((row) => row.skill).filter(Boolean);
  const transportLabels =
    parsed.transport.length > 0
      ? parsed.transport
      : (profile.transportation_tags ?? []).map(
          (tag) => API_TO_DASHBOARD_TRANSPORT[tag] || tag,
        );
  const licenceBadges = getVerifiedLicenceBadges(profile.badges);
  const specialization =
    profile.specialization?.trim() ||
    (parsed.specialization !== 'Select' ? parsed.specialization : '');
  const rating = Number(profile.average_rating ?? 0) || 0;
  const reviewCount = Number(profile.total_reviews ?? 0) || reviews.length;
  const tasksCompleted = Number(profile.tasks_completed ?? 0) || 0;
  const completionRate = Number(profile.completion_rate ?? 0);
  const jobSuccess =
    Number.isFinite(completionRate) && completionRate > 0
      ? Math.round(completionRate)
      : tasksCompleted > 0
        ? Math.min(99, 85 + Math.min(14, Math.floor(tasksCompleted / 10)))
        : 0;

  const seed = hashSeed(profile.id);
  const role = deriveRole(
    { tagline: profile.tagline, specialization: specialization || profile.specialization },
    skillNames[0],
  );
  const languages = parsed.languages
    .map((row) => row.language)
    .filter((name) => Boolean(name?.trim()));

  const freelancer: Freelancer = {
    id: profile.id,
    username: profile.username?.trim() || profile.id,
    name: profile.display_name || profile.full_name || profile.username || 'Freelancer',
    role,
    headline: profile.tagline?.trim() || buildFreelancerHeadline(role),
    memberSince: formatMemberSince(profile.date_joined),
    rating: rating > 0 ? rating : reviewCount > 0 ? 5 : 0,
    reviews: reviewCount,
    rate: Number(profile.hourly_rate ?? 0) || 0,
    avatar: getMediaUrl(profile.profile_image) || DEFAULT_AVATAR,
    tags: skillNames.length > 0 ? skillNames.slice(0, 6) : ['General'],
    location: formatShortLocation(profile) || '—',
    availableNow: Boolean(profile.is_online),
    jobSuccess,
    level: deriveLevel(tasksCompleted, rating),
    languages: languages.length > 0 ? languages : ['English'],
    bestSeller: Boolean(profile.is_verified_tasker) || tasksCompleted >= 50,
    ringColor: RING_COLORS[seed % RING_COLORS.length],
  };

  const mappedReviews = mapReviews(reviews);

  const extras: FreelancerProfileExtras = {
    userId: profile.id,
    description: buildDescription(profile.bio),
    aboutStats: {
      totalJobs: tasksCompleted,
      totalHours: tasksCompleted > 0 ? tasksCompleted * 8 : 0,
      inQueue: 0,
      lastDelivery: profile.online_status?.trim() || '—',
      gender: genderLabelFromApi(profile.gender) !== 'Select'
        ? genderLabelFromApi(profile.gender)
        : '—',
      englishLevel: pickEnglishLevel(parsed.languages),
      memberSinceShort: formatMemberSinceShort(profile.date_joined),
      replyMinutes:
        typeof profile.response_time === 'number' && profile.response_time > 0
          ? profile.response_time
          : 15,
    },
    education: mapEducation(parsed.education),
    experience: mapExperience(parsed.experience),
    awards: mapAwards(parsed.awards),
    skills: skillNames,
    licenceBadges,
    transportLabels,
    featuredServices: mapPortfolioToFeatured(portfolio, freelancer),
    reviews: mappedReviews,
  };

  return { freelancer, extras };
}

function deriveRoleFromEntry(entry: UserDirectoryEntry, primarySkill?: string): string {
  const specialization = entry.specialization?.trim();
  if (specialization) return specialization;
  if (primarySkill) return primarySkill;
  const tagline = entry.tagline?.trim();
  if (tagline) {
    const short = tagline.split(/[.,|–-]/)[0]?.trim();
    if (short && short.length <= 48) return short;
  }
  if (entry.role === 'customer') return 'Customer';
  return 'Freelancer';
}

function jobSuccessFromEntry(entry: UserDirectoryEntry): number {
  const tasksCompleted = Number(entry.tasks_completed ?? 0) || 0;
  const completionRate = Number(entry.completion_rate ?? 0);
  if (Number.isFinite(completionRate) && completionRate > 0) {
    return Math.round(completionRate);
  }
  if (tasksCompleted > 0) {
    return Math.min(99, 85 + Math.min(14, Math.floor(tasksCompleted / 10)));
  }
  return 0;
}

/** Map `/users/directory/` tasker row to the freelancers list card model. */
export function mapDirectoryEntryToFreelancer(entry: UserDirectoryEntry): Freelancer {
  const rating = Number(entry.average_rating ?? 0) || 0;
  const reviewCount = Number(entry.total_reviews ?? 0) || 0;
  const tasksCompleted = Number(entry.tasks_completed ?? 0) || 0;
  const skillTags = (entry.skill_tags ?? []).filter(Boolean);
  const seed = hashSeed(entry.id);

  const role = deriveRoleFromEntry(entry, skillTags[0]);
  const languageTags = (entry.language_tags ?? []).filter(Boolean);
  const displayName =
    entry.full_name?.trim() || entry.username?.trim() || 'Freelancer';

  return {
    id: entry.id,
    username: entry.username?.trim() || entry.id,
    name: displayName,
    role,
    headline: entry.tagline?.trim() || buildFreelancerHeadline(role),
    memberSince: formatMemberSince(entry.date_joined),
    rating: rating > 0 ? rating : reviewCount > 0 ? 5 : 0,
    reviews: reviewCount,
    rate: Number(entry.hourly_rate ?? 0) || 0,
    avatar: getMediaUrl(entry.profile_image) || DEFAULT_AVATAR,
    tags: skillTags.length > 0 ? skillTags.slice(0, 6) : ['General'],
    location:
      formatShortLocation({
        city: entry.city,
        state: entry.state,
        country: entry.country,
        location_display: entry.location_display,
      }) || '—',
    availableNow: Boolean(entry.is_online),
    jobSuccess: jobSuccessFromEntry(entry),
    level: deriveLevel(tasksCompleted, rating),
    languages: languageTags.length > 0 ? languageTags : ['English'],
    bestSeller: Boolean(entry.is_verified_tasker) || tasksCompleted >= 50,
    ringColor: RING_COLORS[seed % RING_COLORS.length],
  };
}

export function formatFreelancerRating(rating: number, reviews: number): string {
  if (rating > 0) return rating.toFixed(reviews > 0 ? 2 : 1);
  if (reviews > 0) return '5.0';
  return 'New';
}

export function mapDirectoryEntriesToFreelancers(
  entries: UserDirectoryEntry[],
): Freelancer[] {
  return entries.map(mapDirectoryEntryToFreelancer);
}
