import type { DashboardSidebarRole } from '@/app/dashboard/dashboardTabs';

export type DashboardTourStep = {
  target: string;
  title: string;
  text: string;
  /** Open mobile sidebar before highlighting (sidebar targets). */
  requiresSidebar?: boolean;
};

const TOUR_STORAGE_PREFIX = 'sajilowork-dashboard-tour-seen-v2';

export function dashboardTourStorageKey(
  userId: string | number,
  role: DashboardSidebarRole,
): string {
  return `${TOUR_STORAGE_PREFIX}:${userId}:${role}`;
}

export function hasSeenDashboardTour(
  userId: string | number | undefined | null,
  role: DashboardSidebarRole,
): boolean {
  if (userId == null || typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(dashboardTourStorageKey(userId, role)) === '1';
  } catch {
    return true;
  }
}

export function markDashboardTourSeen(
  userId: string | number | undefined | null,
  role: DashboardSidebarRole,
): void {
  if (userId == null || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(dashboardTourStorageKey(userId, role), '1');
  } catch {
    /* ignore quota / private mode */
  }
}

/** Shared top navbar steps (site chrome). */
const NAVBAR_TOUR_STEPS: DashboardTourStep[] = [
  {
    target: '[data-tour="navbar-browse-tasks"]',
    title: 'Browse tasks',
    text: 'Explore open marketplace tasks near you and make offers.',
  },
  {
    target: '[data-tour="navbar-jobs"]',
    title: 'Jobs',
    text: 'Discover job listings posted by employers across Sajilo Work.',
  },
  {
    target: '[data-tour="navbar-projects"]',
    title: 'Projects',
    text: 'Browse project opportunities and submit proposals.',
  },
  {
    target: '[data-tour="navbar-services"]',
    title: 'Services',
    text: 'Find freelancer services to purchase, or browse what others offer.',
  },
  {
    target: '[data-tour="navbar-my-tasks"]',
    title: 'My tasks',
    text: 'Jump to tasks you posted or are assigned to work on.',
  },
  {
    target: '[data-tour="navbar-help"]',
    title: 'Help center',
    text: 'Open guides and support whenever you need assistance.',
  },
  {
    target: '[data-tour="navbar-theme"]',
    title: 'Light & dark mode',
    text: 'Switch between light and dark themes for comfortable browsing.',
  },
  {
    target: '[data-tour="navbar-notifications"]',
    title: 'Notifications',
    text: 'See role-relevant alerts for bids, applications, messages, and updates.',
  },
  {
    target: '[data-tour="navbar-messages"]',
    title: 'Quick messages',
    text: 'Open recent chats from the navbar, then continue in your dashboard inbox.',
  },
  {
    target: '[data-tour="navbar-profile"]',
    title: 'Account menu',
    text: 'Open Dashboard, My profile, Settings, or sign out from your avatar.',
  },
];

/** Employer (customer) sidebar + overview steps. */
const EMPLOYER_SIDEBAR_TOUR_STEPS: DashboardTourStep[] = [
  {
    target: '[data-tour="overview-stats"]',
    title: 'Employer overview',
    text: 'Your hiring stats appear here — open listings, applications, and recent activity.',
  },
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Dashboard',
    text: 'Return to this overview anytime from the sidebar.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-jobs"]',
    title: 'My Jobs',
    text: 'Create and manage job posts. Use + to publish a new job.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-project"]',
    title: 'My Projects',
    text: 'Post projects and track proposals from freelancers.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-task"]',
    title: 'My Tasks',
    text: 'Manage marketplace tasks you posted for local or short jobs.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-applications"]',
    title: 'Applications',
    text: 'Review candidates who applied to your jobs.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-bids"]',
    title: 'Bids',
    text: 'Compare offers on your projects and tasks before you hire.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-contracts"]',
    title: 'Contracts',
    text: 'Follow accepted work through delivery and completion.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-orders"]',
    title: 'Orders',
    text: 'Track services you purchased from freelancers.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-message"]',
    title: 'Messages',
    text: 'Chat with applicants and hired freelancers in your employer inbox.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-wallet"]',
    title: 'Wallet',
    text: 'Fund escrow, pay for work, and review balances.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-reviews"]',
    title: 'Reviews',
    text: 'Read and leave feedback after completed work.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-questions"]',
    title: 'Questions',
    text: 'Answer questions freelancers ask on your listings.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-saved"]',
    title: 'Saved',
    text: 'Revisit freelancers and listings you bookmarked.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-profile"]',
    title: 'My profile',
    text: 'Keep your employer profile complete so freelancers trust you.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-settings"]',
    title: 'Settings',
    text: 'Update account preferences, notifications, and security.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-role-switch"]',
    title: 'Switch to Freelancer',
    text: 'Toggle Employer / Freelancer mode to use the matching dashboard menu.',
    requiresSidebar: true,
  },
];

/** Freelancer (tasker) sidebar + overview steps. */
const FREELANCER_SIDEBAR_TOUR_STEPS: DashboardTourStep[] = [
  {
    target: '[data-tour="overview-stats"]',
    title: 'Freelancer overview',
    text: 'Track services, proposals, and earnings from this home screen.',
  },
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Dashboard',
    text: 'Return here for your freelancer performance snapshot.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-proposals"]',
    title: 'My proposals',
    text: 'Follow applications and offers you submitted.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-contracts"]',
    title: 'Contracts',
    text: 'Manage hired work, delivery, and completion.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-message"]',
    title: 'Messages',
    text: 'Talk with employers and buyers in your freelancer inbox.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-services"]',
    title: 'My services',
    text: 'List packages clients can buy. Use + to publish a new service.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-orders"]',
    title: 'Orders',
    text: 'Fulfill purchases of your services and keep buyers updated.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-wallet"]',
    title: 'Wallet',
    text: 'Check available balance, payouts, and earnings.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-reviews"]',
    title: 'Reviews',
    text: 'See client feedback and respond after completed jobs.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-questions"]',
    title: 'Questions',
    text: 'Ask and follow up on questions for listings you care about.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-saved"]',
    title: 'Saved',
    text: 'Open listings and employers you saved for later.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-profile"]',
    title: 'My profile',
    text: 'Complete your freelancer profile to win more work.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-settings"]',
    title: 'Settings',
    text: 'Manage notifications, security, and account preferences.',
    requiresSidebar: true,
  },
  {
    target: '[data-tour="nav-role-switch"]',
    title: 'Switch to Employer',
    text: 'Toggle Freelancer / Employer mode when you need to hire instead of apply.',
    requiresSidebar: true,
  },
];

export const EMPLOYER_TOUR_STEPS: DashboardTourStep[] = [
  ...NAVBAR_TOUR_STEPS,
  ...EMPLOYER_SIDEBAR_TOUR_STEPS,
];

export const FREELANCER_TOUR_STEPS: DashboardTourStep[] = [
  ...NAVBAR_TOUR_STEPS,
  ...FREELANCER_SIDEBAR_TOUR_STEPS,
];

export function getDashboardTourSteps(role: DashboardSidebarRole): DashboardTourStep[] {
  return role === 'tasker' ? FREELANCER_TOUR_STEPS : EMPLOYER_TOUR_STEPS;
}
