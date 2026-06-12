'use client';

import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  FileText,
  Heart,
  MessageSquareMore,
  MessageSquare,
  TrendingUp,
  Monitor,
  Briefcase,
  ClipboardList,
  CircleUser,
  Settings,
  Wallet,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import {
  getDashboardHref,
  getNavTabsForRole,
  type DashboardSidebarRole,
  type DashboardTab,
} from './dashboardTabs';
import { useDashboardRoleSwitch } from './DashboardRoleSwitchContext';

export type { DashboardTab };

interface NavigationItem {
  id: DashboardTab;
  label: string;
  icon: LucideIcon;
  href: string;
}

function resolveNavItem(tabId: DashboardTab, role: DashboardSidebarRole): NavigationItem {
  const base = NAV_ITEM_LOOKUP[tabId];
  if (role === 'tasker' && tabId === 'project') {
    return { ...base, label: 'Projects', href: getDashboardHref('project') };
  }
  return { ...base, href: getDashboardHref(tabId) };
}

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const ROLE_OPTIONS: { value: DashboardSidebarRole; label: string }[] = [
  { value: 'customer', label: 'Employer' },
  { value: 'tasker', label: 'Freelancer' },
];

function DashboardRoleDropdown({
  isProfileActive,
}: {
  isProfileActive: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  const { requestRoleSwitch, switching } = useDashboardRoleSwitch();

  const currentRole: DashboardSidebarRole =
    user?.role === 'tasker' ? 'tasker' : 'customer';

  const shellClass = isProfileActive
    ? 'border-white/20 bg-white/10 text-white'
    : 'border-neutral-200 bg-white text-neutral-900';

  return (
    <div className="relative mr-2 shrink-0">
      {switching ? (
        <span className="flex h-8 w-[6.5rem] items-center justify-center">
          <Loader2
            className={`h-4 w-4 animate-spin ${isProfileActive ? 'text-white' : 'text-neutral-700'}`}
          />
        </span>
      ) : (
        <>
          <select
            value={currentRole}
            onChange={(event) => requestRoleSwitch(event.target.value as DashboardSidebarRole)}
            disabled={switching || !user}
            aria-label="Account type"
            className={`h-8 w-[6.5rem] cursor-pointer appearance-none rounded-md border py-1 pl-2 pr-7 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-[#52C47F]/40 ${shellClass}`}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${
              isProfileActive ? 'text-white/80' : 'text-neutral-500'
            }`}
            strokeWidth={2}
          />
        </>
      )}
    </div>
  );
}

const NAV_ITEM_LOOKUP: Record<DashboardTab, NavigationItem> = {
  dashboard: { id: 'dashboard', label: 'Dashboard', icon: Home },
  proposals: { id: 'proposals', label: 'My Proposals', icon: FileText },
  message: { id: 'message', label: 'Message', icon: MessageSquareMore },
  services: { id: 'services', label: 'Manage Services', icon: Monitor },
  jobs: { id: 'jobs', label: 'Manage Jobs', icon: Briefcase },
  project: { id: 'project', label: 'Manage Projects', icon: ClipboardList },
  statements: { id: 'statements', label: 'Statements', icon: TrendingUp },
  wallet: { id: 'wallet', label: 'Wallet', icon: Wallet },
  reviews: { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  saved: { id: 'saved', label: 'Saved', icon: Heart },
  settings: { id: 'settings', label: 'Settings', icon: Settings },
  profile: { id: 'profile', label: 'My Profile', icon: CircleUser },
};

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  onClose,
}: DashboardSidebarProps) {
  const user = useAuthStore((s) => s.user);
  const sidebarRole: DashboardSidebarRole =
    user?.role === 'tasker' ? 'tasker' : 'customer';

  const navItems = useMemo(
    () => getNavTabsForRole(sidebarRole).map((tabId) => resolveNavItem(tabId, sidebarRole)),
    [sidebarRole],
  );

  const renderItem = (item: NavigationItem) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={() => {
          onTabChange(item.id);
          onClose?.();
        }}
        className={`group flex w-full cursor-pointer items-center gap-[18px] rounded-lg px-4 py-3.5 text-[15px] font-medium transition-all duration-150 ${
          isActive
            ? 'bg-[#222222] font-semibold text-white shadow-sm'
            : 'text-black hover:bg-neutral-50'
        }`}
      >
        <Icon
          className={`h-[22px] w-[22px] shrink-0 ${
            isActive ? 'text-[#52C47F]' : 'text-black'
          }`}
          strokeWidth={1.8}
        />
        <span className="truncate tracking-wide">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col bg-white">
      <div className="scrollbar-none flex-1 select-none overflow-y-auto px-4 py-6 md:py-8">
        <div className="space-y-1">{navItems.map((item) => renderItem(item))}</div>
      </div>

      <div className="p-4 pt-0">
        <div className="space-y-1">
          <div
            className={`group flex w-full items-center rounded-lg transition-all duration-150 ${
              activeTab === 'profile' ? 'bg-[#222222] shadow-sm' : 'hover:bg-neutral-50'
            }`}
          >
            <Link
              href={getDashboardHref('profile')}
              onClick={() => {
                onTabChange('profile');
                onClose?.();
              }}
              className={`flex min-w-0 flex-1 cursor-pointer items-center gap-[18px] rounded-lg px-4 py-3.5 text-[15px] font-medium transition-all duration-150 ${
                activeTab === 'profile' ? 'font-semibold text-white' : 'text-black'
              }`}
            >
              <CircleUser
                className={`h-[22px] w-[22px] shrink-0 ${
                  activeTab === 'profile' ? 'text-[#52C47F]' : 'text-black'
                }`}
                strokeWidth={1.8}
              />
              <span className="truncate tracking-wide">My Profile</span>
            </Link>

            <DashboardRoleDropdown isProfileActive={activeTab === 'profile'} />
          </div>
        </div>
      </div>
    </aside>
  );
}
