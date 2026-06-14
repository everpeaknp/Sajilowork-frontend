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
  ListTodo,
  CircleUser,
  Settings,
  Wallet,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import UserAvatar from '@/components/common/UserAvatar';
import {
  getDashboardHref,
  getDashboardCreateHref,
  getNavTabsForRole,
  resolveDashboardSidebarRole,
  type DashboardCreateTab,
  type DashboardSidebarRole,
  type DashboardTab,
} from './dashboardTabs';
import AccountRoleMode from '@/components/common/AccountRoleMode';

export type { DashboardTab };

interface NavigationItem {
  id: DashboardTab;
  label: string;
  icon: LucideIcon;
  href: string;
}

function isCreateTab(tab: DashboardTab): tab is DashboardCreateTab {
  return tab === 'services' || tab === 'jobs' || tab === 'project' || tab === 'task';
}

function createLabelForTab(tab: DashboardCreateTab): string {
  switch (tab) {
    case 'services':
      return 'service';
    case 'jobs':
      return 'job';
    case 'project':
      return 'project';
    case 'task':
      return 'task';
  }
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

function DashboardRoleDropdown({
  isProfileActive,
}: {
  isProfileActive: boolean;
}) {
  return <AccountRoleMode variant="sidebar" isProfileActive={isProfileActive} />;
}

const NAV_ITEM_LOOKUP: Record<DashboardTab, NavigationItem> = {
  dashboard: { id: 'dashboard', label: 'Dashboard', icon: Home },
  proposals: { id: 'proposals', label: 'My Proposals', icon: FileText },
  message: { id: 'message', label: 'Message', icon: MessageSquareMore },
  services: { id: 'services', label: 'Manage Services', icon: Monitor },
  jobs: { id: 'jobs', label: 'Manage Jobs', icon: Briefcase, href: getDashboardHref('jobs') },
  task: { id: 'task', label: 'Manage Tasks', icon: ListTodo, href: getDashboardHref('task') },
  project: { id: 'project', label: 'Manage Projects', icon: ClipboardList, href: getDashboardHref('project') },
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
    const hasCreate = isCreateTab(item.id);

    if (!hasCreate) {
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
    }

    return (
      <div
        key={item.id}
        className={`group flex w-full items-center rounded-lg transition-all duration-150 ${
          isActive ? 'bg-[#222222] shadow-sm' : 'hover:bg-neutral-50'
        }`}
      >
        <Link
          href={item.href}
          onClick={() => {
            onTabChange(item.id);
            onClose?.();
          }}
          className={`flex min-w-0 flex-1 cursor-pointer items-center gap-[18px] rounded-lg px-4 py-3.5 text-[15px] font-medium transition-all duration-150 ${
            isActive ? 'font-semibold text-white' : 'text-black'
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

        <Link
          href={getDashboardCreateHref(item.id)}
          onClick={() => onClose?.()}
          aria-label={`Post new ${createLabelForTab(item.id)}`}
          title={`Post new ${createLabelForTab(item.id)}`}
          className={`mr-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
            isActive
              ? 'text-white/80 hover:bg-white/10 hover:text-[#52C47F]'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
          }`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
        </Link>
      </div>
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
              <UserAvatar
                src={user?.profile_image}
                name={user ? `${user.first_name} ${user.last_name}` : 'My Profile'}
                size="xs"
                className="!h-[22px] !w-[22px] shrink-0"
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
