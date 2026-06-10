export const DASHBOARD_TABS = [
  'dashboard',
  'proposals',
  'saved',
  'message',
  'reviews',
  'invoice',
  'payouts',
  'statements',
  'wallet',
  'services',
  'jobs',
  'project',
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

export function tabFromPathname(pathname: string): DashboardTab {
  if (!pathname.startsWith('/dashboard')) return 'dashboard';

  const rest = pathname.slice('/dashboard'.length).replace(/^\//, '');
  const segment = rest.split('/')[0];

  if (!segment) return 'dashboard';
  if (isDashboardTab(segment) && segment !== 'dashboard') return segment;

  return 'dashboard';
}
