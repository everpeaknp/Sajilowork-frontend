export const DASHBOARD_TABS = [
  'dashboard',
  'proposals',
  'applications',
  'bids',
  'contracts',
  'saved',
  'message',
  'reviews',
  'questions',
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

export function getDashboardBidsListingHref(listingSlug: string): string {
  return `/dashboard/bids/${encodeURIComponent(listingSlug)}`;
}

export function getDashboardApplicationsListingHref(listingSlug: string): string {
  return `/dashboard/applications/${encodeURIComponent(listingSlug)}`;
}

export function getDashboardProposalDetailHref(projectSlug: string, bidId: string): string {
  return `/dashboard/proposals/${encodeURIComponent(projectSlug)}/${encodeURIComponent(bidId)}`;
}

export type EmployerBidDetailFrom = 'contracts' | 'applications' | 'bids';

export function getEmployerBidDetailHref(
  projectSlug: string,
  bidId: string,
  from: EmployerBidDetailFrom,
): string {
  return `${getDashboardProposalDetailHref(projectSlug, bidId)}?from=${from}`;
}

export type FreelancerBidDetailFrom = 'contracts' | 'proposals' | 'bids';

export function getFreelancerBidDetailHref(
  projectSlug: string,
  bidId: string,
  from: FreelancerBidDetailFrom,
): string {
  return `${getDashboardProposalDetailHref(projectSlug, bidId)}?from=${from}`;
}

export function resolveFreelancerBidDetailFrom(
  status: string,
  fromParam: string | null,
): FreelancerBidDetailFrom {
  if (fromParam === 'contracts' || fromParam === 'proposals' || fromParam === 'bids') {
    return fromParam;
  }
  if (status === 'accepted') return 'contracts';
  return 'proposals';
}

export function getFreelancerBidDetailCopy(from: FreelancerBidDetailFrom): {
  sectionTab: DashboardTab;
  sectionLabel: string;
  titlePrefix: string;
  listBackLabel: string;
  panelDescription: string;
  loadingLabel: string;
  notFoundLabel: string;
} {
  switch (from) {
    case 'contracts':
      return {
        sectionTab: 'contracts',
        sectionLabel: 'Contracts',
        titlePrefix: 'Contract for',
        listBackLabel: 'Back to contracts',
        panelDescription: 'Contract reference, employer contact, and acceptance timeline.',
        loadingLabel: 'Loading contract…',
        notFoundLabel: 'Contract not found.',
      };
    case 'bids':
      return {
        sectionTab: 'bids',
        sectionLabel: 'Bids',
        titlePrefix: 'Bid on',
        listBackLabel: 'Back to bids',
        panelDescription: 'Bid reference, listing details, and submission timeline.',
        loadingLabel: 'Loading bid…',
        notFoundLabel: 'Bid not found.',
      };
    case 'proposals':
      return {
        sectionTab: 'proposals',
        sectionLabel: 'My Proposals',
        titlePrefix: 'Proposal for',
        listBackLabel: 'Back to proposals',
        panelDescription: 'Proposal reference, employer contact, and submission timeline.',
        loadingLabel: 'Loading proposal…',
        notFoundLabel: 'Proposal not found.',
      };
  }
}

export function resolveEmployerBidDetailFrom(
  status: string,
  fromParam: string | null,
): EmployerBidDetailFrom {
  if (fromParam === 'contracts' || fromParam === 'applications' || fromParam === 'bids') {
    return fromParam;
  }
  if (status === 'accepted') return 'contracts';
  if (status === 'pending') return 'applications';
  return 'bids';
}

export function getEmployerBidDetailCopy(from: EmployerBidDetailFrom): {
  sectionTab: DashboardTab;
  sectionLabel: string;
  titlePrefix: string;
  listBackLabel: string;
  panelDescription: string;
  loadingLabel: string;
  notFoundLabel: string;
} {
  switch (from) {
    case 'contracts':
      return {
        sectionTab: 'contracts',
        sectionLabel: 'Contracts',
        titlePrefix: 'Contract with',
        listBackLabel: 'Back to contracts',
        panelDescription: 'Contract reference, freelancer contact, and acceptance timeline.',
        loadingLabel: 'Loading contract…',
        notFoundLabel: 'Contract not found.',
      };
    case 'applications':
      return {
        sectionTab: 'applications',
        sectionLabel: 'Applications',
        titlePrefix: 'Application from',
        listBackLabel: 'Back to applications',
        panelDescription: 'Application reference, applicant contact, and submission timeline.',
        loadingLabel: 'Loading application…',
        notFoundLabel: 'Application not found.',
      };
    case 'bids':
      return {
        sectionTab: 'bids',
        sectionLabel: 'Bids',
        titlePrefix: 'Bid from',
        listBackLabel: 'Back to bids',
        panelDescription: 'Bid reference, freelancer contact, and submission timeline.',
        loadingLabel: 'Loading bid…',
        notFoundLabel: 'Bid not found.',
      };
  }
}

export function getDashboardProjectDetailHref(projectSlug: string): string {
  return `/dashboard/project/${encodeURIComponent(projectSlug)}`;
}

export function tabFromPathname(pathname: string): DashboardTab {
  if (!pathname.startsWith('/dashboard')) return 'dashboard';

  const rest = pathname.slice('/dashboard'.length).replace(/^\//, '');
  const segment = rest.split('/')[0];

  if (!segment) return 'dashboard';
  if (segment === 'qustions') return 'questions';
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
  'jobs',
  'project',
  'task',
  'applications',
  'bids',
  'contracts',
  'message',
  'wallet',
  'reviews',
  'questions',
  'saved',
  'settings',
];

/** Main nav tabs for freelancer (tasker) accounts — excludes profile (footer). */
export const FREELANCER_NAV_TABS: DashboardTab[] = [
  'dashboard',
  'proposals',
  'contracts',
  'message',
  'services',
  'wallet',
  'reviews',
  'questions',
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

  if (segment === 'jobs' || segment === 'task' || segment === 'applications' || segment === 'bids') {
    return 'customer';
  }
  if (segment === 'services') return 'tasker';
  return null;
}

/** Role-specific sidebar label for a nav tab. */
export function getNavLabelForRole(tab: DashboardTab, role: DashboardSidebarRole): string {
  const employer: Partial<Record<DashboardTab, string>> = {
    dashboard: 'Dashboard',
    jobs: 'My Jobs',
    project: 'My Projects',
    task: 'My Tasks',
    applications: 'Applications',
    bids: 'Bids',
    contracts: 'Contracts',
    message: 'Messages',
    statements: 'Statements',
    wallet: 'Wallet',
    reviews: 'Reviews',
    questions: 'Questions',
    saved: 'Saved',
    settings: 'Settings',
  };
  const freelancer: Partial<Record<DashboardTab, string>> = {
    dashboard: 'Dashboard',
    proposals: 'My Proposals',
    contracts: 'Contracts',
    services: 'My Services',
    project: 'Projects',
    message: 'Messages',
    statements: 'Statements',
    wallet: 'Wallet',
    reviews: 'Reviews',
    questions: 'Questions',
    saved: 'Saved',
    settings: 'Settings',
  };
  const map = role === 'tasker' ? freelancer : employer;
  return map[tab] ?? NAV_ITEM_DEFAULT_LABELS[tab] ?? tab;
}

const NAV_ITEM_DEFAULT_LABELS: Partial<Record<DashboardTab, string>> = {
  dashboard: 'Dashboard',
  proposals: 'My Proposals',
  applications: 'Applications',
  bids: 'Bids',
  contracts: 'Contracts',
  message: 'Messages',
  saved: 'Saved',
  reviews: 'Reviews',
  questions: 'Questions',
  statements: 'Statements',
  wallet: 'Wallet',
  services: 'My Services',
  jobs: 'My Jobs',
  task: 'My Tasks',
  project: 'My Projects',
  settings: 'Settings',
  profile: 'My Profile',
};
