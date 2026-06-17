import { userService } from '@/services';
import type { Bid, User, UserBadge, UserSkill } from '@/types';
import type { PublicUserProfile } from '@/types/publicProfile';
import { API_TO_DASHBOARD_TRANSPORT } from '@/lib/dashboardProfileSkills';

export type ApplicantProfileSource = Pick<
  User,
  'first_name' | 'last_name' | 'email' | 'profile_image' | 'bio' | 'tagline' | 'city'
> & {
  full_name?: string;
  phone?: string;
  phone_number?: string;
  skills?: UserSkill[];
  badges?: UserBadge[];
  location_display?: string;
  transportation_tags?: string[];
};

function mapPublicProfileToSource(
  profile: PublicUserProfile,
  tasker?: Bid['tasker'],
): ApplicantProfileSource {
  const transportTags = profile.transportation_tags?.map(
    (tag) => API_TO_DASHBOARD_TRANSPORT[tag] ?? tag,
  );

  return {
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    full_name: profile.full_name,
    email: tasker?.email || '',
    profile_image: profile.profile_image ?? undefined,
    bio: profile.bio,
    tagline: profile.tagline,
    city: profile.city || profile.location_display,
    location_display: profile.location_display,
    skills: profile.skills,
    badges: profile.badges,
    phone_number: tasker?.phone_number,
    transportation_tags: transportTags,
  };
}

/**
 * Load full applicant profile for employer proposal views.
 * Prefers /users/profile/{id|username}/ (no tasker-only gate); falls back to public_profile.
 */
export async function fetchApplicantProfile(
  tasker?: Bid['tasker'],
): Promise<ApplicantProfileSource | null> {
  if (!tasker?.id) return null;

  const slugs = [tasker.id, tasker.username].filter(
    (value): value is string => Boolean(value && String(value).trim()),
  );

  for (const slug of slugs) {
    try {
      const bySlug = await userService.getPublicProfileByUsername(slug);
      if (bySlug.success && bySlug.data) {
        return mapPublicProfileToSource(bySlug.data, tasker);
      }
    } catch {
      // try next slug / fallback
    }
  }

  try {
    const response = await userService.getPublicProfile(tasker.id);
    if (response.success && response.data) {
      const profile = response.data as User & { skills?: UserSkill[]; badges?: UserBadge[] };
      return {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        full_name: profile.full_name,
        email: profile.email ?? tasker.email ?? '',
        profile_image: profile.profile_image,
        bio: profile.bio,
        tagline: profile.tagline,
        city: profile.city,
        skills: profile.skills,
        badges: profile.badges,
        phone_number: tasker.phone_number,
      };
    }
  } catch {
    // caller falls back to bid-only data
  }

  return null;
}
