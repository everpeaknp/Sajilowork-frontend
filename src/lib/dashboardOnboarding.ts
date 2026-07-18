const ONBOARDING_PENDING_KEY = 'sajilowork-onboarding-pending-v1';
const ONBOARDING_DONE_PREFIX = 'sajilowork-onboarding-done-v1';
const ONBOARDING_FORCE_KEY = 'sajilowork-onboarding-force-v1';
const ONBOARDING_SKIP_ROLE_KEY = 'sajilowork-onboarding-skip-role-v1';
const ONBOARDING_PREFERRED_ROLE_KEY = 'sajilowork-onboarding-preferred-role';

export const DASHBOARD_ONBOARDING_EVENT = 'sajilowork:dashboard-onboarding';
export const DASHBOARD_ONBOARDING_DONE_EVENT = 'sajilowork:dashboard-onboarding-done';

export type OnboardingRole = 'customer' | 'tasker';

export type DashboardOnboardingEventDetail = {
  role?: OnboardingRole;
  /** Role already switched — start at verify instead of path picker. */
  skipRoleStep?: boolean;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function resolveOnboardingRole(
  role: string | null | undefined,
): OnboardingRole {
  return role === 'tasker' ? 'tasker' : 'customer';
}

/** Legacy single-key completion (pre role-specific onboarding). */
export function dashboardOnboardingLegacyStorageKey(userId: string | number): string {
  return `${ONBOARDING_DONE_PREFIX}:${String(userId)}`;
}

export function dashboardOnboardingStorageKey(
  userId: string | number,
  role: OnboardingRole,
): string {
  return `${ONBOARDING_DONE_PREFIX}:${String(userId)}:${role}`;
}

export function markOnboardingPending(email: string): void {
  if (typeof window === 'undefined' || !email.trim()) return;
  try {
    window.localStorage.setItem(ONBOARDING_PENDING_KEY, normalizeEmail(email));
  } catch {
    /* ignore */
  }
}

export function clearOnboardingPending(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ONBOARDING_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function isOnboardingPendingFor(email: string | undefined | null): boolean {
  if (typeof window === 'undefined' || !email?.trim()) return false;
  try {
    return window.localStorage.getItem(ONBOARDING_PENDING_KEY) === normalizeEmail(email);
  } catch {
    return false;
  }
}

export function markOnboardingForce(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(ONBOARDING_FORCE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearOnboardingForce(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(ONBOARDING_FORCE_KEY);
  } catch {
    /* ignore */
  }
}

export function isOnboardingForced(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(ONBOARDING_FORCE_KEY) === '1';
  } catch {
    return false;
  }
}

export function hasCompletedDashboardOnboarding(
  userId: string | number | undefined | null,
  role?: string | null,
): boolean {
  if (userId == null || typeof window === 'undefined') return true;
  const resolved = resolveOnboardingRole(role);
  try {
    if (window.localStorage.getItem(dashboardOnboardingStorageKey(userId, resolved)) === '1') {
      return true;
    }
    // Legacy: completed before per-role keys existed — treat both roles as done.
    return window.localStorage.getItem(dashboardOnboardingLegacyStorageKey(userId)) === '1';
  } catch {
    return true;
  }
}

export function markDashboardOnboardingDone(
  userId: string | number | undefined | null,
  role?: string | null,
): void {
  if (userId == null || typeof window === 'undefined') return;
  const resolved = resolveOnboardingRole(role);
  try {
    window.localStorage.setItem(dashboardOnboardingStorageKey(userId, resolved), '1');
    clearOnboardingPending();
    clearOnboardingForce();
    window.sessionStorage.setItem('sajilowork-onboarding-tour-handoff-v1', '1');
  } catch {
    /* ignore */
  }
}

export function hasOnboardingTourHandoff(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem('sajilowork-onboarding-tour-handoff-v1') === '1';
  } catch {
    return false;
  }
}

export function consumeOnboardingTourHandoff(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = 'sajilowork-onboarding-tour-handoff-v1';
    if (window.sessionStorage.getItem(key) !== '1') return false;
    window.sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** First-registration / first-role gate: pending signup, forced flag, unfinished for this role. */
export function shouldShowDashboardOnboarding(
  user: {
    id?: string | number;
    email?: string;
    role?: string | null;
  } | null | undefined,
  role?: string | null,
): boolean {
  if (!user?.id || typeof window === 'undefined') return false;
  const resolved = resolveOnboardingRole(role ?? user.role);
  if (hasCompletedDashboardOnboarding(user.id, resolved)) return false;
  return isOnboardingPendingFor(user.email) || isOnboardingForced();
}

/**
 * After a dashboard role switch, open onboarding once for that role if not completed yet.
 * Returns true when onboarding was requested.
 */
export function maybeStartOnboardingAfterRoleSwitch(
  userId: string | number | undefined | null,
  nextRole: OnboardingRole,
): boolean {
  if (userId == null || typeof window === 'undefined') return false;
  if (hasCompletedDashboardOnboarding(userId, nextRole)) return false;

  try {
    window.sessionStorage.setItem(ONBOARDING_PREFERRED_ROLE_KEY, nextRole);
    window.sessionStorage.setItem(ONBOARDING_SKIP_ROLE_KEY, '1');
  } catch {
    /* ignore */
  }
  markOnboardingForce();
  window.dispatchEvent(
    new CustomEvent(DASHBOARD_ONBOARDING_EVENT, {
      detail: { role: nextRole, skipRoleStep: true } satisfies DashboardOnboardingEventDetail,
    }),
  );
  return true;
}

export function consumeOnboardingSkipRoleStep(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.sessionStorage.getItem(ONBOARDING_SKIP_ROLE_KEY) !== '1') return false;
    window.sessionStorage.removeItem(ONBOARDING_SKIP_ROLE_KEY);
    return true;
  } catch {
    return false;
  }
}
