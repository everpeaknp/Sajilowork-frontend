export const DASHBOARD_TABS = [
  'dashboard',
  'proposals',
  'saved',
  'message',
  'reviews',
  'statements',
  'wallet',
  'services',
  'jobs',
  'project',
  'task',
  'profile',
  'settings',
] as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export function isDashboardTab(value: string): value is DashboardTab {
  return (DASHBOARD_TABS as readonly string[]).includes(value);
}

export function getDashboardHref(tab: DashboardTab): string {
  if (tab === 'dashboard') return '/dashboard';
  return `/dashboard/${tab}`;
}

export function getDashboardProposalProjectHref(projectSlug: string): string {
  return `/dashboard/proposals/${encodeURIComponent(projectSlug)}`;
}

export function getDashboardProposalDetailHref(projectSlug: string, bidId: string): string {
  return `/dashboard/proposals/${encodeURIComponent(projectSlug)}/${encodeURIComponent(bidId)}`;
}

export function getDashboardProjectDetailHref(projectSlug: string): string {
  return `/dashboard/project/${encodeURIComponent(projectSlug)}`;
}

export function tabFromPathname(pathname: string): DashboardTab {
  if (!pathname.startsWith('/dashboard')) return 'dashboard';

  const rest = pathname.slice('/dashboard'.length).replace(/^\//, '');
  const segment = rest.split('/')[0];

  if (!segment) return 'dashboard';
  if (isDashboardTab(segment) && segment !== 'dashboard') return segment;

  return 'dashboard';
}

/** Slug segments for “add / post new” dashboard forms */
export const DASHBOARD_CREATE_SLUGS = {
  services: 'addservices',
  jobs: 'postnewjob',
  project: 'postnewproject',
  task: 'postnewtask',
} as const;

export type DashboardCreateTab = keyof typeof DASHBOARD_CREATE_SLUGS;

export function getDashboardCreateHref(tab: DashboardCreateTab): string {
  return `/dashboard/${tab}/${DASHBOARD_CREATE_SLUGS[tab]}`;
}

export function getDashboardListHref(tab: DashboardCreateTab): string {
  return `/dashboard/${tab}`;
}

export function isDashboardCreateRoute(tab: string, slug: string): tab is DashboardCreateTab {
  if (!(tab in DASHBOARD_CREATE_SLUGS)) return false;
  return DASHBOARD_CREATE_SLUGS[tab as DashboardCreateTab] === slug;
}

export function getDashboardEditHref(tab: DashboardCreateTab, taskSlug: string): string {
  return `/dashboard/${tab}/${DASHBOARD_CREATE_SLUGS[tab]}/${encodeURIComponent(taskSlug)}`;
}

export type DashboardSidebarRole = 'customer' | 'tasker';

export const DASHBOARD_ROLE_OPTIONS: { value: DashboardSidebarRole; label: string }[] = [
  { value: 'customer', label: 'Employer' },
  { value: 'tasker', label: 'Freelancer' },
];

export function resolveDashboardSidebarRole(
  role?: string | null,
): DashboardSidebarRole {
  return role === 'tasker' ? 'tasker' : 'customer';
}

export function getDashboardRoleLabel(role: DashboardSidebarRole): string {
  return role === 'tasker' ? 'Freelancer' : 'Employer';
}

/** Main nav tabs for employer (customer) accounts — excludes profile (footer). */
export const EMPLOYER_NAV_TABS: DashboardTab[] = [
  'dashboard',
  'proposals',
  'message',
  'task',
  'jobs',
  'project',
  'statements',
  'wallet',
  'reviews',
  'saved',
  'settings',
];

/** Main nav tabs for freelancer (tasker) accounts — excludes profile (footer). */
export const FREELANCER_NAV_TABS: DashboardTab[] = [
  'dashboard',
  'proposals',
  'message',
  'services',
  'project',
  'statements',
  'wallet',
  'reviews',
  'saved',
  'settings',
];

export function getNavTabsForRole(role: DashboardSidebarRole): DashboardTab[] {
  return role === 'tasker' ? FREELANCER_NAV_TABS : EMPLOYER_NAV_TABS;
}

export function isTabAllowedForRole(tab: DashboardTab, role: DashboardSidebarRole): boolean {
  if (tab === 'profile') return true;
  return getNavTabsForRole(role).includes(tab);
}

/** Employer-only dashboard sections (jobs, tasks). Freelancer-only: services. */
export function getRequiredDashboardRoleForPathname(
  pathname: string,
): DashboardSidebarRole | null {
  if (!pathname.startsWith('/dashboard')) return null;

  const rest = pathname.slice('/dashboard'.length).replace(/^\//, '');
  const segment = rest.split('/')[0];
  if (!segment) return null;

  if (segment === 'jobs' || segment === 'task') return 'customer';
  if (segment === 'services') return 'tasker';
  return null;
}
