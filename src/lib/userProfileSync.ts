import { User } from '@/types';

/** Dispatched after profile/payment data changes (e.g. Make Offer modal). */
export const USER_PROFILE_UPDATED = 'user-profile-updated';

/** Map Django user fields to frontend User shape. */
export function normalizeUserFromApi(raw: Record<string, unknown>): User {
  const phone =
    (raw.phone_number as string | undefined) ||
    (raw.phone as string | undefined);

  return {
    ...(raw as unknown as User),
    tagline: raw.tagline as string | undefined,
    phone_number: phone,
    is_phone_verified:
      (raw.is_phone_verified as boolean | undefined) ??
      (raw.phone_verified as boolean | undefined) ??
      false,
    is_email_verified:
      (raw.is_email_verified as boolean | undefined) ??
      (raw.email_verified as boolean | undefined) ??
      (raw.is_verified as boolean | undefined),
  };
}

export function notifyUserProfileUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(USER_PROFILE_UPDATED));
}
